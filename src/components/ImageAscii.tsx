"use client";

// Reemplazo ligero del componente externo "Interactive ASCII" (marketplace de Framer)
// usado en las tarjetas de servicios: convierte la imagen a caracteres con degradado.

import { useEffect, useRef } from "react";

const DETAILED = " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";

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
  className?: string;
}

export default function ImageAscii({
  src,
  alt,
  outputWidth = 100,
  colorFrom = "rgb(12, 46, 151)",
  colorTo = "rgb(208, 219, 254)",
  brightness = 30,
  contrast = 20,
  invert = true,
  className,
}: ImageAsciiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    let cancelled = false;
    const img = new Image();
    img.src = src;

    const draw = () => {
      if (cancelled || !img.complete || !img.naturalWidth) return;
      const W = parent.clientWidth;
      const H = parent.clientHeight;
      if (!W || !H) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // "fit": la imagen cabe completa en el contenedor
      const scale = Math.min(W / img.naturalWidth, H / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      const ox = (W - dw) / 2;
      const oy = (H - dh) / 2;

      const cols = outputWidth;
      const cell = dw / cols;
      const rows = Math.max(1, Math.round(dh / cell));

      const sample = document.createElement("canvas");
      sample.width = cols;
      sample.height = rows;
      const sctx = sample.getContext("2d", { willReadFrequently: true });
      if (!sctx) return;
      sctx.drawImage(img, 0, 0, cols, rows);
      const data = sctx.getImageData(0, 0, cols, rows).data;

      const grad = ctx.createLinearGradient(0, oy, 0, oy + dh);
      grad.addColorStop(0, colorFrom);
      grad.addColorStop(1, colorTo);
      ctx.fillStyle = grad;
      ctx.font = `${cell * 1.15}px var(--font-geist-mono), ui-monospace, monospace`;
      ctx.textBaseline = "top";

      const c = (contrast + 100) / 100;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = (y * cols + x) * 4;
          if (data[i + 3] < 20) continue;
          let l = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
          l = (l - 0.5) * c + 0.5 + brightness / 100;
          l = Math.min(1, Math.max(0, l));
          if (invert) l = 1 - l;
          const ch = DETAILED[Math.floor(l * (DETAILED.length - 1))];
          if (ch !== " ") ctx.fillText(ch, ox + x * cell, oy + y * cell);
        }
      }
    };

    img.onload = draw;
    if (img.complete) draw();
    const ro = new ResizeObserver(draw);
    ro.observe(parent);
    return () => {
      cancelled = true;
      ro.disconnect();
    };
  }, [src, outputWidth, colorFrom, colorTo, brightness, contrast, invert]);

  return <canvas ref={canvasRef} role="img" aria-label={alt} className={className} />;
}
