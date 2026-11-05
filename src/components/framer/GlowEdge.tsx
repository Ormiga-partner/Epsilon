"use client"
// Portado desde Framer: Glow_border.tsx

import { useEffect, useRef, useState } from "react"
import type React from "react"

// Devuelve un punto sobre el perímetro del rectángulo (t = 0..1)
function puntoPerimetro(t: number, w: number, h: number) {
    const per = 2 * (w + h)
    let d = (((t % 1) + 1) % 1) * per
    if (d < w) return { x: d, y: 0 }
    d -= w
    if (d < h) return { x: w, y: d }
    d -= h
    if (d < w) return { x: w - d, y: h }
    d -= w
    return { x: 0, y: h - d }
}

// Proyecta la posición del cursor sobre el borde más cercano del rectángulo
function proyectarAlBorde(x: number, y: number, w: number, h: number) {
    const cx = Math.max(0, Math.min(w, x))
    const cy = Math.max(0, Math.min(h, y))
    const dIzq = cx
    const dDer = w - cx
    const dArr = cy
    const dAba = h - cy
    const min = Math.min(dIzq, dDer, dArr, dAba)
    if (min === dArr) return { x: cx, y: 0 }
    if (min === dAba) return { x: cx, y: h }
    if (min === dIzq) return { x: 0, y: cy }
    return { x: w, y: cy }
}

const radioDe = (el: Element | null) => {
    if (!el) return 0
    const v = parseFloat(getComputedStyle(el).borderTopLeftRadius)
    return Number.isNaN(v) ? 0 : v
}

const tieneFondo = (el: Element) => {
    const cs = getComputedStyle(el)
    return (
        (cs.backgroundColor !== "rgba(0, 0, 0, 0)" &&
            cs.backgroundColor !== "transparent") ||
        cs.backgroundImage !== "none" ||
        cs.borderTopWidth !== "0px"
    )
}

export interface GlowEdgeProps {
    /** 0 = automático. Súbelo si no calza con la tarjeta */
    niveles?: number
    heredarRadio?: boolean
    radio?: number
    grosor?: number
    color?: string
    degradado?: boolean
    colorFin?: string
    /** Cuánto borde alcanza la luz */
    tamano?: number
    /** Tramo a color pleno antes de desvanecer */
    nucleo?: number
    opacidad?: number
    /** Ilumina el borde más cercano al cursor */
    proyectar?: boolean
    halo?: boolean
    haloTamano?: number
    haloDifuminado?: number
    haloOpacidad?: number
    modo?: "hover" | "auto" | "ambos"
    /** Rendimiento: en modo "auto", solo anima mientras el cursor está sobre la tarjeta
     *  (útil cuando el borde queda tapado fuera del hover). La posición depende del reloj. */
    soloConHover?: boolean
    /** Vueltas por segundo */
    velocidad?: number
    /** Segundos de seguimiento */
    duracion?: number
    curva?:
        | "linear"
        | "ease-out"
        | "ease-in-out"
        | "cubic-bezier(0.22, 1, 0.36, 1)"
    style?: React.CSSProperties
}

/**
 * GLOW EDGE
 * Colócalo DENTRO de tu tarjeta, como una capa más. Ilumina el borde del padre.
 */
