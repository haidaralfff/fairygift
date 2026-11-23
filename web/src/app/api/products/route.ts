import { NextResponse } from "next/server";
import { getStorefrontCategories, getStorefrontProducts } from "@/lib/data/catalog-service";

export async function GET() {
  const [products, categories] = await Promise.all([
    getStorefrontProducts(),
    getStorefrontCategories(),
  ]);
  return NextResponse.json({ products, categories });
}
