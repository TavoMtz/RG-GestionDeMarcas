---
name: RG Gestión de Marcas
description: Sistema editorial de RG — sitio estático en español para la agencia de marketing en Puebla, México. Dark-only, brand amber sobre tinta, display Montserrat + body Poppins.
colors:
  surface-tinta: "#121212"
  surface-pizarra: "#1e1e1e"
  surface-card: "#1e1e1e"
  text-papel: "#e2e8f0"
  text-blanco: "#ffffff"
  text-niebla: "#b3b3b3"
  text-atenuado: "#c9c9c9"
  accent-marca: "#f4a71c"
  emphasis-sol: "#f6cf3d"
  secondary-ambar: "#ffc107"
  alert-text: "#ff8a8a"
  alert-titulo: "#ffb4b4"
  alert-sutil: "#ffd6d6"
  alert-border: "rgba(255, 138, 138, 0.35)"
  alert-bg: "rgba(255, 138, 138, 0.06)"
  border-sutil: "rgba(255, 255, 255, 0.08)"
  border-medio: "rgba(255, 255, 255, 0.12)"
typography:
  display:
    fontFamily: "Montserrat, sans-serif"
    fontWeight: 700
    fontSize: "clamp(2rem, 5vw, 3rem)"
    lineHeight: 1.2
    letterSpacing: "normal"
  headline:
    fontFamily: "Montserrat, sans-serif"
    fontWeight: 700
    fontSize: "clamp(1.8rem, 4.2vw, 2.6rem)"
    lineHeight: 1.2
    letterSpacing: "normal"
  title:
    fontFamily: "Montserrat, sans-serif"
    fontWeight: 700
    fontSize: "1.15rem"
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "Poppins, sans-serif"
    fontWeight: 400
    fontSize: "1rem"
    lineHeight: 1.6
    letterSpacing: "normal"
  body-prose:
    fontFamily: "Poppins, sans-serif"
    fontWeight: 400
    fontSize: "1.05rem"
    lineHeight: 1.75
    letterSpacing: "normal"
  label:
    fontFamily: "Poppins, sans-serif"
    fontWeight: 600
    fontSize: "0.8rem"
    letterSpacing: "0.08em"
    textTransform: "uppercase"
  eyebrow:
    fontFamily: "Poppins, sans-serif"
    fontWeight: 600
    fontSize: "0.75rem"
    letterSpacing: "0.18em"
    textTransform: "uppercase"
rounded:
  xs: "4px"
  sm: "8px"
  md: "14px"
  lg: "16px"
  pill: "999px"
spacing:
  xs: "0.4rem"
  sm: "0.6rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
  xxl: "3rem"
components:
  button-primary:
    backgroundColor: "{colors.accent-marca}"
    textColor: "{colors.surface-tinta}"
    rounded: "{rounded.sm}"
    padding: "0.6rem 1.25rem"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-papel}"
    rounded: "{rounded.sm}"
    padding: "0.6rem 1.25rem"
  blog-card:
    backgroundColor: "rgba(255, 255, 255, 0.04)"
    textColor: "{colors.text-papel}"
    rounded: "{rounded.md}"
    padding: "0"
  blog-featured-card:
    backgroundColor: "rgba(255, 255, 255, 0.04)"
    textColor: "{colors.text-papel}"
    rounded: "{rounded.lg}"
    padding: "0"
  chip-tag:
    backgroundColor: "{colors.border-sutil}"
    textColor: "{colors.text-atenuado}"
    rounded: "{rounded.pill}"
    padding: "0.25rem 0.7rem"
  select-filter:
    backgroundColor: "rgba(255, 255, 255, 0.05)"
    textColor: "{colors.text-papel}"
    rounded: "{rounded.sm}"
    padding: "0.5rem 2.2rem 0.5rem 0.85rem"
---

# Design System: RG Gestión de Marcas

## Overview

**Creative North Star: "El Taller Editorial"**

