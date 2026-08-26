# AGENTS.md — RG Gestión de Marcas

Sitio web estático en español para **RG Gestión de Marcas** (agencia de marketing digital en Puebla, México).
Desarrollo vanilla sin frameworks, sin bundlers, sin dependencias de Node en frontend y sin paso de compilación (HTML5, CSS3, Vanilla JS). Todo el texto de cara al usuario debe permanecer en español.

---

## 🛠️ Comandos y Ejecución Local

- **Frontend / Sitio estático**: No requiere `npm install` ni `npm build`. Para previsualizar, abrir directamente `index.html` en el navegador o usar cualquier servidor estático:
  ```bash
  npx serve .
  # o con Python:
  python -m http.server 8000
  ```
- **Tests**: `npm test` es solo un stub que sale con código 1.
- **Funciones Serverless en local**: El formulario de contacto y el simulador de IA requieren variables de entorno (`RESEND_API_KEY`, `DEEPSEEK_API_KEY`). Para probar el backend completo en local se requiere Netlify CLI (`npx netlify dev`).

---

## 📁 Estructura del Proyecto

```
├── index.html                  # Página principal (Hero interactivo SVG, portafolio y pantallas de servicios)
├── nosotros.html               # Sobre Nosotros (filosofía, misión, visión, valores, propuesta)
├── simulador-servicios.html    # Simulador interactivo con IA (DeepSeek) y exportación a PDF/WhatsApp
├── contacto.html               # Formulario de contacto con envío vía Resend y datos de contacto
├── blog.html                   # Blog público: lista de posts publicados + vista individual (Markdown + Supabase)
├── admin.html                  # Panel de admin del blog (login + editor CRUD; requiere staff autenticado)
├── css/
│   ├── index.css               # Estilos globales, variables CSS, nav, footer, transiciones zoom, hero
│   ├── contacto.css            # Estilos específicos del formulario y vista de contacto
│   ├── nosotros.css            # Estilos para secciones sobre nosotros y filosofía
│   ├── simulador.css           # Estilos del simulador, tarjetas de resultados y loader
│   ├── blog.css                # Estilos específicos del blog público (cards, post, filtros)
│   └── admin.css               # Estilos del panel de admin (login, editor, listado)
├── js/
│   ├── index.js                # Control del hero SVG, animaciones zoom entre pantallas, panel de redes
│   ├── particles.js            # Configuración de partículas interactivas de fondo
│   ├── blog-config.js          # Configuración pública de Supabase (URL + anon key) para el blog
│   ├── blog.js                 # Lógica del blog público (listado + post individual)
│   └── admin.js                # Lógica del admin (auth, CRUD de posts, tags, uploads)
├── db/
│   ├── blog_schema.sql         # Esquema Postgres + RLS + bucket Storage (idempotente, para Supabase)
│   └── README.md               # Guía de despliegue del blog en Supabase
├── img/                        # Recursos gráficos, logotipos de clientes, capturas y favicon
├── source/                     # Recursos fuente adicionales (PDFs de portafolio)
├── netlify/
│   └── functions/
│       ├── analyze.js          # Función Netlify activa: Proxy a DeepSeek API (CommonJS)
│       └── contact.js          # Función Netlify activa: Envío de emails con Resend (CommonJS)
├── api/
│   ├── analyze.js              # Duplicado ESM para Vercel (export default)
│   └── contact.js              # Duplicado ESM para Vercel (export default)
├── netlify.toml                # Configuración de Netlify y redirección /api/* -> /.netlify/functions/:splat
├── package.json                # Metadatos del proyecto
└── README.md                   # Documentación general del repositorio
```

---

## 🏛️ Arquitectura y Páginas

### 1. `index.html` (Home interactivo multipantalla)
- **Hero SVG animado**: El logotipo SVG (`#main-svg`) contiene esferas interactivas (`.sphere-group`) asociadas a cada uno de los 5 servicios.
- **Transición Zoom (Single-Page Feel)**: Al hacer clic en un servicio, se oculta `#home-screen` y se despliega con animación zoom la pantalla correspondiente (`#sec-investigacion`, `#sec-branding`, `#sec-web`, `#sec-redes`, `#sec-cursos`).
- **Mapeo de Secciones en JS (`js/index.js`)**:
  - `'Investigación de mercados'` → `#sec-investigacion`
  - `'Naming, diseño y producción'` → `#sec-branding`
  - `'Diseño Web'` → `#sec-web`
  - `'Gestión de redes sociales'` → `#sec-redes`
  - `'Cursos y capacitación'` → `#sec-cursos`
