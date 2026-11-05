"use client"
// Portado desde Framer: Dots_cards.tsx

import {
    useRef,
    useEffect,
    useState,
    useCallback,
    useSyncExternalStore,
} from "react"
import type React from "react"

/* ------------------------------------------------------------------
 * Ilustraciones por defecto (SVG embebidos, sin dependencias).
 * Son outlines: funcionan como máscara, así toman el color del panel.
 * Se usan solo mientras la tarjeta no tenga imagen propia cargada.
 * ------------------------------------------------------------------ */
const asDataURI = (svg: string) =>
    `data:image/svg+xml;utf8,${encodeURIComponent(svg.replace(/\s+/g, " ").trim())}`

const ICON_REACT = asDataURI(`
<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
  <g fill="none" stroke="#000" stroke-width="3">
    <ellipse cx="50" cy="50" rx="45" ry="17"/>
    <ellipse cx="50" cy="50" rx="45" ry="17" transform="rotate(60 50 50)"/>
    <ellipse cx="50" cy="50" rx="45" ry="17" transform="rotate(120 50 50)"/>
    <circle cx="50" cy="50" r="9"/>
  </g>
  <circle cx="50" cy="50" r="4.5" fill="#000"/>
</svg>`)

const ICON_FRAMER = asDataURI(`
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="96" viewBox="0 0 64 96">
  <g fill="none" stroke="#000" stroke-width="3" stroke-linejoin="round">
    <path d="M0 0h64v32H32z"/>
    <path d="M0 32h32l32 32H0z"/>
    <path d="M0 64h32v32z"/>
  </g>
</svg>`)

const ICON_ISO = asDataURI(`
<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
  <g fill="none" stroke="#000" stroke-width="3" stroke-linejoin="round">
    <path d="M4 26v46l14 12h48l14-12V6L66 18v42H36V18z"/>
    <path d="M4 26 18 14h48"/>
    <path d="M18 84V60"/>
    <path d="M36 18 22 30"/>
    <path d="M66 18 80 6"/>
  </g>
</svg>`)

const FALLBACK_ICONS = [ICON_REACT, ICON_FRAMER, ICON_ISO]

/* ------------------------------------------------------------------
 * Los color tokens de Framer llegan como "var(--token-x, rgb(...))".
 * CSS los entiende, pero canvas.fillStyle no: al ser inválido el canvas
 * se queda en negro. Acá se resuelven a un color real antes de pintar.
 * ------------------------------------------------------------------ */
function parseCSSVar(value?: string) {
    if (!value) return "#FFFFFF"
    if (value.indexOf("var(") === -1) return value
    const inner = value.slice(value.indexOf("var(") + 4, value.lastIndexOf(")"))
    const comma = inner.indexOf(",")
    const fb = comma === -1 ? "" : inner.slice(comma + 1).trim()
    return fb || "#FFFFFF"
}

export interface EpsilonStackCardsImage {
    src: string
    srcSet?: string
    alt?: string
}

export interface EpsilonStackCardItem {
    image?: EpsilonStackCardsImage
    /** Usa la imagen como máscara: requiere PNG/SVG con fondo transparente. */
    recolor?: boolean
    colorDefault?: string
    colorHover?: string
    text?: string
    textColor?: string
    /** Color del campo ASCII */
    dotsColor?: string
}

export interface EpsilonStackCardsProps {
    items?: EpsilonStackCardItem[]
    background?: string
    borderColor?: string
    borderWidth?: number
    showOuterBorder?: boolean
    cornerRadius?: string | number
    iconSize?: number
    labelGap?: number
    liftOnHover?: number
    font?: React.CSSProperties
    transitionMs?: number
    glyphSize?: number
    glyphLineHeight?: number
    /** De menos a más denso. El primero se deja siempre vacío. */
    ramp?: string
    /** Bajo = manchas grandes. Alto = grano fino. */
    noiseScale?: number
    animateNoise?: boolean
    dotRadius?: number
    dotStrength?: number
    dotMode?: "repel" | "attract"
    dotBaseOpacity?: number
    revealFromCursor?: boolean
    /** 0 = nunca apilar en columna. */
    stackBelow?: number
    style?: React.CSSProperties
}

