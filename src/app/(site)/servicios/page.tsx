import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import BlindsReveal from "@/components/framer/BlindsReveal";
import Reveal from "@/components/Reveal";
import ServicioCard from "@/components/ServicioCard";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Servicios",
  description:
    "Construcción y mantenimiento de redes de fibra óptica, sitios móviles y planta externa para operadores de telecomunicaciones.",
};

// Contenido de la página "/servicios" de Framer (4 áreas, 13 servicios)
const areas = [
  {
    title: "Ingeniería y despliegue de redes de fibra óptica",
    items: [
      {
        title: "Ingeniería y Despliegue de Redes de FON",
        text: "Ejecución, tendido e instalación de tramos troncales e interurbanos de fibra óptica de alta capacidad a lo largo del territorio nacional.",
        image: "ingenieria-redes-fon",
      },
      {
        title: "Enlaces de Transmisión (TX)",
        text: "Construcción y habilitación de infraestructura troncal y de transporte para la interconexión de nodos de telecomunicaciones mediante fibra óptica.",
        image: "enlaces-transmision",
      },
      {
        title: "Despliegue e Infraestructura Vertical FTTH",
        text: "Implementación de redes de acceso masivo bajo la modalidad de “llave en mano”, especializándose en el despliegue vertical.",
        image: "vertical-ftth",
      },
    ],
  },
  {
    title: "Operaciones, mantenimiento y conectividad de clientes",
    items: [
      {
        title: "Conectividad de Última Milla Corporativa",
        text: "Construcción, habilitación y mantenimiento de accesos dedicados de alta velocidad y máxima confiabilidad para el segmento de grandes empresas y clientes corporativos.",
        image: "ultima-milla",
      },
      {
        title: "Mantenimiento de Red de Planta Externa",
        text: "Soporte técnico crítico, atención y resolución de incidencias en redes de fibra óptica, operando bajo estrictos acuerdos de nivel de servicio (SLA) y cumplimiento de KPIs.",
        image: "mantenimiento-planta-externa",
      },
      {
        title: "Operaciones de Desconexión Masiva",
        text: "Gestión, retiro y control de servicios e infraestructura MDU a nivel residencial y comercial, con una amplia capacidad logística y cobertura geográfica.",
        image: "desconexion-masiva",
      },
      {
        title: "Instalación Domiciliaria e Integración de Clientes FTTH",
        text: "Gestión operativa e integral de la última milla residencial, abarcando altas de servicios, migraciones tecnológicas, modificaciones postventa, cambios de domicilio y reparaciones técnicas.",
        image: "instalacion-domiciliaria-ftth",
      },
      {
        title: "Migración de Servicios Masivos DTH",
        text: "Planificación, ejecución y gestión logística para la transición, reorientación y recambio tecnológico de sistemas de televisión satelital domiciliaria e institucional, garantizando la continuidad del servicio y el cumplimiento de metas de conectividad.",
        image: "migracion-dth",
      },
      {
        title: "Traslado y Reordenamiento de Redes",
        text: "Reubicación, adecuación y despeje de tendidos aéreos o subterráneos de redes híbridas de coaxial y fibra (HFC) y redes de Fibra Óptica (F.O.) en distintas regiones del país.",
        image: "traslado-redes",
      },
    ],
  },
  {
    title: "Infraestructura celular y sitios móviles",
    items: [
      {
        title: "Desarrollo de Sitios Fijos e Infraestructura Especializada",
        text: "Construcción y acondicionamiento de centros de intercambio de tráfico y estaciones de datos de alta exigencia regulatoria.",
        image: "sitios-fijos",
      },
      {
        title: "Construcción e Infraestructura de Sitios Móviles",
        text: "Ejecución completa de obras de telecomunicaciones para telefonía celular y datos móviles, especializada en montaje de torres contraventadas, monopostes y autosoportadas.",
        image: "sitios-moviles",
      },
      {
        title: "Implementación de Nodos IPRAN",
        text: "Configuración, comisionamiento e integración de sitios y nodos de red IP orientados a la transmisión de datos móviles de alta velocidad bajo tecnología LTE.",
        image: "nodos-ipran",
      },
    ],
  },
  {
    title: "Obras civiles especializadas",
    items: [
      {
        title: "Obras Civiles Especializadas para Telecomunicaciones",
        text: "Desarrollo del entorno físico, canalizaciones y obras complementarias necesarias para viabilizar y proteger el tendido de las redes de comunicaciones.",
        image: "obras-civiles",
      },
    ],
  },
];

export default function ServiciosPage() {
  return (
    <main className="flex w-full flex-col items-center gap-20 bg-neutral-100">
      <PageHero
        title="Conoce nuestros servicios"
        subtitle="Construcción y mantenimiento de redes de fibra óptica, sitios móviles y planta externa para operadores de telecomunicaciones."
        actions={
          <span className="animate-appear [animation-delay:300ms]">
            <Button href="/contacto">Contáctanos</Button>
          </span>
        }
        image="/images/servicios/hero.webp"
        alt="Postes y tendido de redes en un camino, en arte ASCII"
        overlap={10}
        brightness={15}
        contrast={-5}
      />

      {/* Áreas de servicio */}
      <section className="flex w-full max-w-[1200px] flex-col gap-20 px-4 py-6 min-[810px]:p-8 min-[1200px]:p-10">
        {areas.map((area) => (
          <div key={area.title} className="flex flex-col gap-10">
            <BlindsReveal as="h2" className="t-h2 max-w-[600px] text-neutral-900">
              {area.title}
            </BlindsReveal>
            {/* Phone: fila con scroll horizontal (300×420) · Tablet: 2 columnas · Desktop: 3 columnas */}
            <div className="-mx-4 flex gap-6 overflow-x-auto px-4 pb-2 min-[810px]:mx-0 min-[810px]:grid min-[810px]:grid-cols-2 min-[810px]:gap-x-6 min-[810px]:gap-y-10 min-[810px]:overflow-visible min-[810px]:px-0 min-[810px]:pb-0 min-[1200px]:grid-cols-3">
              {area.items.map((s) => (
                <Reveal key={s.title} className="shrink-0">
                  <ServicioCard
                    title={s.title}
                    text={s.text}
                    image={`/images/servicios/${s.image}.webp`}
                    className="h-[420px] w-[300px] min-[810px]:h-[480px] min-[810px]:w-full"
                  />
                </Reveal>
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
