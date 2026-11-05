"use client"
// Portado desde Framer: Draggablecarousel.tsx

import {
    Children,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
    type ReactNode,
} from "react"

/**
 * Draggable finite carousel with sensitive snap-to-card.
 * (Intrinsic size en Framer: 800 x 400, ancho fijo / alto auto.)
 */
export interface DraggableCarouselProps {
    /** Slides (Framer: Array de ComponentInstance). Si no se pasa, usa `children`. */
    slides?: ReactNode[]
    children?: ReactNode
    /** px. Default 24 */
    gap?: number
    /** px. Default 0 */
    padding?: number
    /** "Rebote" (dragElastic). Default 0.15 */
    dragElastic?: number
    /** "Sensibilidad": fracción del ancho de card para avanzar. Default 0.2 */
    threshold?: number
    /** Default false */
    overflowVisible?: boolean
}

// Spring equivalente a framer-motion { type: "spring", stiffness: 400, damping: 40 }
const STIFFNESS = 400
const DAMPING = 40
const MASS = 1
const REST_DELTA = 0.5
const REST_SPEED = 10
const DRAG_THRESHOLD = 3 // px antes de considerar que empezó el drag (como framer)

export default function DraggableCarousel(props: DraggableCarouselProps) {
    const {
        slides: slidesProp,
        children,
        gap = 24,
        dragElastic = 0.15,
        padding = 0,
        overflowVisible = false,
        threshold = 0.2,
    } = props

    const slides: ReactNode[] = slidesProp ?? Children.toArray(children)

    const containerRef = useRef<HTMLDivElement>(null)
    const trackRef = useRef<HTMLDivElement>(null)
    const xRef = useRef(0)
    const velRef = useRef(0)
    const springRaf = useRef(0)

    const maxScrollRef = useRef(0)
    const snapPointsRef = useRef<number[]>([0])
    const indexRef = useRef(0)
    const [grabbing, setGrabbing] = useState(false)
    const suppressClick = useRef(false)

    const setX = (v: number) => {
        xRef.current = v
        const track = trackRef.current
        if (track) track.style.transform = `translateX(${v}px)`
    }

    useLayoutEffect(() => {
        const measure = () => {
            if (!containerRef.current || !trackRef.current) return
            const containerW = containerRef.current.offsetWidth
            const trackW = trackRef.current.scrollWidth
            const max = Math.max(0, trackW - containerW)
            maxScrollRef.current = max

            const kids = Array.from(trackRef.current.children) as HTMLElement[]
            snapPointsRef.current = kids.map((c) =>
                Math.max(-max, -(c.offsetLeft - padding))
            )
        }
        measure()
        window.addEventListener("resize", measure)
        return () => window.removeEventListener("resize", measure)
    }, [slidesProp, children, gap, padding])

    useEffect(() => () => cancelAnimationFrame(springRaf.current), [])

    const stopSpring = () => {
        cancelAnimationFrame(springRaf.current)
        springRaf.current = 0
    }

    const springTo = (target: number, initialVelocity: number) => {
        stopSpring()
        let v = initialVelocity
        let pos = xRef.current
        let last = performance.now()
        const tick = (now: number) => {
            let dt = Math.min((now - last) / 1000, 1 / 20)
            last = now
            // sub-steps para estabilidad
            const steps = Math.max(1, Math.ceil(dt / (1 / 240)))
            dt /= steps
            for (let s = 0; s < steps; s++) {
                const force = -STIFFNESS * (pos - target) - DAMPING * v
                v += (force / MASS) * dt
                pos += v * dt
            }
            velRef.current = v
            if (Math.abs(v) < REST_SPEED && Math.abs(pos - target) < REST_DELTA) {
                setX(target)
                velRef.current = 0
                springRaf.current = 0
                return
            }
            setX(pos)
            springRaf.current = requestAnimationFrame(tick)
        }
        springRaf.current = requestAnimationFrame(tick)
    }

    const snapToNearest = (offset: number, velocity: number) => {
        const points = snapPointsRef.current
        let i = indexRef.current
        const cardW = Math.abs((points[1] ?? 0) - (points[0] ?? 0)) || 1

        // Avanza si arrastras más que "threshold" del ancho de card, o con flick.
        const dragged = offset / cardW // fracción de card arrastrada
        if (dragged < -threshold || velocity < -400) i++
        else if (dragged > threshold || velocity > 400) i--

        i = Math.max(0, Math.min(points.length - 1, i))
        indexRef.current = i

        springTo(points[i], velRef.current)
    }

    // Constraints con elasticidad (igual que framer-motion applyConstraints)
    const constrain = (point: number) => {
        const min = -maxScrollRef.current
        const max = 0
        if (point < min) return min + (point - min) * dragElastic
        if (point > max) return max + (point - max) * dragElastic
        return point
    }

    const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (e.button !== 0) return
        stopSpring()
        setGrabbing(true)
        suppressClick.current = false

        const startPointer = e.clientX
        const startX = xRef.current
        let dragging = false
        const samples: { t: number; x: number }[] = [
            { t: performance.now(), x: e.clientX },
        ]

        const onMove = (ev: PointerEvent) => {
            const dx = ev.clientX - startPointer
            if (!dragging) {
                if (Math.abs(dx) < DRAG_THRESHOLD) return
                dragging = true
            }
            const now = performance.now()
            samples.push({ t: now, x: ev.clientX })
            while (samples.length > 2 && now - samples[0].t > 100) samples.shift()
            setX(constrain(startX + dx))
        }

        const onUp = (ev: PointerEvent) => {
            window.removeEventListener("pointermove", onMove)
            window.removeEventListener("pointerup", onUp)
            window.removeEventListener("pointercancel", onUp)
            setGrabbing(false)
            if (!dragging) return
            suppressClick.current = true

            const now = performance.now()
            samples.push({ t: now, x: ev.clientX })
            while (samples.length > 2 && now - samples[0].t > 100) samples.shift()
            const first = samples[0]
            const lastS = samples[samples.length - 1]
            const dt = (lastS.t - first.t) / 1000
            const velocity = dt > 0 ? (lastS.x - first.x) / dt : 0
            velRef.current = velocity

            snapToNearest(ev.clientX - startPointer, velocity)
        }

        window.addEventListener("pointermove", onMove)
        window.addEventListener("pointerup", onUp)
        window.addEventListener("pointercancel", onUp)
    }

    return (
        <div
            ref={containerRef}
            style={{
                width: "100%",
                height: "100%",
                overflowX: overflowVisible ? "visible" : "hidden",
                overflowY: "visible",
                cursor: "grab",
            }}
        >
            <div
                ref={trackRef}
                onPointerDown={onPointerDown}
                onDragStartCapture={(e) => e.preventDefault()}
                onClickCapture={(e) => {
                    if (suppressClick.current) {
                        e.preventDefault()
                        e.stopPropagation()
                        suppressClick.current = false
                    }
                }}
                style={{
                    display: "flex",
                    gap,
                    padding,
                    width: "max-content",
                    height: "100%",
                    touchAction: "pan-y",
                    userSelect: grabbing ? "none" : undefined,
                    cursor: grabbing ? "grabbing" : undefined,
                }}
            >
                {slides.map((slide, i) => (
                    <div key={i} style={{ flexShrink: 0, height: "100%" }}>
                        {slide}
                    </div>
                ))}
            </div>
        </div>
    )
}
