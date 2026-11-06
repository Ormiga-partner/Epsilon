"use client";

// Componente "Acordion" de Framer (Misión · Visión · Valores), hecho de 3 instancias de "MVV".
// Desktop/tablet: fila de 400px. Al pasar el cursor por una tarjeta, esa se abre (ocupa el resto)
// y las otras quedan al 25%; se muestra su texto con 0.2s de retraso. Queda abierta la última.
// Phone: columna de 440px; se abre al tocar (la abierta ocupa el 50% del alto).
// Tarjeta: fondo neutral-900, imagen 600px anclada a la izquierda con máscara (0.1 → 1 a la mitad).

import Image from "next/image";
import { useState } from "react";

const items = [
  {
    title: "Misión",
    text: "Entregar a nuestros clientes soluciones integrales de ingeniería, basadas en la innovación y el ingenio de nuestros colaboradores.",
    image: "/images/nosotros/mision.webp",
  },
  {
    title: "Visión",
    text: "Ser una de las mejores empresas de ingeniería y construcción en telecomunicaciones, con altos estándares de calidad y seguridad laboral.",
    image: "/images/nosotros/vision.webp",
  },
  {
    title: "Valores",
    text: "Calidad, seguridad laboral, innovación y compromiso.",
    image: "/images/nosotros/valores.webp",
  },
];

// Curva tipo spring sin rebote (Framer: stiffness 300 / damping 40)
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

// Solo se anima flex-grow (base 0 para todas): es numérico e interpola suave.
// El padding (24px por lado) no se reparte: el espacio libre es el total menos gaps y paddings.
//  - desktop (1120px): libre 1120-32-3·48 = 944; cerradas 280px → 48 + 944/(g+2) = 280 → g ≈ 2.07
//  - phone (440px alto): libre 440-32-3·48 = 264; abierta 220px → 48 + 264·g/(g+2) = 220 → g ≈ 3.74
const GROW_OPEN_DESKTOP = 960 / 464;
const GROW_OPEN_PHONE = 344 / 92;

export default function MVVAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="flex h-[440px] w-full flex-col gap-4 min-[810px]:h-[400px] min-[810px]:flex-row">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <button
            key={it.title}
            type="button"
            aria-expanded={isOpen}
            onMouseEnter={() => setOpen(i)}
            onFocus={() => setOpen(i)}
            onClick={() => setOpen(i)}
            className="relative flex min-h-0 min-w-0 basis-0 flex-col justify-end overflow-hidden rounded-3xl bg-neutral-900 p-6 text-left [flex-grow:var(--grow)] min-[810px]:[flex-grow:var(--grow-d)]"
            style={
              {
                "--grow": isOpen ? GROW_OPEN_PHONE : 1,
                "--grow-d": isOpen ? GROW_OPEN_DESKTOP : 1,
                transition: `flex-grow 0.7s ${EASE}`,
              } as React.CSSProperties
            }
          >
            <span className="pointer-events-none absolute top-0 left-0 z-[1] h-[300px] w-full overflow-hidden min-[810px]:h-full min-[810px]:w-[600px] [mask-image:linear-gradient(0deg,rgba(0,0,0,0.1)_10%,#000_50%)]">
              <Image
                src={it.image}
                alt=""
                fill
                sizes="600px"
                className="object-cover"
                style={{ transform: isOpen ? "scale(1)" : "scale(1.04)", transition: `transform 0.9s ${EASE}` }}
              />
            </span>
            <span className="relative z-[2] flex flex-col">
              <span className="t-h3 text-neutral-100">{it.title}</span>
              {/* Despliegue de altura (0fr → 1fr) + fundido: el título sube suave, sin saltos.
                  Ancho fijo del texto para que no se reacomode mientras la tarjeta se ensancha. */}
              <span
                className="grid"
                style={{
                  gridTemplateRows: isOpen ? "1fr" : "0fr",
                  transition: `grid-template-rows ${isOpen ? "0.6s" : "0.35s"} ${EASE}`,
                }}
              >
                <span className="min-h-0 overflow-hidden">
                  <span
                    className="t-body-m block pt-2.5 text-neutral-100 min-[810px]:w-[460px] min-[810px]:max-w-none"
                    style={{
                      opacity: isOpen ? 1 : 0,
                      transform: isOpen ? "translateY(0)" : "translateY(10px)",
                      transition: isOpen
                        ? `opacity 0.5s ${EASE} 0.2s, transform 0.5s ${EASE} 0.2s`
                        : `opacity 0.2s ease, transform 0.2s ease`,
                    }}
                  >
                    {it.text}
                  </span>
                </span>
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
