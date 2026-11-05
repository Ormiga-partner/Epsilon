import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contacto" };

export default function Page() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <h1 className="text-h2">Contacto</h1>
    </main>
  );
}
