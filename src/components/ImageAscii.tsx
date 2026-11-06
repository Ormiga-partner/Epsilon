"use client";

// Reemplazo del componente externo "Interactive ASCII" (marketplace de Framer) usado en las
// tarjetas de servicios. Valores de la instancia en Framer: sizing "fit", outputWidth 100,
// characterSet "detailed", invertColors, brightness 30, contrast 20, color en degradado
// (brand-700 → brand-100), glow blur 2, cursor "gradient" de 32 caracteres de ancho.

import { useEffect, useRef } from "react";
import { geistMonoFamily, loadGeistMono } from "@/lib/geistMono";

const DETAILED = " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";

function parseRgb(c: string): [number, number, number] {
  const m = c.match(/\d+(\.\d+)?/g);
  return m ? [Number(m[0]), Number(m[1]), Number(m[2])] : [0, 0, 0];
}

function mix(a: [number, number, number], b: [number, number, number], t: number) {
  return `rgb(${Math.round(a[0] + (b[0] - a[0]) * t)}, ${Math.round(a[1] + (b[1] - a[1]) * t)}, ${Math.round(a[2] + (b[2] - a[2]) * t)})`;
}

const BUCKETS = 12;

// Densidad (0–1) → carácter. El tope es "@" (no "$"): en la web de Framer las zonas más oscuras
// se ven en @/B, no en el último carácter del ramp. El índice 0 (espacio) queda para vacíos.
const MAX_GLYPH = DETAILED.length - 2;
const glyphIndex = (l: number) => Math.max(1, Math.min(MAX_GLYPH, Math.round(l * MAX_GLYPH)));

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
  /** niveles automáticos: estira los grises reales de la imagen a todo el ramp (más definición) */
  autoLevels?: boolean;
  /** cursor que aclara/atenúa los caracteres (heros) en vez de borrarlos (tarjetas) */
  cursorInvert?: boolean;
  /** fracción de celdas que cambian en cada paso (0–1) */
  staticFraction?: number;
  /** "fit": la imagen entera cabe (tarjetas) · "fill": cubre el contenedor (hero) */
  sizing?: "fit" | "fill";
  /** alto de línea en em (Framer: 1 en tarjetas, 0.8 en el hero de Servicios) */
  lineHeight?: number;
  /** tamaño fijo del carácter en px (las columnas se calculan según el ancho) */
  fontSize?: number;
  /** tracking en em (negativo = caracteres más juntos); solo con fontSize */
  letterSpacing?: number;
  /** luminancia desde la que un píxel se considera blanco y no se dibuja (1 = nunca) */
  whiteCutoff?: number;
  className?: string;
}

