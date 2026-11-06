"use client";

// En Framer la variable "Visible CTA" del layout está en false solo en /contacto.
import { usePathname } from "next/navigation";
import CTA from "@/components/layout/CTA";

export default function RouteCTA() {
  return usePathname() === "/contacto" ? null : <CTA />;
}
