"use client"
// Portado desde Framer: Orbit_logos.tsx

import { useCallback, useEffect, useRef, useState } from "react"
import type React from "react"

export interface OrbitLogosImage {
    src: string
    srcSet?: string
    alt?: string
}

export interface OrbitLogosItem {
    logo?: OrbitLogosImage
    title?: string
    text?: string
}

export interface OrbitLogosCard {
    width: number
    offset: number
    padding: number
    radius: number
    gap: number
    background: string
    borderColor: string
    titleFont: React.CSSProperties
    titleColor: string
    textFont: React.CSSProperties
    textColor: string
}

export interface OrbitLogosProps {
    centerLogo?: OrbitLogosImage
    centerSize?: number
    centerPadding?: number
    centerBackground?: string
    centerBorderColor?: string
    centerBorderWidth?: number
    centerShadow?: boolean
    items?: OrbitLogosItem[]
    radius?: number
    nodeSize?: number
    nodePadding?: number
    nodeBackground?: string
    nodeBorderColor?: string
    nodeActiveColor?: string
    nodeBorderWidth?: number
    nodeShadow?: boolean
    /** Grados por segundo. Negativo = antihorario. */
    speed?: number
    draggable?: boolean
    showRing?: boolean
    ringColor?: string
    ringWidth?: number
    card?: Partial<OrbitLogosCard>
    /** Bajo este ancho la card se centra horizontalmente */
    breakpoint?: number
    /** Aire mínimo entre la card y el borde */
    margin?: number
    background?: string
    style?: React.CSSProperties
}

const DEFAULT_ITEMS: OrbitLogosItem[] = [
    { title: "Cliente 01", text: "Breve descripción del proyecto." },
    { title: "Cliente 02", text: "Breve descripción del proyecto." },
    { title: "Cliente 03", text: "Breve descripción del proyecto." },
    { title: "Cliente 04", text: "Breve descripción del proyecto." },
]

const DEFAULT_CARD: OrbitLogosCard = {
    width: 280,
    offset: 20,
    padding: 20,
    radius: 12,
    gap: 8,
    background: "#FFFFFF",
    borderColor: "rgba(0,0,0,0.1)",
    titleColor: "#111111",
    textColor: "rgba(0,0,0,0.6)",
    titleFont: { fontSize: 15, fontWeight: 600, lineHeight: "1.3em" },
    textFont: { fontSize: 13, fontWeight: 400, lineHeight: "1.5em" },
}

/* ---------- sustituto de AnimatePresence + motion.div ---------- */
type PresenceState = { x: string; y: string | number; opacity: number; scale: number }

const presenceTransform = (s: PresenceState) =>
    `translateX(${s.x}) translateY(${typeof s.y === "number" ? `${s.y}px` : s.y}) scale(${s.scale})`

interface PresenceProps {
    show: boolean
    initial: PresenceState
    animate: PresenceState
    exit: PresenceState
    duration: number
    ease: string
    style: React.CSSProperties
    onClick?: (e: React.MouseEvent) => void
    onPointerDown?: (e: React.PointerEvent) => void
    children: React.ReactNode
}

/**
 * Monta el contenido con el estado `initial`, transiciona a `animate` y, al
 * ocultarse, transiciona a `exit` antes de desmontarse (como AnimatePresence).
 */
function Presence({
    show,
    initial,
    animate,
    exit,
    duration,
    ease,
    style,
    onClick,
    onPointerDown,
    children,
}: PresenceProps) {
    const [mounted, setMounted] = useState(show)
    const [phase, setPhase] = useState<"initial" | "animate" | "exit">(
        show ? "initial" : "exit"
    )
    // Ajuste de estado al cambiar `show` (patrón de React para estado derivado)
    const [prevShow, setPrevShow] = useState(show)
    if (show !== prevShow) {
        setPrevShow(show)
        if (show) {
            setMounted(true)
            setPhase("initial")
        } else {
            setPhase("exit")
        }
    }

    useEffect(() => {
        if (show) {
            let r2 = 0
            const r1 = requestAnimationFrame(() => {
                r2 = requestAnimationFrame(() => setPhase("animate"))
            })
            return () => {
                cancelAnimationFrame(r1)
                cancelAnimationFrame(r2)
            }
        }
        const t = setTimeout(() => setMounted(false), duration * 1000)
        return () => clearTimeout(t)
    }, [show, duration])

    if (!mounted) return null
    const s = phase === "initial" ? initial : phase === "animate" ? animate : exit

    return (
        <div
            onClick={onClick}
            onPointerDown={onPointerDown}
            style={{
                ...style,
                opacity: s.opacity,
                transform: presenceTransform(s),
                transition:
                    phase === "initial"
                        ? "none"
                        : `opacity ${duration}s ${ease}, transform ${duration}s ${ease}`,
            }}
        >
            {children}
        </div>
    )
}

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)"

