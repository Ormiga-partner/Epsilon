# Epsilon Work

Plan 2 · Autogestionable.

| Capa | Herramienta |
| --- | --- |
| Estructura y SEO | Next.js + React |
| Estilos | Tailwind |
| Animación y 3D | GSAP, Lenis, Three.js (R3F) |
| CMS (el cliente edita) | Sanity, Studio en `/studio` |
| Hosting | Cloudflare Workers (OpenNext) · `dev` → link de prueba, `main` → dominio del cliente |
| Parches | Dependabot (semanal, a `dev`) |

## Arranque

```bash
cp .env.example .env.local   # completar NEXT_PUBLIC_SANITY_PROJECT_ID
npm install
npm run dev
```

## Ramas y deploy

| Rama | Uso | Cloudflare |
| --- | --- | --- |
| `dev` | Todo el trabajo se hace aquí | Preview URL (link de prueba) en cada push |
| `production` | Web final, solo recibe merges desde `dev` | Deploy a producción → dominio del cliente |

Flujo: cambios en `dev` → revisar link de prueba → PR `dev` → `production`.

Cloudflare (Workers & Pages → Create → Import a repository, Workers Builds):
- Production branch: `production`
- Build command: `npx opennextjs-cloudflare build` · Deploy command: `npx opennextjs-cloudflare deploy`
- Preview (rama `dev`, tracking branch): Build command `npx opennextjs-cloudflare build` · Preview command
  `npx opennextjs-cloudflare upload` (no usar el `npx wrangler preview` por defecto: requiere bloque `previews`
  en `wrangler.jsonc` y no está probado con OpenNext)
- Variables: `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`

Manual: `npm run deploy` (producción) · `npm run upload` (preview).

## Origen del diseño

Framer: proyecto "Epsilon Work" (`dyIzFspnOMPrMok3Y005`), publicado en epsilonwork.cl.
Tokens de color y tipografía ya portados a `src/app/globals.css`. Rutas creadas como stubs:
`/`, `/servicios`, `/sobre-nosotros`, `/clientes`, `/contacto`, `/legal/*`.

Componentes de código de Framer portados a React en `src/components/framer/` (sin dependencia de `framer`/`framer-motion`):
NumberCounter, DraggableCarousel, DottedSurface, Preloader, AsciiText, OrbitLogos, VariableDotsGlobe,
GlowEdge, Carrusel3D, BlindsReveal (`withBlindsReveal`), GlowBorder, AsciiShimmer, EpsilonStackCards.

Home maquetado en `src/components/home/` (Hero, Servicios, Diferencial, Marcas). Nav, CTA y Footer del
layout de Framer en `src/components/layout/`. `ImageAscii` sustituye al componente externo "Interactive ASCII".
Assets (logos, imágenes, PDF, video del preloader) en `public/`.
