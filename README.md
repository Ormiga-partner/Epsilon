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
