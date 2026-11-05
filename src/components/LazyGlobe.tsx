"use client";

// Carga diferida del globo: three.js (~600 KB sin comprimir) no entra en el bundle inicial y
// solo se descarga cuando el contenedor está cerca del viewport.

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { VariableDotsGlobeProps } from "@/components/framer/VariableDotsGlobe";

const VariableDotsGlobe = dynamic(() => import("@/components/framer/VariableDotsGlobe"), { ssr: false });

export default function LazyGlobe(props: VariableDotsGlobeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      {near && <VariableDotsGlobe {...props} />}
    </div>
  );
}