RG Gestión de Marcas opera desde Puebla, México como un estudio de marketing donde el oficio pesa más que la pirotecnia. La página web — y por extensión el blog — debe leerse como el escritorio del taller: oscuro, contenido, con instrumentos a la vista. La paleta dominante es tinta de carbón sobre la que aparece un único acento cálido (`accent-marca`) para indicar dirección. La tipografía hace una sola promesa: Montserrat pone título a las cosas, Poppins las explica.

El sitio es dark-only por decisión de ambiente: la marca quiere leer como un estudio de noche, no como una sala de exposición. La voz editorial — cuando esté bien encauzada — debe sentirse local (Puebla, oficio, casos), no genérica. La fase actual del blog es **ingeniería sin autoría**: el sistema está cableado pero el contenido y la huella específica de la agencia todavía no aterrizan.

**Key Characteristics:**
- Dark-only, sin alternancia a tema claro. La marca no es "configurable"; es un ambiente.
- Un acento cálido (`accent-marca` ambar) hace todo el trabajo de énfasis. Raro es el punto.
- Display Montserrat 700, body Poppins 400-600. Sin serif editorial, sin mono de adorno.
- Cards 14-16px radius; tags en pill; superficies por capas tonales (sin sombras estructurales fuertes).
- El blog se renderiza con Markdown sanitizado vía DOMPurify — la jerarquía visual del cuerpo viene del propio Markdown.

## Colors

La paleta es oscura por ambiente y ámbar por acento. Las superficies se apilan por tono, no por sombra.

### Primary
- **Ámbar de Marca** (`#f4a71c`): acento principal. Marca la dirección: enlace "Leer artículo →", CTA activo, hover de borde en cards, foco del select de filtro. Raro es el punto — no más de un acento vivo por viewport.

### Secondary
- **Oro Sol** (`#f6cf3d`): énfasis secundario. Usado originalmente como `--colorEnfasis` y en las plantillas de correo (Resend). No debería competir con el ámbar en el sitio público — reservarlo para estados activos críticos o para el sistema de correo.

### Tertiary
- **Ámbar de Gradiente** (`#ffc107`): tono más claro para gradientes suaves entre los dos acentos. Definido pero apenas usado en el sitio público.

### Alert (semantic, not accent)
- **Alerta Texto** (`#ff8a8a`): texto de error en estados `blog-state--error`. Color reservado exclusivamente para mensajes de error.
- **Alerta Título** (`#ffb4b4`): encabezado del banner de "publicación no encontrada".
- **Alerta Sutil** (`#ffd6d6`): texto descriptivo del banner de error.
- **Borde Alerta** (`rgba(255, 138, 138, 0.35)`): borde del banner.
- **Fondo Alerta** (`rgba(255, 138, 138, 0.06)`): superficie del banner.

La familia Alerta es **semántica, no decorativa**. No debe usarse nunca para emphasis general; existe únicamente para errores y rutas no encontradas.

### Neutral
- **Tinta de Carbón** (`#121212`): superficie base, fondo del documento.
- **Pizarra Tinta** (`#1e1e1e`): superficie de cards y elementos elevados. Mismo valor que `--colorCard`.
- **Papel Frío** (`#e2e8f0`): texto principal (`--text-color`). El más frío de los blancos.
- **Blanco Puro** (`#ffffff`): títulos y enlaces fuertes donde se necesite el contraste máximo.
- **Niebla** (`#b3b3b3`): texto secundario (`--textGray`).
- **Atenuado** (`#c9c9c9`): texto de metadatos y excerpts en el blog (`--text-muted` — usado solo por `blog.css`).
- **Borde Sutil** (`rgba(255, 255, 255, 0.08)`): separador de cards y borde de chips.
- **Borde Medio** (`rgba(255, 255, 255, 0.12)`): borde de inputs y select.

### Named Rules
**The One Voice Rule.** El ámbar de marca (`#f4a71c`) es el único acento vivo del sitio público. Su rareza es el punto: en cualquier viewport, máximo una superficie compite por la atención del ojo. Si un segundo elemento necesita enfatizarse, gana con peso tipográfico (Montserrat 700) o tamaño, no con un segundo color.

