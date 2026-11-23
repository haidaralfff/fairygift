#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { fileURLToPath } from "node:url";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { v2 as cloudinary } from "cloudinary";
import ts from "typescript";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(__dirname, "..");
const ENV_EXAMPLE_PATH = path.join(WEB_ROOT, ".env.example");
const ENV_LOCAL_PATH = path.join(WEB_ROOT, ".env");

function parseEnvFile(content) {
  const map = new Map();
  const order = [];
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eqIdx = line.indexOf("=");
    if (eqIdx === -1) continue;
    const key = line.slice(0, eqIdx).trim();
    let val = line.slice(eqIdx + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!map.has(key)) order.push(key);
    map.set(key, val);
  }
  return { map, order };
}

function serializeEnv(map, order) {
  const keys = [...order];
  for (const k of map.keys()) {
    if (!keys.includes(k)) keys.push(k);
  }
  return (
    keys
      .map((k) => {
        const v = map.get(k) ?? "";
        const needsQuotes = k === "FIREBASE_PRIVATE_KEY" || /[\s#]/.test(v);
        return `${k}=${needsQuotes ? `"${v}"` : v}`;
      })
      .join("\n") + "\n"
  );
}

function ensureEnvLocal() {
  if (!fs.existsSync(ENV_LOCAL_PATH)) {
    fs.copyFileSync(ENV_EXAMPLE_PATH, ENV_LOCAL_PATH);
    console.log("Dibuat .env dari .env.example.");
  }
  const content = fs.readFileSync(ENV_LOCAL_PATH, "utf8");
  return parseEnvFile(content);
}

function isPlaceholderPrivateKey(val) {
  return !val || val.includes("...");
}

function loadDemoSeed() {
  const seedPath = path.join(WEB_ROOT, "src", "lib", "data", "demo-seed.ts");
  const source = fs.readFileSync(seedPath, "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  });
  const moduleObj = { exports: {} };
  const fn = new vm.Script(transpiled.outputText, { filename: seedPath });
  fn.runInNewContext({
    exports: moduleObj.exports,
    module: moduleObj,
  });
  return moduleObj.exports;
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
    } else {
      args[key] = next;
      i++;
    }
  }
  return args;
}

function getStatusSummary(map) {
  const fbClientOk = Boolean(
    map.get("NEXT_PUBLIC_FIREBASE_API_KEY") &&
      map.get("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN") &&
      map.get("NEXT_PUBLIC_FIREBASE_PROJECT_ID") &&
      map.get("NEXT_PUBLIC_FIREBASE_APP_ID")
  );
  const fbAdminOk = Boolean(
    map.get("FIREBASE_PROJECT_ID") &&
      map.get("FIREBASE_CLIENT_EMAIL") &&
      !isPlaceholderPrivateKey(map.get("FIREBASE_PRIVATE_KEY"))
  );
  const cloudinaryOk = Boolean(
    map.get("CLOUDINARY_CLOUD_NAME") &&
      map.get("CLOUDINARY_API_KEY") &&
      map.get("CLOUDINARY_API_SECRET")
  );
  const waOk = /^(?:62|0)8\d{7,12}$/.test(
    map.get("NEXT_PUBLIC_WHATSAPP_ADMIN_NUMBER") || ""
  );
  return { fbClientOk, fbAdminOk, cloudinaryOk, waOk };
}

function printStatus(status) {
  const mark = (ok) => (ok ? "[OK]" : "[BELUM]");
  console.log("\nStatus Integrasi (.env):");
  console.log(`  ${mark(status.waOk)} WhatsApp Admin (NEXT_PUBLIC_WHATSAPP_ADMIN_NUMBER)`);
  console.log(`  ${mark(status.fbClientOk)} Firebase Client Web App (NEXT_PUBLIC_FIREBASE_*)`);
  console.log(`  ${mark(status.fbAdminOk)} Firebase Admin Service Account (FIREBASE_*)`);
  console.log(`  ${mark(status.cloudinaryOk)} Cloudinary Upload (CLOUDINARY_*)\n`);
}

