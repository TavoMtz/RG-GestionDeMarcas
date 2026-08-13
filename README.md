# RG Gestión de Marcas — Sitio Web

Sitio web corporativo de **RG Gestión de Marcas**, agencia de marketing digital con sede en Puebla, México. Muestra los servicios de la agencia, su portafolio, un simulador de servicios con IA y un formulario de contacto.

## Tecnologías

- HTML5 + CSS3 + JavaScript vanilla (sin frameworks ni bundlers)
- Funciones serverless para el backend (Netlify Functions, con duplicados para Vercel en `api/`)
- APIs externas: **Anthropic Claude** (simulador IA) y **Resend** (correo del formulario)

## Estructura

```
├── index.html / nosotros.html / simulador-servicios.html / contacto.html
├── css/          Estilos por página
├── js/           Lógica del frontend (index.js, particles.js)
├── img/          Imágenes y portafolio por servicio
├── netlify/functions/   Funciones serverless activas (CommonJS)
├── api/                  Duplicados Vercel (ESM, no usados por el frontend actualmente)
└── netlify.toml          Configuración de Netlify
```

## Puesta en marcha

No requiere instalación ni build. Solo abre `index.html` en el navegador o sirve la carpeta estáticamente.

```bash
# Sin dependencias; por ejemplo:
npx serve .
```

## Contacto

- Web: https://rg-gestiondemarcas.com
- Correo: contacto@rg-gestiondemarcas.com
- Teléfono: +52 222 446 7947
