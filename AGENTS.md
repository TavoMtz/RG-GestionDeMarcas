# AGENTS.md

Static Spanish-language site for RG Gestión de Marcas (marketing agency). No framework, no bundler, no dependencies, no build step — plain HTML/CSS/vanilla JS. All user-facing copy must stay in Spanish.

## Commands

- No install/build/dev/test/lint commands exist. `npm test` is a stub that exits 1. To preview: open `index.html` in a browser or serve the folder statically.
- No git repo — do not run git commands here.

## Architecture

- 4 pages: `index.html` (home, with hidden service-detail screens toggled by JS zoom transitions), `nosotros.html`, `simulador-servicios.html` (AI simulator), `contacto.html`. Nav, footer, floating social icons, and the client-logo marquee are copy-pasted into every page — keep them in sync when editing.
- Backend is serverless functions only. The **active** deployment is Netlify: `netlify.toml` redirects `/api/*` → `/.netlify/functions/:splat`. Frontend calls only `/api/contact` and `/api/analyze`.
- There are **two duplicate implementations** of each function that must be kept in sync when edited:
  - `netlify/functions/*.js` — CommonJS (`exports.handler`), used by Netlify.
  - `api/*.js` — ESM (`export default`), Vercel-only, not wired to the frontend under the current Netlify setup.
- Env vars (set in the hosting platform, never commit them): `RESEND_API_KEY`; Anthropic key as `ANTHROPIC_API_KEY`, `CLAUDE_API_KEY`, or `ANTHROPIC_KEY` (analyze checks all three).
- The contact form / AI simulator only work when functions run server-side with those env vars; local static preview can't exercise them.

## Conventions

- All user input embedded into HTML (simulator results, contact email template) must go through the `escapeHtml` helper already used in `simulador-servicios.html` and both `contact.js` copies — never raw `innerHTML` interpolation of user data.
- `servicio` codes in the contact form are mapped to Spanish labels inside `contact.js` (`investigacion`, `naiming`, `web`, `redes`, `cursos`, `otro`). Keep the dropdown and map in sync.
- Services are exactly: Investigación de Mercados, Naming/Diseño/Producción, Diseño Web, Gestión de Redes Sociales, Cursos y Capacitación.
- Known stale bits: `simulador-servicios.html` references a nonexistent `config.js`; the PDF footer email (`contacto@rgmarketing.com`) differs from the rest of the site (`contacto@rg-gestiondemarcas.com`); two `<title>` tags in `index.html`. Prefer `rg-gestiondemarcas.com` when touching these.
