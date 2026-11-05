"use client"
// Portado desde Framer: Curve_carrusel.tsx

import { useRef, useMemo, useState, useEffect, useLayoutEffect } from "react"
import type React from "react"

const DEG = Math.PI / 180

export interface Carrusel3DImage {
    src: string
    alt?: string
}

export interface Carrusel3DProps {
    images?: Array<Carrusel3DImage | null | undefined>
    curveMode?: "concave" | "convex"
    autoWidth?: boolean
    /** Mitad del ancho que debe ocupar la rueda (solo si autoWidth = false) */
    radius?: number
    /** Menos = más profundidad. Bajo 1 solo funciona en modo concave */
    depth?: number
    /** Tarjeta más grande completamente visible */
    cardWidth?: number
    cardHeight?: number
    gap?: number
    verticalArc?: number
    paddingY?: number
    /** px por segundo. En 0 solo se mueve al arrastrar */
    speed?: number
    direction?: "left" | "right"
    enableDrag?: boolean
    inertia?: number
    cardRadius?: number
    grayscale?: boolean
    /** % de desvanecido a los lados */
    fade?: number
    style?: React.CSSProperties
}

/**
 * Sustituto de useAnimationFrame de framer-motion: llama al callback más
 * reciente en cada frame con (time, delta) en ms. El delta se limita a 40 ms
 * como hace el frameloop de Framer Motion.
 */
function useAnimationFrame(cb: (time: number, delta: number) => void) {
    const cbRef = useRef(cb)
    useLayoutEffect(() => {
        cbRef.current = cb
    })
    useEffect(() => {
        let raf = 0
        let start = 0
        let prev = 0
        const loop = (now: number) => {
            if (!start) {
                start = now
                prev = now
            }
            const delta = Math.min(now - prev, 40)
            prev = now
            cbRef.current(now - start, delta)
            raf = requestAnimationFrame(loop)
        }
        raf = requestAnimationFrame(loop)
        return () => cancelAnimationFrame(raf)
    }, [])
}

const EMPTY_IMAGES: Array<Carrusel3DImage | null | undefined> = []

/**
 * CARRUSEL 3D — cilindro real con auto-scroll infinito y drag opcional
 *
 * El radio se deriva del ancho medido del bloque, así que la rueda ocupa el
 * ancho completo en cualquier breakpoint. Ancho y Alto describen la tarjeta
 * más grande completamente visible.
 */
