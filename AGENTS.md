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
├── css/
│   ├── index.css               # Estilos globales, variables CSS, nav, footer, transiciones zoom, hero
│   ├── contacto.css            # Estilos específicos del formulario y vista de contacto
│   ├── nosotros.css            # Estilos para secciones sobre nosotros y filosofía
│   └── simulador.css           # Estilos del simulador, tarjetas de resultados y loader
├── js/
│   ├── index.js                # Control del hero SVG, animaciones zoom entre pantallas, panel de redes
│   └── particles.js            # Configuración de partículas interactivas de fondo
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

---

## 🔄 Componentes Compartidos (Mantener en Sincronía)

Los siguientes bloques HTML/CSS/JS están replicados en las 4 páginas y **deben mantenerse idénticos** al realizar modificaciones:

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

