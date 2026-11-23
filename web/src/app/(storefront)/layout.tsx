import { StorefrontFooter } from "@/components/layout/storefront-footer";
import { StorefrontHeader } from "@/components/layout/storefront-header";

export default function StorefrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="storefront-theme flex min-h-dvh flex-col bg-[var(--ground)]">
      <StorefrontHeader />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <StorefrontFooter />
    </div>
  );
}
