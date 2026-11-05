"use client"
// Portado desde Framer: Asciishimmer.tsx

import {
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
    type CSSProperties,
} from "react"

/**
 * ASCII SHIMMER
 * Capa de fondo: grilla de caracteres ASCII que parpadean, revelada por una
 * máscara radial que crece desde el centro cuando se hace hover en la card.
 *
 * Uso: colocar DENTRO del contenedor de la card (position: relative). Se
 * posiciona absolute/inset 0. No captura clicks; escucha el hover del elemento
 * padre (o se controla con `forceOn`).
 */
export interface AsciiShimmerProps {
    /** Caracteres. Default "01<>/\\|*+=-#%$&@" */
    charset?: string
    /** Celda (px). Default 14 */
    cell?: number
    /** Tamaño (px). Default 11 */
    fontSize?: number
    /** Default "ui-monospace, SFMono-Regular, Menlo, monospace" */
    fontFamily?: string
    /** Default "#9AA0A6" */
    baseColor?: string
    /** Default "#3B5BFF" */
    accentColor?: string
    /** Default 0.12 */
    accentChance?: number
    /** Default 0.15 */
    minAlpha?: number
    /** Default 0.9 */
    maxAlpha?: number
    /** Default 14 */
    fps?: number
    /** % de celdas que cambian por tick. Default 6 */
    flicker?: number
    /** true = anima solo en hover. Default true */
    onlyOnHover?: boolean
    /** Máscara base (%). Default 0 */
    maskBase?: number
    /** Máscara hover (%). Default 180 */
    maskHover?: number
    /** Difuminado (%). Default 45 */
    feather?: number
    /** ms. Default 700 */
    duration?: number
    /** Default "cubic-bezier(.22,1,.36,1)" */
    easing?:
        | "cubic-bezier(.22,1,.36,1)"
        | "ease-out"
        | "ease-in-out"
        | "linear"
    /** Forzar hover. Default false */
    forceOn?: boolean
    style?: CSSProperties
}

export default function AsciiShimmer(props: AsciiShimmerProps) {
    const {
        charset = "01<>/\\|*+=-#%$&@",
        cell = 14,
        fontSize = 11,
        fontFamily = "ui-monospace, SFMono-Regular, Menlo, monospace",
        baseColor = "#9AA0A6",
        accentColor = "#3B5BFF",
        accentChance = 0.12,
        minAlpha = 0.15,
        maxAlpha = 0.9,
        fps = 14,
        flicker = 6,
        onlyOnHover = true,
        maskBase = 0,
        maskHover = 180,
        feather = 45,
        duration = 700,
        easing = "cubic-bezier(.22,1,.36,1)",
        forceOn = false,
        style,
    } = props

    const wrapRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const cellsRef = useRef<{ c: string; color: string; a: number }[]>([])
    const gridRef = useRef({ cols: 0, rows: 0 })
    const [box, setBox] = useState({ w: 0, h: 0 })
    const [hover, setHover] = useState(false)

    const on = forceOn || hover

    /* ---------- medir ---------- */
    useLayoutEffect(() => {
        const el = wrapRef.current
        if (!el) return
        const read = () => {
            const r = el.getBoundingClientRect()
            setBox({ w: r.width, h: r.height })
        }
        read()
        const ro = new ResizeObserver(read)
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    /* ---------- hover del padre ---------- */
    useEffect(() => {
        const el = wrapRef.current
        if (!el) return
        const target = el.parentElement ?? el
        const enter = () => setHover(true)
        const leave = () => setHover(false)
        target.addEventListener("pointerenter", enter)
        target.addEventListener("pointerleave", leave)
        target.addEventListener("focusin", enter)
        target.addEventListener("focusout", leave)
        return () => {
            target.removeEventListener("pointerenter", enter)
            target.removeEventListener("pointerleave", leave)
            target.removeEventListener("focusin", enter)
            target.removeEventListener("focusout", leave)
        }
    }, [])

    /* ---------- render de la grilla ---------- */
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas || box.w === 0 || box.h === 0) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const chars = (charset || "01").split("")

        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        canvas.width = Math.ceil(box.w * dpr)
        canvas.height = Math.ceil(box.h * dpr)
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

        const cols = Math.ceil(box.w / cell)
        const rows = Math.ceil(box.h / cell)
        gridRef.current = { cols, rows }

        const rnd = () => ({
            c: chars[Math.floor(Math.random() * chars.length)],
            color: Math.random() < accentChance ? accentColor : baseColor,
            a: minAlpha + Math.random() * Math.max(maxAlpha - minAlpha, 0),
        })

        cellsRef.current = new Array(cols * rows).fill(0).map(rnd)

        const draw = () => {
            ctx.clearRect(0, 0, box.w, box.h)
            ctx.font = `${fontSize}px ${fontFamily}`
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"
            const cellsArr = cellsRef.current
            for (let i = 0; i < cellsArr.length; i++) {
                const item = cellsArr[i]
                const x = (i % cols) * cell + cell / 2
                const y = Math.floor(i / cols) * cell + cell / 2
                ctx.globalAlpha = item.a
                ctx.fillStyle = item.color
                ctx.fillText(item.c, x, y)
            }
            ctx.globalAlpha = 1
        }

        draw()

        const reduced = window.matchMedia?.(
            "(prefers-reduced-motion: reduce)"
        ).matches
        if (reduced) return

        let raf = 0
        let last = performance.now()
        const step = 1000 / Math.max(fps, 1)
        const perTick = Math.max(1, Math.round((cols * rows * flicker) / 100))

        const tick = (now: number) => {
            raf = requestAnimationFrame(tick)
            if (onlyOnHover && !on) return
            if (now - last < step) return
            last = now
            const arr = cellsRef.current
            for (let k = 0; k < perTick; k++) {
                arr[Math.floor(Math.random() * arr.length)] = rnd()
            }
            draw()
        }
        raf = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(raf)
    }, [
        box.w,
        box.h,
        cell,
        fontSize,
        fontFamily,
        charset,
        baseColor,
        accentColor,
        accentChance,
        minAlpha,
        maxAlpha,
        fps,
        flicker,
        onlyOnHover,
        on,
    ])

    /* ---------- máscara radial ---------- */
    const size = on ? maskHover : maskBase
    const mask = `radial-gradient(circle closest-side, #000 ${Math.max(
        100 - feather,
        0
    )}%, rgba(0,0,0,0) 100%)`

    return (
        <div
            ref={wrapRef}
            style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                overflow: "hidden",
                ...style,
            }}
        >
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    WebkitMaskImage: mask,
                    maskImage: mask,
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                    WebkitMaskPosition: "center",
                    maskPosition: "center",
                    WebkitMaskSize: `${size}% ${size}%`,
                    maskSize: `${size}% ${size}%`,
                    transition: `-webkit-mask-size ${duration}ms ${easing}, mask-size ${duration}ms ${easing}`,
                    willChange: "mask-size",
                }}
            >
                <canvas
                    ref={canvasRef}
                    style={{ width: "100%", height: "100%", display: "block" }}
                />
            </div>
        </div>
    )
}
