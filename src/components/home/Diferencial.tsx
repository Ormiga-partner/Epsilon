"use client";

// Sección "Scroll Container" de Framer: contenedor de 6000px con un sticky de 100vh.
// Los elementos cambian de estado (styleTransformEffect "onScrollTarget", viewport "end")
// cuando cada marcador invisible entra por el borde inferior del viewport.

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import NumberCounter from "@/components/framer/NumberCounter";

type Marker =
  "t1" | "text1" | "t2" | "text2" | "stats1" | "t3" | "stats2" | "stats3";
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
    content:
      "Órdenes de trabajo ejecutadas y cerradas con trazabilidad completa, cumpliendo los SLA acordados con cada operador.",
    track: [
      { state: hidden },
      { target: "stats1", state: fadeIn },
      { target: "stats2", state: fadeOut },
    ] as Track,
  },
  {
    texto: "Clientes corporativos",
    prefix: "+",
    suffix: "",
    endValue: 500,
    content:
      "Operadores, contratistas y empresas de todo Chile que confían en nuestra ejecución técnica en terreno",
    track: [
      { state: hidden },
      { target: "stats2", state: fadeIn },
      { target: "stats3", state: fadeOut },
    ] as Track,
  },
  {
    texto: "Fibra óptica construida",
    prefix: "+",
    suffix: " Km",
    endValue: 1300,
    content:
      "Redes FTTH desplegadas de punta a punta, desde el diseño de ingeniería hasta la entrega documentada en As-Built.",
    track: [{ state: hidden }, { target: "stats3", state: fadeIn }] as Track,
  },
];

const titles: { text: string; track: Track }[] = [
  {
    text: "Esto es lo que nos diferencia",
    track: [{ state: fadeIn }, { target: "text1", state: fadeOut }],
  },
  {
    text: "Lo que nos vuelve únicos",
    track: [
      { state: hidden },
      { target: "text1", state: fadeIn },
      { target: "text2", state: fadeOut },
    ],
  },
];

// Escalas de las 8 tarjetas en Trigger 2 / Trigger 3
const cardScales: [number, number][] = [
  [1.8, 3.5],
  [2.3, 3.9],
  [2.8, 4.3],
  [3.3, 4.7],
  [3.8, 5.1],
  [4.3, 5.4],
  [4.8, 5.8],
  [5.3, 6.2],
];
const cardTracks: Track[] = cardScales.map(([s2, s3]) => [
  { state: { scale: 0 } },
  { target: "t1", state: { scale: 1 } },
  { target: "t2", state: { scale: s2 } },
  { target: "t3", state: { scale: s3 } },
]);

type Item = { el: HTMLElement; track: Track; kind?: string; feature: number };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const full = (st: State): Required<State> => ({
  opacity: st.opacity ?? 1,
  y: st.y ?? 0,
  scale: st.scale ?? 1,
});

// Resplandor interior de Framer (box-shadow inset 0 0 42px 35px brand-300) reproducido con
// degradados en los 4 bordes. Mismo perfil medido, pero sin el desenfoque que el navegador
// tenía que recalcular en cada frame al escalar los cuadros (la sección bajaba a ~5 fps).
const GLOW_STOPS: [number, number][] = [
  [0, 0.95],
  [6, 0.91],
  [12, 0.86],
  [18, 0.79],
  [24, 0.69],
  [30, 0.57],
  [36, 0.46],
  [42, 0.34],
  [48, 0.245],
  [54, 0.16],
  [60, 0.096],
  [66, 0.043],
  [72, 0.02],
  [78, 0],
];
const glowEdge = (dir: string) =>
  `linear-gradient(${dir}, ${GLOW_STOPS.map(([d, a]) => `rgba(114, 148, 253, ${a}) ${d}px`).join(", ")})`;
const INNER_GLOW = ["to right", "to left", "to bottom", "to top"]
  .map(glowEdge)
  .join(", ");

