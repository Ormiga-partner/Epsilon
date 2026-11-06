"use client";

// Formulario de Framer (página /contacto): tarjeta rgb(237,237,237) radio 24, padding 24, gap 16.
// Campos con borde neutral-500, fondo neutral-200, radio 8, padding 12.
// Botón (componente "Button"): brand-500, radio 24; estados Loading (spinner), Success
// ("Gracias por tu respuesta", verde 15 %) y Error ("Algo ha salido mal", rojo 15 %).

import Link from "next/link";
import { useState } from "react";

// Versión de la política de privacidad aceptada (se registra junto al consentimiento)
export const PRIVACY_VERSION = "2026-11-06";

type Status = "idle" | "loading" | "success" | "error";

const fields = [
  { name: "Name", label: "Nombre", placeholder: "Jane Smith", type: "text", autoComplete: "name" },
  { name: "Email", label: "Correo", placeholder: "jane@framer.com", type: "email", autoComplete: "email" },
  { name: "Empresa", label: "Empresa", placeholder: "Claro", type: "text", autoComplete: "organization" },
] as const;

const inputClass =
  "t-body-m w-full rounded-lg border border-neutral-500 bg-neutral-200 p-3 text-neutral-900 placeholder:text-neutral-600 outline-none transition-colors focus:border-brand-500";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("success");
      e.currentTarget?.reset();
    } catch {
      setStatus("error");
    }
  }

  const btn = {
    idle: { label: "Enviar", cls: "bg-brand-500 text-neutral-100 hover:bg-brand-600" },
    loading: { label: "Enviando", cls: "bg-brand-500 text-neutral-100" },
    success: { label: "Gracias por tu respuesta", cls: "bg-[rgba(41,255,91,0.15)] text-neutral-900" },
    error: { label: "Algo ha salido mal", cls: "bg-[rgba(255,34,68,0.15)] text-neutral-900" },
  }[status];

  return (
    <form
      onSubmit={onSubmit}
      onInput={() => (status === "success" || status === "error") && setStatus("idle")}
      className="flex w-full flex-col items-start gap-4 overflow-hidden rounded-3xl bg-[rgb(237,237,237)] p-6"
    >
      {fields.map((f) => (
        <label key={f.name} className="flex w-full flex-col gap-2.5">
          <span className="t-body-m text-neutral-900">{f.label}</span>
          <input
            name={f.name}
            type={f.type}
            placeholder={f.placeholder}
            autoComplete={f.autoComplete}
            required
            className={inputClass}
          />
        </label>
      ))}
      <label className="flex w-full flex-col gap-2.5">
        <span className="t-body-m text-neutral-900">Solicitud</span>
        <textarea name="Solicitud" placeholder="Deja tu comentario aquí" required rows={4} className={`${inputClass} resize-y`} />
      </label>
      {/* Ley 21.719 (Chile): información en primera capa + consentimiento libre, informado,
          específico e inequívoco (casilla sin marcar). Comunicaciones comerciales: consentimiento aparte. */}
      <div className="t-body-s w-full rounded-lg bg-neutral-200 p-3 text-neutral-800">
        <p>
          <strong className="font-medium text-neutral-900">Responsable:</strong> Epsilon Work SPA.{" "}
          <strong className="font-medium text-neutral-900">Finalidad:</strong> responder tu solicitud y, si
          corresponde, enviarte una cotización. <strong className="font-medium text-neutral-900">Base:</strong> tu
          consentimiento, que puedes retirar en cualquier momento.{" "}
          <strong className="font-medium text-neutral-900">Conservación:</strong> 6 meses o hasta que solicites su
          eliminación. <strong className="font-medium text-neutral-900">Derechos:</strong> acceso,
          rectificación, supresión, oposición, portabilidad y bloqueo, escribiendo a{" "}
          <a href="mailto:contacto@epsilonwork.cl" className="underline underline-offset-2">
            contacto@epsilonwork.cl
          </a>
          . Más información en la{" "}
          <Link href="/legal/politicas-de-privacidad" className="underline underline-offset-2">
            Política de privacidad
          </Link>
          .
        </p>
      </div>
      <label className="t-body-s flex w-full cursor-pointer items-start gap-3 text-neutral-900">
        <input
          type="checkbox"
          name="consentimiento"
          value="si"
          required
          className="mt-0.5 size-4 shrink-0 cursor-pointer accent-brand-500"
        />
        <span>
          He leído la{" "}
          <Link href="/legal/politicas-de-privacidad" className="underline underline-offset-2" target="_blank">
            Política de privacidad
          </Link>{" "}
          y acepto que Epsilon Work trate mis datos para responder esta solicitud. *
        </span>
      </label>
      <label className="t-body-s flex w-full cursor-pointer items-start gap-3 text-neutral-900">
        <input
          type="checkbox"
          name="comerciales"
          value="si"
          className="mt-0.5 size-4 shrink-0 cursor-pointer accent-brand-500"
        />
        <span>Quiero recibir información comercial y novedades de Epsilon Work (opcional).</span>
      </label>
      <input type="hidden" name="politica" value={PRIVACY_VERSION} />
      <button
        type="submit"
        disabled={status === "loading"}
        className={`t-body-m inline-flex h-10 items-center gap-2 rounded-3xl px-4 transition-colors ${btn.cls}`}
      >
        {btn.label}
        {status === "loading" && (
          <span
            aria-hidden
            className="size-5 animate-spin rounded-full"
            style={{ background: "conic-gradient(from 0deg, rgba(255,255,255,0) 7deg, #fff 342deg)", mask: "radial-gradient(circle, transparent 55%, #000 57%)" }}
          />
        )}
      </button>
      <p aria-live="polite" className="sr-only">
        {status === "success" ? "Mensaje enviado" : status === "error" ? "No se pudo enviar el mensaje" : ""}
      </p>
    </form>
  );
}
