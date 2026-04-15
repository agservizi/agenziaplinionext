"use client";

import { Icon } from "@iconify/react";
import mdiCandle from "@iconify-icons/mdi/candle";
import mdiEggEaster from "@iconify-icons/mdi/egg-easter";
import mdiFlagVariant from "@iconify-icons/mdi/flag-variant";
import mdiGift from "@iconify-icons/mdi/gift";
import mdiHammerWrench from "@iconify-icons/mdi/hammer-wrench";
import mdiMedalOutline from "@iconify-icons/mdi/medal-outline";
import mdiPartyPopper from "@iconify-icons/mdi/party-popper";
import mdiPineTree from "@iconify-icons/mdi/pine-tree";
import mdiSparkles from "@iconify-icons/mdi/sparkles";
import mdiStarFourPoints from "@iconify-icons/mdi/star-four-points";
import mdiWhiteBalanceSunny from "@iconify-icons/mdi/white-balance-sunny";
import type { IconifyIcon } from "@iconify/types";
import type { ReactNode } from "react";

type SeasonalHeroObjectProps = {
  heroKey: string;
  heroNumber: string;
  accentClass: string;
};

function VisualShell({
  accentClass,
  children,
}: {
  accentClass: string;
  children: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(15,23,42,0.16))] p-5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.16),transparent_34%)]" />
      <div className={`relative min-h-[228px] ${accentClass}`}>{children}</div>
    </div>
  );
}

function IconOrb({
  icon,
  className,
}: {
  icon: IconifyIcon;
  className: string;
}) {
  return <Icon icon={icon} className={className} aria-hidden="true" />;
}

function SeasonalIconCard({
  accentClass,
  mainIcon,
  orbitIcon,
  heroNumber,
  heroLabel,
}: {
  accentClass: string;
  mainIcon: IconifyIcon;
  orbitIcon: IconifyIcon;
  heroNumber?: string;
  heroLabel: string;
}) {
  return (
    <VisualShell accentClass={accentClass}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-current/15" />
        <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-current/10" />
      </div>

      <div className="relative flex h-[228px] items-center justify-center">
        <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-current/20 bg-current/5 blur-[1px]" />
        <IconOrb
          icon={mainIcon}
          className="relative z-20 text-[6.2rem] text-current drop-shadow-[0_16px_36px_rgba(0,0,0,0.32)] motion-safe:animate-[heroBreathe_4.4s_ease-in-out_infinite]"
        />

        <IconOrb
          icon={orbitIcon}
          className="absolute left-[22%] top-[22%] z-10 text-[1.6rem] text-current/80 motion-safe:animate-[heroFloat_5.5s_ease-in-out_infinite]"
        />
        <IconOrb
          icon={orbitIcon}
          className="absolute right-[20%] top-[30%] z-10 text-[1.4rem] text-current/70 motion-safe:animate-[heroFloat_6.3s_ease-in-out_infinite_0.6s]"
        />
        <IconOrb
          icon={orbitIcon}
          className="absolute bottom-[20%] left-[28%] z-10 text-[1.25rem] text-current/65 motion-safe:animate-[heroFloat_6.8s_ease-in-out_infinite_1.2s]"
        />
      </div>

      <div className="absolute inset-x-0 bottom-3 px-2 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-current/75">
          {heroLabel}
        </p>
        {heroNumber ? (
          <p className="mt-1 text-sm font-semibold text-current/90">{heroNumber}</p>
        ) : null}
      </div>
    </VisualShell>
  );
}

function AnniversaryCard({
  accentClass,
  heroNumber,
}: {
  accentClass: string;
  heroNumber: string;
}) {
  return (
    <SeasonalIconCard
      accentClass={accentClass}
      mainIcon={mdiMedalOutline}
      orbitIcon={mdiSparkles}
      heroNumber={heroNumber}
      heroLabel="Anniversario"
    />
  );
}

function NewYearObject({ heroNumber, accentClass }: { heroNumber: string; accentClass: string }) {
  const year = heroNumber === "01" ? String(new Date().getFullYear()) : heroNumber;
  return (
    <SeasonalIconCard
      accentClass={accentClass}
      mainIcon={mdiPartyPopper}
      orbitIcon={mdiSparkles}
      heroNumber={year}
      heroLabel="Nuovo Anno"
    />
  );
}

function EpiphanyObject({ accentClass }: { accentClass: string }) {
  return (
    <SeasonalIconCard
      accentClass={accentClass}
      mainIcon={mdiStarFourPoints}
      orbitIcon={mdiSparkles}
      heroLabel="Epifania"
    />
  );
}

