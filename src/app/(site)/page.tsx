import Hero from "@/components/home/Hero";
import Servicios from "@/components/home/Servicios";
import Diferencial from "@/components/home/Diferencial";
import Marcas from "@/components/home/Marcas";

export default function Home() {
  return (
    <main className="flex w-full flex-col items-center gap-20 bg-neutral-100">
      <Hero />
      <Servicios />
      <Diferencial />
      <Marcas />
    </main>
  );
}
