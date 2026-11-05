"use client"
// Portado desde Framer: Border_glow_buton.tsx

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react"
import type React from "react"

export interface GlowBorderProps {
    color?: string
    /** Vacío = mismo color de la línea */
    glowColor?: string
    thickness?: number
    /** % del perímetro que cubre cada línea */
    length?: number
    count?: number
    /** Segundos por vuelta */
    duration?: number
    reverse?: boolean
    glow?: number
    glowOpacity?: number
    hoverGlow?: number
    inheritRadius?: boolean
    radius?: number
    showBase?: boolean
    baseColor?: string
    baseThickness?: number
    /** ms */
    transition?: number
    /** Para controlarlo desde variantes del botón */
    forceOn?: boolean
    style?: React.CSSProperties
}

/**
 * GLOW BORDER
 * Capa de borde para meter DENTRO de un botón. Solo dibuja el borde:
 * dos (o N) líneas de luz recorriendo el perímetro que, en hover del botón
 * padre, se estiran hasta cerrar el borde completo.
 *
 * Uso: pegar dentro del botón (position absolute, inset 0; el padre debe ser
 * position relative). No captura clicks ni hover propio: escucha el hover del padre.
 */
export default function GlowBorder(props: GlowBorderProps) {
    const {
        color = "#E8FF6B",
        glowColor = "",
        thickness = 1.5,
        length = 14,
        count = 2,
        duration = 4,
        reverse = false,
        glow = 8,
        glowOpacity = 0.7,
        hoverGlow = 1,
        inheritRadius = true,
        radius = 100,
        showBase = true,
        baseColor = "rgba(255,255,255,0.18)",
        baseThickness = 1,
        transition = 500,
        forceOn = false,
        style,
    } = props

    const uid = useId().replace(/[^a-zA-Z0-9]/g, "")
    const ref = useRef<HTMLDivElement>(null)
    const [box, setBox] = useState({ w: 0, h: 0 })
    const [autoRadius, setAutoRadius] = useState(0)
    const [hover, setHover] = useState(false)

    // En Framer: RenderTarget.current() === RenderTarget.canvas. Fuera de Framer siempre false.
    const isCanvas = false
    const on = forceOn || hover

    /* ---------- medir el botón padre ---------- */
    useLayoutEffect(() => {
        const el = ref.current
        if (!el) return
        const target = el.parentElement ?? el

        const read = () => {
            const rect = target.getBoundingClientRect()
            setBox({ w: rect.width, h: rect.height })
            if (inheritRadius) {
                const raw = getComputedStyle(target).borderTopLeftRadius || "0"
                const parsed = parseFloat(raw)
                setAutoRadius(Number.isFinite(parsed) ? parsed : 0)
            }
        }

        read()
        const ro = new ResizeObserver(read)
        ro.observe(target)
        return () => ro.disconnect()
    }, [inheritRadius])

    /* ---------- hover del botón padre ---------- */
    useEffect(() => {
        const el = ref.current
        if (!el || isCanvas) return
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
    }, [isCanvas])

    /* ---------- geometría ---------- */
    const sw = Math.max(thickness, baseThickness)
    const pad = Math.ceil(glow * 2 + sw)
    const W = Math.max(box.w, sw + 1)
    const H = Math.max(box.h, sw + 1)

    const rw = W - sw
    const rh = H - sw
    const rIn = inheritRadius ? autoRadius : radius
    const r = Math.max(0, Math.min(rIn, rw / 2, rh / 2))
    const x0 = pad + sw / 2
    const y0 = pad + sw / 2

    const d = [
        `M ${x0 + r} ${y0}`,
        `H ${x0 + rw - r}`,
        `A ${r} ${r} 0 0 1 ${x0 + rw} ${y0 + r}`,
        `V ${y0 + rh - r}`,
        `A ${r} ${r} 0 0 1 ${x0 + rw - r} ${y0 + rh}`,
        `H ${x0 + r}`,
        `A ${r} ${r} 0 0 1 ${x0} ${y0 + rh - r}`,
        `V ${y0 + r}`,
        `A ${r} ${r} 0 0 1 ${x0 + r} ${y0}`,
        "Z",
    ].join(" ")

    const perimeter = 2 * (rw - 2 * r) + 2 * (rh - 2 * r) + 2 * Math.PI * r
    const n = Math.max(1, Math.round(count))
    const segment = perimeter / n
    const dash = on
        ? segment
        : Math.min(segment, (perimeter * Math.max(length, 0.5)) / 100)
    const gap = Math.max(segment - dash, 0)

    const lineClass = `gb-${uid}`
    const css = `
    .${lineClass} {
      stroke-dasharray: ${dash}px ${gap}px;
      stroke-dashoffset: 0;
      transition: stroke-dasharray ${transition}ms cubic-bezier(.22,1,.36,1),
                  opacity ${transition}ms ease,
                  stroke-width ${transition}ms ease;
      ${isCanvas ? "" : `animation: travel-${uid} ${Math.max(duration, 0.1)}s linear infinite;`}
    }
    @keyframes travel-${uid} {
      to { stroke-dashoffset: ${reverse ? perimeter : -perimeter}px; }
    }
    @media (prefers-reduced-motion: reduce) {
      .${lineClass} { animation: none; }
    }
  `

    return (
        <div
            ref={ref}
            style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                overflow: "visible",
                ...style,
            }}
        >
            <style>{css}</style>
            <svg
                width={W + pad * 2}
                height={H + pad * 2}
                viewBox={`0 0 ${W + pad * 2} ${H + pad * 2}`}
                style={{
                    position: "absolute",
                    left: -pad,
                    top: -pad,
                    overflow: "visible",
                    pointerEvents: "none",
                }}
                aria-hidden="true"
            >
                {/* borde base */}
                {showBase && (
                    <path
                        d={d}
                        fill="none"
                        stroke={baseColor}
                        strokeWidth={baseThickness}
                    />
                )}

                {/* glow */}
                {glow > 0 && (
                    <path
                        className={lineClass}
                        d={d}
                        fill="none"
                        stroke={glowColor || color}
                        strokeWidth={thickness * 2.2}
                        strokeLinecap="round"
                        style={{
                            filter: `blur(${glow}px)`,
                            opacity: on ? hoverGlow : glowOpacity,
                        }}
                    />
                )}

                {/* línea */}
                <path
                    className={lineClass}
                    d={d}
                    fill="none"
                    stroke={color}
                    strokeWidth={thickness}
                    strokeLinecap="round"
                />
            </svg>
        </div>
    )
}
