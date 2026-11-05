"use client"
// Portado desde Framer: Preloader.tsx

import { useEffect, useLayoutEffect, useRef, useState } from "react"

/**
 * PRELOADER
 *
 * - Se muestra una sola vez por sesión (sessionStorage): sobrevive a refresh
 *   y a navegación entre páginas en la misma pestaña; se resetea al cerrarla.
 * - El overlay (fondo sólido) tapa la pantalla desde el primer frame -> sin flash del hero.
 * - El video recién se descarga y reproduce cuando la página cargó del todo (window.load),
 *   así no compite con el LCP y no afecta el page speed.
 * - Dura lo que dure el video; al terminar hace fade out.
 * - Scroll bloqueado mientras está visible.
 */
export interface PreloaderProps {
    /** URL del video (logo): mp4 / webm / mov. Sin default. */
    video?: string
    /** Fondo. Default "#0A0A0A" */
    backgroundColor?: string
    /** Ancho video (px). Default 240 */
    videoWidth?: number
    /** Ajuste. Default "contain" */
    objectFit?: "contain" | "cover"
    /** Fade salida (ms). Default 500 */
    fadeDuration?: number
    /** Tope seguridad (ms). Default 10000 */
    maxWait?: number
    /** Clave sesión. Default "preloader-shown" */
    sessionKey?: string
}

export default function Preloader(props: PreloaderProps) {
    const {
        video,
        backgroundColor = "#0A0A0A",
        videoWidth = 240,
        objectFit = "contain",
        fadeDuration = 500,
        maxWait = 10000,
        sessionKey = "preloader-shown",
    } = props

    // SSR-safe: el servidor y el primer render del cliente siempre muestran el
    // overlay; antes del primer paint (layout effect) se consulta sessionStorage.
    const [show, setShow] = useState<boolean>(true)
    const [checked, setChecked] = useState(false)

    const [src, setSrc] = useState<string | undefined>(undefined)
    const [fading, setFading] = useState(false)
    const [logoIn, setLogoIn] = useState(false)
    const hideRef = useRef<() => void>(() => {})

    // ¿Ya se mostró en esta sesión? -> no lo renderizamos.
    /* eslint-disable react-hooks/set-state-in-effect -- lectura única post-hidratación */
    useLayoutEffect(() => {
        try {
            if (sessionStorage.getItem(sessionKey) === "1") setShow(false)
        } catch {}
        setChecked(true)
    }, [sessionKey])
    /* eslint-enable react-hooks/set-state-in-effect */

    // Bloquear scroll mientras el preloader está visible.
    useEffect(() => {
        if (!checked || !show) return
        const prev = document.body.style.overflow
        document.body.style.overflow = "hidden"
        return () => {
            document.body.style.overflow = prev
        }
    }, [checked, show])

    // Marcar la sesión + arrancar el video cuando la página cargó del todo.
    useEffect(() => {
        if (!checked || !show) return

        try {
            sessionStorage.setItem(sessionKey, "1")
        } catch {}

        let done = false
        const hide = () => {
            if (done) return
            done = true
            setFading(true)
            window.setTimeout(() => setShow(false), fadeDuration)
        }
        hideRef.current = hide

        // Empieza SOLO cuando window.load ya disparó (página 100% cargada).
        const start = () => {
            if (!video) {
                hide() // sin video no hay nada que reproducir
                return
            }
            setSrc(video) // recién acá arranca la descarga del video
        }

        if (document.readyState === "complete") start()
        else window.addEventListener("load", start, { once: true })

        // Red de seguridad por si el video nunca dispara "ended" (error/buffer).
        const safety = window.setTimeout(hide, maxWait)

        return () => {
            window.removeEventListener("load", start)
            window.clearTimeout(safety)
        }
    }, [checked, show, video, sessionKey, fadeDuration, maxWait])

    if (!show) return null

    const containerStyle: React.CSSProperties = {
        position: "fixed",
        inset: 0,
        zIndex: 2147483647,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: backgroundColor,
        opacity: fading ? 0 : 1,
        transition: `opacity ${fadeDuration}ms ease`,
        pointerEvents: fading ? "none" : "auto",
        overflow: "hidden",
    }

    const videoStyle: React.CSSProperties = {
        width: videoWidth,
        height: "auto",
        maxWidth: "100%",
        maxHeight: "100%",
        objectFit,
        display: "block",
        opacity: logoIn ? 1 : 0,
        transition: `opacity ${fadeDuration}ms ease`,
    }

    return (
        <div style={containerStyle}>
            {src ? (
                <video
                    src={src}
                    muted
                    playsInline
                    autoPlay
                    preload="auto"
                    onPlaying={() => setLogoIn(true)}
                    onEnded={() => hideRef.current()}
                    onError={() => hideRef.current()}
                    style={videoStyle}
                />
            ) : (
                // Antes de window.load solo se ve el fondo sólido (sin flash).
                <div style={{ width: videoWidth }} />
            )}
        </div>
    )
}
