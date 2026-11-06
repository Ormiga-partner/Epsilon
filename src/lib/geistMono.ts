// Geist Mono para dibujar ASCII en <canvas>.
// - ctx.font no entiende var(): hay que pasarle el nombre real de la familia que define next/font
//   (variable --font-geist-mono en <html>).
// - next/font solo descarga la fuente cuando un texto del DOM la usa; un canvas no cuenta, así que
//   se pide explícitamente con document.fonts.load() y se redibuja cuando termina.

const FALLBACK = 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace';

/** Familia CSS lista para ctx.font, p. ej. `'Geist Mono', 'Geist Mono Fallback', ui-monospace, …` */
export function geistMonoFamily(): string {
  if (typeof document === "undefined") return FALLBACK;
  const v = getComputedStyle(document.documentElement).getPropertyValue("--font-geist-mono").trim();
  return v ? `${v}, ${FALLBACK}` : FALLBACK;
}

/** Asegura que Geist Mono esté cargada (resuelve también si falla, para no bloquear el dibujo). */
export function loadGeistMono(px = 12): Promise<void> {
  if (typeof document === "undefined" || !document.fonts?.load) return Promise.resolve();
  return document.fonts
    .load(`${px}px ${geistMonoFamily()}`)
    .then(() => undefined)
    .catch(() => undefined);
}
