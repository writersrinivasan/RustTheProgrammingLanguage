export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative mb-10 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-ink-800 via-ink-900 to-ink-950 px-6 py-10 sm:px-10">
      <div className="grid-lines absolute inset-0" aria-hidden />
      <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-rust-500/25 blur-3xl" aria-hidden />
      <div className="absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-purple-500/20 blur-3xl" aria-hidden />
      <div className="relative">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-rust-300">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-3xl text-base text-white/65 sm:text-lg">{subtitle}</p>
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  );
}
