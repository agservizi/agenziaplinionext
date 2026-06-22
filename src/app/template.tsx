export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-[fadeSlideIn_0.35s_cubic-bezier(0.22,1,0.36,1)_0.05s_both]">
      {children}
    </div>
  );
}
