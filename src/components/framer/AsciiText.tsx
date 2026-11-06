"use client"
// Portado desde Framer: Text_Dots.tsx

import { useEffect, useRef, useState, type CSSProperties } from "react"
import { geistMonoFamily } from "@/lib/geistMono"

/**
 * ASCII TEXT
 *
 * Versión ASCII del panel dot-matrix: el texto se rasteriza en un canvas oculto
 * y cada celda de la grilla se dibuja como un caracter cuya "densidad" viene de
 * la cobertura de píxeles de esa celda.
 *
 * Movimiento:
 * - Onda diagonal continua que hace respirar la densidad (los caracteres suben
 *   y bajan por la rampa: . : - = + * # % @).
 * - Glitch: algunas celdas cambian de caracter en pasos discretos (no cada frame,
 *   así no vibra feo).
 * - Cursor: cerca del mouse los caracteres se encienden y el campo apagado
 *   del fondo se revela, igual que la grilla de dots de Epsilon.
 */
export interface AsciiTextProps {
    /** Texto. Default "404" */
    text?: string
    /** Tipografía base (CSS). Default sans-serif Bold */
    font?: CSSProperties
    /** Tipografía ASCII (CSS). Default monospace Regular */
    charFont?: CSSProperties
    /** Default "#2E5BFF" */
    charColor?: string
    /** px. Default 14 */
    charSize?: number
    /** Filas (resolución). Default 14 */
    rows?: number
    /** px. Default 2 */
    gapX?: number
    /** px. Default 2 */
    gapY?: number
    /** Margen en celdas. Default 2 */
    padding?: number
    /** De menor a mayor densidad. Default " .:-=+*#%@" */
    ramp?: string
    /** Default "." */
    offChar?: string
    /** Default 0.08 */
    offOpacity?: number
    /** Default 2 */
    speed?: number
    /** Default 0.6 */
    waveScale?: number
    /** Default 0.55 */
    waveAmount?: number
    /** Default 0.35 */
    glitch?: number
    /** px. Default 90 */
    mouseRadius?: number
    /** Default 0.9 */
    mouseIntensity?: number
    /** px. Default 0 */
    glow?: number
    /** px. Default 0 */
    borderRadius?: number
}

const DEFAULT_FONT: CSSProperties = {
    fontFamily: "var(--font-geist-sans), sans-serif",
    fontSize: 40,
    fontWeight: 700,
    letterSpacing: 0,
    lineHeight: 1,
}

const DEFAULT_CHAR_FONT: CSSProperties = {
    fontFamily: "var(--font-geist-mono), monospace",
    fontSize: 14,
    fontWeight: 400,
    letterSpacing: 0,
    lineHeight: 1,
}

type Grid = {
    cols: number
    rows: number
    vals: Float32Array
    cellW: number
    cellH: number
    charCSS: string
}

