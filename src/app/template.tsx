export default function Template({ children }: { children: React.ReactNode }) {
  // h-full keeps dashboard shells sized; avoid transform here — it creates a
  // containing block and collapses absolute/flex children to 0 height.
  return (
    <div className="h-full min-h-0 animate-[fadeSlideIn_0.35s_cubic-bezier(0.22,1,0.36,1)_0.05s_both]">
      {children}
    </div>
  );
}
