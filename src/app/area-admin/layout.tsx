import AdminPortalGuard from "@/components/admin-area/AdminPortalGuard";
import AdminSidebarShell from "@/components/admin-area/AdminSidebarShell";

export default function AreaAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AdminPortalGuard>
      <AdminSidebarShell>{children}</AdminSidebarShell>
    </AdminPortalGuard>
  );
}
