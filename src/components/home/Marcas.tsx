import BlindsReveal from "@/components/framer/BlindsReveal";
import OrbitLogos from "@/components/framer/OrbitLogos";

const items = [
  { logo: { src: "/logos/orbit-claro.svg", alt: "Claro" }, title: "Claro", text: "Construcción de accesos +500 clientes corporativos." },
  { logo: { src: "/logos/orbit-tuves.svg", alt: "Tuves" }, title: "Tuves", text: "Operación técnica del ciclo de vida DTH, con foco en continuidad del servicio y cumplimiento de SLA." },
  { logo: { src: "/logos/orbit-vtr.svg", alt: "VTR" }, title: "Vtr", text: "Más de 7.000 incidencias atendidas, cumpliendo con los SLA y KPI establecidos por cliente ClaroVTR." },
  { logo: { src: "/logos/orbit-wom.svg", alt: "WOM" }, title: "Wom", text: "Construcción de 40 sitios móviles en territorio nacional. Torres contraventadas, monoposte y autosoportadas, cliente WOM." },
  { logo: { src: "/logos/orbit-zte.svg", alt: "ZTE" }, title: "Zte", text: "Ingeniería end-to-end para redes de fibra óptica, desde el levantamiento en terreno hasta la entrega documentada del proyecto." },
];

const geist = "var(--font-geist-sans), sans-serif";

export default function Marcas() {
  return (
    <section className="flex w-full max-w-[1200px] flex-col items-center gap-10 bg-neutral-100 px-6 py-10 md:px-10">
      <div className="flex w-full max-w-[700px] flex-col items-center gap-4">
        <BlindsReveal as="h2" className="t-h2 w-full text-center text-neutral-900">
          Marcas con las que conectamos
        </BlindsReveal>
        <p className="t-body-m w-full text-center text-neutral-800">
          Trabajamos junto a los principales operadores e integradores del país, conectando cada proyecto con la
          infraestructura que lo sostiene.
        </p>
      </div>
      <div className="h-[440px] w-full">
        <OrbitLogos
          centerLogo={{ src: "/brand/favicon-centrado.svg", alt: "Epsilon Work" }}
          centerSize={100}
          centerPadding={8}
          centerBackground="rgb(255, 255, 255)"
          centerBorderColor="rgba(0, 0, 0, 0.08)"
          centerBorderWidth={1}
          centerShadow
          items={items}
          radius={280}
          nodeSize={80}
          nodePadding={10}
          nodeBackground="rgb(255, 255, 255)"
          nodeBorderColor="rgba(0, 0, 0, 0.08)"
          nodeActiveColor="rgba(90, 105, 224, 0)"
          nodeBorderWidth={1}
          nodeShadow
          speed={6}
          draggable={false}
          showRing
          ringColor="rgba(0, 0, 0, 0.24)"
          ringWidth={1}
          card={{
            width: 280,
            offset: 20,
            padding: 24,
            radius: 16,
            gap: 8,
            background: "#FFFFFF",
            borderColor: "rgba(0,0,0,0.1)",
            titleFont: { fontFamily: geist, fontSize: "1.78rem", letterSpacing: "-0.01em", lineHeight: "1.2em", fontWeight: 400 },
            titleColor: "var(--color-neutral-900)",
            textFont: { fontFamily: geist, fontSize: "1rem", letterSpacing: "-0.01em", lineHeight: "1.4em", fontWeight: 400 },
            textColor: "var(--color-neutral-700)",
          }}
          breakpoint={600}
          margin={16}
          background="transparent"
        />
      </div>
    </section>
  );
}
