"use client";

// Componente "Nav" de Framer.
// - Variante 1 (arriba): contenedor 1200px, padding 0 28px, pastilla transparente sin blur.
// - Variante 2 (al bajar, cuando el hero queda visible < 50%): contenedor 898px con padding
//   16px 24px 0, pastilla máx. 800px, fondo rgba(194,194,194,.5), blur 10px, padding 8 12 8 24.
//   Ajustado más compacto a pedido: pastilla 640px, padding 6 8 6 16, logo 32px.
//   Transiciones: ancho spring 1.4s sin rebote; pastilla spring 0.4s.
// Links centrados respecto a la pastilla (posición absoluta al 50%), aunque el padding sea asimétrico.

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import MobileNav from "@/components/layout/MobileNav";

// En Framer el link "Contacto" está oculto en desktop: lo cubre el botón
const links = [
  { label: "Nosotros", href: "/sobre-nosotros" },
  { label: "Clientes", href: "/clientes" },
  { label: "Servicios", href: "/servicios" },
];

// Spring sin rebote de ~1.4s ≈ ease-out largo
const WIDTH_EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
const PILL_EASE = "cubic-bezier(0.34, 1.2, 0.64, 1)"; // spring 0.4s con bounce 0.2

export default function Nav() {
  const [compact, setCompact] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Disparador como en Framer: la sección de referencia es el hero (primera <section> del main),
    // threshold 0.5. En páginas sin hero se compacta al bajar 80px.
    const hero = document.querySelector("main > section");
    if (hero) {
      const io = new IntersectionObserver(
        ([entry]) => setCompact(entry.intersectionRatio < 0.5),
        {
          threshold: [0, 0.5, 1],
        },
      );
      io.observe(hero);
      return () => io.disconnect();
    }
    const onScroll = () => setCompact(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  const glass = compact;

  return (
    <>
      <MobileNav />
      <header
        className="fixed top-2 left-1/2 z-50 hidden w-full -translate-x-1/2 min-[810px]:block"
        style={{
          maxWidth: compact ? 898 : 1200,
          paddingTop: compact ? 16 : 0,
          paddingLeft: compact ? 24 : 28,
          paddingRight: compact ? 24 : 28,
          transition: `max-width 1.4s ${WIDTH_EASE}, padding 1.4s ${WIDTH_EASE}`,
        }}
      >
        <div
          className="relative mx-auto w-full rounded-[28px]"
          style={{
            // Compacto: más angosto y bajo que la variante 2 de Framer (pedido del cliente)
            maxWidth: compact ? 640 : 1200,
            paddingTop: compact ? 6 : 8,
            paddingBottom: compact ? 6 : 8,
            paddingLeft: compact ? 16 : 12,
            paddingRight: compact ? 8 : 12,
            backgroundColor: glass
              ? "rgba(194, 194, 194, 0.5)"
              : "rgba(194, 194, 194, 0)",
            backdropFilter: glass ? "blur(10px)" : "blur(0px)",
            WebkitBackdropFilter: glass ? "blur(10px)" : "blur(0px)",
            transition: `max-width 1.4s ${WIDTH_EASE}, padding 0.4s ${PILL_EASE}, background-color 0.4s ease, backdrop-filter 0.4s ease`,
          }}
        >
          <div className="flex items-center justify-between">
            <Link
              href="/"
              aria-label="Epsilon Work, inicio"
              className="justify-self-start"
            >
              <Image
                src="/brand/mark.svg"
                alt=""
                width={40}
                height={40}
                preload
                className="transition-[width,height] duration-400 ease-[cubic-bezier(0.34,1.2,0.64,1)]"
                style={{ width: compact ? 32 : 40, height: compact ? 32 : 40 }}
              />
            </Link>

            <nav
              aria-label="Principal"
              className="absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-6 min-[810px]:flex"
            >
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="t-body-m text-[rgb(6,6,6)] transition-colors hover:text-brand-500"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="justify-self-end">
              <Button href="/contacto">Contacto</Button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