export default function Diferencial() {
  const rootRef = useRef<HTMLDivElement>(null);
  // Qué cifras están visibles: el contador se monta al aparecer (resetOnReEntry de Framer)
  const [shown, setShown] = useState<boolean[]>(() =>
    features.map(() => false),
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const items: Item[] = Array.from(
      root.querySelectorAll<HTMLElement>("[data-track]"),
    ).map((el) => ({
      el,
      track: JSON.parse(el.dataset.track ?? "[]") as Track,
      kind: el.dataset.kind,
      feature: Number(el.dataset.feature ?? -1),
    }));
    const markerEls = new Map<string, HTMLElement>();
    root
      .querySelectorAll<HTMLElement>("[data-marker]")
      .forEach((m) => markerEls.set(m.dataset.marker!, m));

    // Posición de scroll (dentro de la sección) en la que cada marcador toca el borde inferior
    // del viewport: el mismo disparador que "onScrollTarget / viewport end" de Framer.
    let trig = new Map<string, number>();
    let vh = window.innerHeight;
    const measure = () => {
      vh = window.innerHeight;
      trig = new Map();
      markerEls.forEach((m, k) => trig.set(k, m.offsetTop - vh));
    };

    const stateAt = (it: Item, pos: number): Required<State> => {
      const keys = it.track.map((s, i) => ({
        st: full(s.state),
        at: s.target ? (trig.get(s.target) ?? 0) : null,
        i,
      }));
      if (it.kind === "card") {
        // Continuo de punta a punta: crecen ligadas al scroll entre marcador y marcador.
        const pts = keys.map((k, i) => ({
          st: k.st,
          at: k.at ?? (keys[i + 1]?.at ?? 0) - vh,
        }));
        if (pos <= pts[0].at) return pts[0].st;
        for (let i = 1; i < pts.length; i++) {
          if (pos <= pts[i].at) {
            const t =
              (pos - pts[i - 1].at) / Math.max(1, pts[i].at - pts[i - 1].at);
            return {
              opacity: lerp(pts[i - 1].st.opacity, pts[i].st.opacity, t),
              y: lerp(pts[i - 1].st.y, pts[i].st.y, t),
              scale: lerp(pts[i - 1].st.scale, pts[i].st.scale, t),
            };
          }
        }
        return pts[pts.length - 1].st;
      }
      // Textos: cada cambio ocurre de forma continua en un tramo de scroll que termina en su marcador.
      const W = vh * 0.35;
      let cur = keys[0].st;
      for (let i = 1; i < keys.length; i++) {
        const at = keys[i].at ?? 0;
        if (pos >= at) {
          cur = keys[i].st;
          continue;
        }
        if (pos > at - W) {
          const t = (pos - (at - W)) / W;
          return {
            opacity: lerp(cur.opacity, keys[i].st.opacity, t),
            y: lerp(cur.y, keys[i].st.y, t),
            scale: lerp(cur.scale, keys[i].st.scale, t),
          };
        }
        break;
      }
      return cur;
    };

    let raf = 0;
    let lastShown = features.map(() => false);
    const update = () => {
      raf = 0;
      const pos = -root.getBoundingClientRect().top;
      const nextShown = [...lastShown];
      for (const it of items) {
        const st = stateAt(it, pos);
        if (reduced && it.kind === "card") st.scale = Math.max(st.scale, 1);
        gsap.set(it.el, {
          opacity: st.opacity,
          y: st.y,
          scale: st.scale,
          force3D: true,
        });
        if (it.feature >= 0) nextShown[it.feature] = st.opacity > 0.5;
      }
      if (nextShown.some((v, i) => v !== lastShown[i])) {
        lastShown = nextShown;
        setShown(nextShown);
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      schedule();
    };

    measure();
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <section
      ref={rootRef}
      aria-label="Lo que nos diferencia"
      className="relative flex h-[6000px] w-full flex-col items-center"
    >
      <div className="sticky top-0 z-[1] flex h-screen w-full items-center justify-center overflow-hidden">
        {/* Tarjetas que se expanden */}
        <div className="relative size-[260px] md:size-[370px]">
          {cardTracks.map((track, i) => (
            <div
              key={i}
              data-kind="card"
              data-track={JSON.stringify(track)}
              className="absolute inset-0 overflow-hidden rounded-3xl bg-brand-500 will-change-transform"
              style={{
                zIndex: 8 - i,
                transform: "scale(0)",
                backgroundImage: INNER_GLOW,
              }}
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
          {features.map((f, fi) => (
            <div
              key={f.texto}
              data-track={JSON.stringify(f.track)}
              data-feature={fi}
              className="absolute flex w-full max-w-[488px] flex-col gap-4 px-6"
              style={{ opacity: 0 }}
            >
              <div className="flex flex-col gap-0.5">
                {shown[fi] ? (
                  <NumberCounter
                    startValue={0}
                    endValue={f.endValue}
                    duration={2}
                    decimals={0}
                    easing="easeOut"
                    font={{
                      fontSize: "3.16rem",
                      lineHeight: "1.2em",
                      letterSpacing: "-0.03em",
                      fontWeight: 400,
                    }}
                    textAlign="left"
                    color="var(--color-neutral-100)"
                    resetOnReEntry
                    prefix={f.prefix}
                    suffix={f.suffix}
                    separator="."
                  />
                ) : (
                  <span
                    aria-hidden
                    className="text-neutral-100"
                    style={{
                      fontSize: "3.16rem",
                      lineHeight: "1.2em",
                      letterSpacing: "-0.03em",
                    }}
                  >
                    {f.prefix}0{f.suffix}
                  </span>
                )}
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
