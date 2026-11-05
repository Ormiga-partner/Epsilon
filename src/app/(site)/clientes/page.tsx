import type { Metadata } from "next";

export const metadata: Metadata = { title: "Clientes" };

export default function Page() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <h1 className="text-h2">Clientes</h1>
    </main>
  );
}
