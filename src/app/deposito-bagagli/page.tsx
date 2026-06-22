import { Suspense } from "react";
import { buildMetadata } from "@/lib/seo";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import DepositoBookingClient from "./DepositoBookingClient";

export const revalidate = 3600;

export function generateMetadata() {
  return buildMetadata({
    title: "Deposito Bagagli a Castellammare di Stabia",
    description:
      "Prenota il deposito bagagli presso AG SERVIZI a Castellammare di Stabia. Tariffa giornaliera, prenotazione online e ritiro in Via Plinio il Vecchio 72.",
    path: "/deposito-bagagli",
    keywords: [
      "deposito bagagli castellammare di stabia",
      "deposito bagagli costiera",
      "left luggage castellammare",
      "luggage storage",
    ],
  });
}

export default function DepositoBagagliPage() {
  return (
    <>
      <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
        <DepositoBookingClient />
      </Suspense>
      <BreadcrumbJsonLd
        items={[{ name: "Deposito Bagagli", href: "/deposito-bagagli" }]}
      />
    </>
  );
}
