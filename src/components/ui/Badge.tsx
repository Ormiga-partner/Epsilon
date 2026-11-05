// Componente "Badges" de Framer
export default function Badge({ tag, children }: { tag: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(208,219,254,0.6)] py-0.5 pr-3 pl-0.5 backdrop-blur-[10px]">
      <span className="t-body-s rounded-full bg-brand-500 px-2 py-1 text-white">{tag}</span>
      <span className="t-body-s text-neutral-900">{children}</span>
    </span>
  );
}
