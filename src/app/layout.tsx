import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://epsilonwork.cl"),
  title: {
    default: "Epsilon Work | Ingeniería y construcción telecom en Chile",
    template: "%s | Epsilon Work",
  },
  description:
    "Despliegue, operación y mantenimiento de redes de fibra óptica, sitios móviles y obras civiles telecom. Modalidad llave en mano con SLA. Cobertura nacional.",
  // Imagen para redes: src/app/opengraph-image.png (la "Social Preview" de Framer); íconos: icon.svg,
  // favicon.ico y apple-icon.png (archivos de convención de Next).
  openGraph: { type: "website", locale: "es_CL", siteName: "Epsilon Work", url: "/" },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