**The Dark-Only Rule.** No existe modo claro. La marca no se adapta al sistema operativo; el visitante entra al taller, no a una sala configurable. `prefers-color-scheme` se respeta solo para reducir movimiento (`prefers-reduced-motion`), no para alternar paleta.

**The Drift Acknowledgement (pendiente).** El archivo `css/blog.css` define sus propias variables `--accent`, `--text-primary`, `--text-muted` que **no existen en `:root`** y caen siempre a los fallbacks literales (`#c89b3c`, `#fff`, `#c9c9c9`). Resultado: la página pública del blog usa un bronce propio (`#c89b3c`) que no aparece en ninguna otra parte del sitio. **Resolución pendiente para una fase posterior**: o se añaden los tres tokens a `:root` en `index.css`, o se renombran las variables del blog para apuntar a las que sí existen (`--accent-color`, `--text-color`, `--textGray`). Hasta entonces, `Bronce Taberna` (`#c89b3c`) es un drift, no un token normativo.

## Typography

**Display Font:** Montserrat (con fallback `sans-serif`)
**Body Font:** Poppins (con fallback `sans-serif`)

**Character:** Montserrat dice "esto importa" con peso y tamaño; Poppins explica con neutralidad contemporánea. La combinación es deliberadamente genérica — el carácter del sistema no viene de la tipografía sino del ambiente oscuro y del acento ámbar. No se busca una voz tipográfica única; se busca legibilidad sostenida en artículos largos.

### Hierarchy
- **Display** (Montserrat 700, `clamp(2rem, 5vw, 3rem)`, lh 1.2): título del hero (`blog-hero__title`). Una sola vez por superficie.
- **Headline** (Montserrat 700, `clamp(1.8rem, 4.2vw, 2.6rem)`, lh 1.2): título del post en la vista individual (`blog-post__title`).
- **Title** (Montserrat 700, `1.15rem`, lh 1.3): título de card regular (`blog-card__title`).
- **Body** (Poppins 400, `1rem`, lh 1.6): párrafos, descripciones, contenido en general. Body measure en el post view es ~65-75ch (760px / ~1.05rem con `lh 1.75`).
- **Body Prose** (Poppins 400, `1.05rem`, lh 1.75): párrafo dentro del post. Más generoso que body normal — el cuerpo del post es el momento de lectura sostenida.
- **Label** (Poppins 600, `0.8rem`, lh normal, letter-spacing `0.08em`, uppercase): meta de cards y CTA. Mayúsculas con tracking abierto.
- **Eyebrow** (Poppins 600, `0.75rem`, lh normal, letter-spacing `0.18em`, uppercase): rótulo sobre el título del hero (`"BLOG"`). Más pequeño y con más tracking que el label — es la señal de sección, no de estado.

### Named Rules
**The Two-Face Rule.** Montserrat y Poppins son las únicas dos voces del sitio. No se introduce un serif editorial, ni un monospace decorativo, ni un sistema display alternativo. Si un artículo necesita código, el `<code>` usa Poppins con `font-size: 0.9em` y fondo sutil — la monotonía tipográfica es el precio que se paga por no gritar.

## Layout

El blog es una columna angosta de lectura sobre un sistema de grid ancho para el listado.

- **Container del listado:** `max-width: 1100px`, padding horizontal `1.5rem`.
- **Hero:** `max-width: 900px`, padding vertical `8rem 1.5rem 3rem` (en mobile se reduce a `6rem` arriba).
- **Columna del post:** `max-width: 760px`, padding vertical `7rem 1.5rem 2rem`. Es la única columna del sitio con medida verdaderamente editorial.
- **Grid del listado:** `grid-template-columns: repeat(auto-fill, minmax(290px, 1fr))` con `gap: 1.75rem`. Sin breakpoint fijo — el grid se rearma solo entre 290px y el container.
- **Featured card:** `grid-template-columns: 1.1fr 1fr`, dos columnas lado a lado. Bajo 640px se apila en una sola columna (`grid-template-columns: 1fr`).
- **Breakpoint único:** `640px`. Solo mobile. Sin tablet intermedio — la decisión es que el sitio se ve bien entre 360px y 1440px sin escalas intermedias.