type Grid = { chars: string[]; base: number[]; dens: number[]; cols: number; rows: number; colW: number; rowH: number; fontPx: number; ox: number; oy: number };

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
  // Intervalo de Framer (0.1s); a pedido solo cambia una fracción de celdas y con saltos cortos
  staticInterval = 0.1,
  staticAmount = 0.04,
  staticFraction = 0.15,
  cursorInvert = false,
  autoLevels = false,
  sizing = "fit",
  lineHeight = 1,
  fontSize,
  letterSpacing = 0,
  whiteCutoff = 1.01,
  className,
}: ImageAsciiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    // El cursor se sigue sobre toda la tarjeta (como en Framer, donde el área es la tarjeta)
    // Área del cursor: la tarjeta (article) o la sección del hero completa (así responde también
    // cuando el cursor pasa sobre el título que tapa parte de la imagen)
    const hoverTarget =
      (canvas.closest("article") as HTMLElement | null) ?? (canvas.closest("section") as HTMLElement | null) ?? parent;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const from = parseRgb(colorFrom);
    const to = parseRgb(colorTo);
    const monoFamily = geistMonoFamily();

    const palette = Array.from({ length: BUCKETS }, (_, k) => mix(from, to, ((k + 0.5) / BUCKETS) * lightMax));
    let bucketOf = new Uint8Array(0);
    let cancelled = false;
    let grid: Grid | null = null;
    // Cursor con inercia: `target` es la posición real, `lens` la que se dibuja (persigue al target),
    // `strength` crece al entrar y se desvanece al salir.
    let target: { x: number; y: number } | null = null;
    const lens = { x: 0, y: 0 };
    let strength = 0;
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

      // Celdas de texto monoespaciado: ancho ≈ 0.64em (glifo + tracking 0.02em), alto = lineHeight·em.
      //  - "fit": la imagen completa cabe en el contenedor, con su proporción (medido en Framer).
      //  - "fill": la imagen cubre el contenedor (se recorta lo que sobra), columnas sobre el ancho visible.
      const scale =
        sizing === "fill"
          ? Math.max(W / img.naturalWidth, H / img.naturalHeight)
          : Math.min(W / img.naturalWidth, H / img.naturalHeight);
      const viewW = sizing === "fill" ? W : img.naturalWidth * scale;
      const viewH = sizing === "fill" ? H : img.naturalHeight * scale;
      // Con fontSize fijo: el tamaño del carácter manda y las columnas salen del ancho
      // (avance real de Geist Mono + tracking). Sin fontSize: outputWidth columnas escaladas.
      let cols: number;
      let colW: number;
      let fontPx: number;
      if (fontSize) {
        fontPx = fontSize;
        const mctx = canvas.getContext("2d");
        if (mctx) mctx.font = `${fontPx}px ${monoFamily}`;
        const advance = mctx ? mctx.measureText("M").width : fontPx * 0.6;
        colW = Math.max(1, advance + letterSpacing * fontPx);
        cols = Math.max(1, Math.round(viewW / colW));
      } else {
        cols = outputWidth;
        colW = viewW / cols;
        fontPx = colW / 0.64;
      }
      const rowH = fontPx * lineHeight;
      const rows = Math.max(1, Math.round(viewH / rowH));
      // Región de la imagen original que se ve (en "fit" es la imagen entera)
      const sw = viewW / scale;
      const sh = viewH / scale;
      const sx = (img.naturalWidth - sw) / 2;
      const sy = (img.naturalHeight - sh) / 2;

      const sample = document.createElement("canvas");
      sample.width = cols;
      sample.height = rows;
      const sctx = sample.getContext("2d", { willReadFrequently: true });
      if (!sctx) return;
      sctx.drawImage(img, sx, sy, sw, sh, 0, 0, cols, rows);
      const data = sctx.getImageData(0, 0, cols, rows).data;

      const c = (contrast + 100) / 100;
      const n = cols * rows;
      const chars: string[] = new Array(n);
      const dens: number[] = new Array(n).fill(0);
      const base: number[] = new Array(n).fill(0);
      // 1) luminancia de cada celda (-1 = vacía: transparente o blanca ignorada)
      const lum = new Float32Array(n);
      const vals: number[] = [];
      for (let i = 0; i < n; i++) {
        const p = i * 4;
        const l = (0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2]) / 255;
        // whiteMode "ignore" de Framer: los blancos no dibujan caracteres
        if (data[p + 3] < 20 || l >= whiteCutoff) {
          lum[i] = -1;
          continue;
        }
        lum[i] = l;
        vals.push(l);
      }
      // 2) Niveles automáticos: los grises reales de la imagen (percentil 2 → 98) se estiran a todo
      //    el ramp, así caras oscuras, costados grises y ventanas caen en caracteres distintos.
      let lo = 0;
      let hi = 1;
      if (autoLevels && vals.length > 20) {
        vals.sort((a, b) => a - b);
        lo = vals[Math.floor(vals.length * 0.02)];
        hi = vals[Math.floor(vals.length * 0.98)];
        if (hi - lo < 0.05) {
          lo = 0;
          hi = 1;
        }
      }
      for (let i = 0; i < n; i++) {
        if (lum[i] < 0) {
          chars[i] = " ";
          continue;
        }
        let l = autoLevels ? (lum[i] - lo) / (hi - lo) : lum[i];
        l = (l - 0.5) * c + 0.5 + brightness / 100;
        l = Math.min(1, Math.max(0, l));
        if (invert) l = 1 - l;
        chars[i] = DETAILED[glyphIndex(l)];
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
      bucketOf = new Uint8Array(dens.length);
      for (let i = 0; i < dens.length; i++) bucketOf[i] = Math.min(BUCKETS - 1, Math.floor((1 - dens[i]) * BUCKETS));
      grid = { chars, base, dens, cols, rows, colW, rowH, fontPx, ox: (W - viewW) / 2, oy: (H - rows * rowH) / 2 };
      draw();
    };

    const draw = () => {
      raf = 0;
      if (!grid) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const dpr = canvas.width / parseFloat(canvas.style.width || "1");
      const { chars, cols, rows, colW, rowH, fontPx, ox, oy } = grid;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Geist Mono (ctx.font no admite var(): ver lib/geistMono)
      ctx.font = `${fontPx}px ${monoFamily}`;
      ctx.textBaseline = "top";

      // Color "gradient" de Framer: caracteres densos → colorFrom, livianos → colorTo.
      // Rendimiento: los colores se agrupan en BUCKETS tonos y se dibujan por grupo (un solo
      // cambio de fillStyle por tono); el glow va en un drop-shadow CSS del canvas.
      // Avance de la lente (lerp por frame) y de la intensidad
      if (target) {
        // Framer: cursor smoothing 0 → el círculo sigue al cursor exacto (sin inercia)
        lens.x = target.x;
        lens.y = target.y;
      }
      strength += ((target ? 1 : 0) - strength) * 0.12;
      if (strength < 0.005) strength = 0;

      const radius = (cursorWidth / 2) * colW;
      const r2 = radius * radius;
      // peso de la lente en una celda: 1 en el centro → 0 en el borde (smoothstep), por la intensidad
      const lensWeight = (px: number, py: number) => {
        if (!strength) return 0;
        const dx = px + colW / 2 - lens.x;
        const dy = py + rowH / 2 - lens.y;
        const d2 = dx * dx + dy * dy;
        if (d2 >= r2) return 0;
        const t = Math.sqrt(d2) / radius;
        return (1 - t * t * (3 - 2 * t)) * strength;
      };

      const lensCells: number[] = [];
      for (let bkt = 0; bkt < BUCKETS; bkt++) {
        ctx.fillStyle = palette[bkt];
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            const i = y * cols + x;
            const ch = chars[i];
            if (ch === " " || bucketOf[i] !== bkt) continue;
            const px = ox + x * colW;
            const py = oy + y * rowH;
            const w = lensWeight(px, py);
            if (w > 0.02 && cursorInvert) {
              lensCells.push(i); // se dibuja después, aclarada
              continue;
            }
            // borrado con degradado suave
            const alpha = 1 - w;
            if (alpha <= 0.02) continue;
            if (alpha !== ctx.globalAlpha) ctx.globalAlpha = alpha;
            ctx.fillText(ch, px, py);
          }
        }
      }

      // Cursor "gradient" + invert de Framer: dentro del círculo cada carácter pasa hacia su densidad
      // opuesta (con degradado al borde) y toma el color que corresponde a esa nueva densidad, así los
      // densos (@B8) se vuelven livianos y claros, y los livianos se vuelven densos.
      if (lensCells.length) {
        const { base, dens } = grid;
        for (const i of lensCells) {
          const x = i % cols;
          const y = (i - x) / cols;
          const px = ox + x * colW;
          const py = oy + y * rowH;
          const w = lensWeight(px, py);
          const lb = base[i] + (1 - 2 * base[i]) * w;
          const ld = dens[i] + (1 - 2 * dens[i]) * w;
          ctx.fillStyle = palette[Math.min(BUCKETS - 1, Math.floor((1 - ld) * BUCKETS))];
          ctx.globalAlpha = 1;
          ctx.fillText(DETAILED[glyphIndex(lb)], px, py);
        }
      }

      // sigue animando mientras la lente no llegue al cursor o la intensidad no se asiente
      const moving = target ? Math.abs(target.x - lens.x) + Math.abs(target.y - lens.y) > 0.5 : false;
      if (moving || (strength > 0 && strength < 0.995) || (!target && strength > 0)) schedule();
      ctx.globalAlpha = 1;
    };

    // "Static effect": cada `staticInterval` s se vuelve a sortear un ruido por celda sobre la
    // densidad base, así los caracteres saltan a vecinos del ramp y la imagen "hormiguea".
    const reroll = () => {
      if (!grid) return;
      const { chars, base } = grid;
      for (let i = 0; i < chars.length; i++) {
        if (chars[i] === " ") continue;
        // solo una fracción de celdas cambia en cada paso: hormigueo suave, no parpadeo
        if (Math.random() > staticFraction) continue;
        const l = Math.min(1, Math.max(0.02, base[i] + (Math.random() * 2 - 1) * staticAmount));
        chars[i] = DETAILED[glyphIndex(l)];
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
      const p = { x: e.clientX - r.left, y: e.clientY - r.top };
      // al entrar, la lente nace en el cursor (sin viajar desde la esquina)
      if (!target && strength === 0) {
        lens.x = p.x;
        lens.y = p.y;
      }
      target = p;
      schedule();
    };
    const onLeave = () => {
      target = null;
      schedule();
    };

    img.onload = compute;
    if (img.complete) compute();
    // Geist Mono puede no estar descargada aún (el canvas no la dispara): se pide y se redibuja
    loadGeistMono(12).then(() => {
      if (!cancelled) compute();
    });
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
  }, [src, outputWidth, colorFrom, colorTo, brightness, contrast, invert, cursorWidth, glowBlur, lightMax, staticInterval, staticAmount, staticFraction, cursorInvert, autoLevels, sizing, lineHeight, whiteCutoff, fontSize, letterSpacing]);

  const [gr, gg, gb] = parseRgb(colorFrom);
  const glowColor = `rgba(${gr}, ${gg}, ${gb}, 0.5)`;
  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={alt}
      className={className}
      style={glowBlur > 0 ? { filter: `drop-shadow(0 0 ${glowBlur}px ${glowColor})` } : undefined}
    />
  );
}
