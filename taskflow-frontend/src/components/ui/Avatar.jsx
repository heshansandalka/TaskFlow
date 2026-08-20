const PALETTE = [
  "from-brand-500 to-brand-700",
  "from-accent-teal to-brand-500",
  "from-accent-amber to-accent-rose",
  "from-brand-400 to-accent-teal",
  "from-accent-rose to-brand-700",
];

function hashName(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return Math.abs(h);
}

export default function Avatar({ name = "?", size = "md", ring = false }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const gradient = PALETTE[hashName(name) % PALETTE.length];
  const sizes = { sm: "h-6 w-6 text-[10px]", md: "h-8 w-8 text-xs", lg: "h-11 w-11 text-sm" };

  return (
    <div
      title={name}
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradient}
        font-display font-semibold text-white ${sizes[size]}
        ${ring ? "ring-2 ring-ink-900" : ""}`}
    >
      {initials}
    </div>
  );
}
