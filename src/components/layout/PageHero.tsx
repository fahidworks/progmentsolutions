export function PageHero({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <section className="text-white" style={{ background: "var(--gradient-hero)" }}>
      <div className="container mx-auto px-4 py-20 lg:py-28 text-center">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-4 max-w-2xl mx-auto opacity-90 text-base md:text-lg">{subtitle}</p>}
      </div>
    </section>
  );
}