export default function AsciiText(props: AsciiTextProps) {
    const {
        text = "404",
        font = DEFAULT_FONT,
        charFont = DEFAULT_CHAR_FONT,
        charColor = "#2E5BFF",
        charSize = 14,
        rows = 14,
        gapX = 2,
        gapY = 2,
        padding = 2,
        ramp = " .:-=+*#%@",
        offChar = ".",
        offOpacity = 0.08,
        speed = 2,
        waveScale = 0.6,
        waveAmount = 0.55,
        glitch = 0.35,
        mouseRadius = 90,
        mouseIntensity = 0.9,
        glow = 0,
        borderRadius = 0,
    } = props

    const fontKey = JSON.stringify(font || {})
    const charFontKey = JSON.stringify(charFont || {})

    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const mouse = useRef({ x: -9999, y: -9999, tx: -9999, ty: -9999 })

    const [grid, setGrid] = useState<Grid>({
        cols: 0,
        rows: 0,
        vals: new Float32Array(0),
        cellW: 1,
        cellH: 1,
        charCSS: `12px ${geistMonoFamily()}`,
    })

    // ---- Construir la grilla (densidad por celda) --------------------------
    useEffect(() => {
        let cancelled = false
        const fontObj = JSON.parse(fontKey) as CSSProperties
        const charFontObj = JSON.parse(charFontKey) as CSSProperties
        const build = () => {
            const g = textToAscii(
                text || "",
                fontObj,
                charFontObj,
                rows,
                charSize,
                gapX,
                gapY,
                padding
            )
            if (!cancelled) setGrid(g)
        }
        build()
        if (typeof document !== "undefined" && document.fonts?.ready) {
            document.fonts.ready.then(() => {
                if (!cancelled) build()
            })
        }
        return () => {
            cancelled = true
        }
    }, [text, fontKey, charFontKey, rows, charSize, gapX, gapY, padding])

    const width = Math.max(1, grid.cols * grid.cellW)
    const height = Math.max(1, grid.rows * grid.cellH)

    // ---- Dibujo + animación ------------------------------------------------
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas || grid.vals.length === 0) return

        const chars = Array.from(ramp && ramp.length ? ramp : " .:-=+*#%@")
        const last = chars.length - 1

        const dpr = Math.min(
            typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
            2
        )
        canvas.width = Math.round(width * dpr)
        canvas.height = Math.round(height * dpr)
        const ctx = canvas.getContext("2d")
        if (!ctx) return
        ctx.scale(dpr, dpr)

        const { cols, rows: gRows, vals, cellW, cellH, charCSS } = grid
        const start = performance.now()
        let raf = 0

        const draw = (now: number) => {
            const t = (now - start) / 1000

            // Suavizado del cursor
            const m = mouse.current
            m.x += (m.tx - m.x) * 0.14
            m.y += (m.ty - m.y) * 0.14

            ctx.clearRect(0, 0, width, height)
            ctx.font = charCSS
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"
            ctx.fillStyle = charColor
            ctx.shadowColor = glow > 0 ? charColor : "transparent"
            ctx.shadowBlur = glow

            const step = Math.floor(t * 10) // pasos de glitch (10/s)
            const r2 = Math.max(1, mouseRadius * mouseRadius)

            for (let r = 0; r < gRows; r++) {
                for (let c = 0; c < cols; c++) {
                    const i = r * cols + c
                    const v = vals[i]
                    const x = c * cellW + cellW / 2
                    const y = r * cellH + cellH / 2

                    // Influencia del cursor
                    let boost = 0
                    if (mouseIntensity > 0) {
                        const dx = x - m.x
                        const dy = y - m.y
                        const d2 = dx * dx + dy * dy
                        if (d2 < r2 * 3)
                            boost = mouseIntensity * Math.exp(-d2 / r2)
                    }

                    // Onda diagonal en movimiento
                    const wave =
                        0.5 +
                        0.5 *
                            Math.sin(
                                c * waveScale * 0.5 -
                                    t * speed +
                                    Math.sin(
                                        r * waveScale * 0.4 + t * speed * 0.6
                                    )
                            )

                    if (v > 0.02) {
                        let level = v * (1 - waveAmount + waveAmount * wave)
                        level = Math.min(1, level + boost)

                        let idx = Math.round(level * last)
                        if (glitch > 0 && hash(i, step) < glitch * 0.12)
                            idx = 1 + Math.floor(hash(i, step + 7) * last)

                        const ch = chars[Math.max(0, Math.min(last, idx))]
                        if (!ch || ch === " ") continue

                        ctx.globalAlpha = Math.min(1, 0.28 + 0.72 * level)
                        ctx.fillText(ch, x, y)
                    } else if (offOpacity > 0 || boost > 0.02) {
                        // Campo de fondo: apagado, pero el cursor lo despierta
                        const alpha = Math.min(1, offOpacity + boost * 0.8)
                        if (alpha <= 0.005) continue
                        let ch = offChar || "."
                        if (boost > 0.15) {
                            const idx = Math.round(boost * last * 0.9)
                            ch = chars[Math.max(1, Math.min(last, idx))] || ch
                        }
                        ctx.globalAlpha = alpha
                        ctx.fillText(ch, x, y)
                    }
                }
            }
            ctx.globalAlpha = 1
            raf = requestAnimationFrame(draw)
        }

        raf = requestAnimationFrame(draw)
        return () => cancelAnimationFrame(raf)
    }, [
        grid,
        width,
        height,
        ramp,
        offChar,
        offOpacity,
        charColor,
        speed,
        waveScale,
        waveAmount,
        glitch,
        mouseRadius,
        mouseIntensity,
        glow,
    ])

    const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        mouse.current.tx = e.clientX - rect.left
        mouse.current.ty = e.clientY - rect.top
    }
    const handleLeave = () => {
        mouse.current.tx = -9999
        mouse.current.ty = -9999
    }

    return (
        <div
            onPointerMove={handleMove}
            onPointerLeave={handleLeave}
            style={{
                width,
                height,
                background: "transparent",
                borderRadius,
                overflow: "hidden",
            }}
        >
            <canvas
                ref={canvasRef}
                style={{ width, height, display: "block" }}
            />
        </div>
    )
}

// ---- Utilidades -----------------------------------------------------------

// Ruido determinista (mismo resultado dentro de un mismo "step")
function hash(a: number, b: number) {
    let h = (a * 374761393 + b * 668265263) | 0
    h = (h ^ (h >>> 13)) * 1274126177
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295
}