function applyServiceAccountFile(jsonPath, envMap) {
  const resolved = path.resolve(jsonPath.replace(/^["']|["']$/g, ""));
  if (!fs.existsSync(resolved)) {
    throw new Error(`File tidak ditemukan: ${resolved}`);
  }
  const raw = JSON.parse(fs.readFileSync(resolved, "utf8"));
  if (!raw.project_id || !raw.client_email || !raw.private_key) {
    throw new Error("File JSON bukan Service Account Firebase yang valid.");
  }
  envMap.set("FIREBASE_PROJECT_ID", String(raw.project_id));
  envMap.set("FIREBASE_CLIENT_EMAIL", String(raw.client_email));
  envMap.set("FIREBASE_PRIVATE_KEY", String(raw.private_key).replace(/\n/g, "\\n"));
  if (!envMap.get("NEXT_PUBLIC_FIREBASE_PROJECT_ID")) {
    envMap.set("NEXT_PUBLIC_FIREBASE_PROJECT_ID", String(raw.project_id));
  }
  if (!envMap.get("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN")) {
    envMap.set("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", `${raw.project_id}.firebaseapp.com`);
  }
  console.log(`Service Account terbaca untuk project: ${raw.project_id}`);
}

function initFirebaseAdminFromEnv(envMap) {
  if (getApps().length > 0) return getApps()[0];
  const projectId = envMap.get("FIREBASE_PROJECT_ID");
  const clientEmail = envMap.get("FIREBASE_CLIENT_EMAIL");
  const privateKey = (envMap.get("FIREBASE_PRIVATE_KEY") || "").replace(/\\n/g, "\n");
  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

async function seedFirestore(db) {
  const {
    DEMO_CATEGORIES,
    DEMO_PRODUCTS,
    DEMO_PACKAGINGS,
    DEMO_GIFT_COMPONENTS,
    DEMO_CARD_DESIGNS,
  } = loadDemoSeed();

  const batch = db.batch();
  for (const cat of DEMO_CATEGORIES) {
    batch.set(db.collection("categories").doc(cat.id), cat, { merge: true });
  }
  for (const prod of DEMO_PRODUCTS) {
    batch.set(db.collection("products").doc(prod.id), prod, { merge: true });
  }
  for (const pack of DEMO_PACKAGINGS) {
    batch.set(db.collection("packagings").doc(pack.id), pack, { merge: true });
  }
  for (const comp of DEMO_GIFT_COMPONENTS) {
    batch.set(db.collection("giftComponents").doc(comp.id), comp, { merge: true });
  }
  for (const card of DEMO_CARD_DESIGNS) {
    batch.set(db.collection("cardDesigns").doc(card.id), card, { merge: true });
  }
  await batch.commit();

  console.log(
    `Seed Firestore selesai: ${DEMO_CATEGORIES.length} kategori, ${DEMO_PRODUCTS.length} produk, ${DEMO_PACKAGINGS.length} kemasan, ${DEMO_GIFT_COMPONENTS.length} komponen, ${DEMO_CARD_DESIGNS.length} kartu.`
  );
}

async function ensureAdminUser(auth, db, email, password, name = "Admin FairyGift") {
  let userRecord;
  try {
    userRecord = await auth.getUserByEmail(email);
    if (password) {
      await auth.updateUser(userRecord.uid, { password, displayName: name });
    }
    console.log(`Akun Firebase Auth ditemukan: ${email} (uid: ${userRecord.uid})`);
  } catch (err) {
    if (err && err.code === "auth/user-not-found") {
      if (!password || password.length < 6) {
        throw new Error("Password admin baru minimal 6 karakter.");
      }
      userRecord = await auth.createUser({
        email,
        password,
        displayName: name,
      });
      console.log(`Akun admin baru dibuat di Firebase Auth: ${email} (uid: ${userRecord.uid})`);
    } else {
      throw err;
    }
  }

  await db.collection("users").doc(userRecord.uid).set(
    {
      uid: userRecord.uid,
      name,
      email,
      role: "admin",
      createdAt: new Date().toISOString(),
    },
    { merge: true }
  );
  console.log(`Dokumen Firestore users/${userRecord.uid} diset dengan role: "admin".`);
}

async function verifyCloudinary(envMap) {
  cloudinary.config({
    cloud_name: envMap.get("CLOUDINARY_CLOUD_NAME"),
    api_key: envMap.get("CLOUDINARY_API_KEY"),
    api_secret: envMap.get("CLOUDINARY_API_SECRET"),
  });
  const res = await cloudinary.api.ping();
  console.log(`Koneksi Cloudinary berhasil (status: ${res?.status || "ok"}).`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const { map: envMap, order } = ensureEnvLocal();

  if (typeof args["service-account"] === "string") {
    applyServiceAccountFile(args["service-account"], envMap);
    fs.writeFileSync(ENV_LOCAL_PATH, serializeEnv(envMap, order), "utf8");
  }

  if (args.check) {
    const status = getStatusSummary(envMap);
    printStatus(status);
    if (status.fbAdminOk) {
      try {
        initFirebaseAdminFromEnv(envMap);
        const db = getFirestore();
        await db.collection("categories").limit(1).get();
        console.log("Tes koneksi Firestore Admin: BERHASIL");
        const [authList, adminSnap] = await Promise.all([
          getAuth().listUsers(10),
          db.collection("users").where("role", "==", "admin").get(),
        ]);
        console.log(`Firebase Auth users: ${authList.users.length} (${authList.users.map((u) => u.email).filter(Boolean).join(", ") || "belum ada"})`);
        console.log(`Firestore admin docs: ${adminSnap.size}`);
      } catch (err) {
        console.error("Tes koneksi Firestore Admin: GAGAL -", err.message);
      }
    }
    if (status.cloudinaryOk) {
      try {
        await verifyCloudinary(envMap);
      } catch (err) {
        console.error("Tes koneksi Cloudinary: GAGAL -", err.message);
      }
    }
    return;
  }

  if (args.seed || typeof args["admin-email"] === "string") {
    const status = getStatusSummary(envMap);
    if (!status.fbAdminOk) {
      throw new Error("Firebase Admin Service Account belum lengkap di .env.");
    }
    initFirebaseAdminFromEnv(envMap);
    const db = getFirestore();
    const auth = getAuth();

    if (typeof args["admin-email"] === "string") {
      await ensureAdminUser(
        auth,
        db,
        args["admin-email"],
        typeof args["admin-password"] === "string" ? args["admin-password"] : "",
        typeof args["admin-name"] === "string" ? args["admin-name"] : "Admin FairyGift"
      );
    }
    if (args.seed) {
      await seedFirestore(db);
    }
    return;
  }

  const rl = createInterface({ input, output });
  try {
    console.log("=== Setup Integrasi FairyGift ===");
    printStatus(getStatusSummary(envMap));

    const ask = async (label, key, maskPlaceholder = false) => {
      const current = envMap.get(key) || "";
      const display = maskPlaceholder && isPlaceholderPrivateKey(current) ? "" : current;
      const hint = display ? ` [${display}]` : "";
      const ans = (await rl.question(`${label}${hint}: `)).trim();
      if (ans) envMap.set(key, ans);
    };

    await ask(
      "1) Nomor WhatsApp Admin (format 628...)",
      "NEXT_PUBLIC_WHATSAPP_ADMIN_NUMBER"
    );

    const saPath = (
      await rl.question(
        "2) Path file JSON Service Account Firebase (kosongkan jika sudah diisi): "
      )
    ).trim();
    if (saPath) {
      applyServiceAccountFile(saPath, envMap);
    }

    console.log("\n3) Firebase Web App Config (Firebase Console -> Project Settings -> Your apps):");
    await ask("   NEXT_PUBLIC_FIREBASE_API_KEY", "NEXT_PUBLIC_FIREBASE_API_KEY");
    await ask("   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
    await ask("   NEXT_PUBLIC_FIREBASE_PROJECT_ID", "NEXT_PUBLIC_FIREBASE_PROJECT_ID");
    await ask("   NEXT_PUBLIC_FIREBASE_APP_ID", "NEXT_PUBLIC_FIREBASE_APP_ID");

    console.log("\n4) Cloudinary Free Tier (Cloudinary Dashboard -> API Keys):");
    await ask("   CLOUDINARY_CLOUD_NAME", "CLOUDINARY_CLOUD_NAME");
    await ask("   CLOUDINARY_API_KEY", "CLOUDINARY_API_KEY");
    await ask("   CLOUDINARY_API_SECRET", "CLOUDINARY_API_SECRET");

    fs.writeFileSync(ENV_LOCAL_PATH, serializeEnv(envMap, order), "utf8");
    console.log("\nFile .env berhasil disimpan.");

    const status = getStatusSummary(envMap);
    printStatus(status);

    if (status.fbAdminOk) {
      initFirebaseAdminFromEnv(envMap);
      const db = getFirestore();
      const auth = getAuth();

      const createAdminAns = (
        await rl.question("Buat atau aktifkan akun Admin pertama di Firebase? (y/N): ")
      )
        .trim()
        .toLowerCase();
      if (createAdminAns === "y" || createAdminAns === "ya") {
        const email =
          (typeof args["admin-email"] === "string" && args["admin-email"]) ||
          (await rl.question("   Email admin (misal admin@fairygift.id): ")).trim();
        const password =
          (typeof args["admin-password"] === "string" && args["admin-password"]) ||
          (await rl.question("   Password admin (min 6 karakter, kosongkan jika akun sudah ada): ")).trim();
        const name = (await rl.question("   Nama admin [Admin FairyGift]: ")).trim() || "Admin FairyGift";
        if (email) {
          await ensureAdminUser(auth, db, email, password, name);
        }
      }

      const seedAns = (
        await rl.question("Seed data katalog awal (kategori, produk, kemasan, komponen) ke Firestore? (y/N): ")
      )
        .trim()
        .toLowerCase();
      if (seedAns === "y" || seedAns === "ya" || args.seed) {
        await seedFirestore(db);
      }
    }

    if (status.cloudinaryOk) {
      await verifyCloudinary(envMap);
    }

    console.log("\nSetup selesai. Jalankan `npm run dev` dan cek `http://localhost:3000/api/health`.");
  } finally {
    rl.close();
  }
}

main().catch((err) => {
  console.error("\nTerjadi kesalahan setup:", err.message || err);
  process.exit(1);
});
