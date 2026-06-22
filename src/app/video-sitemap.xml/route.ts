import { NextResponse } from "next/server";

const SITE_URL = "https://agenziaplinio.it";

const videos = [
  {
    page: "/",
    title: "AG SERVIZI - Servizi Senza Attese",
    description: "Agenzia di servizi a Castellammare di Stabia: pagamenti, telefonia, energia, SPID, PEC e siti web.",
    contentUrl: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260517_222138_3e3205be-3364-417b-a64a-bfe087acbec4.mp4",
    thumbnailUrl: `${SITE_URL}/images/hero-poster.jpg`,
  },
  {
    page: "/chi-siamo",
    title: "Chi Siamo - AG SERVIZI dal 2016",
    description: "La storia di AG SERVIZI, agenzia di servizi a Castellammare di Stabia.",
    contentUrl: "https://assets.mixkit.co/videos/42617/42617-720.mp4",
    thumbnailUrl: `${SITE_URL}/images/chi-siamo-poster.jpg`,
  },
  {
    page: "/contatti",
    title: "Contatti AG SERVIZI",
    description: "Contatta AG SERVIZI a Castellammare di Stabia. WhatsApp, telefono o in sede.",
    contentUrl: "https://assets.mixkit.co/videos/13325/13325-720.mp4",
    thumbnailUrl: `${SITE_URL}/images/contatti-poster.jpg`,
  },
];

export async function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${videos.map(v => `  <url>
    <loc>${SITE_URL}${v.page}</loc>
    <video:video>
      <video:thumbnail_loc>${v.thumbnailUrl}</video:thumbnail_loc>
      <video:title>${v.title}</video:title>
      <video:description>${v.description}</video:description>
      <video:content_loc>${v.contentUrl}</video:content_loc>
      <video:family_friendly>yes</video:family_friendly>
    </video:video>
  </url>`).join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
    },
  });
}