// Resolver la tipografía real aplicada (vía estilos computados)
function resolveFont(
    fontObj: CSSProperties | undefined,
    sizePx: number,
    fallback: string
) {
    let css = `bold ${sizePx}px ${fallback}`
    let letterSpacing = ""
    try {
        const probe = document.createElement("span")
        if (fontObj && typeof fontObj === "object")
            Object.assign(probe.style, normalizeStyle(fontObj))
        probe.style.position = "absolute"
        probe.style.left = "-9999px"
        probe.style.visibility = "hidden"
        probe.style.fontSize = sizePx + "px"
        probe.style.whiteSpace = "pre"
        probe.textContent = "Mg"
        document.body.appendChild(probe)
        const cs = getComputedStyle(probe)
        css = `${cs.fontStyle} ${cs.fontWeight} ${sizePx}px ${cs.fontFamily}`
        letterSpacing =
            cs.letterSpacing && cs.letterSpacing !== "normal"
                ? cs.letterSpacing
                : ""
        document.body.removeChild(probe)
    } catch {}
    return { css, letterSpacing }
}

// React acepta números sin unidad (fontSize: 40); el DOM necesita "40px".
function normalizeStyle(style: CSSProperties): Record<string, string> {
    const out: Record<string, string> = {}
    const unitless = new Set(["fontWeight", "lineHeight", "opacity", "zIndex"])
    for (const [k, v] of Object.entries(style)) {
        if (v === undefined || v === null) continue
        out[k] = typeof v === "number" && !unitless.has(k) ? `${v}px` : String(v)
    }
    return out
}

// Texto -> grilla de densidades (0..1) por celda
function textToAscii(
    text: string,
    fontObj: CSSProperties | undefined,
    charFontObj: CSSProperties | undefined,
    rows: number,
    charSize: number,
    gapX: number,
    gapY: number,
    pad: number
): Grid {
    const empty: Grid = {
        cols: 0,
        rows,
        vals: new Float32Array(0),
        cellW: 1,
        cellH: 1,
        charCSS: `${charSize}px ${geistMonoFamily()}`,
    }
    if (!text || typeof document === "undefined") return empty

    const off = document.createElement("canvas")
    const ctx = off.getContext("2d")
    if (!ctx) return empty

    // 1) Métricas del caracter ASCII (define el aspecto de la celda)
    const charFont = resolveFont(charFontObj, charSize, geistMonoFamily())
    ctx.font = charFont.css
    const cm = ctx.measureText("M")
    const advance = Math.max(1, cm.width)
    const lineH = Math.max(
        1,
        (cm.actualBoundingBoxAscent || charSize * 0.72) +
            (cm.actualBoundingBoxDescent || charSize * 0.24)
    )
    const cellW = advance + gapX
    const cellH = lineH * 1.15 + gapY

    // 2) Rasterizar el texto
    const F = 160
    const textFont = resolveFont(fontObj, F, "sans-serif")
    const applyFont = () => {
        ctx.font = textFont.css
        try {
            ;(ctx as CanvasRenderingContext2D & { letterSpacing: string })
                .letterSpacing = textFont.letterSpacing || "0px"
        } catch {}
    }

    applyFont()
    const m = ctx.measureText(text)
    const tw = Math.max(1, Math.ceil(m.width))
    const ascent = m.actualBoundingBoxAscent || F * 0.8
    const descent = m.actualBoundingBoxDescent || F * 0.2
    const th = Math.max(1, Math.ceil(ascent + descent))

    off.width = tw
    off.height = th
    applyFont()
    ctx.fillStyle = "#fff"
    ctx.textBaseline = "alphabetic"
    ctx.fillText(text, 0, ascent)

    const data = ctx.getImageData(0, 0, tw, th).data

    // 3) Columnas necesarias para no deformar el texto con celdas no cuadradas
    const cols = Math.max(1, Math.round((tw / th) * rows * (cellH / cellW)))
    const stepX = tw / cols
    const stepY = th / rows

    const outCols = cols + pad * 2
    const outRows = rows + pad * 2
    const vals = new Float32Array(outCols * outRows)

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const x0 = Math.floor(c * stepX)
            const x1 = Math.max(x0 + 1, Math.floor((c + 1) * stepX))
            const y0 = Math.floor(r * stepY)
            const y1 = Math.max(y0 + 1, Math.floor((r + 1) * stepY))
            let sum = 0
            let n = 0
            for (let y = y0; y < y1 && y < th; y++) {
                for (let x = x0; x < x1 && x < tw; x++) {
                    sum += data[(y * tw + x) * 4 + 3]
                    n++
                }
            }
            const v = n ? sum / n / 255 : 0
            vals[(r + pad) * outCols + (c + pad)] = v
        }
    }

    return {
        cols: outCols,
        rows: outRows,
        vals,
        cellW,
        cellH,
        charCSS: charFont.css,
    }
}
