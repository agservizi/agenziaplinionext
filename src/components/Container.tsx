import { cx } from "@/lib/utils";

export default function Container({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("mx-auto w-full max-w-none px-6 md:px-10 lg:px-14", className)}>
      {children}
    </div>
  );
}
