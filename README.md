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

## Deploy

- `npm run deploy:dev` → worker `epsilon-work-dev`
- `npm run deploy` → worker `epsilon-work` (producción)

## Origen del diseño

Framer: proyecto "Epsilon Work" (`dyIzFspnOMPrMok3Y005`), publicado en epsilonwork.cl.
Tokens de color y tipografía ya portados a `src/app/globals.css`. Rutas creadas como stubs:
`/`, `/servicios`, `/sobre-nosotros`, `/clientes`, `/contacto`, `/legal/*`.

Componentes de código en Framer pendientes de portar (React):
NumberCounter, DraggableCarousel, DottedSurface (Red_node), Preloader, AsciiText, OrbitLogos,
VariableDotsGlobe (Network_Globe), GlowEdge, Carrusel3D, withBlindsReveal, GlowBorder, AsciiShimmer,
EpsilonStackCards (Dots_cards).
