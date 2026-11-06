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

// En Framer el link "Contacto" está oculto en desktop: lo cubre el botón
const links = [
  { label: "Nosotros", href: "/sobre-nosotros" },
  { label: "Clientes", href: "/clientes" },
  { label: "Servicios", href: "/servicios" },
];
const mobileLinks = [...links, { label: "Contacto", href: "/contacto" }];

// Spring sin rebote de ~1.4s ≈ ease-out largo
const WIDTH_EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
const PILL_EASE = "cubic-bezier(0.34, 1.2, 0.64, 1)"; // spring 0.4s con bounce 0.2

export default function Nav() {
  const [compact, setCompact] = useState(false);
  const [open, setOpen] = useState(false);
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

  const glass = compact || open;

  return (
    <header
      className="fixed top-2 left-1/2 z-50 w-full -translate-x-1/2"
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
            onClick={() => setOpen(false)}
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
            className="absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-3 md:flex"
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

          <div className="hidden justify-self-end md:block">
            <Button href="/contacto">Contacto</Button>
          </div>

          <button
            type="button"
            className="flex size-[30px] flex-col items-center justify-center gap-1.5 justify-self-end md:hidden"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span
              className={`h-px w-5 bg-neutral-900 transition-transform ${open ? "translate-y-[3.5px] rotate-45" : ""}`}
            />
            <span
              className={`h-px w-5 bg-neutral-900 transition-transform ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`}
            />
          </button>
        </div>

        {open && (
          <nav
            aria-label="Principal móvil"
            className="flex flex-col gap-4 px-1 pt-6 pb-3 md:hidden"
          >
            {mobileLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="t-h4 text-neutral-900"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
