export default function AuthShell({ eyebrow, title, subtitle, children }) {
  return (
    <div className="flex min-h-screen bg-aurora bg-fixed">
      {/* Left: form */}
      <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-[440px] lg:shrink-0 xl:w-[480px]">
        <div className="mb-8 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gradient font-display font-bold text-white">
            T
          </div>
          <span className="font-display text-xl font-semibold tracking-tight">TaskFlow</span>
        </div>

        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-brand-400">
          {eyebrow}
        </p>
        <h1 className="mb-2 font-display text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mb-8 text-sm text-mist-100/50">{subtitle}</p>

        <div className="glass-panel p-6">{children}</div>
      </div>

      {/* Right: signature visual — live board preview, hidden on small screens */}
      <div className="relative hidden flex-1 items-center justify-center overflow-hidden lg:flex">
        <BoardPreview />
      </div>
    </div>
  );
}

function BoardPreview() {
  const columns = [
    { title: "To Do", cards: ["Design onboarding flow", "Set up CI pipeline"] },
    { title: "Doing", cards: ["Real-time sync engine", "Drag-and-drop cards"] },
    { title: "Done", cards: ["Auth & JWT", "Board schema"] },
  ];

  return (
    <div className="relative flex gap-4 p-10">
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-500/25 blur-3xl"
        aria-hidden
      />
      {columns.map((col, i) => (
        <div
          key={col.title}
          className="glass-panel w-52 space-y-2.5 p-3 opacity-95"
          style={{
            transform: `translateY(${i === 1 ? "-14px" : "8px"}) rotate(${i === 0 ? "-1.5deg" : i === 2 ? "1.5deg" : "0"})`,
          }}
        >
          <p className="px-1 font-display text-sm font-semibold">{col.title}</p>
          {col.cards.map((c) => (
            <div
              key={c}
              className="rounded-lg border border-white/[0.08] bg-white/[0.05] p-2.5 text-xs leading-snug text-mist-100/80"
            >
              {c}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
