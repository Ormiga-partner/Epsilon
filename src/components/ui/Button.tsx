import Link from "next/link";
import GlowBorder from "@/components/framer/GlowBorder";

const glowBase = {
  thickness: 1,
  length: 15,
  count: 2,
  duration: 3,
  reverse: true,
  glow: 8,
  glowOpacity: 0.8,
  hoverGlow: 0.6,
  inheritRadius: false,
  radius: 100,
  baseThickness: 1,
  transition: 600,
} as const;

type Variant = "primario" | "secundario" | "secundario-blanco";

const styles: Record<Variant, string> = {
  // "Primario / Azul": relleno brand-500, texto neutral-100
  primario: "bg-brand-500 px-6 text-neutral-100 hover:bg-brand-700",
  // "Secundario / Azul": transparente, texto brand-500
  secundario: "px-4 text-brand-500 hover:bg-brand-100/60",
  // "Secundario / Blanco": transparente, texto neutral-100 (sobre fondos azules)
  "secundario-blanco": "px-4 text-neutral-100 hover:bg-white/10",
};

export default function Button({
  href,
  variant = "primario",
  children,
  className = "",
  download,
}: {
  href: string;
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
  download?: boolean | string;
}) {
  const cls = `t-body-m relative inline-flex items-center justify-center rounded-full py-2 whitespace-nowrap transition-colors ${styles[variant]} ${className}`;
  // Valores de las instancias GlowBorder en los botones de Framer
  const glow =
    variant === "primario" ? (
      <GlowBorder
        {...glowBase}
        color="var(--color-brand-300)"
        glowColor="var(--color-brand-300)"
        showBase={false}
      />
    ) : (
      // Pill: borde base + luz animada alrededor de todo el botón
      <>
        <GlowBorder
          {...glowBase}
          color={
            variant === "secundario"
              ? "var(--color-brand-500)"
              : "var(--color-neutral-100)"
          }
          glowColor={
            variant === "secundario"
              ? "var(--color-brand-500)"
              : "var(--color-neutral-100)"
          }
          showBase
          baseColor={
            variant === "secundario"
              ? "rgba(20, 77, 250, 0.24)"
              : "rgba(255,255,255,0.24)"
          }
        />
      </>
    );
  if (download || href.startsWith("http") || href.startsWith("mailto:")) {
    return (
      <a href={href} className={cls} download={download}>
        {children}
        {glow}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
      {glow}
    </Link>
  );
}
