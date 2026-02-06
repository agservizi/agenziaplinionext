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
}: {
  category: ServiceCategoryType;
  compact?: boolean;
}) {
  const Icon = iconMap[category.icon];
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-lg shadow-black/20">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-cyan-500/10 p-3 text-cyan-400">
          <Icon />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-white">{category.title}</h3>
          <p className="text-sm text-slate-300">{category.subtitle}</p>
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
            className="rounded-2xl border border-white/10 bg-slate-950/60 p-4"
          >
            <h4 className="text-base font-semibold text-white">{item.title}</h4>
            <p className="mt-2 text-sm text-slate-300">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
