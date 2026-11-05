"use client";

// Reemplazo del componente externo "Interactive ASCII" (marketplace de Framer) usado en las
// tarjetas de servicios. Valores de la instancia en Framer: sizing "fit", outputWidth 100,
// characterSet "detailed", invertColors, brightness 30, contrast 20, color en degradado
// (brand-700 → brand-100), glow blur 2, cursor "gradient" de 32 caracteres de ancho.

import { useEffect, useRef } from "react";

const DETAILED = " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";

function parseRgb(c: string): [number, number, number] {
  const m = c.match(/\d+(\.\d+)?/g);
  return m ? [Number(m[0]), Number(m[1]), Number(m[2])] : [0, 0, 0];
}

function mix(a: [number, number, number], b: [number, number, number], t: number) {
  return `rgb(${Math.round(a[0] + (b[0] - a[0]) * t)}, ${Math.round(a[1] + (b[1] - a[1]) * t)}, ${Math.round(a[2] + (b[2] - a[2]) * t)})`;
}

export interface ImageAsciiProps {
  src: string;
  alt: string;
  /** columnas de caracteres */
  outputWidth?: number;
  colorFrom?: string;
  colorTo?: string;
  brightness?: number;
  contrast?: number;
  invert?: boolean;
  /** ancho (en caracteres) del borrado con degradado alrededor del cursor */
  cursorWidth?: number;
  glowBlur?: number;
  /** cuánto se acercan al color claro los caracteres más livianos (0–1) */
  lightMax?: number;
  /** "Static effect" de Framer: cada cuántos segundos se re-sortea el ruido */
  staticInterval?: number;
  /** amplitud del ruido sobre la densidad (0 = sin hormigueo) */
  staticAmount?: number;
  className?: string;
}

type Grid = { chars: string[]; base: number[]; dens: number[]; cols: number; rows: number; colW: number; rowH: number; ox: number; oy: number };

