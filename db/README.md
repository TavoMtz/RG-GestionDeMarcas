# Blog — Base de datos (Supabase)

Este directorio contiene el script SQL para crear la estructura de la base de
datos del blog en Supabase.

## Archivos

- `blog_schema.sql` — Tablas, índices, triggers, políticas RLS, bucket de
  Storage y notas operativas. El script es idempotente.

## Despliegue

1. Crear un proyecto en <https://supabase.com>.
2. Abrir **SQL Editor**, pegar el contenido de `blog_schema.sql` y ejecutar.
3. Crear las cuentas de staff manualmente desde
   **Authentication → Users → Add user → Create new user** (email + password).
   El script SQL crea un trigger (`force_password_change_default`) que
   añade automáticamente el flag `must_change_password = true` en la
   metadata de cada usuario nuevo, por lo que el panel admin forzará el
   cambio de contraseña en el primer inicio de sesión **sin necesidad de
   configurar nada manualmente**.
   El registro público debe quedar **deshabilitado**.
   Si necesitas volver a forzar el cambio a un usuario existente, pegar
   el siguiente JSON en *Edit user → User metadata* o ejecutar desde el
   SQL editor:
   ```sql
   update auth.users
     set raw_user_meta_data = raw_user_meta_data
       || '{"must_change_password": true}'::jsonb
     where email = 'staff@rg-gestiondemarcas.com';
   ```
   Si necesitas excluir a un usuario concreto del cambio obligatorio,
   define explícitamente el flag como `false` en su metadata:
   ```json
   { "must_change_password": false }
   ```
4. En **Authentication → URL Configuration**, registrar el dominio del sitio
   (ej. `https://rg-gestiondemarcas.com`) como **Site URL** y, si se usan
   previews locales, agregar la URL local también.
5. Copiar `Project URL` y `anon public key` desde **Settings → API** al
   archivo `js/blog-config.js`.

No se ejecuta ninguna migración automática; el flujo es manual y reproducible.

## Migraciones

`blog_schema.sql` es idempotente y, al inicio, incluye los `DROP TABLE` de
tablas obsoletas (p. ej. `post_categories` y `categories`, eliminadas por ser
redundantes con los tags). Para aplicar una migración en una base ya desplegada,
vuelve a ejecutar el script completo en **SQL Editor**.