export default function GlowEdge(props: GlowEdgeProps) {
    const {
        niveles = 0,
        heredarRadio = true,
        radio = 24,
        grosor = 1.5,
        color = "#7C3AED",
        degradado = false,
        colorFin = "#C4B5FD",
        tamano = 180,
        nucleo = 0,
        opacidad = 1,
        proyectar = true,
        halo = true,
        haloTamano = 180,
        haloDifuminado = 40,
        haloOpacidad = 0.45,
        modo = "hover",
        soloConHover = false,
        velocidad = 0.25,
        duracion = 0.25,
        curva = "cubic-bezier(0.22, 1, 0.36, 1)",
        style,
    } = props

    const rootRef = useRef<HTMLDivElement>(null)
    const targetRef = useRef<HTMLElement | null>(null)
    const capasRef = useRef<Array<HTMLDivElement | null>>([])
    const rafRef = useRef<number>(0)
    const syncRef = useRef<number>(0)
    const hoverRef = useRef(false)

    const [caja, setCaja] = useState({ x: 0, y: 0, w: 0, h: 0, r: radio })
    const cajaRef = useRef(caja)

    // En Framer: RenderTarget.current() === RenderTarget.canvas. Fuera de Framer siempre false.
    const enCanvas = false
    const opacidades = [opacidad, haloOpacidad]
    const radios = [tamano, haloTamano]
    const margen = Math.max(haloDifuminado * 2, 40)

    // --- localizar la tarjeta ---
    const buscarTarget = () => {
        const root = rootRef.current
        if (!root) return null
        let el: HTMLElement | null = root.parentElement

        if (niveles > 0) {
            for (let i = 1; i < niveles && el?.parentElement; i++) {
                el = el.parentElement
            }
            return el
        }
        // Auto: sube hasta el primer ancestro con radio o fondo propio
        let mejor: HTMLElement | null = el
        for (let i = 0; i < 6 && el; i++) {
            if (radioDe(el) > 0 || tieneFondo(el)) return el
            mejor = el
            el = el.parentElement
        }
        return mejor
    }

    // --- medir ---
    const medir = () => {
        const root = rootRef.current
        const target = targetRef.current
        if (!root || !target) return
        const rr = root.getBoundingClientRect()
        const tr = target.getBoundingClientRect()

        let r = radio
        if (heredarRadio) {
            r = radioDe(target)
            if (r === 0) {
                for (const hijo of Array.from(target.children)) {
                    const v = radioDe(hijo)
                    if (v > 0) {
                        r = v
                        break
                    }
                }
            }
        }

        const nueva = {
            x: tr.left - rr.left,
            y: tr.top - rr.top,
            w: tr.width,
            h: tr.height,
            r,
        }
        const a = cajaRef.current
        if (
            Math.abs(a.x - nueva.x) > 0.5 ||
            Math.abs(a.y - nueva.y) > 0.5 ||
            Math.abs(a.w - nueva.w) > 0.5 ||
            Math.abs(a.h - nueva.h) > 0.5 ||
            a.r !== nueva.r
        ) {
            cajaRef.current = nueva
            setCaja(nueva)
        }
    }

    const mover = (x: number, y: number, suave: boolean) => {
        capasRef.current.forEach((el, i) => {
            if (!el) return
            const r = radios[i]
            el.style.transitionDuration = suave ? `${duracion}s` : "0s"
            el.style.transform = `translate3d(${x - r}px, ${y - r}px, 0)`
        })
    }

    const mostrar = (v: boolean) => {
        capasRef.current.forEach((el, i) => {
            if (!el) return
            el.style.opacity = v ? String(opacidades[i]) : "0"
        })
    }

    const detenerAuto = () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
        rafRef.current = 0
    }

    const iniciarAuto = () => {
        detenerAuto()
        const reducido =
            typeof window !== "undefined" &&
            window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
        const paso = () => {
            const t = targetRef.current
            if (!t) return
            // Rendimiento: usa la caja ya medida (ResizeObserver) en vez de getBoundingClientRect por frame
            const { w: width, h: height } = cajaRef.current
            const tt = (performance.now() / 1000) * velocidad
            const p = puntoPerimetro(tt, width, height)
            mover(p.x, p.y, false)
            if (!reducido) rafRef.current = requestAnimationFrame(paso)
        }
        mostrar(true)
        paso()
    }

    // --- montaje: target + observadores ---
    useEffect(() => {
        const root = rootRef.current
        if (!root) return
        targetRef.current = buscarTarget()
        medir()
        const t1 = requestAnimationFrame(medir)
        const t2 = setTimeout(medir, 250)

        const ro = new ResizeObserver(medir)
        if (targetRef.current) ro.observe(targetRef.current)
        ro.observe(root)
        window.addEventListener("resize", medir)
        window.addEventListener("scroll", medir, true)
        return () => {
            cancelAnimationFrame(t1)
            clearTimeout(t2)
            ro.disconnect()
            window.removeEventListener("resize", medir)
            window.removeEventListener("scroll", medir, true)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [niveles, heredarRadio, radio])

    // --- eventos sobre la tarjeta ---
    useEffect(() => {
        const target = targetRef.current
        if (!target) return

        const sincronizar = () => {
            medir()
            if (hoverRef.current)
                syncRef.current = requestAnimationFrame(sincronizar)
        }

        const puntoDesde = (e: PointerEvent) => {
            const r = target.getBoundingClientRect()
            const x = e.clientX - r.left
            const y = e.clientY - r.top
            return proyectar
                ? proyectarAlBorde(x, y, r.width, r.height)
                : { x, y }
        }

        const onEnter = (e: PointerEvent) => {
            if (modo === "auto") return
            hoverRef.current = true
            detenerAuto()
            medir()
            syncRef.current = requestAnimationFrame(sincronizar)
            const p = puntoDesde(e)
            mover(p.x, p.y, false)
            mostrar(true)
        }

        const onMove = (e: PointerEvent) => {
            if (modo === "auto") return
            const p = puntoDesde(e)
            if (!hoverRef.current) {
                hoverRef.current = true
                detenerAuto()
                mover(p.x, p.y, false)
                mostrar(true)
                return
            }
            mover(p.x, p.y, true)
        }

        const onLeave = () => {
            if (modo === "auto") return
            hoverRef.current = false
            cancelAnimationFrame(syncRef.current)
            if (modo === "ambos") iniciarAuto()
            else mostrar(false)
        }

        if (modo === "hover" || modo === "ambos") {
            target.addEventListener("pointerenter", onEnter)
            target.addEventListener("pointermove", onMove)
            target.addEventListener("pointerleave", onLeave)
        }

        if (modo === "hover") {
            // Vista estática en el canvas para previsualizar el efecto
            if (enCanvas) {
                const { width } = target.getBoundingClientRect()
                mover(width * 0.35, 0, false)
                mostrar(true)
            } else {
                mostrar(false)
            }
        } else {
            iniciarAuto()
        }

        // Rendimiento: el recorrido automático se pausa mientras la tarjeta está fuera de pantalla
        // (la posición depende del reloj, así que al volver sigue donde corresponde).
        const io =
            modo === "hover" || soloConHover
                ? null
                : new IntersectionObserver(([entry]) => {
                      if (entry.isIntersecting) {
                          if (!hoverRef.current) iniciarAuto()
                      } else {
                          detenerAuto()
                      }
                  })
        io?.observe(target)

        const autoEnter = () => iniciarAuto()
        const autoLeave = () => detenerAuto()
        if (modo === "auto" && soloConHover) {
            detenerAuto()
            target.addEventListener("pointerenter", autoEnter)
            target.addEventListener("pointerleave", autoLeave)
        }

        return () => {
            io?.disconnect()
            target.removeEventListener("pointerenter", autoEnter)
            target.removeEventListener("pointerleave", autoLeave)
            target.removeEventListener("pointerenter", onEnter)
            target.removeEventListener("pointermove", onMove)
            target.removeEventListener("pointerleave", onLeave)
            cancelAnimationFrame(syncRef.current)
            detenerAuto()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        modo,
        soloConHover,
        velocidad,
        tamano,
        haloTamano,
        opacidad,
        haloOpacidad,
        proyectar,
        duracion,
        enCanvas,
        caja.w,
        caja.h,
    ])

    const fondo = (i: number) => {
        const nucleoStop = i === 0 ? nucleo : 0
        const inicio = `${color} ${nucleoStop}%`
        const medio = Math.max(nucleoStop + 5, 55)
        return degradado
            ? `radial-gradient(circle closest-side, ${inicio}, ${colorFin} ${medio}%, transparent 100%)`
            : `radial-gradient(circle closest-side, ${inicio}, transparent 100%)`
    }

    const blob = (i: number): React.CSSProperties => ({
        position: "absolute",
        top: 0,
        left: 0,
        width: radios[i] * 2,
        height: radios[i] * 2,
        borderRadius: "50%",
        background: fondo(i),
        opacity: 0,
        transform: `translate3d(${-radios[i]}px, ${-radios[i]}px, 0)`,
        transitionProperty: "transform, opacity",
        transitionTimingFunction: curva,
        transitionDuration: `${duracion}s`,
        willChange: "transform, opacity",
        pointerEvents: "none",
    })

    const mascaraAnillo = {
        WebkitMask:
            "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
        WebkitMaskComposite: "xor",
        mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
        maskComposite: "exclude",
    } as React.CSSProperties

    return (
        <div
            ref={rootRef}
            style={{
                ...style,
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                overflow: "visible",
            }}
        >
            {/* Halo: anillo exterior, recortado para no tapar el contenido */}
            {halo && (
                <div
                    style={{
                        position: "absolute",
                        left: caja.x - margen,
                        top: caja.y - margen,
                        width: caja.w + margen * 2,
                        height: caja.h + margen * 2,
                        borderRadius: caja.r + margen,
                        padding: margen,
                        boxSizing: "border-box",
                        zIndex: 0,
                        pointerEvents: "none",
                        ...mascaraAnillo,
                    }}
                >
                    <div
                        style={{
                            position: "absolute",
                            left: margen,
                            top: margen,
                            width: caja.w,
                            height: caja.h,
                            filter: `blur(${haloDifuminado}px)`,
                        }}
                    >
                        <div
                            ref={(el) => {
                                capasRef.current[1] = el
                            }}
                            style={blob(1)}
                        />
                    </div>
                </div>
            )}

            {/* Borde iluminado */}
            <div
                style={{
                    position: "absolute",
                    left: caja.x,
                    top: caja.y,
                    width: caja.w,
                    height: caja.h,
                    borderRadius: caja.r,
                    padding: grosor,
                    boxSizing: "border-box",
                    zIndex: 10,
                    pointerEvents: "none",
                    ...mascaraAnillo,
                }}
            >
                <div
                    ref={(el) => {
                        capasRef.current[0] = el
                    }}
                    style={blob(0)}
                />
            </div>
        </div>
    )
}
