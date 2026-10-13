# Cambios — RG Gestión de Marcas

Archivos a modificar: `index.html` e `index.css`.
**No modificar `js/index.js`** (ya se revisó y no necesita cambios).

---

## Tarea 1: Homologar el tamaño del zoom en "Gestión de Redes Sociales"

### Problema (confirmado)
- Las imágenes de cada cliente se generan en `js/index.js` (objeto `redesProyectos`) con la clase `zoom-on-hover`.
- Al pasar el mouse, el JS crea un lightbox (`.img-lightbox` > `img.img-lightbox__img`) y le asigna el `src` de la imagen.
- En `index.css`, `.img-lightbox__img` solo tiene `max-width` y `max-height`, sin ancho ni alto fijo. Por eso la imagen se muestra al tamaño natural del archivo.
- Las miniaturas en la galería (`.redes-project__gallery img`) ya son todas cuadradas (`aspect-ratio: 1/1`), así que el problema está solo en el lightbox.
- Las imágenes de Enprotech y El Cielo Dental tienen menos resolución que las de Grupo Bapa, y por eso se ven más pequeñas al agrandarse.

### Archivo
`index.css` (bloque `.img-lightbox__img`, cerca de la línea 2713)

### Código actual

```css
.img-lightbox__img {
    max-width: 85vw;
    max-height: 85vh;
    object-fit: contain;
    border-radius: 8px;
    transform: scale(0.92);
    transition: transform 0.3s ease;
}
```

### Código nuevo
Reemplazar **solo** `max-width` y `max-height` por `width` y `height`:

```css
.img-lightbox__img {
    width: min(85vw, 85vh, 900px);
    height: min(85vw, 85vh, 900px);
    object-fit: contain;
    border-radius: 8px;
    transform: scale(0.92);
    transition: transform 0.3s ease;
}
```

### Reglas
- No tocar `.img-lightbox`, `.img-lightbox.active` ni `.img-lightbox.active .img-lightbox__img`.
- No modificar el JS ni el HTML en esta tarea.
- Objetivo: todas las imágenes ampliadas (Enprotech, El Cielo Dental, Grupo Bapa, etc.) deben verse del mismo tamaño en pantalla.

### Verificación
1. Abrir "Gestión de Redes Sociales" y elegir un cliente.
2. Hacer hover sobre una imagen de Grupo Bapa, una de Enprotech y una de El Cielo Dental.
3. Las tres deben ampliarse exactamente al mismo tamaño.

### Revisión de resolución (solo reportar, no modificar archivos)
Listar el ancho × alto en píxeles de estas carpetas:

| Cliente | Carpeta |
|---|---|
| Grupo Bapa | `./img/redesSociales/proyecto2/` |
| Enprotech | `./img/redesSociales/proyecto4/` |
| El Cielo Dental | `./img/redesSociales/proyecto5/` |

Si las de Enprotech o El Cielo Dental tienen menos de ~1000 px por lado, se verán un poco suaves al ampliarse. Opciones:
- Reemplazarlas por versiones de mayor resolución.
- O bajar `900px` a `700px` en el CSS.

---

## Tarea 2: Cambiar el texto del inicio

### Archivo
`index.html`, línea 191 (sección `quote-break`)

### Código actual

```html
<h2 class="slogan">"Estrategias que inspiran"</h2>
```

### Código nuevo

```html
<h2 class="slogan">"Estrategias que inspiran 10 años de experiencia"</h2>
```

### Reglas
- No cambiar el `<span>RG GESTIÓN DE MARCAS</span>` de abajo.
- No cambiar los `<meta>` de description ni Open Graph.
- Revisar en móvil (≈390 px) que el título más largo se acomode en varias líneas sin desbordarse. Si se corta, ajustar el `font-size` solo en `.quote-break h2` dentro del `@media` móvil (hoy es `1.8rem`).

---

## Reglas generales para el agente
- Cambiar solo lo indicado, sin refactorizar ni tocar otras secciones.
- Al terminar, listar los archivos modificados y las líneas cambiadas.
