import type { Metadata } from "next";
import BlindsReveal from "@/components/framer/BlindsReveal";
import Carrusel3D from "@/components/framer/Carrusel3D";
import EpsilonStackCards from "@/components/framer/EpsilonStackCards";
import ImageAscii from "@/components/ImageAscii";
import MVVAccordion from "@/components/nosotros/MVVAccordion";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Sobre nosotros",
  description:
    "Ingeniería y construcción en telecomunicaciones: redes de fibra óptica, sitios móviles y redes HFC/FTTH con altos estándares de calidad y seguridad laboral.",
};

const obras = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({
  src: `/images/nosotros/obra-${n}.webp`,
  alt: `Equipo de Epsilon Work en terreno (${n})`,
}));

// Colores de los tokens de Framer en rgb (el canvas de EpsilonStackCards no entiende var())
const N900 = "rgb(31, 31, 31)";
const B700 = "rgb(12, 46, 151)";

export default function SobreNosotrosPage() {
  return (
    <main className="flex w-full flex-col items-center gap-20 bg-neutral-100">
      {/* Hero */}
      <section className="relative flex w-full flex-col items-center overflow-hidden bg-linear-to-b from-brand-100 to-neutral-100 pt-[94px]">
        <div className="relative z-[2] flex w-full max-w-[1200px] justify-center px-6 min-[810px]:px-10">
          <div className="flex w-full max-w-[700px] flex-col items-center gap-6">
            <BlindsReveal as="h1" className="t-h1 w-full text-center text-neutral-900 max-[420px]:text-[2.45rem]">
              Infraestructura de red en la que tu operación puede confiar.
            </BlindsReveal>
            <p className="t-body-l w-full text-center text-neutral-800">
              Internet dedicado, fibra óptica y redes empresariales con respaldo técnico real y soporte permanente.
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
        </div>
        {/* "Negative Gap" -20% de Framer y máscara inferior 0→20% */}
        <div className="relative z-0 -mt-[20%] aspect-[2048/1143] w-full [mask-image:linear-gradient(0deg,transparent_0%,#000_20%)]">
          <ImageAscii
            src="/images/nosotros/hero.webp"
            alt="Torre de telecomunicaciones sobre cordillera, en arte ASCII"
            sizing="fill"
            outputWidth={200}
            lineHeight={0.8}
            colorFrom="rgb(67, 113, 252)"
            colorTo="rgb(161, 184, 253)"
            lightMax={1}
            // Suavizado a pedido: las montañas casi negras caían en los glifos más densos
            brightness={38}
            contrast={-25}
            whiteCutoff={0.9}
            glowBlur={1}
            cursorWidth={16}
            className="absolute inset-0"
          />
        </div>
      </section>

      {/* Sobre Epsilon */}
      <section className="flex w-full max-w-[1200px] flex-col items-center gap-10 px-4 py-6 min-[810px]:p-8 min-[1200px]:p-10">
        <div className="flex w-full flex-col items-center gap-6">
          <BlindsReveal as="h2" className="t-h2 w-full max-w-[500px] text-center text-neutral-900">
            Ingeniería y construcción en telecomunicaciones
          </BlindsReveal>
          <p className="t-body-m w-full max-w-[500px] text-center text-neutral-800">
            Somos una empresa dedicada a soluciones integrales de ingeniería y desarrollo de proyectos en
            telecomunicaciones. Construimos y mantenemos redes de fibra óptica, sitios móviles y redes HFC/FTTH para
            los principales operadores del país, con altos estándares de calidad y seguridad laboral.
          </p>
        </div>
        <div className="w-full">
          <Carrusel3D
            images={obras}
            curveMode="concave"
            depth={2}
            autoWidth
            radius={1000}
            cardWidth={250}
            cardHeight={350}
            gap={26}
            verticalArc={5}
            paddingY={0}
            speed={45}
            direction="left"
            enableDrag
            inertia={45}
            cardRadius={24}
            grayscale={false}
            fade={4}
          />
        </div>
      </section>

      {/* Misión, visión y valores */}
      <section className="flex w-full max-w-[1200px] px-4 py-6 min-[810px]:p-8 min-[1200px]:p-10">
        <MVVAccordion />
      </section>

      {/* Features */}
      <section className="flex w-full max-w-[1200px] flex-col items-center gap-10 px-4 py-6 min-[810px]:p-8 min-[1200px]:p-10">
        <div className="flex w-full max-w-[700px] flex-col items-center gap-6">
          <BlindsReveal as="h2" className="t-h2 w-full text-center text-neutral-900">
            Esto nos diferencia
          </BlindsReveal>
          <p className="t-body-m w-full max-w-[400px] text-center text-neutral-800">
            No competimos por precio. Competimos por calidad de servicio, soporte cercano y experiencia real en
            terreno. Cada proyecto cuenta con respaldo técnico permanente.
          </p>
        </div>
        <div className="w-full min-[400px]:h-[350px]">
          <EpsilonStackCards
            items={[
              {
                image: { src: "/images/nosotros/icono-criterio.png", alt: "" },
                recolor: true,
                colorDefault: N900,
                colorHover: B700,
                text: "Criterio",
                textColor: N900,
                dotsColor: "rgb(67, 113, 252)",
              },
              {
                image: { src: "/images/nosotros/icono-rigor.png", alt: "" },
                recolor: true,
                colorDefault: N900,
                colorHover: B700,
                text: "Rigor",
                textColor: N900,
                dotsColor: "rgb(114, 148, 253)",
              },
              {
                image: { src: "/images/nosotros/icono-velocidad.png", alt: "" },
                recolor: true,
                colorDefault: N900,
                colorHover: B700,
                text: "Velocidad",
                textColor: "rgb(4, 15, 50)",
                dotsColor: "rgb(114, 148, 253)",
              },
            ]}
            glyphSize={14}
            glyphLineHeight={1}
            ramp=" .:-=+*oahkbB%&@#"
            noiseScale={0.22}
            animateNoise
            dotRadius={170}
            dotStrength={6}
            dotMode="repel"
            dotBaseOpacity={0.34}
            revealFromCursor
            iconSize={150}
            labelGap={26}
            liftOnHover={14}
            font={{ fontSize: "22px", lineHeight: "1.2em", letterSpacing: "-0.01em", fontWeight: 400 }}
            transitionMs={450}
            background="rgb(243, 243, 243)"
            borderColor={N900}
            borderWidth={1}
            showOuterBorder
            cornerRadius="24px"
            stackBelow={400}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </section>
    </main>
  );
}
