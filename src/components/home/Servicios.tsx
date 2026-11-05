import Button from "@/components/ui/Button";
import BlindsReveal from "@/components/framer/BlindsReveal";
import DraggableCarousel from "@/components/framer/DraggableCarousel";
import GlowEdge from "@/components/framer/GlowEdge";
import ImageAscii from "@/components/ImageAscii";

const servicios = [
  {
    title: "Operaciones de Desconexión Masiva",
    text: "Gestión, retiro y control de infraestructura MDU residencial y comercial, con amplia capacidad logística y cobertura.",
    image: "/images/servicio-desconexion-masiva.webp",
  },
  {
    title: "Implementación de Nodos IPRAN",
    text: "Configuración, comisionamiento e integración de sitios y nodos IP para transmisión de datos móviles bajo tecnología LTE.",
    image: "/images/servicio-nodos-ipran.webp",
  },
  {
    title: "Traslado y Reordenamiento de Redes",
    text: "Reubicación y despeje de tendidos aéreos y subterráneos de redes HFC y Fibra Óptica en distintas regiones del país.",
    image: "/images/servicio-traslado-redes.webp",
  },
  {
    title: "Conectividad de Última Milla Corporativa",
    text: "Construcción y mantenimiento de accesos dedicados de alta velocidad y confiabilidad para clientes corporativos.",
    image: "/images/servicio-ultima-milla.webp",
  },
];

// Componente "Servicios" de Framer (tarjeta 390×480 desktop / 300 mobile)
function ServicioCard({ title, text, image }: (typeof servicios)[number]) {
  return (
    <article className="relative flex h-[440px] w-[300px] flex-col gap-8 overflow-hidden rounded-3xl bg-[rgb(237,237,237)] p-6 md:h-[480px] md:w-[390px]">
      <GlowEdge
        niveles={3}
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
        velocidad={0.3}
        duracion={0.25}
      />
      <div className="relative min-h-0 flex-1">
        <ImageAscii src={image} alt={title} className="absolute inset-0" />
      </div>
      <div className="relative flex flex-col gap-4">
        <h3 className="t-h3 text-neutral-900">{title}</h3>
        <p className="t-body-m text-neutral-800">{text}</p>
      </div>
    </article>
  );
}

export default function Servicios() {
  return (
    <section className="flex w-full max-w-[1200px] flex-col gap-10 bg-neutral-100 px-6 py-10 md:px-10">
      <div className="flex items-end gap-2.5">
        <BlindsReveal as="h2" className="t-h2 flex-1 text-neutral-900">
          Nuestras soluciones
        </BlindsReveal>
        <Button href="/servicios" variant="secundario">
          Ver todos
        </Button>
      </div>
      <DraggableCarousel gap={24} padding={0} dragElastic={0.2} threshold={0.1} overflowVisible>
        {servicios.map((s) => (
          <ServicioCard key={s.title} {...s} />
        ))}
      </DraggableCarousel>
    </section>
  );
}
