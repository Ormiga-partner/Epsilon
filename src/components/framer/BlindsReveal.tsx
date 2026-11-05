"use client"
// Portado desde Framer: Blindsreveal.tsx

import {
    createElement,
    useCallback,
    useEffect,
    useRef,
    useState,
    type ComponentType,
    type CSSProperties,
    type ElementType,
    type ReactNode,
    type RefObject,
} from "react"

/**
 * BlindsReveal — reveal por líneas para textos.
 * Arranca vacío: la barra entra, cubre la línea, y al salir por el otro
 * lado deja el texto impreso. Alterna izquierda-derecha por línea.
 */

export interface BlindsRevealConfig {
    /** Color de la barra. Default "#3B82F6" */
    color?: string
    /** Duración de cada fase (s). Default 0.55 */
    duration?: number
    /** Retardo entre líneas (s). Default 0.07 */
    stagger?: number
    /** Cubic-bezier. Default [0.76, 0, 0.24, 1] */
    ease?: [number, number, number, number]
    /** Dirección de la primera línea. Default "left" */
    startFrom?: "left" | "right"
    /** Alto extra de la barra (relativo al alto de línea). Default 0.14 */
    padY?: number
    /** Ancho extra de la barra (relativo al alto de línea). Default 0.03 */
    padX?: number
    /** Animar solo la primera vez. Default true */
    once?: boolean
    /** Porción visible para disparar (0-1). Default 0.4 */
    amount?: number
}

const CONFIG: Required<BlindsRevealConfig> = {
    color: "#3B82F6",
    duration: 0.55,
    stagger: 0.07,
    ease: [0.76, 0, 0.24, 1],
    startFrom: "left",
    padY: 0.14,
    padX: 0.03,
    once: true,
    amount: 0.4,
}

const BLEED = 2 // margen de la máscara del texto, en px

type Line = { top: number; left: number; width: number; height: number }

function useMeasure(
    hostRef: RefObject<HTMLElement | null>,
    textRef: RefObject<HTMLElement | null>
) {
    const [lines, setLines] = useState<Line[]>([])
    const [offset, setOffset] = useState({ x: 0, y: 0 })
    const [measured, setMeasured] = useState(false)

    const measure = useCallback(() => {
        const host = hostRef.current
        const text = textRef.current
        if (!host || !text) return

        const base = host.getBoundingClientRect()
        const textBox = text.getBoundingClientRect()
        const walker = document.createTreeWalker(text, NodeFilter.SHOW_TEXT)
        const raw: {
            top: number
            bottom: number
            left: number
            right: number
        }[] = []

        let node: Node | null
        while ((node = walker.nextNode())) {
            if (!node.nodeValue || !node.nodeValue.trim()) continue
            const range = document.createRange()
            range.selectNodeContents(node)
            for (const r of Array.from(range.getClientRects())) {
                if (r.width < 1 || r.height < 1) continue
                raw.push({
                    top: r.top - base.top,
                    bottom: r.bottom - base.top,
                    left: r.left - base.left,
                    right: r.right - base.left,
                })
            }
        }

        const merged: typeof raw = []
        for (const r of raw) {
            const h = r.bottom - r.top
            const hit = merged.find((m) => Math.abs(m.top - r.top) < h * 0.5)
            if (hit) {
                hit.top = Math.min(hit.top, r.top)
                hit.bottom = Math.max(hit.bottom, r.bottom)
                hit.left = Math.min(hit.left, r.left)
                hit.right = Math.max(hit.right, r.right)
            } else {
                merged.push({ ...r })
            }
        }

        setOffset({ x: textBox.left - base.left, y: textBox.top - base.top })
        setLines(
            merged
                .sort((a, b) => a.top - b.top)
                .map((m) => ({
                    top: m.top,
                    left: m.left,
                    width: m.right - m.left,
                    height: m.bottom - m.top,
                }))
        )
        setMeasured(true)
    }, [hostRef, textRef])

    useEffect(() => {
        const host = hostRef.current
        if (!host) return
        let raf = 0
        const run = () => {
            raf = requestAnimationFrame(measure)
        }
        if (document.fonts?.ready) document.fonts.ready.then(run)
        else run()

        const ro = new ResizeObserver(run)
        ro.observe(host)
        return () => {
            cancelAnimationFrame(raf)
            ro.disconnect()
        }
    }, [measure, hostRef])

    return { lines, offset, measured }
}

/** Reemplazo de framer-motion `useInView` ({ once, amount }). */
function useInView(
    ref: RefObject<Element | null>,
    { once, amount }: { once: boolean; amount: number }
) {
    const [inView, setInView] = useState(false)
    useEffect(() => {
        const el = ref.current
        if (!el || typeof IntersectionObserver === "undefined") return
        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true)
                    if (once) io.disconnect()
                } else if (!once) {
                    setInView(false)
                }
            },
            { threshold: amount }
        )
        io.observe(el)
        return () => io.disconnect()
    }, [ref, once, amount])
    return inView
}

