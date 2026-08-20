const COLOR_MAP = {
  teal: "bg-accent-teal/15 text-accent-teal border-accent-teal/30",
  amber: "bg-accent-amber/15 text-accent-amber border-accent-amber/30",
  rose: "bg-accent-rose/15 text-accent-rose border-accent-rose/30",
  brand: "bg-brand-500/15 text-brand-400 border-brand-500/30",
};

export default function Badge({ children, color = "brand", className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${COLOR_MAP[color]} ${className}`}
    >
      {children}
    </span>
  );
}
