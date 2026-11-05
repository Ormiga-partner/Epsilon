"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";

const links = [
  { label: "Nosotros", href: "/sobre-nosotros" },
  { label: "Clientes", href: "/clientes" },
  { label: "Servicios", href: "/servicios" },
  { label: "Contacto", href: "/contacto" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const glass = scrolled || open;

  return (
    <header className="fixed inset-x-0 top-2 z-50 mx-auto w-full max-w-[1200px] px-4 md:px-7">
      <div
        className={`rounded-[28px] px-3 py-2 transition-[background-color,backdrop-filter] duration-300 ${
          glass ? "bg-[rgba(194,194,194,0.5)] backdrop-blur-[10px]" : "bg-transparent"
        }`}
      >
        <div className="flex items-center">
          <Link href="/" aria-label="Epsilon Work, inicio" onClick={() => setOpen(false)}>
            <Image src="/brand/mark.svg" alt="" width={40} height={40} preload />
          </Link>

          <nav aria-label="Principal" className="hidden flex-1 items-center justify-center gap-3 md:flex">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="t-body-m text-[rgb(6,6,6)] transition-colors hover:text-brand-500">
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto hidden md:block">
            <Button href="/contacto">Contacto</Button>
          </div>

          <button
            type="button"
            className="ml-auto flex size-[30px] flex-col items-center justify-center gap-1.5 md:hidden"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className={`h-px w-5 bg-neutral-900 transition-transform ${open ? "translate-y-[3.5px] rotate-45" : ""}`} />
            <span className={`h-px w-5 bg-neutral-900 transition-transform ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`} />
          </button>
        </div>

        {open && (
          <nav aria-label="Principal móvil" className="flex flex-col gap-4 px-1 pt-6 pb-3 md:hidden">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="t-h4 text-neutral-900">
                {l.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