const DEFAULT_ITEMS: EpsilonStackCardItem[] = [
    {
        recolor: true,
        colorDefault: "#FFFFFF",
        colorHover: "#61DAFB",
        text: "React",
        textColor: "#FFFFFF",
        dotsColor: "#2F6E86",
    },
    {
        recolor: true,
        colorDefault: "#FFFFFF",
        colorHover: "#FFFFFF",
        text: "Framer",
        textColor: "#FFFFFF",
        dotsColor: "#3A3A3A",
    },
    {
        recolor: true,
        colorDefault: "#FFFFFF",
        colorHover: "#FFFFFF",
        text: "Epsilon",
        textColor: "#FFFFFF",
        dotsColor: "#3A3A3A",
    },
]

const DEFAULT_FONT: React.CSSProperties = {
    fontSize: 22,
    fontWeight: 600,
    letterSpacing: "-0.01em",
    lineHeight: 1.2,
}

interface Fx {
    glyphSize: number
    lineHeight: number
    ramp: string
    noiseScale: number
    animate: boolean
    radius: number
    strength: number
    mode: "repel" | "attract"
    baseOpacity: number
    reveal: boolean
}

interface Dot {
    x: number
    y: number
    ox: number
    oy: number
    v: number
    n: number
    seed: number
}

/**
 * EPSILON — Stack Cards
 * Fila de tarjetas con ilustración centrada. En hover aparece un campo de
 * caracteres ASCII (canvas) que se densifica y deforma según el cursor, la
 * ilustración cambia de color y aparece el texto bajo el ícono.
 */
export default function EpsilonStackCards(props: EpsilonStackCardsProps) {
    const {
        items = DEFAULT_ITEMS,
        background = "#050505",
        borderColor = "rgba(255,255,255,0.14)",
        borderWidth = 1,
        showOuterBorder = true,
        cornerRadius = "0px",
        iconSize = 90,
        labelGap = 26,
        liftOnHover = 14,
        font = DEFAULT_FONT,
        transitionMs = 450,
        glyphSize = 13,
        glyphLineHeight = 1,
        ramp = " .:-=+*oahkbB%&@#",
        noiseScale = 0.22,
        animateNoise = true,
        dotRadius = 170,
        dotStrength = 6,
        dotMode = "repel",
        dotBaseOpacity = 0.34,
        revealFromCursor = true,
        stackBelow = 640,
        style,
    } = props

    const wrapRef = useRef<HTMLDivElement>(null)
    const [stacked, setStacked] = useState(false)

    useEffect(() => {
        const el = wrapRef.current
        if (!el || !stackBelow) return
        const ro = new ResizeObserver((entries) => {
            const w = entries[0]?.contentRect?.width ?? 0
            setStacked(w > 0 && w < stackBelow)
        })
        ro.observe(el)
        return () => ro.disconnect()
    }, [stackBelow])

    const fx: Fx = {
        glyphSize: Math.max(6, glyphSize),
        lineHeight: Math.max(0.6, glyphLineHeight),
        ramp: ramp && ramp.length > 1 ? ramp : " .:-=+*oahkbB%&@#",
        noiseScale,
        animate: animateNoise,
        radius: dotRadius,
        strength: dotStrength,
        mode: dotMode,
        baseOpacity: dotBaseOpacity,
        reveal: revealFromCursor,
    }

    return (
        <div
            ref={wrapRef}
            style={{
                ...style,
                display: "flex",
                flexDirection: stacked ? "column" : "row",
                width: "100%",
                height: "100%",
                background,
                border: showOuterBorder
                    ? `${borderWidth}px solid ${borderColor}`
                    : "none",
                borderRadius: cornerRadius,
                boxSizing: "border-box",
                overflow: "hidden",
                // fuerza el recorte del canvas contra las esquinas redondeadas
                isolation: "isolate",
                WebkitMaskImage:
                    "-webkit-radial-gradient(center, white, black)",
            }}
        >
            {items.map((item, i) => (
                <Card
                    key={i}
                    item={item}
                    fallback={FALLBACK_ICONS[i % FALLBACK_ICONS.length]}
                    isLast={i === items.length - 1}
                    stacked={stacked}
                    borderColor={borderColor}
                    borderWidth={borderWidth}
                    iconSize={iconSize}
                    labelGap={labelGap}
                    lift={liftOnHover}
                    font={font}
                    transitionMs={transitionMs}
                    fx={fx}
                />
            ))}
        </div>
    )
}

