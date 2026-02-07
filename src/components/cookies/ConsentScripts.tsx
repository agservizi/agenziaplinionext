"use client";

import Script from "next/script";
import { useConsent } from "@/components/cookies/ConsentProvider";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function ConsentScripts() {
  const { consent } = useConsent();

  if (!GA_ID || !consent?.analytics) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config','${GA_ID}', { anonymize_ip: true });`}
      </Script>
    </>
  );
}
