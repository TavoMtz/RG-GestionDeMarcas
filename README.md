# RG Gestión de Marcas — Sitio Web

Sitio web corporativo de **RG Gestión de Marcas**, agencia de marketing digital con sede en Puebla, México. Muestra los servicios de la agencia, su portafolio, un simulador de servicios con IA, un formulario de contacto y un blog con panel de administración.

## Tecnologías

- HTML5 + CSS3 + JavaScript vanilla (sin frameworks ni bundlers)
- Funciones serverless para el backend (Netlify Functions, con duplicados para Vercel en `api/`)
- APIs externas: **DeepSeek** (simulador IA) y **Resend** (correo del formulario)
- **Supabase** (Postgres + Auth + Storage) como base de datos del blog
- Librerías vía CDN: `marked` (Markdown), `DOMPurify` (anti-XSS), `@supabase/supabase-js`

## Blog

El blog es público para lectura y de CRUD restringido al equipo de staff.

- **Lectura**: cualquier visitante ve los posts publicados.
- **Escritura (CRUD)**: sólo usuarios autenticados. Las cuentas se crean manualmente desde Supabase. El registro público está deshabilitado.
- **Tags**: tabla independiente con relación many-to-many con los posts (`post_tags`).
- **Portadas**: se suben al bucket `blog-covers` de Supabase Storage.

Ver instrucciones completas en `db/README.md` y el esquema en `db/blog_schema.sql`.

## Puesta en marcha

No requiere instalación ni build. Solo abre `index.html` en el navegador o sirve la carpeta estáticamente.

```bash
# Sin dependencias; por ejemplo:
npx serve .
```

## Configuración

`js/blog-config.js` contiene `supabaseUrl` y `supabaseAnonKey`. Reemplazar por los valores reales del proyecto Supabase antes de desplegar.

## Contacto

- Web: https://rg-gestiondemarcas.com
- Correo: contacto@rg-gestiondemarcas.com
- Teléfono: +52 222 446 7947
