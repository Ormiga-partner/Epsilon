import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity.config";
import { projectId } from "@/sanity/env";

export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  // Sin NEXT_PUBLIC_SANITY_PROJECT_ID el Studio no puede iniciar (y rompía el build).
  if (!projectId) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6 text-center">
        <p className="t-body-m max-w-md text-neutral-800">
          Sanity Studio no está configurado. Define <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> y{" "}
          <code>NEXT_PUBLIC_SANITY_DATASET</code> en las variables de entorno y vuelve a desplegar.
        </p>
      </main>
    );
  }
  return <NextStudio config={config} />;
}
