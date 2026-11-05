"use client";

// Sección "Scroll Container" de Framer: contenedor de 6000px con un sticky de 100vh.
// Los elementos cambian de estado (styleTransformEffect "onScrollTarget", viewport "end")
// cuando cada marcador invisible entra por el borde inferior del viewport.

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import NumberCounter from "@/components/framer/NumberCounter";

type Marker = "t1" | "text1" | "t2" | "text2" | "stats1" | "t3" | "stats2" | "stats3";
type State = { opacity?: number; y?: number; scale?: number };
type Track = { target?: Marker; state: State }[];

const fadeOut: State = { opacity: 0, y: -30 };
const fadeIn: State = { opacity: 1, y: 0 };
const hidden: State = { opacity: 0, y: 30 };

const features = [
  {
    texto: "Actividades gestionadas",
    prefix: "+",
    suffix: "",
    endValue: 10069,
    content: "Órdenes de trabajo ejecutadas y cerradas con trazabilidad completa, cumpliendo los SLA acordados con cada operador.",
    track: [{ state: hidden }, { target: "stats1", state: fadeIn }, { target: "stats2", state: fadeOut }] as Track,
  },
  {
    texto: "Clientes corporativos",
    prefix: "+",
    suffix: "",
    endValue: 500,
    content: "Operadores, contratistas y empresas de todo Chile que confían en nuestra ejecución técnica en terreno",
    track: [{ state: hidden }, { target: "stats2", state: fadeIn }, { target: "stats3", state: fadeOut }] as Track,
  },
  {
    texto: "Fibra óptica construida",
    prefix: "+",
    suffix: " Km",
    endValue: 1300,
    content: "Redes FTTH desplegadas de punta a punta, desde el diseño de ingeniería hasta la entrega documentada en As-Built.",
    track: [{ state: hidden }, { target: "stats3", state: fadeIn }] as Track,
  },
];

const titles: { text: string; track: Track }[] = [
  { text: "Esto es lo que nos diferencia", track: [{ state: fadeIn }, { target: "text1", state: fadeOut }] },
  { text: "Lo que nos vuelve únicos", track: [{ state: hidden }, { target: "text1", state: fadeIn }, { target: "text2", state: fadeOut }] },
];

// Escalas de las 8 tarjetas en Trigger 2 / Trigger 3
const cardScales: [number, number][] = [
  [1.8, 3.5], [2.3, 3.9], [2.8, 4.3], [3.3, 4.7], [3.8, 5.1], [4.3, 5.4], [4.8, 5.8], [5.3, 6.2],
];
const cardTracks: Track[] = cardScales.map(([s2, s3]) => [
  { state: { scale: 0 } },
  { target: "t1", state: { scale: 1 } },
  { target: "t2", state: { scale: s2 } },
  { target: "t3", state: { scale: s3 } },
]);

export default function Diferencial() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-track]")).map((el) => ({
      el,
      track: JSON.parse(el.dataset.track ?? "[]") as Track,
      kind: el.dataset.kind,
      current: -1,
    }));
    const markers = new Map<string, HTMLElement>();
    root.querySelectorAll<HTMLElement>("[data-marker]").forEach((m) => markers.set(m.dataset.marker!, m));

    const update = () => {
      const vh = window.innerHeight;
      for (const it of items) {
        let idx = 0;
        it.track.forEach((s, i) => {
          if (!s.target) return;
          const m = markers.get(s.target);
          if (m && m.getBoundingClientRect().top <= vh) idx = i;
        });
        if (idx === it.current) continue;
        const first = it.current === -1;
        it.current = idx;
        const st = it.track[idx].state;
        gsap.to(it.el, {
          ...st,
          duration: first || reduced ? 0 : it.kind === "card" ? 0.6 : 0.4,
          ease: it.kind === "card" ? "power3.out" : "power2.out",
          overwrite: true,
        });
      }
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <section ref={rootRef} aria-label="Lo que nos diferencia" className="relative flex h-[6000px] w-full flex-col items-center">
      <div className="sticky top-0 z-[1] flex h-screen w-full items-center justify-center overflow-hidden">
        {/* Tarjetas que se expanden */}
        <div className="relative size-[260px] md:size-[370px]">
          {cardTracks.map((track, i) => (
            <div
              key={i}
              data-kind="card"
              data-track={JSON.stringify(track)}
              className="absolute inset-0 overflow-hidden rounded-3xl bg-brand-500 shadow-[inset_0_0_42px_35px_var(--color-brand-300)]"
              style={{ zIndex: 8 - i, transform: "scale(0)" }}
            />
          ))}
        </div>

        {/* Textos */}
        <div className="absolute inset-0 z-10 flex items-center justify-center px-6">
          {titles.map((t, i) => (
            <h2
              key={t.text}
              data-track={JSON.stringify(t.track)}
              className="t-h2 absolute text-center text-neutral-900"
              style={{ opacity: i === 0 ? 1 : 0 }}
            >
              {t.text}
            </h2>
          ))}
          {features.map((f) => (
            <div
              key={f.texto}
              data-track={JSON.stringify(f.track)}
              className="absolute flex w-full max-w-[488px] flex-col gap-4 px-6"
              style={{ opacity: 0 }}
            >
              <div className="flex flex-col gap-0.5">
                <NumberCounter
                  startValue={0}
                  endValue={f.endValue}
                  duration={2}
                  decimals={0}
                  easing="easeOut"
                  font={{ fontSize: "3.16rem", lineHeight: "1.2em", letterSpacing: "-0.03em", fontWeight: 400 }}
                  textAlign="left"
                  color="var(--color-neutral-100)"
                  resetOnReEntry
                  prefix={f.prefix}
                  suffix={f.suffix}
                  separator="."
                />
                <h3 className="t-h3 text-neutral-100">{f.texto}</h3>
              </div>
              <p className="t-body-m text-neutral-300">{f.content}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Marcadores de scroll (orden y alturas como en Framer) */}
      <div data-marker="t1" className="flex-1" />
      <div data-marker="text1" className="h-[100px]" />
      <div data-marker="t2" className="flex-1" />
      <div data-marker="text2" className="h-[100px]" />
      <div data-marker="stats1" className="h-[100px]" />
      <div data-marker="t3" className="flex-1" />
      <div data-marker="stats2" className="h-[100px]" />
      <div className="flex-1" />
      <div data-marker="stats3" className="h-[100px]" />
      <div className="flex-1" />
    </section>
  );
}
