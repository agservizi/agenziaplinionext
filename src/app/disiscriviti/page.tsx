import type { Metadata } from "next";
import Container from "@/components/Container";
import UnsubscribeForm from "@/components/compliance/UnsubscribeForm";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Disiscrizione comunicazioni commerciali",
  description:
    "Disiscriviti dalle email promozionali di AG SERVIZI. Mittente identificabile, senza tracking di apertura.",
  path: "/disiscriviti",
});

type PageProps = {
  searchParams: Promise<{ e?: string; ok?: string; error?: string }>;
};

export default async function DisiscrivitiPage({ searchParams }: PageProps) {
  const params = await searchParams;
  return (
    <div className="pb-24 pt-32">
      <Container className="max-w-xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#5E0ED7]">
          Privacy
        </p>
        <h1 className="display-type mt-3 text-4xl text-[var(--ink)] md:text-5xl">
          Disiscrizione
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-[var(--ink)]/65">
          Puoi interrompere le comunicazioni commerciali in qualsiasi momento. Le email
          transazionali (es. stato pratica, reset password) non sono interessate.
        </p>
        <UnsubscribeForm
          initialToken={params.e || ""}
          initialOk={params.ok === "1"}
          initialError={params.error === "1"}
        />
      </Container>
    </div>
  );
}
