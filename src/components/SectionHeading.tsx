import { cx } from "@/lib/utils";

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "light",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
}) {
  const isDark = tone === "dark";
  return (
    <div
      className={cx(
        "space-y-3",
        align === "center" ? "text-center" : "text-left",
      )}
    >
      {eyebrow ? (
        <p
          className={cx(
            "text-sm font-semibold uppercase tracking-[0.2em]",
            isDark ? "text-cyan-600" : "text-cyan-400",
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cx(
          "text-3xl font-semibold md:text-4xl",
          isDark ? "text-slate-900" : "text-white",
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cx(
            "text-base md:text-lg",
            isDark ? "text-slate-600" : "text-slate-300",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