/**
 * ORBIT LOGOS
 * Marca central + logos orbitando. Click en un logo = card con título y texto.
 * Auto-rotación continua + arrastre manual. Se pausa mientras hay una card abierta.
 *
 * En pantallas angostas la card deja de anclarse al logo y pasa a una posición
 * fija (centro de la órbita o abajo), con el ancho limitado al del contenedor.
 */
export default function OrbitLogos(props: OrbitLogosProps) {
    const {
        centerLogo,
        centerSize = 110,
        centerPadding = 22,
        centerBackground = "#FFFFFF",
        centerBorderColor = "rgba(0,0,0,0.08)",
        centerBorderWidth = 1,
        centerShadow = true,
        items = DEFAULT_ITEMS,
        radius = 230,
        nodeSize = 84,
        nodePadding = 16,
        nodeBackground = "#FFFFFF",
        nodeBorderColor = "rgba(0,0,0,0.08)",
        nodeActiveColor = "#5B6BE1",
        nodeBorderWidth = 1,
        nodeShadow = true,
        speed = 6,
        draggable = true,
        showRing = true,
        ringColor = "rgba(0,0,0,0.08)",
        ringWidth = 1,
        card: cardProp,
        breakpoint = 600,
        margin = 16,
        background = "transparent",
        style,
    } = props

    const card: OrbitLogosCard = { ...DEFAULT_CARD, ...cardProp }

    // En Framer: RenderTarget.current() === RenderTarget.canvas. Fuera de Framer siempre false.
    const isCanvas = false

    const containerRef = useRef<HTMLDivElement>(null)
    const rotationRef = useRef(0)
    const velocityRef = useRef(speed)
    const draggingRef = useRef(false)
    const movedRef = useRef(0)
    const grabAngleRef = useRef(0)
    const lastMoveRef = useRef({ angle: 0, time: 0 })

    const [rotation, setRotation] = useState(0)
    const [active, setActive] = useState<number | null>(null)
    const [hovered, setHovered] = useState<number | null>(null)
    const [size, setSize] = useState({ w: 700, h: 700 })
    const [view, setView] = useState({ vw: 1200, cx: 350 })

    const list: OrbitLogosItem[] = Array.isArray(items) ? items : []
    const total = Math.max(list.length, 1)

    /* ---------- medida del contenedor y del viewport ---------- */
    useEffect(() => {
        const el = containerRef.current
        if (!el) return
        const read = () => {
            const rect = el.getBoundingClientRect()
            setSize({ w: rect.width, h: rect.height })
            setView({
                vw: window.innerWidth || rect.width,
                cx: rect.left + rect.width / 2,
            })
        }
        read()
        const ro = new ResizeObserver(read)
        ro.observe(el)
        window.addEventListener("resize", read)
        window.addEventListener("scroll", read, { passive: true })
        return () => {
            ro.disconnect()
            window.removeEventListener("resize", read)
            window.removeEventListener("scroll", read)
        }
    }, [])

    // el ancho útil es el menor entre el componente y la pantalla
    const avail = Math.min(size.w, view.vw)
    const isNarrow = avail > 0 && avail < breakpoint
    const cardW = Math.max(140, Math.min(card.width, size.w - margin * 2))

    const maxRadius = Math.max(
        40,
        (Math.min(size.w, size.h) - nodeSize) / 2 - 4
    )
    const r = Math.min(radius, maxRadius)

    /* ---------- rotación ---------- */
    useEffect(() => {
        if (isCanvas) return
        const reduced =
            typeof window !== "undefined" &&
            window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
        if (reduced) return

        let raf = 0
        let last = performance.now()

        const tick = (now: number) => {
            const dt = Math.min((now - last) / 1000, 0.05)
            last = now
            if (!draggingRef.current) {
                const target = active === null ? speed : 0
                velocityRef.current +=
                    (target - velocityRef.current) * Math.min(1, dt * 3)
                rotationRef.current =
                    (rotationRef.current + velocityRef.current * dt) % 360
                setRotation(rotationRef.current)
            }
            raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(raf)
    }, [isCanvas, speed, active])

    /* ---------- drag ---------- */
    const angleFromEvent = useCallback((e: React.PointerEvent) => {
        const el = containerRef.current
        if (!el) return 0
        const rect = el.getBoundingClientRect()
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        return (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI
    }, [])

    const onPointerDown = (e: React.PointerEvent) => {
        if (!draggable || isCanvas) return
        draggingRef.current = true
        movedRef.current = 0
        const a = angleFromEvent(e)
        grabAngleRef.current = a - rotationRef.current
        lastMoveRef.current = { angle: a, time: performance.now() }
        ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
    }

    const onPointerMove = (e: React.PointerEvent) => {
        if (!draggingRef.current) return
        const a = angleFromEvent(e)
        const now = performance.now()
        let delta = a - lastMoveRef.current.angle
        if (delta > 180) delta -= 360
        if (delta < -180) delta += 360
        movedRef.current += Math.abs(delta)

        const dt = Math.max((now - lastMoveRef.current.time) / 1000, 0.001)
        velocityRef.current = Math.max(-360, Math.min(360, delta / dt))
        lastMoveRef.current = { angle: a, time: now }

        rotationRef.current = a - grabAngleRef.current
        setRotation(rotationRef.current)
    }

    const endDrag = (e: React.PointerEvent) => {
        if (!draggingRef.current) return
        draggingRef.current = false
        ;(e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId)
    }

    const handleNodeClick = (index: number) => {
        if (movedRef.current > 4) return // fue arrastre, no click
        setActive((prev) => (prev === index ? null : index))
    }

    const closeCard = () => setActive(null)

    /* ---------- contenido de la card ---------- */
    const cardBody = (item: OrbitLogosItem, withClose = false) => (
        <>
            {withClose && (
                <div
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                        e.stopPropagation()
                        closeCard()
                    }}
                    style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        width: 28,
                        height: 28,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 999,
                        cursor: "pointer",
                        color: card.textColor,
                        fontSize: 16,
                        lineHeight: 1,
                    }}
                >
                    ×
                </div>
            )}
            <div
                style={{
                    ...card.titleFont,
                    color: card.titleColor,
                    margin: 0,
                    paddingRight: withClose ? 28 : 0,
                }}
            >
                {item.title}
            </div>
            <p
                style={{
                    ...card.textFont,
                    color: card.textColor,
                    margin: `${card.gap}px 0 0 0`,
                }}
            >
                {item.text}
            </p>
        </>
    )

    const cardSkin: React.CSSProperties = {
        background: card.background,
        border: `1px solid ${card.borderColor}`,
        borderRadius: card.radius,
        padding: card.padding,
        boxSizing: "border-box" as const,
        boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
    }

    // última card activa: mantiene el contenido de la card mobile durante su salida
    const [lastActive, setLastActive] = useState<number | null>(null)
    if (active !== null && active !== lastActive) setLastActive(active)
    const mobileItem = active !== null ? list[active] : undefined
    const mobileContent =
        lastActive !== null ? list[lastActive] : undefined

    return (
        <div
            ref={containerRef}
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                background,
                overflow: "visible",
                touchAction: draggable ? "none" : "auto",
                cursor: draggable && !isCanvas ? "grab" : "default",
                userSelect: "none",
                ...style,
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onClick={(e) => {
                if (e.target === containerRef.current) closeCard()
            }}
        >
            {/* anillo */}
            {showRing && (
                <div
                    style={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        width: r * 2,
                        height: r * 2,
                        marginLeft: -r,
                        marginTop: -r,
                        borderRadius: "50%",
                        border: `${ringWidth}px solid ${ringColor}`,
                        pointerEvents: "none",
                    }}
                />
            )}

            {/* marca central */}
            <div
                style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    width: centerSize,
                    height: centerSize,
                    marginLeft: -centerSize / 2,
                    marginTop: -centerSize / 2,
                    borderRadius: "50%",
                    background: centerBackground,
                    border: `${centerBorderWidth}px solid ${centerBorderColor}`,
                    boxShadow: centerShadow
                        ? "0 8px 30px rgba(0,0,0,0.08)"
                        : "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: centerPadding,
                    boxSizing: "border-box",
                    pointerEvents: "none",
                    zIndex: 5,
                }}
            >
                {centerLogo?.src && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={centerLogo.src}
                        srcSet={centerLogo.srcSet}
                        alt={centerLogo.alt || ""}
                        draggable={false}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                        }}
                    />
                )}
            </div>

            {/* nodos */}
            {list.map((item, index) => {
                const angle = ((index / total) * 360 + rotation) % 360
                const rad = (angle * Math.PI) / 180
                const x = r * Math.cos(rad)
                const y = r * Math.sin(rad)
                const isActive = active === index
                const isHovered = hovered === index
                const below = y > 0 // nodo abajo -> card arriba

                // corrimiento para que la card no se salga de la PANTALLA
                const minShift = margin + cardW / 2 - view.cx - x
                const maxShift = view.vw - margin - cardW / 2 - view.cx - x
                let shift = 0
                if (minShift > 0) shift = minShift
                if (shift > maxShift) shift = maxShift

                return (
                    <div
                        key={index}
                        style={{
                            position: "absolute",
                            left: "50%",
                            top: "50%",
                            transform: `translate(${x - nodeSize / 2}px, ${y - nodeSize / 2}px)`,
                            width: nodeSize,
                            height: nodeSize,
                            zIndex: isActive ? 50 : 10,
                            willChange: "transform",
                        }}
                    >
                        <div
                            role="button"
                            tabIndex={0}
                            aria-expanded={isActive}
                            onClick={(e) => {
                                e.stopPropagation()
                                handleNodeClick(index)
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault()
                                    setActive((p) =>
                                        p === index ? null : index
                                    )
                                }
                            }}
                            onMouseEnter={() => setHovered(index)}
                            onMouseLeave={() => setHovered(null)}
                            style={{
                                width: "100%",
                                height: "100%",
                                borderRadius: "50%",
                                background: nodeBackground,
                                border: `${nodeBorderWidth}px solid ${
                                    isActive || isHovered
                                        ? nodeActiveColor
                                        : nodeBorderColor
                                }`,
                                boxShadow: nodeShadow
                                    ? "0 6px 20px rgba(0,0,0,0.07)"
                                    : "none",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: nodePadding,
                                boxSizing: "border-box",
                                cursor: "pointer",
                                transition:
                                    "transform .3s ease, border-color .3s ease, box-shadow .3s ease",
                                transform: isActive
                                    ? "scale(1.12)"
                                    : isHovered
                                      ? "scale(1.06)"
                                      : "scale(1)",
                            }}
                        >
                            {item.logo?.src ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={item.logo.src}
                                    srcSet={item.logo.srcSet}
                                    alt={item.logo.alt || item.title || ""}
                                    draggable={false}
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "contain",
                                        pointerEvents: "none",
                                    }}
                                />
                            ) : (
                                <span
                                    style={{
                                        fontSize: 11,
                                        opacity: 0.5,
                                        textAlign: "center",
                                        lineHeight: 1.2,
                                    }}
                                >
                                    {item.title}
                                </span>
                            )}
                        </div>

                        {/* card anclada (solo desktop) */}
                        <Presence
                            show={isActive && !isNarrow}
                            initial={{
                                x: "-50%",
                                opacity: 0,
                                y: below ? 8 : -8,
                                scale: 0.96,
                            }}
                            animate={{
                                x: "-50%",
                                opacity: 1,
                                y: 0,
                                scale: 1,
                            }}
                            exit={{
                                x: "-50%",
                                opacity: 0,
                                y: below ? 8 : -8,
                                scale: 0.96,
                            }}
                            duration={0.28}
                            ease={EASE}
                            onClick={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                            style={{
                                position: "absolute",
                                left: `calc(50% + ${shift}px)`,
                                [below ? "bottom" : "top"]:
                                    nodeSize + card.offset,
                                width: cardW,
                                cursor: "default",
                                zIndex: 100,
                                ...cardSkin,
                            }}
                        >
                            <div
                                style={{
                                    position: "absolute",
                                    left: `calc(50% - ${shift}px)`,
                                    [below ? "bottom" : "top"]: -card.offset,
                                    width: 1,
                                    height: card.offset,
                                    background: card.borderColor,
                                }}
                            />
                            {cardBody(item)}
                        </Presence>
                    </div>
                )
            })}

            {/* card fija (mobile) */}
            <Presence
                show={isNarrow && active !== null && !!mobileItem}
                initial={{ x: "-50%", y: "-50%", opacity: 0, scale: 0.94 }}
                animate={{ x: "-50%", y: "-50%", opacity: 1, scale: 1 }}
                exit={{ x: "-50%", y: "-50%", opacity: 0, scale: 0.94 }}
                duration={0.28}
                ease={EASE}
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    width: cardW,
                    zIndex: 300,
                    cursor: "default",
                    ...cardSkin,
                }}
            >
                {mobileContent ? cardBody(mobileContent, true) : null}
            </Presence>
        </div>
    )
}
