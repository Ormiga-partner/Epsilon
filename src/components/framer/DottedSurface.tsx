"use client"
// Portado desde Framer: Red_node.tsx

import { useRef, useEffect } from "react"
import * as THREE from "three"

/**
 * Dotted Surface — malla de puntos con oleaje senoidal (three.js).
 * Fondo transparente, tamaño según el contenedor.
 */
export interface DottedSurfaceProps {
    /** Default "#C8C8C8" */
    color?: string
    /** Columnas. Default 40 */
    amountX?: number
    /** Filas. Default 60 */
    amountY?: number
    /** Separación. Default 150 */
    separation?: number
    /** Tamaño dot. Default 8 */
    dotSize?: number
    /** Opacidad. Default 0.8 */
    opacity?: number
    /** Altura ola. Default 50 */
    waveHeight?: number
    /** Velocidad. Default 0.1 */
    speed?: number
}

export default function DottedSurface(props: DottedSurfaceProps) {
    const {
        color = "#C8C8C8",
        amountX = 40,
        amountY = 60,
        separation = 150,
        dotSize = 8,
        opacity = 0.8,
        waveHeight = 50,
        speed = 0.1,
    } = props

    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        let w = container.clientWidth || 1
        let h = container.clientHeight || 1

        const AMOUNTX = Math.round(amountX)
        const AMOUNTY = Math.round(amountY)

        const scene = new THREE.Scene()
        scene.fog = new THREE.Fog(0xffffff, 2000, 10000)

        const camera = new THREE.PerspectiveCamera(60, w / h, 1, 10000)
        camera.position.set(0, 355, 1220)

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
        })
        renderer.setPixelRatio(window.devicePixelRatio)
        renderer.setSize(w, h)
        renderer.setClearColor(0x000000, 0)
        container.appendChild(renderer.domElement)

        const geometry = new THREE.BufferGeometry()
        const positions: number[] = []
        for (let ix = 0; ix < AMOUNTX; ix++) {
            for (let iy = 0; iy < AMOUNTY; iy++) {
                const x = ix * separation - (AMOUNTX * separation) / 2
                const z = iy * separation - (AMOUNTY * separation) / 2
                positions.push(x, 0, z)
            }
        }
        geometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(positions, 3)
        )

        const material = new THREE.PointsMaterial({
            color: new THREE.Color(color),
            size: dotSize,
            transparent: true,
            opacity,
            sizeAttenuation: true,
        })
        const points = new THREE.Points(geometry, material)
        scene.add(points)

        let count = 0
        let raf = 0
        const animate = () => {
            raf = requestAnimationFrame(animate)
            const arr = geometry.attributes.position.array as Float32Array
            let i = 0
            for (let ix = 0; ix < AMOUNTX; ix++) {
                for (let iy = 0; iy < AMOUNTY; iy++) {
                    arr[i * 3 + 1] =
                        Math.sin((ix + count) * 0.3) * waveHeight +
                        Math.sin((iy + count) * 0.5) * waveHeight
                    i++
                }
            }
            geometry.attributes.position.needsUpdate = true
            renderer.render(scene, camera)
            count += speed
        }
        animate()

        const ro = new ResizeObserver(() => {
            w = container.clientWidth || 1
            h = container.clientHeight || 1
            camera.aspect = w / h
            camera.updateProjectionMatrix()
            renderer.setSize(w, h)
        })
        ro.observe(container)

        return () => {
            cancelAnimationFrame(raf)
            ro.disconnect()
            geometry.dispose()
            material.dispose()
            renderer.dispose()
            if (renderer.domElement.parentNode)
                renderer.domElement.parentNode.removeChild(renderer.domElement)
        }
    }, [
        color,
        amountX,
        amountY,
        separation,
        dotSize,
        opacity,
        waveHeight,
        speed,
    ])

    return (
        <div
            ref={containerRef}
            style={{ width: "100%", height: "100%", overflow: "hidden" }}
        />
    )
}
