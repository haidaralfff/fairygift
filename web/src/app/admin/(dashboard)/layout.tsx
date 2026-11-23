import { AdminAuthProvider } from "@/components/admin/admin-auth-provider";
import { AdminShell } from "@/components/admin/admin-shell";

export default function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AdminAuthProvider>
      <AdminShell>{children}</AdminShell>
    </AdminAuthProvider>
  );
}