- **Portafolio Interactivo**:
  - Grid de logos interactivo con flip cards (`.ndp-logo-card`).
  - Panel dinámico para proyectos de redes (`#redes-project-panel`) con galería e integración de YouTube Shorts vía `<lite-youtube>`.
- **Marquesina de Clientes**: Carrusel infinito de logotipos de clientes (`.carousel_container`).

### 2. `nosotros.html` (Sobre Nosotros)
- Presentación de la agencia, pilares, misión, visión, valores y propuesta de valor, junto con la marquesina de clientes y llamada a la acción.

### 3. `simulador-servicios.html` (Simulador con IA)
- Flujo interactivo que recopila datos del negocio del cliente.
- Llama a `/api/analyze` (DeepSeek) para generar diagnóstico y recomendaciones de servicios.
- Generación de PDF descargable del diagnóstico en el navegador utilizando `jsPDF`.
- Envío y cotización directa por WhatsApp con mensaje preformateado.

### 4. `contacto.html` (Contacto)
- Formulario de contacto conectado a `/api/contact` (Resend).
- Notificaciones de éxito/error en tiempo real en la UI.
- Información de contacto directa (correo, WhatsApp, ubicación física en Puebla).

### 5. `blog.html` (Blog público)
- Lista de posts publicados (cards con portada, título, resumen, tags y fecha).
- Vista individual: `blog.html?slug=<slug>` renderiza el Markdown del post (`marked`) y lo sanitiza con `DOMPurify` antes de insertarlo en el DOM.
- Lectura vía cliente Supabase con `anon key`; la separación lectura/escritura se aplica en el servidor con **Row Level Security**.
- Datos leídos: `posts`, `tags` con su tabla pivote `post_tags`.

### 6. `admin.html` (Panel de administración del blog)
- Login con email/contraseña mediante Supabase Auth (`signInWithPassword`). El registro público está deshabilitado; las cuentas de staff se crean manualmente desde el panel de Supabase.
- **Cambio de contraseña obligatorio en el primer inicio**: el panel consulta `user_metadata.must_change_password`. Por defecto, todo usuario nuevo recibe `true` automáticamente gracias al trigger `force_password_change_default` definido en `db/blog_schema.sql`. Si el flag está activo, el panel muestra la vista `#adminPasswordChange` y bloquea el resto del admin hasta que el usuario establezca una nueva contraseña (mínimo 8 caracteres y confirmación obligatoria). Al guardar, se llama a `sb.auth.updateUser({ password, data: { must_change_password: false } })` y se muestra el panel. El flag persiste mientras esté en `true`, por lo que el cambio se vuelve a forzar si el usuario cierra el navegador sin completarlo.
- Editor CRUD de posts:
  - Título, slug (auto-generado desde el título, editable).
  - Resumen, contenido en Markdown, estado (Borrador / Publicado).
  - Subida de portada al bucket Storage `blog-covers` o URL manual.
  - Tags (coma-separados, autos-creados).
  - Eliminar post (cascade).
- Listado de todos los posts con estado, slug, fecha de actualización, acceso a edición y vista previa pública.
- Toda escritura pasa por RLS: sólo usuarios con rol `authenticated` pueden modificar las tablas del blog.

---

## 🔄 Componentes Compartidos (Mantener en Sincronía)

Los siguientes bloques HTML/CSS/JS están replicados en las 6 páginas (`index`, `nosotros`, `simulador-servicios`, `contacto`, `blog`, `admin`) y **deben mantenerse idénticos** al realizar modificaciones:

1. **Barra de Navegación (`.nav`)**: Logo, botón hamburguesa (`#menuBtn`) y menú desplegable circular (`#menuOverlay`).
2. **Pie de Página (`footer.footer`)**: Enlaces de navegación, lista de servicios, datos de contacto y copyright.
3. **Botón Flotante de Redes (`#floatingSocial`)**: Botón expandible con enlaces directos a Facebook, Instagram y TikTok.
4. **Fondo de Partículas (`#particles-js`)**: Contenedor `#particles-js` con scripts `particles.js` + `js/particles.js`.
5. **Marquesina de Logos (`.carousel_container`)**: Ticker infinito de clientes compartido entre páginas.

---

## ⚡ Backend y Funciones Serverless

- **Plataforma Activa**: Netlify (`netlify.toml` redirige `/api/*` hacia `/.netlify/functions/:splat`).
- **Regla de Doble Implementación**: Cada función existe en dos formatos y **ambos deben mantenerse sincronizados**:
  - `netlify/functions/*.js`: Formato CommonJS (`exports.handler`), activo en producción.
  - `api/*.js`: Formato ESM (`export default`), compatible con despliegues en Vercel.