function EasterObject({ accentClass }: { accentClass: string }) {
  return (
    <SeasonalIconCard
      accentClass={accentClass}
      mainIcon={mdiEggEaster}
      orbitIcon={mdiSparkles}
      heroLabel="Pasqua"
    />
  );
}

function TricolorObject({ accentClass }: { accentClass: string }) {
  return (
    <VisualShell accentClass={accentClass}>
      <div className="relative flex h-[228px] items-center justify-center">
        <div className="absolute inset-0 rounded-[1.25rem] bg-[linear-gradient(90deg,rgba(34,197,94,0.28)_0%,rgba(255,255,255,0.1)_50%,rgba(239,68,68,0.28)_100%)]" />
        <Icon icon={mdiFlagVariant} className="relative z-10 text-[6rem] text-white/95 drop-shadow-[0_16px_36px_rgba(0,0,0,0.32)] motion-safe:animate-[heroBreathe_4.4s_ease-in-out_infinite]" aria-hidden="true" />
      </div>
      <p className="absolute inset-x-0 bottom-3 text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-current/80">
        Italia
      </p>
    </VisualShell>
  );
}

function LabourObject({ accentClass }: { accentClass: string }) {
  return (
    <SeasonalIconCard
      accentClass={accentClass}
      mainIcon={mdiHammerWrench}
      orbitIcon={mdiSparkles}
      heroLabel="1 Maggio"
    />
  );
}

function FerragostoObject({ accentClass }: { accentClass: string }) {
  return (
    <SeasonalIconCard
      accentClass={accentClass}
      mainIcon={mdiWhiteBalanceSunny}
      orbitIcon={mdiSparkles}
      heroLabel="Ferragosto"
    />
  );
}

function LanternObject({ accentClass }: { accentClass: string }) {
  return (
    <SeasonalIconCard
      accentClass={accentClass}
      mainIcon={mdiCandle}
      orbitIcon={mdiSparkles}
      heroLabel="Ricorrenza"
    />
  );
}

function ImmacolataObject({ accentClass }: { accentClass: string }) {
  return (
    <SeasonalIconCard
      accentClass={accentClass}
      mainIcon={mdiStarFourPoints}
      orbitIcon={mdiSparkles}
      heroLabel="8 Dicembre"
    />
  );
}

function ChristmasObject({ accentClass }: { accentClass: string }) {
  return (
    <VisualShell accentClass={accentClass}>
      <div className="relative flex h-[228px] items-center justify-center">
        <Icon
          icon={mdiPineTree}
          className="relative z-10 text-[6rem] text-current drop-shadow-[0_16px_36px_rgba(0,0,0,0.32)] motion-safe:animate-[heroBreathe_4.4s_ease-in-out_infinite]"
          aria-hidden="true"
        />
        <Icon
          icon={mdiGift}
          className="absolute bottom-[18%] left-[28%] text-[2.1rem] text-current/85 motion-safe:animate-[heroFloat_6.2s_ease-in-out_infinite]"
          aria-hidden="true"
        />
        <Icon
          icon={mdiSparkles}
          className="absolute right-[24%] top-[28%] text-[1.4rem] text-current/75 motion-safe:animate-[heroFloat_5.8s_ease-in-out_infinite_0.6s]"
          aria-hidden="true"
        />
      </div>
      <p className="absolute inset-x-0 bottom-3 text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-current/80">
        Natale
      </p>
    </VisualShell>
  );
}

export default function SeasonalHeroObject({
  heroKey,
  heroNumber,
  accentClass,
}: SeasonalHeroObjectProps) {
  switch (heroKey) {
    case "new-year":
      return <NewYearObject heroNumber={heroNumber} accentClass={accentClass} />;
    case "epiphany":
      return <EpiphanyObject accentClass={accentClass} />;
    case "easter":
      return <EasterObject accentClass={accentClass} />;
    case "liberation-day":
    case "republic-day":
      return <TricolorObject accentClass={accentClass} />;
    case "labour-day":
      return <LabourObject accentClass={accentClass} />;
    case "anniversary-june-2026":
      return <AnniversaryCard heroNumber={heroNumber} accentClass={accentClass} />;
    case "ferragosto":
      return <FerragostoObject accentClass={accentClass} />;
    case "all-saints":
    case "saint-catello":
    case "saint-stephen":
      return <LanternObject accentClass={accentClass} />;
    case "immaculate-conception":
      return <ImmacolataObject accentClass={accentClass} />;
    case "christmas":
      return <ChristmasObject accentClass={accentClass} />;
    default:
      return <ImmacolataObject accentClass={accentClass} />;
  }
}
