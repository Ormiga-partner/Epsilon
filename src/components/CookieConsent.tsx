"use client";

// Banner de cookies (Ley 21.719): Google Analytics solo se carga si el visitante lo acepta.
// "Rechazar" tiene el mismo peso que "Aceptar". La decisión se guarda en localStorage y puede
// cambiarse con el enlace "Configuración de cookies" del footer (evento "open-cookie-settings").
// Si no hay NEXT_PUBLIC_GA_ID no se muestra nada: no hay cookies que consentir.

import Link from "next/link";
import Script from "next/script";
import { useEffect, useState } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const KEY = "cookie-consent-v1"; // "granted" | "denied"

type Choice = "granted" | "denied" | null;

function readChoice(): Choice {
  try {
    const v = localStorage.getItem(KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

// Borra las cookies de GA (_ga, _ga_XXXX) del dominio actual y del dominio raíz
function clearGaCookies() {
  const host = location.hostname;
  const domains = ["", host, "." + host.split(".").slice(-2).join(".")];
  document.cookie.split(";").forEach((c) => {
    const name = c.split("=")[0].trim();
    if (!name.startsWith("_ga")) return;
    domains.forEach((d) => {
      document.cookie = `${name}=; Max-Age=0; path=/${d ? `; domain=${d}` : ""}`;
    });
  });
}

export function openCookieSettings() {
  window.dispatchEvent(new Event("open-cookie-settings"));
}

export default function CookieConsent() {
  const [choice, setChoice] = useState<Choice>(null);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!GA_ID) return;
    const c = readChoice();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage solo existe en el cliente
    setChoice(c);
    setOpen(c === null);
    setReady(true);
    const reopen = () => setOpen(true);
    window.addEventListener("open-cookie-settings", reopen);
    return () => window.removeEventListener("open-cookie-settings", reopen);
  }, []);

  if (!GA_ID || !ready) return null;

  const decide = (c: "granted" | "denied") => {
    try {
      localStorage.setItem(KEY, c);
    } catch {}
    if (c === "denied" && choice === "granted") {
      clearGaCookies();
      location.reload(); // descarga el script de GA ya cargado
      return;
    }
    setChoice(c);
    setOpen(false);
  };

  return (
    <>
      {choice === "granted" && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_ID}',{anonymize_ip:true});`}
          </Script>
        </>
      )}
      {open && (
        <div
          role="dialog"
          aria-label="Preferencias de cookies"
          className="fixed inset-x-4 bottom-4 z-[60] mx-auto flex max-w-[640px] flex-col gap-4 rounded-3xl bg-white p-5 shadow-[0_8px_32px_rgba(4,15,50,0.18)] min-[810px]:flex-row min-[810px]:items-center"
        >
          <p className="t-body-s flex-1 text-neutral-800">
            Usamos cookies de Google Analytics para medir de forma agregada cómo se usa el sitio y mejorarlo. Solo se
            activan si las aceptas. Más información en la{" "}
            <Link href="/legal/politicas-de-privacidad" className="underline underline-offset-2">
              Política de privacidad
            </Link>
            .
          </p>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => decide("denied")}
              className="t-body-m rounded-full border border-brand-500 px-4 py-2 text-brand-500 transition-colors hover:bg-brand-100"
            >
              Rechazar
            </button>
            <button
              type="button"
              onClick={() => decide("granted")}
              className="t-body-m rounded-full border border-brand-500 bg-brand-500 px-4 py-2 text-neutral-100 transition-colors hover:bg-brand-700"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
