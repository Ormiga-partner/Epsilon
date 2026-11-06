import Button from "@/components/ui/Button";
import BlindsReveal from "@/components/framer/BlindsReveal";
import DraggableCarousel from "@/components/framer/DraggableCarousel";
import ServicioCard from "@/components/ServicioCard";

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
      <DraggableCarousel
        gap={24}
        padding={0}
        dragElastic={0.2}
        threshold={0.1}
        overflowVisible
      >
        {servicios.map((s) => (
          <ServicioCard
            key={s.title}
            {...s}
            className="h-[440px] w-[300px] cursor-grab active:cursor-grabbing md:h-[480px] md:w-[390px]"
          />
        ))}
      </DraggableCarousel>
    </section>
  );
}
