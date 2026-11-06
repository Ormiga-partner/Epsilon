import Image from "next/image";
import Link from "next/link";
import CookieSettingsLink from "@/components/layout/CookieSettingsLink";

const columns = [
  {
    title: "Áreas de negocio",
    links: [
      { label: "Ingeniería y despliegue de redes de fibra óptica", href: "/servicios" },
      { label: "Operaciones, mantenimiento y conectividad de clientes", href: "/servicios" },
      { label: "Infraestructura celular y sitios móviles", href: "/servicios" },
      { label: "Obras civiles especializadas", href: "/servicios" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Políticas de privacidad", href: "/legal/politicas-de-privacidad" },
      { label: "Términos y condiciones", href: "/legal/terminos-y-condiciones" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Sobre nosotros", href: "/sobre-nosotros" },
      { label: "Clientes", href: "/clientes" },
      { label: "Contacto", href: "/contacto" },
    ],
  },
];

// Todos los links del footer comparten estado: activos (negro) por defecto; al pasar el cursor
// por cualquiera, ese sigue activo y TODOS los demás (de todas las columnas) quedan inactivos
// (mismo negro al 50 %). Al sacar el cursor, todos vuelven a activo.
const linkClass =
  "footer-link t-body-s text-neutral-900 transition-opacity duration-200 group-has-[.footer-link:hover]/footer:opacity-50 hover:opacity-100!";

export default function Footer() {
  return (
    <footer className="group/footer flex w-full flex-col items-center gap-20 bg-neutral-100 p-6 md:p-10">
      <div className="flex w-full max-w-[1200px] flex-col gap-8 lg:flex-row">
        <div className="flex flex-1 flex-col gap-6">
          <Link href="/" aria-label="Epsilon Work, inicio">
            <Image src="/brand/logo.svg" alt="Epsilon Work" width={91} height={90} />
          </Link>
          <div className="flex flex-col gap-3">
            <p className="t-body-m text-neutral-900">Contacto</p>
            <a href="mailto:contacto@epsilonwork.cl" className={linkClass}>
              contacto@epsilonwork.cl
            </a>
          </div>
        </div>
        <nav aria-label="Pie de página" className="flex flex-col gap-8 md:flex-row">
          {columns.map((col) => (
            <div key={col.title} className="flex flex-col gap-3">
              <p className="t-body-m text-neutral-900">{col.title}</p>
              {col.links.map((l) => (
                <Link key={l.label} href={l.href} className={linkClass}>
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </div>
      <div className="flex w-full max-w-[1200px] flex-col gap-4 md:flex-row">
        <p className="t-body-s flex-1 text-neutral-800">© Epsilon Work · todos los derechos reservados</p>
        <div className="flex gap-4">
          <Link href="/legal/terminos-y-condiciones" className={linkClass}>
            Términos y condiciones
          </Link>
          <Link href="/legal/politicas-de-privacidad" className={linkClass}>
            Políticas de privacidad
          </Link>
          <CookieSettingsLink className={`${linkClass} cursor-pointer`} />
        </div>
      </div>
    </footer>
  );
}
