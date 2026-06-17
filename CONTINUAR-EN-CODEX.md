# Handoff para Codex — Sitio Web Patitas Felices
*Actualizado: 2026-06-17 — Estado real post-sesión Claude Code*

---

## ✅ LO QUE YA ESTÁ HECHO

| Tarea | Estado |
|---|---|
| Supabase: tablas `animales` + `testimonios` con RLS | ✅ Listo |
| Seed: 8 animales + 6 testimonios con fotos Unsplash | ✅ Listo |
| CSS: `css/main.css` + `css/admin.css` | ✅ Listo |
| JS: supabase-client, utils, galeria, testimonios, whatsapp | ✅ Listo |
| JS Admin: auth.js, animales-admin.js, testimonios-admin.js | ✅ Listo |
| Landing: `index.html` completo (hero, impacto, galería, donación, testimonios, footer) | ✅ Listo |
| `galeria.html` con filtros por especie y estado | ✅ Listo |
| `testimonios.html` con filtros por tipo | ✅ Listo |
| Admin: `admin/index.html` (login) | ✅ Listo |
| Admin: `admin/animales.html` (CRUD + upload fotos) | ✅ Listo |
| Admin: `admin/testimonios.html` (CRUD) | ✅ Listo |
| GitHub repo: `Nachocedrolla/Fundacion_animal` | ✅ Listo |
| Deploy Vercel | ⏳ Pendiente (1 click) |

---

## ⏳ LO QUE FALTA — en orden de prioridad

### 1. Deploy a Vercel (2 minutos, lo hace Juan Ignacio)
1. Ir a → https://vercel.com/new
2. Importar repo: `Nachocedrolla/Fundacion_animal`
3. Framework: **Other** (HTML estático, sin build)
4. Root directory: `.`
5. Click **Deploy**
6. Copiar la URL que genera Vercel

### 2. Bucket de Storage en Supabase (para subir fotos desde el admin)
1. Ir a: https://supabase.com/dashboard/project/uikfriddtmyddazyviqs/storage/buckets
2. Crear bucket: nombre `animales-fotos`, **público: activado**
3. En el SQL editor ejecutar:

```sql
CREATE POLICY "public_read_fotos" ON storage.objects
  FOR SELECT USING (bucket_id = 'animales-fotos');
CREATE POLICY "admin_upload_fotos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'animales-fotos' AND auth.role() = 'authenticated');
CREATE POLICY "admin_delete_fotos" ON storage.objects
  FOR DELETE USING (bucket_id = 'animales-fotos' AND auth.role() = 'authenticated');
```

### 3. Usuario admin en Supabase Auth
1. Ir a: https://supabase.com/dashboard/project/uikfriddtmyddazyviqs/auth/users
2. Click **Add user** → poner el email y password del refugio

### 4. Datos reales del refugio (reemplazar placeholders)
Editar en GitHub o localmente estos archivos:

**`js/whatsapp.js` y todos los HTML que tengan el número:**
- Reemplazar `5491112345678` → número real del refugio

**`index.html` — sección donación:**
- Reemplazar `patitas.felices` → alias real de MercadoPago
- Reemplazar `0000003100025274446939` → CVU real

**`index.html` + `galeria.html` + `testimonios.html` — footer/contacto:**
- Reemplazar `contacto@patitasfelices.org` → email real
- Reemplazar `https://instagram.com/patitasfelices` → perfil real
- Reemplazar `https://facebook.com/patitasfelices` → perfil real
- Reemplazar `https://tiktok.com/@patitasfelices` → perfil real

**`index.html` — hero:**
- Reemplazar `Buenos Aires` → ciudad real
- Reemplazar `2020` → año de fundación real
- Subir foto real del refugio como `assets/img/hero.jpg` y hacer commit

### 5. Foto del hero (visual)
El hero actualmente muestra un fondo negro (sin foto). El refugio debe proveer:
- Una foto horizontal del refugio, animales, o equipo
- Subirla como `assets/img/hero.jpg` al repo

---

## Credenciales

| Variable | Valor |
|---|---|
| `SUPABASE_URL` | `https://uikfriddtmyddazyviqs.supabase.co` |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpa2ZyaWRkdG15ZGRhenl2aXFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MTgzMjksImV4cCI6MjA5NzI5NDMyOX0.8bykJH8pnmSeoK19sgxr5V6WdYGrl1vq_AHL8v_WJpA` |
| `SUPABASE_SERVICE_ROLE` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpa2ZyaWRkdG15ZGRhenl2aXFzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTcxODMyOSwiZXhwIjoyMDk3Mjk0MzI5fQ.6gn1M8uAV3dkkUKK4e3tftRn5UCAz48fh8J9D5uOujU` |
| Proyecto Supabase | `uikfriddtmyddazyviqs` |
| GitHub repo | `https://github.com/Nachocedrolla/Fundacion_animal` |
| Vercel Team ID | `team_czYbIu3XXy0EUAcWG2oboM3b` |

---

## Stack técnico del sitio

- HTML/CSS/JS vanilla — sin frameworks, sin build tools
- Supabase JS v2 via CDN
- Tailwind CDN solo en `/admin/`
- Inter (Google Fonts)
- Vercel hosting estático
- Paleta: naranja `#F97316`, blanco, gris oscuro `#1A1A1A`
- **PROHIBIDO:** violeta, morado, indigo en cualquier variante

---

## Estructura del repo

```
Fundacion_animal/
├── index.html           ← landing principal
├── galeria.html         ← galería completa con filtros
├── testimonios.html     ← testimonios completos con filtros
├── admin/
│   ├── index.html       ← login admin
│   ├── animales.html    ← CRUD galería
│   └── testimonios.html ← CRUD testimonios
├── css/
│   ├── main.css
│   └── admin.css
├── js/
│   ├── supabase-client.js  ← credenciales ya inyectadas
│   ├── utils.js
│   ├── galeria.js
│   ├── testimonios.js
│   ├── whatsapp.js
│   └── admin/
│       ├── auth.js
│       ├── animales-admin.js
│       └── testimonios-admin.js
├── assets/img/          ← subir hero.jpg aquí
├── docs/superpowers/
│   ├── specs/2026-06-17-patitas-felices-design.md
│   └── plans/2026-06-17-patitas-felices.md
└── supabase/
    ├── migrations/001_initial_schema.sql
    └── seed.sql
```

---

## Si Codex necesita hacer fixes

El diseño visual está en `css/main.css`. Las variables clave:
```css
--color-primary: #F97316;
--color-primary-dark: #EA580C;
--color-dark: #1A1A1A;
--color-whatsapp: #25D366;
```

El JS de la galería está en `js/galeria.js` — funciones:
- `loadGaleriaPreview()` → 8 cards en el landing
- `loadGaleriaFull()` → galería completa con filtros

El admin usa `checkAuth()` de `js/admin/auth.js` para proteger cada página.

---

*Generado por Orquestador Giovanni Servicios IA — 2026-06-17*
*Commit: 4424db7 — GitHub: Nachocedrolla/Fundacion_animal*
