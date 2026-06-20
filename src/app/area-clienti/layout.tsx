import type { Metadata } from "next";
import ClientAreaShell from "@/components/client-area/ClientAreaShell";
import { PRIVATE_AREA_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = {
  robots: PRIVATE_AREA_ROBOTS,
};

export default function AreaClientiLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ClientAreaShell>{children}</ClientAreaShell>;
}
