import BlindsReveal from "@/components/framer/BlindsReveal";
import ImageAscii from "@/components/ImageAscii";

// Hero de las páginas internas (Servicios, Sobre nosotros, Clientes) en Framer:
// degradado brand-100 → neutral-100, padding superior 94px, título H1 con BlindsReveal, Body L,
// acciones, y debajo una imagen "Interactive ASCII" a todo el ancho que sube bajo el título
// ("Negative Gap" en %) con máscara inferior 0→20%.

export interface PageHeroProps {
  title: string;
  subtitle: string;
  /** botones bajo el subtítulo */
  actions?: React.ReactNode;
  image: string;
  alt: string;
  /** Negative Gap de Framer en % (p. ej. 10 → la imagen sube un 10 %) */
  overlap: number;
  brightness: number;
  contrast: number;
  /** color1Point / color2Point de Framer (0–1) */
  colorPoints?: [number, number];
  /** contenido extra dentro del hero, bajo la imagen (p. ej. ticker de logos) */
  children?: React.ReactNode;
}

export default function PageHero({ title, subtitle, actions, image, alt, overlap, brightness, contrast, colorPoints = [0, 0.45], children }: PageHeroProps) {
  return (
    <section className="relative flex w-full flex-col items-center overflow-hidden bg-linear-to-b from-brand-100 to-neutral-100 pt-[94px]">
      <div className="relative z-[2] flex w-full max-w-[1200px] justify-center px-6 min-[810px]:px-10">
        <div className="flex w-full max-w-[700px] flex-col items-center gap-6">
          <BlindsReveal as="h1" className="t-h1 w-full text-center text-neutral-900 max-[420px]:text-[2.45rem]">
            {title}
          </BlindsReveal>
          <p className="t-body-l w-full text-center text-neutral-800">{subtitle}</p>
          {actions && <div className="flex flex-wrap items-center justify-center gap-4">{actions}</div>}
        </div>
      </div>
      <div
        className="relative z-0 aspect-[2048/1143] w-full [mask-image:linear-gradient(0deg,transparent_0%,#000_20%)]"
        style={{ marginTop: `-${overlap}%` }}
      >
        <ImageAscii
          src={image}
          alt={alt}
          sizing="fill"
          // Framer: 200 columnas, Geist Mono escalada al ancho, line height 0.8.
          // Bajo 810px se mantiene 12px con tracking negativo (200 columnas serían ilegibles).
          outputWidth={200}
          fontSize={12}
          fixedFontBelow={810}
          lineHeight={0.8}
          letterSpacing={-0.06}
          colorFrom="rgb(20, 77, 251)"
          colorTo="rgb(161, 184, 253)"
          colorPoints={colorPoints}
          // Calibrado contra capturas de Framer (glifo elegido por nivel de gris en Clientes,
          // Sobre nosotros y Servicios): su mapeo equivale al nuestro con brillo 0.4·b − 7 y contraste −14
          brightness={brightness * 0.4 - 7}
          contrast={contrast - 14}
          staticAmount={0.015}
          whiteCutoff={0.9}
          glowBlur={1}
          cursorWidth={16}
          cursorInvert
          className="absolute inset-0"
        />
      </div>
      {children}
    </section>
  );
}
