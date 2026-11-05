import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import LazyGlobe from "@/components/LazyGlobe";

// Componente "CTA" del layout de Framer
export default function CTA() {
  return (
    <section className="flex w-full justify-center bg-neutral-100 p-4 md:p-6">
      <div className="relative flex w-full max-w-[1200px] overflow-hidden rounded-3xl bg-brand-600 px-6 py-14 md:px-10">
        <div className="relative z-[1] flex w-full max-w-[520px] flex-col items-start gap-6">
          <Badge tag="N°1">conectividad empresarial</Badge>
          <h2 className="t-h2 text-white">Contáctanos</h2>
          <p className="t-body-l text-white">
            Cuéntanos qué requiere tu operación y te contactamos con una propuesta a tu medida.
          </p>
          <Button href="/contacto" variant="secundario-blanco">
            Contáctanos
          </Button>
        </div>
        <div className="pointer-events-auto absolute right-[-200px] bottom-0 hidden h-[380px] w-[70%] md:block">
          <LazyGlobe
            style={{ width: "100%", height: "100%" }}
            markers={[]}
            styling={{ oceanColor: "rgb(209, 220, 255)", dotColor: "rgb(67, 113, 252)", backgroundColor: "rgba(242, 242, 242, 0)" }}
            layout={{ isFlat: false, globeScale: 2.3, rotationSpeed: 0.05, positionX: 0, positionY: -1.5, dotDensity: 30000 }}
            dotSizing={{ edgeDotSize: 4.2, interiorDotSize: 2, edgeInfluence: 2.6, sizeRandomness: 0 }}
            interactions={{ enableHover: true }}
          />
        </div>
      </div>
    </section>
  );
}
