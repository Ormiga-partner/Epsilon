import type { Metadata } from "next";
import SmoothScroll from "@/components/SmoothScroll";
import AsciiText from "@/components/framer/AsciiText";
import Footer from "@/components/layout/Footer";
import Nav from "@/components/layout/Nav";
import CookieConsent from "@/components/CookieConsent";
import ProgressiveBlur from "@/components/layout/ProgressiveBlur";
import Button from "@/components/ui/Button";

export const metadata: Metadata = { title: "Página no encontrada" };

// Página "/404" de Framer: layout con nav y footer (sin bloque CTA), hero de 100vh centrado con el
// "404" en ASCII animado (componente AsciiText / Text_Dots), título, texto y botón al inicio.
export default function NotFound() {
  return (
    <SmoothScroll>
      <ProgressiveBlur />
      <Nav />
      <CookieConsent />
      <div className="flex w-full flex-col items-center overflow-x-clip bg-neutral-100">
        <main className="flex min-h-screen w-full flex-col items-center justify-center px-4 pt-[94px]">
          <div className="flex w-full flex-col items-center gap-6">
            {/* Framer: 16 filas en desktop/tablet y 12 en phone (en phone se reduce para que quepa en 390px) */}
            <div className="hidden min-[810px]:block">
              <AsciiText
                text="404"
                font={{
                  fontFamily: "var(--font-geist-sans), sans-serif",
                  fontWeight: 500,
                  fontSize: "40px",
                  lineHeight: "0.1em",
                  letterSpacing: 0,
                }}
                charFont={{
                  fontSize: 14,
                  fontWeight: 400,
                  letterSpacing: 0,
                  lineHeight: 1,
                }}
                charColor="rgb(20, 77, 251)"
                charSize={14}
                rows={16}
                gapX={2}
                gapY={2}
                padding={2}
                ramp=" .:-=+*#%@"
                offChar="."
                offOpacity={0}
                speed={1.5}
                waveScale={0.6}
                waveAmount={0.55}
                glitch={0.35}
                mouseRadius={60}
                mouseIntensity={0.9}
                glow={0}
                borderRadius={23}
              />
            </div>
            <div className="-my-[42px] origin-center scale-[0.66] min-[810px]:hidden">
              <AsciiText
                text="404"
                font={{
                  fontFamily: "var(--font-geist-sans), sans-serif",
                  fontWeight: 500,
                  fontSize: "40px",
                  lineHeight: "0.1em",
                  letterSpacing: 0,
                }}
                charFont={{
                  fontSize: 14,
                  fontWeight: 400,
                  letterSpacing: 0,
                  lineHeight: 1,
                }}
                charColor="rgb(20, 77, 251)"
                charSize={12}
                rows={12}
                gapX={1}
                gapY={2}
                padding={2}
                ramp=" .:-=+*#%@"
                offChar="."
                offOpacity={0}
                speed={1.5}
                waveScale={0.6}
                waveAmount={0.55}
                glitch={0.35}
                mouseRadius={60}
                mouseIntensity={0.9}
                glow={0}
                borderRadius={23}
              />
            </div>
            <div className="flex w-full flex-col items-center gap-4 text-center">
              <h1 className="t-h1 text-neutral-900">Página no encontrada</h1>
              <p className="t-body-l text-neutral-900">
                No hemos podido encontrar esta página.
              </p>
            </div>
            <Button href="/">Volver al inicio</Button>
          </div>
        </main>
        <Footer />
      </div>
    </SmoothScroll>
  );
}
