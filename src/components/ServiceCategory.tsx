import { ServiceCategory as ServiceCategoryType } from "@/lib/site-data";
import { cx } from "@/lib/utils";
import {
  DigitalIcon,
  EnergyIcon,
  LogisticsIcon,
  PaymentsIcon,
  PhoneIcon,
  WebIcon,
} from "./Icons";

const iconMap = {
  payments: PaymentsIcon,
  phone: PhoneIcon,
  energy: EnergyIcon,
  logistics: LogisticsIcon,
  digital: DigitalIcon,
  web: WebIcon,
};

export default function ServiceCategory({
  category,
  compact = false,
  tone = "light",
}: {
  category: ServiceCategoryType;
  compact?: boolean;
  tone?: "light" | "dark";
}) {
  const Icon = iconMap[category.icon];
  const isDark = tone === "dark";
  return (
    <section
      className={cx(
        "group relative overflow-hidden rounded-[32px] p-7",
        isDark
          ? "border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-950/80 to-slate-950/95 shadow-[0_30px_90px_rgba(0,0,0,0.35)]"
          : "border border-slate-200/60 bg-white/90 shadow-[0_30px_90px_rgba(15,23,42,0.12)]",
      )}
    >
      <div
        className={cx(
          "absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent",
          isDark ? "via-cyan-400/50" : "via-cyan-500/40",
        )}
      />
      <div className="flex items-start gap-4">
        <div
          className={cx(
            "rounded-2xl p-3 ring-1 transition group-hover:scale-105",
            isDark
              ? "bg-cyan-500/10 text-cyan-300 ring-cyan-400/20"
              : "bg-cyan-500/10 text-cyan-700 ring-cyan-500/20",
          )}
        >
          <Icon />
        </div>
        <div className="space-y-2">
          <h3
            className={cx(
              "text-xl font-semibold",
              isDark ? "text-white" : "text-slate-900",
            )}
          >
            {category.title}
          </h3>
          <p className={cx("text-sm", isDark ? "text-slate-300" : "text-slate-600")}>
            {category.subtitle}
          </p>
        </div>
      </div>
      <div
        className={cx(
          "mt-6 grid gap-4",
          compact ? "md:grid-cols-2" : "md:grid-cols-3",
        )}
      >
        {category.items.map((item) => (
          <div
            key={item.title}
            className={cx(
              "rounded-2xl p-4 transition hover:-translate-y-1",
              isDark
                ? "border border-white/10 bg-slate-950/60 hover:border-cyan-400/40 hover:shadow-[0_18px_45px_rgba(8,47,73,0.45)]"
                : "border border-slate-200/60 bg-white/95 hover:border-cyan-500/40 hover:shadow-[0_18px_45px_rgba(15,23,42,0.15)]",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <h4
                className={cx(
                  "text-base font-semibold",
                  isDark ? "text-white" : "text-slate-900",
                )}
              >
                {item.title}
              </h4>
              <span
                className={cx(
                  "hidden rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] md:inline",
                  isDark
                    ? "border-white/10 text-cyan-300"
                    : "border-slate-200 text-cyan-600",
                )}
              >
                Servizio
              </span>
            </div>
            <p className={cx("mt-2 text-sm", isDark ? "text-slate-300" : "text-slate-600")}>
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