**Rhythm:** el espaciado sigue una escala de 4px (xs=4, sm=8, md=16, lg=24, xl=32, xxl=48). Las cards respiran con `gap: 1.75rem` (28px), el contenido del post con `margin-bottom: 1.1rem` entre párrafos.

## Elevation & Depth

El sistema **no usa sombras estructurales**. La profundidad se construye con capas tonales:

- Fondo base: `surface-tinta` (`#121212`).
- Cards y filtros: `rgba(255, 255, 255, 0.04)` sobre el fondo (capa sutil).
- Hover en cards: borde pasa a `rgba(200, 155, 60, 0.4)` (≈ tinte del ámbar) **y** aparece una sombra suave `box-shadow: 0 18px 40px rgba(0, 0, 0, 0.35)` o `0 22px 50px rgba(0, 0, 0, 0.4)` para el featured card.

Es decir: en reposo, **flat-by-default**. La sombra aparece como respuesta al estado, no como base.

### Shadow Vocabulary
- **Hover ambient** (`box-shadow: 0 18px 40px rgba(0, 0, 0, 0.35)`): card regular al hover. Sombra baja, suave, eleva la card 4px (`translateY(-4px)`).
- **Hover ambient large** (`box-shadow: 0 22px 50px rgba(0, 0, 0, 0.4)`): featured card al hover. Igual idea, radio más generoso.

### Named Rules
**The Flat-By-Default Rule.** Las superficies son planas en reposo. La sombra aparece **solo** como respuesta al hover (y al foco del select del filtro). Nada más. Sin doble elevación, sin borde + sombra simultáneos sobre el mismo elemento — sería la tarjeta fantasma.

## Shapes

- **Cards:** radio de 14px (regular) y 16px (featured). Sin borde + sombra combinado.
- **Chips / tags:** pill (`border-radius: 999px`). Padding horizontal generoso (`0.25rem 0.7rem`) para que el tag no se lea como un botón.
- **Inputs (select):** radio 8px.
- **Code inline:** radio 4px.
- **Code blocks (pre):** radio 8px.
- **Cover images:** sin clipping geométrico — la imagen se sirve tal cual con `object-fit: cover`. La imagen manda.

## Components

### Buttons
- **Shape:** radio 8px.
- **Primary:** ámbar de marca sobre tinta, peso 600, padding `0.6rem 1.25rem`. Usado en CTAs del admin y en el simulador.
- **Ghost:** transparente con borde tenue, color de texto neutro. Para acciones secundarias.
- **Hover / Focus:** oscurecimiento de fondo + transición de 0.2s. Focus con outline explícito (`outline: none` + `box-shadow` de halo en ámbar para el select).

### Chips / Tags
- **Style:** fondo `border-sutil`, texto `text-atenuado`, pill radius.
- **State:** son estáticos en la superficie pública del blog (no son filtros reales). En el admin, los chips son interactivos.
- **Inconsistencia detectada:** los tags visibles en cards y post son `<span>` sin handler — se ven clicables pero no lo son. Resolución pendiente.

### Cards / Containers
- **Corner Style:** 14px (card regular), 16px (featured).
- **Background:** `rgba(255, 255, 255, 0.04)` sobre tinta.
- **Shadow Strategy:** flat en reposo, sombra suave al hover.
- **Border:** `border: 1px solid rgba(255, 255, 255, 0.08)` en reposo; pasa a `rgba(200, 155, 60, 0.4)` al hover.
- **Internal Padding:** `1.25rem 1.25rem 1.5rem` en el body de la card regular; `2rem 2.25rem` en el featured.

### Inputs / Fields
- **Select (filtro del blog):** fondo `rgba(255, 255, 255, 0.05)`, borde `border-medio`, radio 8px, chevron SVG inline en ámbar.
- **Focus:** halo ámbar `box-shadow: 0 0 0 3px rgba(200, 155, 60, 0.15)` + cambio de borde a ámbar.
- **Option items:** fondo `#16161a`, texto blanco (resuelve el contraste dentro del dropdown del navegador).

