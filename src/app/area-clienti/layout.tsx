import ClientPortalGuard from "@/components/client-area/ClientPortalGuard";

export default function AreaClientiLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ClientPortalGuard>{children}</ClientPortalGuard>;
}
