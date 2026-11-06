"use client";

// Formulario de Framer (página /contacto): tarjeta rgb(237,237,237) radio 24, padding 24, gap 16.
// Campos con borde neutral-500, fondo neutral-200, radio 8, padding 12.
// Botón (componente "Button"): brand-500, radio 24; estados Loading (spinner), Success
// ("Gracias por tu respuesta", verde 15 %) y Error ("Algo ha salido mal", rojo 15 %).

import { useState } from "react";

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
