"use client"
// Portado desde Framer: Workshop/NumberCounter.tsx

// Number Counter component that animates from start to end value with customizable options
import {
    useState,
    useEffect,
    useRef,
    useMemo,
    startTransition,
    type CSSProperties,
    type RefObject,
} from "react"

export type NumberCounterEasing =
    | "linear"
    | "easeIn"
    | "easeOut"
    | "easeInOut"
    | "bounce"

export interface NumberCounterProps {
    /** Default 0 */
    startValue?: number
    /** Default 100 */
    endValue?: number
    /** Seconds. Default 2 */
    duration?: number
    /** Seconds. Default 0 */
    delay?: number
    /** Default 0 */
    decimals?: number
    /** Default "easeOut" */
    easing?: NumberCounterEasing
    /** Font styles (Framer Font control). Default 32px / Bold / -0.03em / 1em */
    font?: CSSProperties
    /** Default "left" */
    textAlign?: "left" | "center" | "right"
    /** Default "#000000" */
    color?: string
    /** Default true */
    autoStart?: boolean
    /** Default false */
    loop?: boolean
    /** Default false */
    resetOnReEntry?: boolean
    /** Default "" */
    prefix?: string
    /** Default "" */
    suffix?: string
    /** Default "," */
    separator?: string
    style?: CSSProperties
}

const DEFAULT_FONT: CSSProperties = {
    fontFamily: "var(--font-geist-sans), sans-serif",
    fontSize: "32px",
    fontWeight: 700,
    letterSpacing: "-0.03em",
    lineHeight: "1em",
}

const easingMap: Record<NumberCounterEasing, [number, number, number, number]> =
    {
        linear: [0, 0, 1, 1],
        easeIn: [0.4, 0, 1, 1],
        easeOut: [0, 0, 0.2, 1],
        easeInOut: [0.4, 0, 0.2, 1],
        bounce: [0.68, -0.55, 0.265, 1.55],
    }

/** Reemplazo de framer-motion `useInView` con IntersectionObserver. */
function useInView(
    ref: RefObject<Element | null>,
    { once, margin }: { once: boolean; margin: string }
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
            { rootMargin: margin }
        )
        io.observe(el)
        return () => io.disconnect()
    }, [ref, once, margin])
    return inView
}

export default function NumberCounter(props: NumberCounterProps) {
    const {
        startValue = 0,
        endValue = 100,
        duration = 2,
        delay = 0,
        decimals = 0,
        easing = "easeOut",
        font = DEFAULT_FONT,
        textAlign = "left",
        color = "#000000",
        autoStart = true,
        loop = false,
        resetOnReEntry = false,
        prefix = "",
        suffix = "",
        separator = ",",
    } = props

    const [currentValue, setCurrentValue] = useState(startValue)
    const [hasStarted, setHasStarted] = useState(false)
    const animationRef = useRef<number | undefined>(undefined)
    const startTimeRef = useRef<number | undefined>(undefined)
    const containerRef = useRef<HTMLDivElement>(null)

    const isInView = useInView(containerRef, {
        once: !resetOnReEntry,
        margin: "0px 0px -10% 0px",
    })

    const formatNumber = useMemo(() => {
        return (value: number) => {
            const fixed = value.toFixed(decimals)
            if (separator && Math.abs(value) >= 1000) {
                const parts = fixed.split(".")
                parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator)
                return parts.join(".")
            }
            return fixed
        }
    }, [decimals, separator])

    const easeValue = useMemo(() => {
        return (t: number) => {
            const [, y1, , y2] = easingMap[easing]

            if (easing === "linear") return t
            if (easing === "bounce") {
                if (t < 1 / 2.75) {
                    return 7.5625 * t * t
                } else if (t < 2 / 2.75) {
                    return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75
                } else if (t < 2.5 / 2.75) {
                    return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375
                } else {
                    return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375
                }
            }

            // Cubic bezier approximation
            return (
                3 * (1 - t) * (1 - t) * t * y1 +
                3 * (1 - t) * t * t * y2 +
                t * t * t
            )
        }
    }, [easing])

    const animate = useMemo(() => {
        const step = (timestamp: number) => {
            if (!startTimeRef.current) {
                startTimeRef.current = timestamp + delay * 1000
            }

            const elapsed = timestamp - startTimeRef.current
            const progress = Math.min(elapsed / (duration * 1000), 1)

            if (progress >= 0) {
                const easedProgress = easeValue(progress)
                const newValue =
                    startValue + (endValue - startValue) * easedProgress

                startTransition(() => {
                    setCurrentValue(newValue)
                })

                if (progress < 1) {
                    animationRef.current = requestAnimationFrame(step)
                } else if (loop) {
                    // Reset for loop
                    startTimeRef.current = undefined
                    startTransition(() => {
                        setCurrentValue(startValue)
                    })
                    setTimeout(() => {
                        animationRef.current = requestAnimationFrame(step)
                    }, 100)
                }
            } else {
                animationRef.current = requestAnimationFrame(step)
            }
        }
        return step
    }, [startValue, endValue, duration, delay, loop, easeValue])

    const startAnimation = useMemo(() => {
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
            }
            startTimeRef.current = undefined
            startTransition(() => {
                setCurrentValue(startValue)
                setHasStarted(true)
            })
            animationRef.current = requestAnimationFrame(animate)
        }
    }, [animate, startValue])

    // Handle auto-start and in-view animation
    useEffect(() => {
        // Original: autoStart y !autoStart disparan igual al entrar en vista.
        if (autoStart && isInView && (!hasStarted || resetOnReEntry)) {
            startAnimation()
        } else if (!autoStart && isInView && (!hasStarted || resetOnReEntry)) {
            startAnimation()
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
            }
        }
    }, [autoStart, isInView, hasStarted, resetOnReEntry, startAnimation])

    // Reset when not in view and resetOnReEntry is true
    useEffect(() => {
        if (!isInView && resetOnReEntry && hasStarted) {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
            }
            startTransition(() => {
                setCurrentValue(startValue)
                setHasStarted(false)
            })
            startTimeRef.current = undefined
        }
    }, [isInView, resetOnReEntry, hasStarted, startValue])

    const displayValue = formatNumber(currentValue)
    const fullText = `${prefix}${displayValue}${suffix}`

    return (
        <div
            ref={containerRef}
            style={{
                position: "relative",
                width: "max-content",
                minWidth: "max-content",
                ...props.style,
            }}
        >
            <span
                style={{
                    display: "block",
                    textAlign,
                    color,
                    width: "max-content",
                    ...font,
                }}
            >
                {fullText}
            </span>
        </div>
    )
}