### Navigation
- **Barra superior (`.nav`):** logo a la izquierda, botón hamburguesa a la derecha. Sin fondo sólido — flotante sobre el contenido.
- **Menú overlay (`#menuOverlay`):** reveal circular que crece desde el botón. Contiene los 5 enlaces principales: Inicio, Sobre Nosotros, Simulador IA, Admin, Contacto.
- **Floating social:** botón fijo en la esquina inferior derecha que se expande para mostrar Facebook / Instagram / TikTok. Toggle con `aria-label="Ver redes sociales"` — pendiente: emitir `aria-expanded`.

### Markdown Post Body
- **Prose column:** 760px, lh 1.75, fuente Poppins.
- **Headings dentro del post:** Montserrat, `margin-top: 2rem; margin-bottom: 0.75rem`.
- **Blockquote:** borde izquierdo 3px en ámbar, texto en cursiva, color `text-atenuado`. Convención consistente con el resto del sitio.
- **Code:** inline `rgba(255, 255, 255, 0.08)` + radio 4px; blocks con `rgba(255, 255, 255, 0.06)` + radio 8px + scroll horizontal.
- **Links dentro del post:** color ámbar, subrayados.

## Do's and Don'ts

### Do:
- **Do** mantener el blog dark-only. No añadir modo claro.
- **Do** respetar `prefers-reduced-motion` para las partículas y los `transform` de hover. Las cards pueden seguir reaccionando al hover sin movimiento.
- **Do** sanitizar todo el Markdown con DOMPurify antes de insertarlo en el DOM. Es la regla anti-XSS del proyecto y es no-negociable.
- **Do** usar `aria-live` solo en regiones que cambian con el usuario (errores, estado de carga), **no** en contenedores que reciben la lista completa (re-anuncia todo).
- **Do** escribir el texto de cara al usuario en español. Sin excepciones.

### Don't:
- **Don't** introducir un segundo color de acento vivo. El ámbar de marca es único.
- **Don't** añadir un eyebrow o kicker sobre los headings. La banlist del craft-floor es absoluta; el heading carga su propio peso.
- **Don't** usar texto con gradiente. El énfasis se gana con peso o tamaño, no con un degradado decorativo.
- **Don't** apilar border + sombra sobre el mismo elemento en reposo. La sombra aparece solo al hover.
- **Don't** dejar el blog con sus variables `--accent` / `--text-primary` / `--text-muted` desconectadas de `:root`. Resolver antes de añadir cualquier nueva superficie (próxima fase).
- **Don't** publicar contenido del blog sin excerpt real ni cover propio. La fase actual del blog tiene excerpt = byline (`"Por Gustavo Martinez."`) en 6 de 6 posts publicados — un bug sistémico del editor que hay que arreglar antes de la próxima ronda.
- **Don't** anidar elementos interactivos (anchor dentro de un article clickable). El featured card tiene `<a class="blog-featured__cta">` dentro de un `<article>` con handler `click` — actualmente dispara la navegación dos veces.

### Pendiente para la próxima fase (deferred intent)
- **Editorial voice:** el blog no dice "Puebla" ni enlaza con los 5 servicios de la agencia. Cuando aterrice la voz específica de RG, debe vivirse en el hero copy, el byline, el CTA al pie del post y el footer del blog. Por ahora, contenido genérico.
- **Token unification:** resolver el drift entre `blog.css` y `index.css`. Decidir un acento canónico (`--accent-color: #f4a71c` ámbar naranja) y migrar el blog a usarlo.
- **Featured = curated:** introducir un flag real `featured: boolean` en `posts`, o relabelar "Destacado" como "Más reciente".
- **Bottom of post:** añadir `Publicado por · [N] min de lectura`, dos posts relacionados (por tag overlap), y un CTA suave a `contacto.html` / `simulador-servicios.html`. Es el real estate de mayor conversión del blog y está vacío.