export default function Carrusel3D(props: Carrusel3DProps) {
    const {
        images = EMPTY_IMAGES,
        curveMode = "concave",
        autoWidth = true,
        radius = 700,
        depth = 1.4,
        cardWidth = 230,
        cardHeight = 310,
        gap = 26,
        verticalArc = 0,
        paddingY = 0,
        speed = 45,
        direction = "left",
        enableDrag = true,
        inertia = 45,
        cardRadius = 16,
        grayscale = false,
        fade = 6,
        style,
    } = props

    const containerRef = useRef<HTMLDivElement>(null)
    const itemRefs = useRef<Array<HTMLDivElement | null>>([])
    const angle = useRef(0)

    const dragging = useRef(false)
    const lastX = useRef(0)
    const lastT = useRef(0)
    const velocity = useRef(0) // px/ms
    const spin = useRef(0) // grados/seg de inercia residual

    const [grabbing, setGrabbing] = useState(false)

    // En Framer: RenderTarget.current() === RenderTarget.canvas. Fuera de Framer siempre false.
    const isCanvas = false

    // --- Ancho medido del bloque ----------------------------------------
    const [measured, setMeasured] = useState(0)
    useEffect(() => {
        const el = containerRef.current
        if (!el) return
        setMeasured(el.offsetWidth)
        if (typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver((entries) => {
            const w = entries[0]?.contentRect?.width
            if (w) setMeasured(w)
        })
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    // --- Geometría del cilindro ------------------------------------------
    const concave = curveMode === "concave"
    const sign = concave ? -1 : 1

    // En cóncavo la cámara puede quedar dentro del cilindro (depth < 1), que es
    // lo que produce la perspectiva fuerte. En convexo tiene que quedar por
    // delante del frente, así que depth > 1.
    const d = concave ? Math.max(0.25, depth) : Math.max(1.25, depth)

    const limit = concave ? 90 : Math.acos(Math.min(0.99, 1 / d)) / DEG
    const fadeStart = limit * (concave ? 0.8 : 0.62)

    // Escala que aplica la perspectiva a un ángulo dado.
    const scaleAt = (aDeg: number) => d / (d - sign * Math.cos(aDeg * DEG))

    const centerScale = scaleAt(0)
    // Tarjeta más grande que se ve completa: en cóncavo la del borde del fade,
    // en convexo la central.
    const refScale = concave ? scaleAt(fadeStart) : centerScale

    // Qué fracción del radio ocupa en pantalla la última tarjeta opaca. Sirve
    // para despejar el radio a partir del ancho disponible.
    const projFrac = Math.sin(fadeStart * DEG) * scaleAt(fadeStart)

    const halfSpan = autoWidth && measured > 0 ? measured / 2 : radius

    // Tamaños "fuente": lo que se dibuja en 3D para que al proyectarse mida en
    // pantalla lo que pidió el usuario.
    const srcW = cardWidth / refScale
    const srcH = cardHeight / refScale
    const srcGap = gap / refScale
    const srcArc = verticalArc / refScale
    const srcRadius = halfSpan / projFrac

    const step = srcW + srcGap

    const geo = useMemo(() => {
        const base = (images || []).filter(Boolean) as Carrusel3DImage[]
        if (!base.length || srcRadius <= 0 || step <= 0) return null

        let R = srcRadius
        // floor, no round: así el arco que ocupa cada tarjeta nunca queda por
        // debajo de ancho + gap y el solape sigue siendo imposible.
        let count = Math.floor((2 * Math.PI * R) / step)

        if (count > 80) {
            count = 80
            R = (count * step) / (2 * Math.PI)
        }
        // única repetición que molesta: que la misma imagen quede junto a sí
        // misma en la costura del loop.
        if (base.length > 1 && count % base.length === 1) count -= 1
        count = Math.max(3, count)

        const list: Carrusel3DImage[] = []
        for (let i = 0; i < count; i++) list.push(base[i % base.length])

        return { list, count, R, stepAngle: 360 / count }
    }, [images, step, srcRadius])

    const degPerPx = geo ? 180 / (Math.PI * geo.R * centerScale) : 0

    // --- Alto automático -------------------------------------------------
    const arcTravel =
        (Math.abs(verticalArc) *
            ((1 - Math.cos(fadeStart * DEG)) * scaleAt(fadeStart))) /
        refScale
    const autoHeight = Math.ceil(cardHeight + arcTravel + paddingY * 2)
    const trackShift = -Math.sign(verticalArc) * (arcTravel / 2)

    const perspective = geo ? geo.R * d : 1000

    // Signo de ángulo que mueve las tarjetas hacia la derecha.
    const moveSign = concave ? 1 : -1

    // --- Drag ------------------------------------------------------------
    const canDrag = enableDrag && !isCanvas && !!geo

    const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!canDrag) return
        dragging.current = true
        lastX.current = e.clientX
        lastT.current = performance.now()
        velocity.current = 0
        spin.current = 0
        setGrabbing(true)
        try {
            e.currentTarget.setPointerCapture(e.pointerId)
        } catch {}
    }

    const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!dragging.current) return
        const now = performance.now()
        const dx = e.clientX - lastX.current
        const dt = Math.max(1, now - lastT.current)

        angle.current += dx * degPerPx * moveSign
        velocity.current = velocity.current * 0.7 + (dx / dt) * 0.3

        lastX.current = e.clientX
        lastT.current = now
    }

    const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!dragging.current) return
        dragging.current = false
        setGrabbing(false)

        const boost = (inertia / 100) * 1000
        spin.current = velocity.current * boost * degPerPx * moveSign

        try {
            e.currentTarget.releasePointerCapture(e.pointerId)
        } catch {}
    }

    useAnimationFrame((_time, delta) => {
        if (!geo) return
        const { list, R, stepAngle } = geo

        if (!dragging.current) {
            const autoDir = (direction === "left" ? -1 : 1) * moveSign
            const spd = isCanvas ? 0 : speed
            const autoDeg =
                (spd / centerScale / (2 * Math.PI * R)) * 360 * autoDir

            angle.current += ((autoDeg + spin.current) * delta) / 1000

            spin.current *= Math.pow(0.94, delta / 16.67)
            if (Math.abs(spin.current) < 0.01) spin.current = 0
        }

        angle.current = ((angle.current % 360) + 360) % 360

        for (let i = 0; i < list.length; i++) {
            const el = itemRefs.current[i]
            if (!el) continue

            let a = (i * stepAngle - angle.current) % 360
            if (a > 180) a -= 360
            if (a <= -180) a += 360

            const abs = Math.abs(a)

            let opacity = 1
            if (abs >= limit) opacity = 0
            else if (abs > fadeStart)
                opacity = 1 - (abs - fadeStart) / (limit - fadeStart)

            el.style.opacity = String(opacity)
            el.style.visibility = opacity <= 0.01 ? "hidden" : "visible"
            if (opacity <= 0.01) continue

            const y = srcArc * (1 - Math.cos(a * DEG))

            el.style.transform = `translateY(${y}px) rotateY(${a}deg) translateZ(${
                sign * R
            }px)`
        }
    })

    const maskValue = fade
        ? `linear-gradient(to right, transparent 0%, #000 ${fade}%, #000 ${
              100 - fade
          }%, transparent 100%)`
        : undefined

    return (
        <div
            ref={containerRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            style={{
                ...style,
                position: "relative",
                height: autoHeight,
                overflow: "hidden",
                perspective: `${perspective}px`,
                perspectiveOrigin: "50% 50%",
                WebkitMaskImage: maskValue,
                maskImage: maskValue,
                cursor: canDrag ? (grabbing ? "grabbing" : "grab") : "default",
                touchAction: canDrag ? "pan-y" : "auto",
                userSelect: "none",
                WebkitUserSelect: "none",
            }}
        >
            {!geo ? (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "sans-serif",
                        fontSize: 13,
                        color: "#999",
                    }}
                >
                    Agrega imágenes en el panel de propiedades
                </div>
            ) : (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        transformStyle: "preserve-3d",
                        transform: `translateY(${trackShift}px)`,
                    }}
                >
                    {geo.list.map((img, i) => (
                        <div
                            key={i}
                            ref={(el) => {
                                itemRefs.current[i] = el
                            }}
                            role={img?.alt ? "img" : undefined}
                            aria-label={img?.alt || undefined}
                            style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                width: srcW,
                                height: srcH,
                                marginTop: -srcH / 2,
                                marginLeft: -srcW / 2,
                                borderRadius: cardRadius / refScale,
                                overflow: "hidden",
                                backfaceVisibility: "hidden",
                                WebkitBackfaceVisibility: "hidden",
                                willChange: "transform, opacity",
                                backgroundColor: "rgba(128,128,128,0.08)",
                                backgroundImage: img?.src
                                    ? `url(${img.src})`
                                    : "none",
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                filter: grayscale ? "grayscale(1)" : "none",
                                pointerEvents: "none",
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
