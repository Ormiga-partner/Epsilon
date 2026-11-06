// Plantilla de las páginas legales de Framer: hero (H1 + "Última actualización" en Body L,
// alineados abajo), intro en Body L y secciones (H3 + Body M) al 80 % del ancho, gap 40/20.

export interface LegalSection {
  title: string;
  body: React.ReactNode;
}

export default function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro: React.ReactNode;
  sections: LegalSection[];
}) {
  return (
    <main className="flex w-full flex-col items-center gap-20 bg-neutral-100">
      <section className="flex w-full max-w-[1200px] flex-col gap-4 px-4 pt-[94px] min-[810px]:flex-row min-[810px]:items-end min-[810px]:px-8 min-[1200px]:px-10">
        <h1 className="t-h1 flex-1 text-neutral-900">{title}</h1>
        <p className="t-body-l text-neutral-900">Última actualización: {updated}</p>
      </section>
      <section className="flex w-full max-w-[1200px] flex-col items-start gap-10 px-4 py-6 min-[810px]:p-8 min-[1200px]:p-10">
        <div className="t-body-l w-full text-neutral-900 min-[810px]:w-4/5">{intro}</div>
        {sections.map((s) => (
          <div key={s.title} className="flex w-full flex-col gap-5 min-[810px]:w-4/5">
            <h2 className="t-h3 text-neutral-900">{s.title}</h2>
            <div className="t-body-m flex flex-col gap-4 text-neutral-800 [&_strong]:font-medium [&_strong]:text-neutral-900 [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:pl-5 [&_a]:underline [&_a]:underline-offset-2">
              {s.body}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
