# Configuración del Sistema de Envío de Correo

Guía paso a paso para activar el formulario de contacto usando **Resend** como proveedor de email y **Vercel** como plataforma de deploy.

---

## Requisitos previos

- Acceso al panel DNS de tu dominio `rg-gestiondemarcas.com`
- Acceso al dashboard de Vercel del proyecto
- Cuenta de Git con acceso al repositorio

---

## Paso 1 — Crear cuenta en Resend

1. Ve a [resend.com](https://resend.com) → **Sign up**
2. Completa el registro con tu email de trabajo
3. Confirma tu cuenta desde el correo de verificación

---

## Paso 2 — Verificar el dominio `rg-gestiondemarcas.com`

> Este paso es obligatorio. Sin él, Resend no permite enviar desde `@rg-gestiondemarcas.com`.

1. En el dashboard de Resend, ve a **Domains** → **Add Domain**
2. Ingresa: `rg-gestiondemarcas.com`
3. Resend te mostrará una serie de registros DNS para agregar. Normalmente son:
   - **SPF** (tipo `TXT`)
   - **DKIM** (tipo `TXT` o `CNAME`, puede ser más de uno)
   - **DMARC** (tipo `TXT`, opcional pero recomendado)
4. Agrega esos registros en el panel de tu proveedor DNS (GoDaddy, Cloudflare, Namecheap, etc.)
5. Haz clic en **Verify** en Resend

> **Tiempo de propagación DNS:** entre 15 minutos y 48 horas. Resend reintenta la verificación automáticamente.

---

## Paso 3 — Obtener la API Key

1. En Resend, ve a **API Keys** → **Create API Key**
2. Nombre sugerido: `rg-contact-form`
3. Permisos: `Sending access`
4. Haz clic en **Add** y **copia la clave inmediatamente** — solo se muestra una vez
   - Tiene el formato: `re_xxxxxxxxxxxxxxxxxxxx`

---

## Paso 4 — Configurar la variable de entorno en Vercel

1. Ve al [dashboard de Vercel](https://vercel.com/dashboard) → selecciona el proyecto
2. **Settings** → **Environment Variables**
3. Agrega la siguiente variable:

   | Key | Value | Entornos |
   |---|---|---|
   | `RESEND_API_KEY` | `re_xxxxxxxxxxxxxxxxxxxx` | Production, Preview |

4. Haz clic en **Save**

---

## Paso 5 — Hacer el deploy

El deploy se activa automáticamente al hacer push al repositorio:

```bash
git add .
git commit -m "Add email contact system"
git push
```

Vercel detecta el push y despliega en ~1-2 minutos.

Alternativamente, desde el dashboard de Vercel: **Deployments** → **Redeploy** (selecciona el último deploy).

---

## Paso 6 — Prueba de funcionamiento

1. Abre la página de contacto en producción
2. Llena todos los campos del formulario y haz clic en **Enviar mensaje**
3. Verifica que aparezca el banner verde de confirmación
4. Revisa la bandeja de entrada de `contacto@rg-gestiondemarcas.com`
5. Abre el correo recibido y comprueba que el diseño se ve correctamente
6. Haz clic en **Responder** — debe ir al email del cliente (reply-to), no a `noreply@`

---

## Troubleshooting

| Síntoma | Causa probable | Solución |
|---|---|---|
| Banner rojo "Servicio de email no configurado" | `RESEND_API_KEY` no está en Vercel | Agregar la variable en Settings → Env Vars y redeployar |
| Banner rojo con error 401 | API Key incorrecta o expirada | Verificar la clave en Resend → API Keys |
| Banner rojo con error 422 | Dominio no verificado en Resend | Completar la verificación DNS del Paso 2 |
| El correo llega pero va a spam | Falta configuración DMARC/DKIM | Asegurarse de haber agregado todos los registros DNS indicados por Resend |
| El formulario no responde | Error de red o función serverless caída | Revisar los logs en Vercel → Functions → contact |

---

## Estructura de archivos creados

```
api/
  contact.js        ← Función serverless (Vercel)
css/
  contacto.css      ← Estilos de feedback agregados al final
contacto.html       ← Script de submit agregado antes de </body>
SETUP-EMAIL.md      ← Este archivo
```

---

## Límites del plan gratuito de Resend

- **3.000 emails/mes**
- **100 emails/día**

Suficiente para el volumen esperado de un formulario de contacto de agencia.
