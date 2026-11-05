"use client";

// Ticker de logos del Hero (tickerEffect de Framer: velocity 50 px/s, hoverModifier 50 %, sin máscara).
// Cada logo es el componente "Logo": opacidad 0.3, en hover 0.7 y scale 1.02 (spring 300/30).

import Image from "next/image";
import { useRef } from "react";

const logos = [
  { src: "/logos/vtr.svg", alt: "VTR", width: 95 },
  { src: "/logos/zte.svg", alt: "ZTE", width: 76 },
  { src: "/logos/wom.svg", alt: "WOM", width: 86 },
  { src: "/logos/tuves.svg", alt: "Tuves", width: 115 },
  { src: "/logos/claro.svg", alt: "Claro", width: 108 },
];

const GAP = 65;
const VELOCITY = 50; // px/s
const SET_WIDTH = logos.reduce((w, l) => w + l.width + GAP, 0);
// 6 copias: la mitad (3 sets ≈ 2400px) cubre pantallas anchas sin huecos
const COPIES = 6;
const DURATION = ((SET_WIDTH * COPIES) / 2 / VELOCITY).toFixed(2);

export default function LogoTicker() {
  const trackRef = useRef<HTMLUListElement>(null);
  const setRate = (rate: number) => {
    trackRef.current?.getAnimations().forEach((a) => (a.playbackRate = rate));
  };

  return (
    <div className="w-full overflow-hidden" onMouseEnter={() => setRate(0.5)} onMouseLeave={() => setRate(1)}>
      <ul
        ref={trackRef}
        className="flex w-max items-center"
        style={{ gap: GAP, paddingRight: GAP, animation: `ticker ${DURATION}s linear infinite` }}
      >
        {Array.from({ length: COPIES }, () => logos)
          .flat()
          .map((l, i) => (
            <li key={i} aria-hidden={i >= logos.length} className="shrink-0" style={{ width: l.width }}>
              <Image
                src={l.src}
                alt={i < logos.length ? l.alt : ""}
                width={l.width}
                height={40}
                className="h-auto w-full opacity-30 transition-[opacity,scale] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.02] hover:opacity-70"
              />
            </li>
          ))}
      </ul>
    </div>
  );
}
