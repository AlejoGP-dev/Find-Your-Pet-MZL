# 🐾 Find Your Pet MZL

Plataforma comunitaria para reportar **mascotas perdidas y encontradas en Manizales**
después del sismo. Sin registro, gratis, pensada para el celular y con contacto directo
por WhatsApp.

Hecho con Next.js 16 (App Router) + Tailwind CSS 4 + Supabase. Listo para desplegar en Vercel.

---

## Qué hace

- Publicar un reporte de mascota **perdida** o **encontrada** en menos de un minuto.
- Foto (se comprime sola en el navegador), nombre, especie, raza, color, tamaño, sexo,
  barrio de Manizales, punto de referencia, fecha y señas particulares.
- Listado con filtros por tipo, especie y barrio + buscador por texto.
- Página propia para cada mascota, con enlace para compartir en WhatsApp y redes.
- Botón **"Escribir por WhatsApp"** con mensaje prellenado.
- Código de gestión para que quien publicó pueda marcar el reporte como resuelto.
- Sin cuentas ni contraseñas: en una emergencia la fricción mata la ayuda.

---

## 1. Correrlo en tu computador

```bash
npm install
npm run dev
```

Abre http://localhost:3000. Sin configurar Supabase la app arranca en **modo demo**:
funciona todo, pero los reportes se guardan en memoria y se pierden al reiniciar.

---

## 2. Conectar Supabase (gratis)

El plan gratuito alcanza de sobra: 500 MB de base de datos, 1 GB de fotos y 5 GB de
tráfico al mes. No pide tarjeta.

1. Entra a [supabase.com](https://supabase.com) → **New project**.
   - Region: `East US` o `South America (São Paulo)`.
   - Guarda la contraseña de la base de datos.
2. En el menú lateral abre **SQL Editor** → **New query**, pega todo el contenido de
   `supabase/esquema.sql` y dale **Run**. Eso crea la tabla `reportes` y el bucket
   público `fotos`.
3. Ve a **Project Settings → API** y copia:
   - **Project URL** → `SUPABASE_URL`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`
4. Crea el archivo `.env.local` en la raíz del proyecto:

   ```bash
   cp .env.example .env.local
   ```

   y pega tus dos valores.

5. Reinicia `npm run dev`. El aviso amarillo de "modo demo" desaparece.

> ⚠️ La `service_role key` es una llave maestra. Solo se usa en el servidor de Next.js
> (nunca llega al navegador) y **nunca** debe subirse a GitHub. `.env.local` ya está en
> el `.gitignore`.

---

## 3. Desplegar en Vercel

```bash
git init                # si aún no lo has hecho
git add .
git commit -m "Find Your Pet MZL"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/findyourpetmzl.git
git push -u origin main
```

Luego en [vercel.com](https://vercel.com):

1. **Add New → Project** e importa el repositorio.
2. Framework: Next.js (lo detecta solo). No cambies nada más.
3. En **Environment Variables** agrega las mismas dos:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. **Deploy**.

Si más adelante cambias una variable, hay que volver a hacer **Redeploy** para que tome
el valor nuevo.

### Dominio

Vercel te da algo como `findyourpetmzl.vercel.app` gratis. Si quieres un dominio propio
(`findyourpetmzl.co`), se compra aparte y se conecta en **Settings → Domains**.

---

## Estructura

```
src/
  app/
    page.tsx                        Listado + filtros + consejos
    reportar/page.tsx               Formulario de publicación
    mascota/[id]/page.tsx           Ficha de la mascota + WhatsApp
    api/reportes/route.ts           GET listar · POST crear
    api/reportes/[id]/resuelto/     POST marcar como resuelto
  components/
    FormularioReporte.tsx           Formulario (compresión de foto incluida)
    TarjetaReporte.tsx              Tarjeta del listado
    Filtros.tsx                     Pestañas, selects y buscador
    AccionesReporte.tsx             Compartir y marcar resuelto
  lib/
    tipos.ts                        Tipos, barrios de Manizales, utilidades
    almacen.ts                      Acceso a Supabase (+ modo demo)
supabase/esquema.sql                SQL para crear todo en Supabase
```

---

## Ideas para después

- Moderación: un panel con clave para bajar publicaciones falsas o duplicadas.
- Aviso automático cuando entra un reporte parecido (misma especie + barrio).
- Mapa con los puntos donde se perdieron o encontraron.
- Vencimiento automático de reportes viejos (por ejemplo, a los 60 días).
- Límite de publicaciones por IP para evitar spam.

---

Iniciativa ciudadana sin ánimo de lucro para Manizales, Caldas. 🇨🇴
