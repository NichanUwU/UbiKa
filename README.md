# UbiKa

UbiKa es una PWA mobile-first para descubrir comercios y productos locales de Villaflores, Chiapas. Incluye búsqueda por sinónimos, cotizador por WhatsApp, métricas de contacto, modo local de respaldo y recepción de solicitudes de comercios.

## Requisitos

- Node.js 20.19+ o 22.12+
- npm

## Desarrollo

```bash
npm install
npm run dev
```

## Comandos

```bash
npm run dev        # Servidor local
npm run typecheck  # Verificación de tipos TypeScript
npm run build      # Verificación de tipos y compilación PWA
npm run preview    # Previsualizar la compilación (incluye service worker)
```

## Configurar Supabase

1. Crea un proyecto en Supabase.
2. Copia `.env.example` a `.env` y completa las credenciales públicas del proyecto:

   ```dotenv
   VITE_SUPABASE_URL=https://<project-ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=<publishable-or-anon-key>
   ```

   La clave `anon`/publishable se distribuye al navegador; **nunca** pongas una `service_role` o clave secreta en variables `VITE_*`. RLS debe mantenerse habilitado.
3. En Supabase abre **SQL Editor**, ejecuta el contenido de [`supabase/schema.sql`](./supabase/schema.sql) y verifica que existan las tablas y políticas RLS.
4. Reinicia `npm run dev` después de crear o editar `.env`.
5. Agrega los negocios y productos públicos revisados mediante el panel de Supabase. Los registros de la interfaz de comerciantes se guardan como solicitudes pendientes en `merchant_submissions`; deben revisarse antes de publicarse en `businesses`.

Si las variables no existen, son inválidas o la API no está disponible, la app usa `src/data/mockData.ts`. Los clics sin conexión o hechos en datos ficticios se conservan localmente (hasta 500 eventos por navegador); las métricas de Supabase solo estarán disponibles para comercios con UUID reales. No se envían datos personales de clientes.

## Panel de comercios y fotos

El panel acepta registros y solicitudes de actualización. Con Supabase configurado, la solicitud queda pendiente de revisión; sin conexión se guarda en el navegador de ese dispositivo. La selección de un archivo de imagen ofrece una vista previa local; para adjuntar una foto al registro se requiere pegar una URL HTTPS pública. No se suben archivos a Supabase Storage desde esta versión.

Las políticas públicas solo permiten leer comercios/productos e insertar métricas y solicitudes pendientes. No se concede acceso anónimo para editar el catálogo ni para leer métricas o solicitudes. Para moderar y publicar solicitudes se requiere una sesión administrativa segura (fuera del navegador público). Como los envíos anónimos pueden recibir spam, agrega CAPTCHA o rate limiting en un endpoint/Edge Function antes de anunciar el formulario públicamente.

## PWA y modo sin conexión

El service worker precachea el app shell, guarda las imágenes de Unsplash con `StaleWhileRevalidate` y conserva respuestas públicas del catálogo con `NetworkFirst` y timeout corto. El catálogo también usa fallback local ante errores de red. La instalación requiere un navegador compatible y HTTPS (o localhost); en iOS la instalación se realiza desde **Compartir → Agregar a pantalla de inicio**.

## Arquitectura

```text
src/
├── components/       # Catálogo, formularios, instalación y avisos offline
├── data/mockData.ts  # Datos ficticios de respaldo
├── hooks/            # Estado de búsqueda, cotizador y carga inicial
├── lib/supabase.ts   # Cliente opcional y tipos de base de datos
├── services/api.ts   # Catálogo, solicitudes y métricas con fallback local
├── types/            # Tipos compartidos de dominio
└── utils/            # Búsqueda y enlaces de WhatsApp
supabase/schema.sql   # Tablas, índices, permisos y políticas RLS
```

**Importante:** los nombres, domicilios, teléfonos, precios e imágenes del catálogo de muestra son datos ficticios. Verifica y reemplaza esos datos antes de publicar la app o habilitar métricas reales.
