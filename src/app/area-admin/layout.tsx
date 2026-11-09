import type { Metadata } from "next";
import CmsShell from "@/components/cms/CmsShell";

export const metadata: Metadata = {
  title: "Editor sito | AG SERVIZI",
  robots: { index: false, follow: false },
};

export default function AreaAdminLayout({ children }: { children: React.ReactNode }) {
  return <CmsShell>{children}</CmsShell>;
}
