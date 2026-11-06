import GlowEdge from "@/components/framer/GlowEdge";
import ImageAscii from "@/components/ImageAscii";

// Componente "Servicios" de Framer (Home: 390×480 / 300×440 · Servicios: grilla 1fr×480 / 300×420).
// Capas como en Framer: fondo degradado → GlowEdge → capa gris rgb(237,237,237) → contenido.
// En hover (variante gesture "hover") la capa gris pasa de opacidad 1 a 0 con un spring
// (stiffness 300, damping 40) y deja ver el degradado y el borde iluminado.
export interface ServicioCardProps {
  title: string;
  text: string;
  image: string;
  /** tamaño de la tarjeta (alto/ancho) según dónde se use */
  className?: string;
}

export default function ServicioCard({
  title,
  text,
  image,
  className = "",
}: ServicioCardProps) {
  return (
    <article
      className={`group relative flex flex-col gap-8 overflow-hidden rounded-3xl bg-linear-to-b from-[rgb(242,245,255)] to-brand-100 p-6 ${className}`}
    >
      {/* niveles=1: en Framer eran 3 por los wrappers del canvas; aquí el padre directo es la tarjeta.
          zIndex 0 = wrapper de Framer, deja el borde bajo la capa gris hasta el hover. */}
      <GlowEdge
        style={{ zIndex: 0 }}
        niveles={1}
        heredarRadio
        radio={24}
        grosor={1.5}
        color="var(--color-brand-300)"
        degradado
        colorFin="var(--color-brand-100)"
        tamano={240}
        nucleo={40}
        opacidad={1}
        proyectar={false}
        halo
        haloTamano={180}
        haloDifuminado={10}
        haloOpacidad={1}
        modo="auto"
        soloConHover
        velocidad={0.3}
        duracion={0.25}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[rgb(237,237,237)] opacity-100 transition-opacity duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-0"
      />
      <div className="relative min-h-0 flex-1">
        <ImageAscii
          src={image}
          alt={title}
          brightness={-15}
          className="absolute inset-0"
        />
      </div>
      <div className="relative z-[2] flex flex-col gap-4">
        <h3 className="t-h3 text-balance hyphens-auto break-words text-neutral-900">{title}</h3>
        <p className="t-body-m text-balance text-neutral-800">{text}</p>
      </div>
    </article>
  );
}
