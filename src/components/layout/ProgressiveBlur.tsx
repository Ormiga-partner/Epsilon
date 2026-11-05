// Blur progresivo fijo en el borde superior (equivale al componente externo de Framer que va en
// el layout: fixed, ancho completo, 100px desktop / 90px tablet / 80px phone, z-index 9, sin
// eventos). El contenido que pasa por debajo se desenfoca más cuanto más arriba está.
// Implementación: capas apiladas de backdrop-filter con blur creciente; cada una se enmascara a
// una franja con degradado para que la transición entre niveles sea continua.

const LAYERS = 6;
const MAX_BLUR = 16; // px en el borde superior

export default function ProgressiveBlur() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[9] h-20 select-none min-[810px]:h-[90px] min-[1200px]:h-[100px]"
    >
      {Array.from({ length: LAYERS }, (_, k) => {
        // k = 0 es la franja superior (blur máximo); cada capa siguiente baja y desenfoca la mitad
        const blur = MAX_BLUR / 2 ** k;
        const step = 100 / LAYERS;
        const a = k * step; // inicio de la franja (desde arriba)
        const b = (k + 1) * step; // fin de la franja
        const fadeIn = k === 0 ? "#000 0%" : `transparent ${a - step}%, #000 ${a}%`;
        const mask = `linear-gradient(to bottom, ${fadeIn}, #000 ${b}%, transparent ${Math.min(b + step, 100)}%)`;
        return (
          <div
            key={k}
            className="absolute inset-0"
            style={{
              backdropFilter: `blur(${blur}px)`,
              WebkitBackdropFilter: `blur(${blur}px)`,
              maskImage: mask,
              WebkitMaskImage: mask,
            }}
          />
        );
      })}
    </div>
  );
}
