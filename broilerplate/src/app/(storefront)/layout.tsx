import { StorefrontHeader } from "@/components/layout/storefront-header";
import { StorefrontFooter } from "@/components/layout/storefront-footer";

export default function StorefrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-dvh flex-col bg-[var(--ground)]">
      <StorefrontHeader />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <StorefrontFooter />
    </div>
  );
}