/** Lógica compartida: devuelve el ref del host y el contenido (texto + barras). */
function useBlindsReveal(children: ReactNode, config?: BlindsRevealConfig) {
    const cfg = { ...CONFIG, ...config }
    const hostRef = useRef<HTMLElement | null>(null)
    const textRef = useRef<HTMLSpanElement | null>(null)
    const barRefs = useRef<(HTMLSpanElement | null)[]>([])
    const animsRef = useRef<(Animation | null)[]>([])
    const { lines, offset, measured } = useMeasure(hostRef, textRef)
    const inView = useInView(hostRef, { once: cfg.once, amount: cfg.amount })
    const [printed, setPrinted] = useState<boolean[]>([])
    const play = inView && lines.length > 0
    const total = cfg.duration * 2
    const [e1, e2, e3, e4] = cfg.ease
    const easing = `cubic-bezier(${e1}, ${e2}, ${e3}, ${e4})`

    // Cada línea se "imprime" justo cuando la barra termina de cubrirla
    useEffect(() => {
        if (!play) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- igual al original
            setPrinted(lines.map(() => false))
            return
        }
        const timers = lines.map((_, i) =>
            setTimeout(
                () =>
                    setPrinted((prev) => {
                        const next = [...prev]
                        next[i] = true
                        return next
                    }),
                (i * cfg.stagger + cfg.duration) * 1000
            )
        )
        return () => timers.forEach(clearTimeout)
    }, [play, lines, cfg.stagger, cfg.duration])

    // Barras: scaleX [0, 1, 1, 0] con times [0, .5, .5, 1] (WAAPI)
    useEffect(() => {
        const anims = animsRef.current
        if (!play) {
            anims.forEach((a) => a?.cancel())
            animsRef.current = []
            return
        }
        for (let i = 0; i < lines.length; i++) {
            const el = barRefs.current[i]
            if (!el || anims[i]) continue
            const fromLeft =
                cfg.startFrom === "left" ? i % 2 === 0 : i % 2 === 1
            const originIn = fromLeft ? "0% 50%" : "100% 50%"
            const originOut = fromLeft ? "100% 50%" : "0% 50%"
            anims[i] = el.animate(
                [
                    {
                        transform: "scaleX(0)",
                        transformOrigin: originIn,
                        offset: 0,
                        easing,
                    },
                    {
                        transform: "scaleX(1)",
                        transformOrigin: originIn,
                        offset: 0.5,
                        easing,
                    },
                    {
                        transform: "scaleX(1)",
                        transformOrigin: originOut,
                        offset: 0.5,
                        easing,
                    },
                    {
                        transform: "scaleX(0)",
                        transformOrigin: originOut,
                        offset: 1,
                    },
                ],
                {
                    duration: total * 1000,
                    delay: i * cfg.stagger * 1000,
                    fill: "both",
                }
            )
        }
    }, [play, lines.length, cfg.startFrom, cfg.stagger, total, easing])

    useEffect(
        () => () => {
            animsRef.current.forEach((a) => a?.cancel())
        },
        []
    )

    // Máscara: cada línea se descubre solo cuando le toca
    const allPrinted =
        lines.length > 0 &&
        printed.length === lines.length &&
        printed.every(Boolean)
    const useMask = measured && lines.length > 0 && !allPrinted

    const maskImage = lines.map(() => "linear-gradient(#000, #000)").join(", ")
    const maskPosition = lines
        .map(
            (l) =>
                `${l.left - offset.x - BLEED}px ${l.top - offset.y - BLEED}px`
        )
        .join(", ")
    const maskSize = lines
        .map((l, i) =>
            printed[i]
                ? `${l.width + BLEED * 2}px ${l.height + BLEED * 2}px`
                : "0px 0px"
        )
        .join(", ")

    const maskStyle: CSSProperties = useMask
        ? {
              WebkitMaskImage: maskImage,
              maskImage,
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskPosition: maskPosition,
              maskPosition,
              WebkitMaskSize: maskSize,
              maskSize,
          }
        : {}

    const content = (
        <>
            <span
                ref={textRef}
                style={{
                    display: "block",
                    opacity: measured ? 1 : 0,
                    ...maskStyle,
                }}
            >
                {children}
            </span>

            {lines.map((l, i) => {
                const fromLeft =
                    cfg.startFrom === "left" ? i % 2 === 0 : i % 2 === 1
                const originIn = fromLeft ? "0% 50%" : "100% 50%"
                const padY = l.height * cfg.padY
                const padX = l.height * cfg.padX

                return (
                    <span
                        key={i}
                        ref={(el) => {
                            barRefs.current[i] = el
                        }}
                        aria-hidden="true"
                        style={{
                            position: "absolute",
                            top: l.top - padY,
                            left: l.left - padX,
                            width: l.width + padX * 2,
                            height: l.height + padY * 2,
                            background: cfg.color,
                            pointerEvents: "none",
                            willChange: "transform",
                            transformOrigin: originIn,
                            transform: "scaleX(0)",
                        }}
                    />
                )
            })}
        </>
    )

    return { hostRef, content }
}

export interface BlindsRevealProps extends BlindsRevealConfig {
    children?: ReactNode
    /** Elemento host. Default "div" */
    as?: ElementType
    className?: string
    style?: CSSProperties
}

export default function BlindsReveal({
    children,
    as = "div",
    className,
    style,
    ...config
}: BlindsRevealProps) {
    const { hostRef, content } = useBlindsReveal(children, config)
    return createElement(
        as,
        {
            ref: hostRef,
            className,
            style: { ...style, position: "relative" },
        },
        content
    )
}

/**
 * HOC equivalente al override de Framer. `Component` debe aceptar `ref`
 * (React 19: prop normal) apuntando a su elemento raíz, `style` y `children`.
 */
export function withBlindsReveal<
    P extends { style?: CSSProperties; children?: ReactNode },
>(Component: ElementType, config?: BlindsRevealConfig): ComponentType<P> {
    function WithBlindsReveal(props: P) {
        const { hostRef, content } = useBlindsReveal(props.children, config)
        return createElement(
            Component,
            {
                ...props,
                ref: hostRef,
                style: { ...props.style, position: "relative" },
            },
            content
        )
    }
    return WithBlindsReveal
}
