import Image from "next/image";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import BlindsReveal from "@/components/framer/BlindsReveal";
import VariableDotsGlobe from "@/components/framer/VariableDotsGlobe";

const logos = [
  { src: "/logos/vtr.svg", alt: "VTR", width: 95 },
  { src: "/logos/zte.svg", alt: "ZTE", width: 76 },
  { src: "/logos/wom.svg", alt: "WOM", width: 86 },
  { src: "/logos/tuves.svg", alt: "Tuves", width: 115 },
  { src: "/logos/claro.svg", alt: "Claro", width: 108 },
];

export default function Hero() {
  return (
    <section className="relative flex w-full flex-col items-center">
      <div className="flex w-full flex-col items-center overflow-hidden bg-linear-to-b from-brand-100 to-neutral-100 pt-[94px]">
        <div className="flex w-full max-w-[700px] flex-col items-center gap-6 px-6">
          <Badge tag="N°1">conectividad empresarial</Badge>
          <BlindsReveal as="h1" className="t-h1 w-full text-center text-neutral-900 max-[420px]:text-[2.45rem]">
            Construimos la red que mueve las Telecomunicaciones.
          </BlindsReveal>
          <p className="t-body-l w-full text-center text-neutral-800">
            Construcción y mantenimiento de redes de fibra óptica, sitios móviles y planta externa para operadores.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <span className="animate-appear [animation-delay:300ms]">
              <a
                href="/files/presentacion-epsilon.pdf"
                download="Presentación Epsilon.pdf"
                className="t-body-m inline-flex items-center rounded-full bg-brand-500 px-4 py-2 text-neutral-100 transition-colors hover:bg-brand-700 hover:text-white"
              >
                Descarga nuestra presentación
              </a>
            </span>
            <span className="animate-appear [animation-delay:500ms]">
              <Button href="/servicios" variant="secundario">
                Ver servicios
              </Button>
            </span>
          </div>
        </div>

        {/* Globo: máscara inferior como en Framer */}
        <div className="h-[260px] w-full max-w-[1200px] [mask-image:linear-gradient(0deg,transparent_7%,#000_30%)] md:h-[380px]">
          <VariableDotsGlobe
            style={{ width: "100%", height: "100%" }}
            markers={[]}
            styling={{ oceanColor: "rgb(208, 219, 254)", dotColor: "rgb(67, 113, 252)", backgroundColor: "rgba(242, 242, 242, 0)" }}
            layout={{ isFlat: false, globeScale: 2.25, rotationSpeed: 0.05, positionX: 0, positionY: -1.4, dotDensity: 24000 }}
            dotSizing={{ edgeDotSize: 5, interiorDotSize: 2.4, edgeInfluence: 2.2, sizeRandomness: 0 }}
            interactions={{ enableHover: true }}
          />
        </div>

        {/* Ticker de logos (tickerEffect velocity 50) */}
        <div className="w-full max-w-[1200px] overflow-hidden py-4 [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
          <ul className="flex w-max animate-[ticker_32s_linear_infinite] items-center gap-[65px] pr-[65px] hover:[animation-duration:64s]">
            {[...logos, ...logos, ...logos, ...logos].map((l, i) => (
              <li key={i} aria-hidden={i >= logos.length} className="shrink-0">
                <Image src={l.src} alt={i < logos.length ? l.alt : ""} width={l.width} height={40} style={{ width: l.width, height: "auto" }} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
