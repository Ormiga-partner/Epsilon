import type { Metadata } from "next";
import ContactForm from "@/components/contacto/ContactForm";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Solicita una cotización o agenda una evaluación para tu proyecto de telecomunicaciones.",
};

// Página "/contacto" de Framer: sin hero ASCII ni bloque CTA (Visible CTA = false).
export default function ContactoPage() {
  return (
    <main className="flex w-full flex-col items-center gap-2.5 bg-neutral-100">
      <section className="flex w-full max-w-[1200px] px-4 pt-[94px] min-[810px]:px-8 min-[1200px]:px-10">
        <h1 className="t-h1 w-full max-w-[500px] text-neutral-900">Contáctate con nosotros</h1>
      </section>
      <section className="flex w-full max-w-[1200px] flex-col gap-10 px-4 py-6 min-[810px]:flex-row min-[810px]:justify-between min-[810px]:gap-0 min-[810px]:p-8 min-[1200px]:p-10">
        <p className="t-body-l w-full text-neutral-900 min-[810px]:w-[500px] min-[810px]:shrink-0 min-[810px]:pr-6">
          Si quieres solicitar una cotización o agendar una evaluación para tu proyecto, responde nuestro formulario y
          te respondemos.
        </p>
        <div className="w-full min-[810px]:flex-1">
          <ContactForm />
        </div>
      </section>
    </main>
  );
}
