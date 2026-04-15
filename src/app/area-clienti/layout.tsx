import ClientAreaShell from "@/components/client-area/ClientAreaShell";

export default function AreaClientiLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ClientAreaShell>{children}</ClientAreaShell>;
}
