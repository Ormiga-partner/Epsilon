"use client";
import { openCookieSettings } from "@/components/CookieConsent";

// Enlace del footer para volver a abrir el banner y cambiar o retirar el consentimiento
export default function CookieSettingsLink({ className = "" }: { className?: string }) {
  if (!process.env.NEXT_PUBLIC_GA_ID) return null;
  return (
    <button type="button" onClick={openCookieSettings} className={className}>
      Configuración de cookies
    </button>
  );
}