- **Endpoints**:
  - `POST /api/analyze`: Conexión segura con DeepSeek API (`https://api.deepseek.com/chat/completions`).
  - `POST /api/contact`: Envío de correos HTML estilizados con plantilla corporativa a través de Resend (`https://api.resend.com/emails`).
- **Variables de Entorno** (configuradas en el panel del hosting, **nunca** commitear `.env`):
  - `RESEND_API_KEY`: Clave de API de Resend para envío de correos.
  - `DEEPSEEK_API_KEY`: Clave de API de DeepSeek para el simulador inteligente.

### Base de datos del blog — Supabase
- El blog usa **Supabase** como backend de datos. No requiere claves secretas en el frontend: la `anon key` es pública y se declara en `js/blog-config.js`.
- Las operaciones de lectura/escritura y la autenticación del blog se hacen directamente desde el navegador con `@supabase/supabase-js` (cargado por CDN). **No** se exponen las claves `service_role` en el frontend.
- La separación "todos leen, sólo autenticados escriben" se aplica con **Row Level Security (RLS)** definido en `db/blog_schema.sql`. Ver guía de despliegue en `db/README.md`.
- Configuración local (no commitear):
  - `SUPABASE_URL` y `SUPABASE_ANON_KEY` se copian desde *Supabase → Settings → API* al archivo `js/blog-config.js`.

---

## 🛡️ Convenciones y Reglas de Código

1. **Seguridad y Sanitización (Anti-XSS)**:
   - Todo dato ingresado por el usuario que se inserte en el DOM o en la plantilla de correo debe sanitizarse estrictamente con `escapeHtml` / `escapeHTML`. Nunca usar `innerHTML` con datos sin escapar.
2. **Catálogo Canónico de Servicios**:
   - `investigacion` → Investigación de Mercados
   - `naiming` → Naming, Diseño y Producción
   - `web` → Diseño Web
   - `redes` → Gestión de Redes Sociales
   - `cursos` → Cursos y Capacitación
   - Mantener siempre alineados los `<select>` de los formularios y el mapeo en `contact.js`.
3. **Datos de Contacto Oficiales**:
   - **Correo canónico**: `contacto@rg-gestiondemarcas.com`
   - **Remitente Resend**: `RG Gestión de Marcas <noreply@rg-gestiondemarcas.com>`
   - **Teléfono / WhatsApp**: `+52 222 446 7947` (`WHATSAPP_NUMBER = '5212224467947'`)
   - **Ubicación**: Puebla, Pue., México
4. **Librerías Externas (CDNs)**:
   - FontAwesome 6.5.1
   - Google Fonts (Montserrat & Poppins)
   - Particles.js 2.0.0
   - jsPDF 2.5.1
   - `<lite-youtube>` para incrustación ligera y rápida de videos/Shorts de YouTube.
   - `marked` — renderizado de Markdown en el blog público (`blog.html`).
   - `DOMPurify` — sanitización obligatoria del HTML producido por `marked` antes de insertarlo en el DOM (cumple la regla anti-XSS del punto 1).
   - `@supabase/supabase-js` — cliente del blog (lectura pública + auth/admin del panel).
5. **Blog — Reglas adicionales**:
   - Toda portada subida pasa al bucket `blog-covers`; la URL pública resultante se guarda en `posts.cover_image`.
   - Los slugs se generan desde el título (slugify en `js/admin.js`) y deben ser únicos en `public.posts`.
   - El slug define la URL pública del post: `blog.html?slug=<slug>`.
6. **Admin — Cambio de contraseña obligatorio**:
   - Por defecto, todo usuario nuevo fuerza el cambio de contraseña en su primer inicio. El script `db/blog_schema.sql` instala un trigger `BEFORE INSERT` sobre `auth.users` (`force_password_change_default`) que escribe `must_change_password = true` en `raw_user_meta_data` si no se especificó un valor explícito. **No hace falta configurar metadata al crear cuentas.**
   - Excepciones: si al crear un usuario se define explícitamente `must_change_password: false` en la metadata, ese valor se respeta y el usuario NO será forzado a cambiar.
   - Tras cambiar la contraseña, el flag se limpia desde el propio navegador (`sb.auth.updateUser` con `data`). Para volver a forzar el cambio a un usuario existente, usar *Edit user → User metadata* o el snippet SQL documentado en `db/blog_schema.sql` / `db/README.md`.

