# MEDIOUSAO 🇩🇴

Marketplace de moda usada y nueva para la **zona inicial de Bonao, República Dominicana**.

## Estado del proyecto

- Zona de servicio: **Bonao exclusivamente**.
- Catálogo filtrado por ciudad `Bonao`.
- Nuevos productos creados desde administración: `Bonao` automáticamente.
- Compras y reservas: `Bonao`.
- Delivery: requiere sector y dirección.
- Recogida personal: disponible como alternativa al delivery.
- Reservas: 24 horas mediante función SQL atómica.
- Estructura preparada para ampliar a otras ciudades posteriormente.

## Archivos

- `index.html` — aplicación web de MEDIOUSAO.
- `MEDIOUSAO_RESERVAS.sql` — cambios de base de datos y función de reservas de 24 horas.

## Configuración de Supabase

Antes de usar reservas y pedidos, abre el **SQL Editor de Supabase** y ejecuta `MEDIOUSAO_RESERVAS.sql`.

La aplicación utiliza una clave pública/publicable de Supabase en el navegador. **Nunca coloques una `service_role` key, contraseña de base de datos o secreto privado dentro de `index.html`.**

## Publicar en GitHub

### Opción A — desde GitHub.com

1. Crea un repositorio nuevo llamado `MEDIOUSAO`.
2. Mantén el repositorio como público si quieres usar GitHub Pages sin restricciones adicionales.
3. Sube `index.html`, `MEDIOUSAO_RESERVAS.sql` y este `README.md`.
4. En **Settings → Pages**, selecciona **Deploy from a branch**.
5. Elige la rama `main` y la carpeta `/ (root)`.
6. Guarda y espera a que GitHub Pages genere la dirección pública.

### Opción B — con Git

```bash
git init
git add .
git commit -m "Preparar MEDIOUSAO para Bonao"
git branch -M main
git remote add origin TU_REPOSITORIO
 git push -u origin main
```

## Seguridad

El acceso del administrador debe gestionarse mediante **Supabase Auth**. No guardes contraseñas de administrador directamente en el código ni en este repositorio.

Antes de poner la app en producción, revisa también las políticas **RLS (Row Level Security)** de las tablas de Supabase para asegurar que clientes anónimos solo puedan realizar las operaciones que realmente necesita la aplicación.

## Próximos pasos recomendados

1. Probar catálogo, compra y reserva en Supabase.
2. Configurar correctamente RLS y el usuario administrador.
3. Publicar esta versión en GitHub/GitHub Pages.
4. Crear el paquete Android (`.aab`) para Google Play.
5. Más adelante agregar nuevas ciudades sin cambiar la arquitectura de la app.

<!-- repair-trigger -->
