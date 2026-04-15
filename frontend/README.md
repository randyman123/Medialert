# MediAlert Frontend

Frontend React + Vite preparado para correr en local y para deploy como SPA en Vercel o Cloudflare Pages.

## Variables de entorno

Este frontend consume la URL del backend desde `VITE_API_URL`.

Si la variable no está definida, la app usa este fallback local:

```env
VITE_API_URL=http://localhost:3000
```

Ejemplo de `.env.local` para desarrollo:

```env
VITE_API_URL=http://localhost:3000
VITE_WHATSAPP_NUMBER=56912345678
```

Ejemplo para demo:

```env
VITE_API_URL=https://tu-backend-demo.onrender.com
VITE_WHATSAPP_NUMBER=56912345678
```

## Desarrollo local

```bash
npm install
npm run dev
```

## Build de producción

```bash
npm run build
```

## Deploy SPA

El proyecto usa `BrowserRouter`, por lo que necesita fallback de SPA en hosting:

- `vercel.json` resuelve todas las rutas hacia `index.html`.
- `public/_redirects` hace lo mismo para plataformas compatibles como Cloudflare Pages.

## Deploy en Vercel

1. Crear un nuevo proyecto en Vercel importando este repositorio.
2. Configurar `Root Directory` como `frontend`.
3. Verificar estos valores:

```text
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

4. En `Environment Variables`, agregar:

```text
VITE_API_URL=https://tu-backend-demo.com
VITE_WHATSAPP_NUMBER=56912345678
```

5. Hacer deploy.

## Apuntar al backend demo

Para que el frontend de portfolio consuma un backend remoto:

1. Publicar el backend demo.
2. Copiar su URL pública base, por ejemplo `https://mi-backend-demo.com`.
3. Configurar `VITE_API_URL` con esa URL en Vercel.
4. Volver a desplegar si Vercel no lo hace automáticamente.

Importante:

- No usar slash final en la URL, por ejemplo `https://mi-backend-demo.com`.
- El backend debe permitir CORS desde el dominio del frontend en Vercel.