interface CardProps {
    item: EpsilonStackCardItem
    fallback: string
    isLast: boolean
    stacked: boolean
    borderColor: string
    borderWidth: number
    iconSize: number
    labelGap: number
    lift: number
    font: React.CSSProperties
    transitionMs: number
    fx: Fx
}

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)"
const subscribeReducedMotion = (cb: () => void) => {
    if (typeof window === "undefined" || !window.matchMedia) return () => {}
    const mq = window.matchMedia(REDUCED_QUERY)
    mq.addEventListener?.("change", cb)
    return () => mq.removeEventListener?.("change", cb)
}
const getReducedMotion = () =>
    typeof window !== "undefined" &&
    !!window.matchMedia &&
    window.matchMedia(REDUCED_QUERY).matches

function Card({
    item,
    fallback,
    isLast,
    stacked,
    borderColor,
    borderWidth,
    iconSize,
    labelGap,
    lift,
    font,
    transitionMs,
    fx,
}: CardProps) {
    const hostRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const probeRef = useRef<HTMLSpanElement>(null)
    const colorRef = useRef<string>(parseCSSVar(item.dotsColor))
    const atlasRef = useRef<HTMLCanvasElement | null>(null)
    const atlasMetrics = useRef({ cw: 0, ch: 0, dpr: 1, count: 0 })
    const gridRef = useRef({ cw: 8, ch: 13 })
    const timeRef = useRef(0)
    const pointer = useRef({ x: -9999, y: -9999 })
    const target = useRef(0)
    const prog = useRef(0)
    const reveal = useRef(0)
    const rafRef = useRef<number | null>(null)
    const dotsRef = useRef<Dot[]>([])
    const sizeRef = useRef({ w: 0, h: 0 })
    const [hovered, setHovered] = useState(false)

    // prefers-reduced-motion (SSR-safe: false en el servidor)
    const reduced = useSyncExternalStore(
        subscribeReducedMotion,
        getReducedMotion,
        () => false
    )

    // ---- atlas de glifos: se pre-renderiza cada carácter una sola vez ----
    const buildAtlas = useCallback(() => {
        if (typeof document === "undefined") return
        const chars = fx.ramp
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        const size = fx.glyphSize
        const cw = Math.max(1, Math.round(size * 0.62))
        const ch = Math.max(1, Math.round(size * fx.lineHeight))
        gridRef.current = { cw, ch }

        const atlas = atlasRef.current || document.createElement("canvas")
        atlas.width = Math.ceil(cw * dpr) * chars.length
        atlas.height = Math.ceil(ch * dpr)
        const actx = atlas.getContext("2d")
        if (!actx) return
        actx.setTransform(dpr, 0, 0, dpr, 0, 0)
        actx.clearRect(0, 0, cw * chars.length, ch)
        actx.font = `${size}px ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace`
        actx.textAlign = "center"
        actx.textBaseline = "middle"
        actx.fillStyle = colorRef.current
        for (let i = 0; i < chars.length; i++) {
            actx.fillText(chars[i], i * cw + cw / 2, ch / 2)
        }
        atlasRef.current = atlas
        atlasMetrics.current = {
            cw: Math.ceil(cw * dpr),
            ch: Math.ceil(ch * dpr),
            dpr,
            count: chars.length,
        }
    }, [fx.ramp, fx.glyphSize, fx.lineHeight])

    // ---- resolver color de dots (tokens de Framer incluidos) ----
    useEffect(() => {
        const el = probeRef.current
        let resolved = parseCSSVar(item.dotsColor)
        if (el && typeof window !== "undefined") {
            const computed = window.getComputedStyle(el).color
            if (
                computed &&
                computed !== "" &&
                computed !== "rgba(0, 0, 0, 0)"
            ) {
                resolved = computed
            }
        }
        colorRef.current = resolved
        buildAtlas()
    }, [item.dotsColor, buildAtlas])

    // ---- construir grilla ----
    const build = useCallback(() => {
        const host = hostRef.current
        const canvas = canvasRef.current
        if (!host || !canvas) return
        const rect = host.getBoundingClientRect()
        const w = Math.max(1, rect.width)
        const h = Math.max(1, rect.height)
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        canvas.width = Math.floor(w * dpr)
        canvas.height = Math.floor(h * dpr)
        canvas.style.width = w + "px"
        canvas.style.height = h + "px"
        const ctx = canvas.getContext("2d")
        if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        sizeRef.current = { w, h }

        const { cw, ch } = gridRef.current
        const cols = Math.max(1, Math.ceil(w / cw) + 1)
        const rows = Math.max(1, Math.ceil(h / ch) + 1)
        const list: Dot[] = []
        for (let j = 0; j < rows; j++) {
            for (let i = 0; i < cols; i++) {
                // ruido de valor: clusters orgánicos, no aleatoriedad plana
                const s = Math.max(0.02, fx.noiseScale)
                const n =
                    0.5 +
                    0.5 *
                        Math.sin(i * s * 1.7 + Math.cos(j * s * 1.1) * 2.3) *
                        Math.cos(j * s * 1.3 - Math.sin(i * s * 0.9) * 1.7)
                const hash = ((i * 73856093) ^ (j * 19349663)) % 1000
                list.push({
                    x: i * cw + cw / 2,
                    y: j * ch + ch / 2,
                    ox: 0,
                    oy: 0,
                    v: 0,
                    n,
                    seed: (hash < 0 ? hash + 1000 : hash) / 1000,
                })
            }
        }
        dotsRef.current = list
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fx.noiseScale, fx.glyphSize, fx.lineHeight])

    useEffect(() => {
        build()
        const host = hostRef.current
        if (!host) return
        const ro = new ResizeObserver(() => build())
        ro.observe(host)
        return () => ro.disconnect()
    }, [build])

    // ---- loop de animación ----
    const tick = useCallback(() => {
        const loop = (): void => {
            const canvas = canvasRef.current
            const ctx = canvas?.getContext("2d")
            if (!ctx || !canvas) return
            const { w, h } = sizeRef.current
            const diag = Math.sqrt(w * w + h * h)

            prog.current += (target.current - prog.current) * 0.1
            const p = prog.current

            const revealTarget = target.current === 1 ? diag : 0
            reveal.current += (revealTarget - reveal.current) * 0.14

            ctx.clearRect(0, 0, w, h)

            if (p > 0.002) {
                const mx = pointer.current.x
                const my = pointer.current.y
                const R = Math.max(1, fx.radius)
                const dir = fx.mode === "attract" ? -1 : 1
                const base = fx.baseOpacity
                const atlas = atlasRef.current
                const { cw: acw, ch: ach, count } = atlasMetrics.current
                const { cw, ch } = gridRef.current
                if (!atlas || !count) {
                    rafRef.current = requestAnimationFrame(loop)
                    return
                }

                timeRef.current += fx.animate && !reduced ? 0.012 : 0

                for (const d of dotsRef.current) {
                    const dx = d.x - mx
                    const dy = d.y - my
                    const dist = Math.sqrt(dx * dx + dy * dy)

                    let tox = 0
                    let toy = 0
                    let boost = 0
                    if (dist < R) {
                        const f = 1 - dist / R
                        const e = f * f
                        if (!reduced) {
                            const nx = dist === 0 ? 0 : dx / dist
                            const ny = dist === 0 ? 0 : dy / dist
                            tox = nx * e * fx.strength * dir
                            toy = ny * e * fx.strength * dir
                        }
                        boost = e
                    }
                    d.ox += (tox - d.ox) * 0.16
                    d.oy += (toy - d.oy) * 0.16

                    // aparición: el campo se revela desde el cursor hacia afuera
                    let mask = 1
                    if (fx.reveal) {
                        const edge = reveal.current
                        mask = Math.max(0, Math.min(1, (edge - dist) / 90 + 0.5))
                    }

                    // intensidad -> qué carácter del ramp le toca a esta celda
                    const shimmer = fx.animate
                        ? 0.12 * Math.sin(timeRef.current * 2 + d.seed * 6.28)
                        : 0
                    const targetV = Math.max(
                        0,
                        Math.min(1, d.n * 0.55 + boost * 0.9 + shimmer)
                    )
                    d.v += (targetV - d.v) * 0.22

                    const alpha = (base + boost * (1 - base)) * p * mask
                    if (alpha <= 0.015) continue

                    const idx = Math.min(
                        count - 1,
                        Math.max(0, Math.round(d.v * (count - 1)))
                    )
                    if (idx === 0) continue // primer carácter del ramp = celda vacía

                    ctx.globalAlpha = alpha
                    ctx.drawImage(
                        atlas,
                        idx * acw,
                        0,
                        acw,
                        ach,
                        d.x - cw / 2 + d.ox,
                        d.y - ch / 2 + d.oy,
                        cw,
                        ch
                    )
                }
                ctx.globalAlpha = 1
            }

            const settled = target.current === 0 && p < 0.004 && reveal.current < 1
            if (settled) {
                ctx.clearRect(0, 0, w, h)
                prog.current = 0
                reveal.current = 0
                rafRef.current = null
                return
            }
            rafRef.current = requestAnimationFrame(loop)
        }
        loop()
    }, [fx, reduced])

    const start = useCallback(() => {
        if (rafRef.current == null) rafRef.current = requestAnimationFrame(tick)
    }, [tick])

    useEffect(() => {
        return () => {
            if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
        }
    }, [])

    const onEnter = (e: React.PointerEvent<HTMLDivElement>) => {
        const rect = hostRef.current?.getBoundingClientRect()
        if (rect) {
            pointer.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            }
        }
        reveal.current = 0
        target.current = 1
        setHovered(true)
        start()
    }

    const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
        const rect = hostRef.current?.getBoundingClientRect()
        if (!rect) return
        pointer.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
        start()
    }

    const onLeave = () => {
        target.current = 0
        pointer.current = { x: -9999, y: -9999 }
        setHovered(false)
        start()
    }

    const src = item.image?.src || fallback
    const usingFallback = !item.image?.src
    const color = hovered ? item.colorHover : item.colorDefault
    const ease = "cubic-bezier(0.22, 1, 0.36, 1)"

    return (
        <div
            ref={hostRef}
            onPointerEnter={onEnter}
            onPointerMove={onMove}
            onPointerLeave={onLeave}
            style={{
                position: "relative",
                flex: 1,
                minWidth: 0,
                minHeight: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                borderRight:
                    !isLast && !stacked
                        ? `${borderWidth}px solid ${borderColor}`
                        : "none",
                borderBottom:
                    !isLast && stacked
                        ? `${borderWidth}px solid ${borderColor}`
                        : "none",
                boxSizing: "border-box",
            }}
        >
            <span
                ref={probeRef}
                aria-hidden
                style={{
                    color: item.dotsColor,
                    position: "absolute",
                    width: 0,
                    height: 0,
                    opacity: 0,
                    pointerEvents: "none",
                }}
            />

            <canvas
                ref={canvasRef}
                style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                }}
            />

            <div
                style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transform: `translateY(${hovered ? -lift : 0}px)`,
                    transition: `transform ${transitionMs}ms ${ease}`,
                }}
            >
                {src ? (
                    item.recolor || usingFallback ? (
                        <div
                            role="img"
                            aria-label={item.image?.alt || item.text}
                            style={{
                                width: iconSize,
                                height: iconSize,
                                backgroundColor: color,
                                WebkitMaskImage: `url("${src}")`,
                                maskImage: `url("${src}")`,
                                WebkitMaskRepeat: "no-repeat",
                                maskRepeat: "no-repeat",
                                WebkitMaskPosition: "center",
                                maskPosition: "center",
                                WebkitMaskSize: "contain",
                                maskSize: "contain",
                                transition: `background-color ${transitionMs}ms ${ease}`,
                            }}
                        />
                    ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={src}
                            srcSet={item.image?.srcSet}
                            alt={item.image?.alt || item.text || ""}
                            style={{
                                width: iconSize,
                                height: iconSize,
                                objectFit: "contain",
                                display: "block",
                            }}
                        />
                    )
                ) : (
                    <div
                        style={{
                            width: iconSize,
                            height: iconSize,
                            border: `1px dashed ${item.colorDefault}`,
                            opacity: 0.4,
                        }}
                    />
                )}

                {item.text ? (
                    <span
                        style={{
                            position: "absolute",
                            top: "100%",
                            left: "50%",
                            marginTop: labelGap,
                            transform: `translate(-50%, ${hovered ? 0 : 8}px)`,
                            opacity: hovered ? 1 : 0,
                            whiteSpace: "nowrap",
                            color: item.textColor,
                            ...font,
                            transition: `opacity ${transitionMs}ms ${ease}, transform ${transitionMs}ms ${ease}`,
                            pointerEvents: "none",
                        }}
                    >
                        {item.text}
                    </span>
                ) : null}
            </div>
        </div>
    )
}