export default function ImageAscii({
  src,
  alt,
  outputWidth = 100,
  colorFrom = "rgb(12, 46, 151)",
  colorTo = "rgb(208, 219, 254)",
  brightness = 30,
  contrast = 20,
  invert = true,
  cursorWidth = 32,
  glowBlur = 2,
  lightMax = 0.55,
  staticInterval = 0.1,
  staticAmount = 0.06,
  className,
}: ImageAsciiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    // El cursor se sigue sobre toda la tarjeta (como en Framer, donde el área es la tarjeta)
    const hoverTarget = (canvas.closest("article") as HTMLElement | null) ?? parent;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const geistMono = getComputedStyle(document.documentElement).getPropertyValue("--font-geist-mono").trim();
    const from = parseRgb(colorFrom);
    const to = parseRgb(colorTo);
    const monoFamily = `${geistMono ? `${geistMono}, ` : ""}ui-monospace, monospace`;

    let cancelled = false;
    let grid: Grid | null = null;
    let pointer: { x: number; y: number } | null = null;
    let raf = 0;
    const img = new Image();
    img.src = src;

    const compute = () => {
      if (cancelled || !img.complete || !img.naturalWidth) return;
      const W = parent.clientWidth;
      const H = parent.clientHeight;
      if (!W || !H) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;

      // "fit" con la proporción de la imagen intacta (medido en la web de Framer).
      // Celdas de texto monoespaciado: ancho ≈ 0.64em (glifo + tracking 0.02em), alto = 1em.
      const scale = Math.min(W / img.naturalWidth, H / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      const cols = outputWidth;
      const colW = dw / cols;
      const rowH = colW / 0.64;
      const rows = Math.max(1, Math.round(dh / rowH));

      const sample = document.createElement("canvas");
      sample.width = cols;
      sample.height = rows;
      const sctx = sample.getContext("2d", { willReadFrequently: true });
      if (!sctx) return;
      sctx.drawImage(img, 0, 0, cols, rows);
      const data = sctx.getImageData(0, 0, cols, rows).data;

      const c = (contrast + 100) / 100;
      const chars: string[] = new Array(cols * rows);
      const dens: number[] = new Array(cols * rows).fill(0);
      const base: number[] = new Array(cols * rows).fill(0);
      for (let i = 0; i < cols * rows; i++) {
        const p = i * 4;
        if (data[p + 3] < 20) {
          chars[i] = " ";
          continue;
        }
        let l = (0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2]) / 255;
        l = (l - 0.5) * c + 0.5 + brightness / 100;
        l = Math.min(1, Math.max(0, l));
        if (invert) l = 1 - l;
        chars[i] = DETAILED[Math.floor(l * (DETAILED.length - 1))];
        dens[i] = l;
        base[i] = l;
      }
      // Normaliza la densidad al rango real de la imagen (el color se reparte entre trazos densos y livianos)
      let dMin = 1;
      let dMax = 0;
      for (let i = 0; i < dens.length; i++) {
        if (chars[i] === " ") continue;
        dMin = Math.min(dMin, dens[i]);
        dMax = Math.max(dMax, dens[i]);
      }
      const span = Math.max(dMax - dMin, 0.001);
      for (let i = 0; i < dens.length; i++) dens[i] = (dens[i] - dMin) / span;
      grid = { chars, base, dens, cols, rows, colW, rowH, ox: (W - dw) / 2, oy: (H - (rows * rowH)) / 2 };
      draw();
    };

    const draw = () => {
      raf = 0;
      if (!grid) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const dpr = canvas.width / parseFloat(canvas.style.width || "1");
      const { chars, dens, cols, rows, colW, rowH, ox, oy } = grid;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.shadowBlur = glowBlur;
      // ctx.font no admite var(): se resuelve la familia de Geist Mono desde CSS
      ctx.font = `${rowH}px ${monoFamily}`;
      ctx.textBaseline = "top";

      // Color "gradient" de Framer: caracteres densos → colorFrom, livianos → colorTo
      const radius = (cursorWidth / 2) * colW;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = y * cols + x;
          const ch = chars[i];
          if (ch === " ") continue;
          const px = ox + x * colW;
          const py = oy + y * rowH;
          let alpha = 1;
          if (pointer) {
            const d = Math.hypot(px + colW / 2 - pointer.x, py + rowH / 2 - pointer.y);
            if (d < radius) alpha = d / radius; // degradado: transparente en el centro del cursor
          }
          if (alpha <= 0.02) continue;
          const color = mix(from, to, (1 - dens[i]) * lightMax);
          ctx.globalAlpha = alpha;
          ctx.fillStyle = color;
          ctx.shadowColor = color;
          ctx.fillText(ch, px, py);
        }
      }
      ctx.globalAlpha = 1;
    };

    // "Static effect": cada `staticInterval` s se vuelve a sortear un ruido por celda sobre la
    // densidad base, así los caracteres saltan a vecinos del ramp y la imagen "hormiguea".
    const reroll = () => {
      if (!grid) return;
      const { chars, base } = grid;
      const last = DETAILED.length - 1;
      for (let i = 0; i < chars.length; i++) {
        if (chars[i] === " ") continue;
        const l = Math.min(1, Math.max(0.02, base[i] + (Math.random() * 2 - 1) * staticAmount));
        chars[i] = DETAILED[Math.max(1, Math.round(l * last))];
      }
      schedule();
    };
    let timer = 0;
    const startStatic = () => {
      if (reduced || staticAmount <= 0 || timer) return;
      timer = window.setInterval(reroll, staticInterval * 1000);
    };
    const stopStatic = () => {
      window.clearInterval(timer);
      timer = 0;
    };
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) startStatic();
      else stopStatic();
    });
    io.observe(canvas);

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer = { x: e.clientX - r.left, y: e.clientY - r.top };
      schedule();
    };
    const onLeave = () => {
      pointer = null;
      schedule();
    };

    img.onload = compute;
    if (img.complete) compute();
    const ro = new ResizeObserver(compute);
    ro.observe(parent);
    if (!reduced) {
      hoverTarget.addEventListener("pointermove", onMove);
      hoverTarget.addEventListener("pointerleave", onLeave);
    }
    return () => {
      cancelled = true;
      ro.disconnect();
      io.disconnect();
      stopStatic();
      if (raf) cancelAnimationFrame(raf);
      hoverTarget.removeEventListener("pointermove", onMove);
      hoverTarget.removeEventListener("pointerleave", onLeave);
    };
  }, [src, outputWidth, colorFrom, colorTo, brightness, contrast, invert, cursorWidth, glowBlur, lightMax, staticInterval, staticAmount]);

  return <canvas ref={canvasRef} role="img" aria-label={alt} className={className} />;
}
