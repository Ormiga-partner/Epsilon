// Botón "Download" de Framer (presentación PDF): pastilla brand-500, hover brand-700.
export default function DownloadButton() {
  return (
    <a
      href="/files/presentacion-epsilon.pdf"
      download="Presentación Epsilon.pdf"
      className="t-body-m inline-flex items-center rounded-full bg-brand-500 px-4 py-2 text-neutral-100 transition-colors hover:bg-brand-700 hover:text-white"
    >
      Descarga nuestra presentación
    </a>
  );
}
