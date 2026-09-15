import type { Metadata } from "next";
import AdminPortalGuard from "@/components/admin-area/AdminPortalGuard";
import AdminSidebarShell from "@/components/admin-area/AdminSidebarShell";
import SessionCookieBridge from "@/components/auth/SessionCookieBridge";
import { PRIVATE_AREA_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = {
  robots: PRIVATE_AREA_ROBOTS,
};

export default function AreaAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SessionCookieBridge kind="staff" />
      <AdminPortalGuard>
        <AdminSidebarShell>{children}</AdminSidebarShell>
      </AdminPortalGuard>
    </>
  );
}
