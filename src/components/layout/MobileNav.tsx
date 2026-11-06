"use client";

// Nav de Framer en phone (< 810px), variantes "Phone Closed" / "Phone Open".
// - Cerrado: pastilla de vidrio a todo el ancho (margen 8px arriba, 16px a los lados), radio 40,
//   fondo rgba(194,194,194,.5) + blur 10, logo 24px y botón hamburguesa de 30px.
// - Abierto: la pastilla se expande a pantalla completa (radio 0, 100dvh); links en Heading 3
//   centrados (gap 12, incluye Contacto) y abajo la ciudad en ASCII. Cada link cierra el menú.
// Transición: spring 0.4s con leve rebote (contenido) y 0.7s para el ícono → X.

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ImageAscii from "@/components/ImageAscii";

const links = [
  { label: "Nosotros", href: "/sobre-nosotros" },
  { label: "Clientes", href: "/clientes" },
  { label: "Servicios", href: "/servicios" },
  { label: "Contacto", href: "/contacto" },
];

const EASE = "cubic-bezier(0.34, 1.2, 0.64, 1)";
const ICON_EASE = "cubic-bezier(0.34, 1.35, 0.64, 1)";

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // cerrar al navegar
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  // bloquea el scroll del fondo y cierra con Escape mientras está abierto
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      html.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 min-[810px]:hidden"
      style={{ padding: open ? 0 : "8px 16px 0", transition: `padding 0.4s ${EASE}` }}
    >
      <div
        className="relative flex flex-col overflow-hidden bg-[rgba(194,194,194,0.5)] backdrop-blur-[10px]"
        style={{
          height: open ? "100dvh" : 46,
          borderRadius: open ? 0 : 40,
          paddingTop: open ? 16 : 8,
          transition: `height 0.45s ${EASE}, border-radius 0.4s ${EASE}, padding 0.4s ${EASE}`,
        }}
      >
        <div className="flex h-[30px] shrink-0 items-center justify-between px-6">
          <Link href="/" aria-label="Epsilon Work, inicio" onClick={() => setOpen(false)}>
            <Image src="/brand/mark.svg" alt="" width={24} height={24} preload />
          </Link>
          <button
            type="button"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            aria-controls="menu-movil"
            onClick={() => setOpen((v) => !v)}
            className="relative size-[30px]"
          >
            {[-6, 0, 6].map((y, i) => (
              <span
                key={i}
                className="absolute top-1/2 left-1/2 h-[1.5px] w-5 -translate-x-1/2 rounded-full bg-neutral-900"
                style={{
                  transform: open
                    ? i === 1
                      ? "translate(-50%, -50%) scaleX(0)"
                      : `translate(-50%, -50%) rotate(${i === 0 ? 45 : -45}deg)`
                    : `translate(-50%, calc(-50% + ${y}px))`,
                  opacity: open && i === 1 ? 0 : 1,
                  transition: `transform 0.7s ${ICON_EASE}, opacity 0.2s ease`,
                }}
              />
            ))}
          </button>
        </div>

        <nav
          id="menu-movil"
          aria-label="Principal móvil"
          aria-hidden={!open}
          className="flex flex-1 flex-col items-center gap-3 pt-10"
          style={{
            opacity: open ? 1 : 0,
            transform: open ? "translateY(0)" : "translateY(-12px)",
            transition: open ? `opacity 0.4s ease 0.15s, transform 0.5s ${EASE} 0.15s` : "opacity 0.15s ease",
            visibility: open ? "visible" : "hidden",
          }}
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              tabIndex={open ? 0 : -1}
              onClick={() => setOpen(false)}
              className="t-h3 text-[rgb(6,6,6)]"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {open && (
          <div className="relative aspect-[2048/1143] w-full shrink-0 animate-[appear-up_0.6s_ease_0.2s_both] [mask-image:linear-gradient(180deg,transparent_0%,#000_25%)]">
            <ImageAscii
              src="/images/clientes/hero.webp"
              alt=""
              sizing="fill"
              fontSize={12}
              lineHeight={0.8}
              letterSpacing={-0.06}
              colorFrom="rgb(20, 77, 251)"
              colorTo="rgb(161, 184, 253)"
              lightMax={1.25}
              brightness={-6}
              contrast={9}
              staticAmount={0.015}
              whiteCutoff={0.9}
              glowBlur={1}
              cursorWidth={16}
              cursorInvert
              autoLevels
              className="absolute inset-0"
            />
          </div>
        )}
      </div>
    </header>
  );
}
