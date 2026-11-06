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

// spring stiffness 300 / damping 40 ≈ ease-out de ~0.5s
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

export default function MVVAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="flex h-[440px] w-full flex-col gap-4 min-[810px]:h-[400px] min-[810px]:flex-row">
      {items.map((it, i) => {
        const isOpen = open === i;
        const shrunk = open !== null && !isOpen;
        return (
          <button
            key={it.title}
            type="button"
            aria-expanded={isOpen}
            onMouseEnter={() => setOpen(i)}
            onFocus={() => setOpen(i)}
            onClick={() => setOpen(i)}
            className={`relative flex min-h-0 min-w-0 flex-col justify-end overflow-hidden rounded-3xl bg-neutral-900 p-6 text-left transition-[flex] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isOpen ? "flex-[0_0_50%]" : "flex-[1_1_0%]"
            } ${shrunk ? "min-[810px]:flex-[0_0_25%]" : "min-[810px]:flex-[1_1_0%]"}`}
          >
            <span className="pointer-events-none absolute top-0 left-0 z-[1] h-[300px] w-full min-[810px]:h-full min-[810px]:w-[600px] [mask-image:linear-gradient(0deg,rgba(0,0,0,0.1)_10%,#000_50%)]">
              <Image src={it.image} alt="" fill sizes="600px" className="object-cover" />
            </span>
            <span className="relative z-[2] flex flex-col gap-2.5">
              <span className="t-h3 text-neutral-100">{it.title}</span>
              <span
                className={`t-body-m text-neutral-100 ${isOpen ? "block" : "hidden"}`}
                style={{ animation: isOpen ? `appear-up 0.5s ${EASE} 0.2s both` : undefined }}
              >
                {it.text}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
