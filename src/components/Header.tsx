import Link from "next/link";
import Container from "./Container";
import { navigation } from "@/lib/site-data";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/70 backdrop-blur">
      <Container className="flex items-center justify-between py-5">
        <Link href="/" className="text-lg font-semibold text-white">
          AG SERVIZI
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-200 transition hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex">
          <Link
            href="/contatti"
            className="rounded-full bg-cyan-500 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            Contattaci
          </Link>
        </div>
      </Container>
      <div className="border-t border-white/10 md:hidden">
        <Container className="flex flex-wrap items-center gap-4 py-4 text-sm">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-medium text-slate-200"
            >
              {item.label}
            </Link>
          ))}
        </Container>
      </div>
    </header>
  );
}
