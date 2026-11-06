import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import LogoTicker from "@/components/home/LogoTicker";
import Marcas from "@/components/home/Marcas";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Clientes",
  description: "Trabajamos con empresas que necesitan conectividad confiable y soporte que responde.",
};

export default function ClientesPage() {
  return (
    <main className="flex w-full flex-col items-center gap-20 bg-neutral-100">
      <PageHero
        title="Empresas que confían en nuestra red."
        subtitle="Trabajamos con empresas que necesitan conectividad confiable y soporte que responde."
        actions={
          <>
            <span className="animate-appear [animation-delay:300ms]">
              <Button href="/servicios">Ver servicios</Button>
            </span>
            <span className="animate-appear [animation-delay:500ms]">
              <Button href="/contacto" variant="secundario">
                Contáctanos
              </Button>
            </span>
          </>
        }
        image="/images/clientes/hero.webp"
        alt="Ciudad con edificios y antenas de telecomunicaciones, en arte ASCII"
        overlap={12}
        brightness={10}
        contrast={5}
      >
        {/* En Framer el ticker de logos va dentro del hero, 40px bajo la imagen */}
        <div className="mt-10 w-full">
          <LogoTicker />
        </div>
      </PageHero>
      <Marcas reveal={false} />
    </main>
  );
}
