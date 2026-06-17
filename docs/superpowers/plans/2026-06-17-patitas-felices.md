# Patitas Felices — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sitio web completo para refugio animal con galería dinámica, panel admin y captación de donaciones.

**Architecture:** HTML/CSS/JS vanilla estático servido por Vercel. Supabase provee base de datos (animales + testimonios), storage para fotos y auth para el panel admin. Sin frameworks ni build tools.

**Tech Stack:** HTML5, CSS3 (custom properties), JS ES6+ vanilla, Supabase JS v2 (CDN), Tailwind CDN (solo admin), Inter (Google Fonts), Vercel.

## Global Constraints

- PROHIBIDO: colores violet/purple/indigo — usar naranja `#F97316`, azul puro, teal, verde, gris, negro, blanco
- Nombre del producto: "Patitas Felices" (provisional — reemplazar cuando se confirme)
- Deploy SOLO via MCP Vercel — nunca CLI
- Supabase JS v2: `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2`
- Tailwind CDN: `https://cdn.tailwindcss.com` (solo en /admin/)
- Google Fonts Inter: `https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap`
- Todos los placeholders de datos reales usan el formato `[DATO_PENDIENTE]`

---

### Task 1: Supabase — Tablas, RLS y Storage

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`
- Create: `supabase/seed.sql`

**Interfaces:**
- Produce: tablas `animales` y `testimonios` con RLS activo; bucket `animales-fotos` público

- [ ] **Step 1: Crear archivo de migración**

```sql
-- supabase/migrations/001_initial_schema.sql

-- Tabla animales
CREATE TABLE IF NOT EXISTS animales (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre     text NOT NULL,
  especie    text NOT NULL CHECK (especie IN ('perro','gato','otro')),
  edad       text,
  historia   text,
  foto_url   text,
  adoptado   boolean DEFAULT false,
  destacado  boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Tabla testimonios
CREATE TABLE IF NOT EXISTS testimonios (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre     text NOT NULL,
  tipo       text NOT NULL CHECK (tipo IN ('adoptante','voluntario','donante')),
  texto      text NOT NULL,
  foto_url   text,
  destacado  boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- RLS animales
ALTER TABLE animales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_select_animales" ON animales FOR SELECT USING (true);
CREATE POLICY "admin_all_animales"     ON animales FOR ALL   USING (auth.role() = 'authenticated');

-- RLS testimonios
ALTER TABLE testimonios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_select_testimonios" ON testimonios FOR SELECT USING (true);
CREATE POLICY "admin_all_testimonios"     ON testimonios FOR ALL   USING (auth.role() = 'authenticated');
```

- [ ] **Step 2: Crear seed con datos de ejemplo**

```sql
-- supabase/seed.sql
INSERT INTO animales (nombre, especie, edad, historia, foto_url, destacado) VALUES
('Luna',   'perra', '2 años',   'Luna fue rescatada de la calle en invierno, desnutrida y asustada. Hoy es la más juguetona del refugio.', 'https://placedog.net/400/400?r=1', true),
('Thor',   'perro', '3 años',   'Thor llegó con una pata herida. Luego de su recuperación se convirtió en el perro más cariñoso que puedas imaginar.', 'https://placedog.net/400/400?r=2', true),
('Mochi',  'gato',  '1 año',    'Mochi fue encontrado en una caja de cartón. Pequeño pero lleno de vida y curiosidad.', 'https://placekitten.com/400/400', true),
('Panda',  'gato',  '4 años',   'Panda llegó lastimado y desconfiado. Hoy busca una familia que le dé el amor que merece.', 'https://placekitten.com/401/400', true),
('Canela', 'perra', '5 años',   'Canela fue abandonada con sus cachorros. Todos fueron adoptados menos ella. Sigue esperando su hogar.', 'https://placedog.net/400/400?r=3', true),
('Simón',  'perro', '6 meses',  'Simón es un cachorro lleno de energía que necesita una familia activa y mucho amor.', 'https://placedog.net/400/400?r=4', true),
('Nube',   'gato',  '2 años',   'Nube es tranquila, silenciosa y perfecta para un hogar que busca compañía sin mucho escándalo.', 'https://placekitten.com/402/400', true),
('Rex',    'perro', '7 años',   'Rex es un perro mayor que merece pasar sus últimos años en una familia que lo quiera como se merece.', 'https://placedog.net/400/400?r=5', true);

INSERT INTO testimonios (nombre, tipo, texto, destacado) VALUES
('Martina G.',     'adoptante',  'Adoptamos a Luna hace 6 meses y cambió nuestra familia para siempre. El proceso fue muy fácil y el refugio nos acompañó en todo momento.', true),
('Carlos y Sofía', 'adoptante',  'Cuando fuimos a buscar un perro no esperábamos encontrar tanto amor. Thor es parte de la familia desde el primer día.', true),
('Laura M.',       'voluntaria', 'Ser voluntaria en Patitas Felices me enseñó más sobre la compasión de lo que aprendí en años. Recomiendo a todos que se sumen.', true),
('Rodrigo P.',     'donante',    'Dono todos los meses y sé que cada peso llega directamente a los animales. La transparencia del refugio es total.', true),
('Florencia T.',   'adoptante',  'Mochi llegó a casa y en una semana ya dormía en mi cama. Es lo mejor que me pasó en el año.', true),
('Equipo Devs AR', 'donante',    'Como empresa decidimos apoyar a Patitas Felices porque creemos en causas locales con impacto real. Los invitamos a sumarse.', true);
```

- [ ] **Step 3: Aplicar migración en Supabase**

Usar el MCP de Supabase:
```
mcp__supabase__apply_migration(sql: contenido de 001_initial_schema.sql)
```

- [ ] **Step 4: Crear bucket de storage**

En el dashboard de Supabase → Storage → New bucket:
- Name: `animales-fotos`
- Public: ✅ sí
- Allowed MIME types: `image/jpeg, image/png, image/webp`
- Max file size: 5MB

O via SQL:
```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('animales-fotos', 'animales-fotos', true);
CREATE POLICY "public_read_fotos" ON storage.objects FOR SELECT USING (bucket_id = 'animales-fotos');
CREATE POLICY "admin_upload_fotos" ON storage.objects FOR INSERT USING (bucket_id = 'animales-fotos' AND auth.role() = 'authenticated');
CREATE POLICY "admin_delete_fotos" ON storage.objects FOR DELETE USING (bucket_id = 'animales-fotos' AND auth.role() = 'authenticated');
```

- [ ] **Step 5: Crear usuario admin en Supabase Auth**

Dashboard → Authentication → Users → Add user:
- Email: el email real del refugio (o `admin@patitasfelices.com` provisional)
- Password: contraseña segura (proveer al refugio)

- [ ] **Step 6: Ejecutar seed**

```
mcp__supabase__execute_sql(sql: contenido de seed.sql)
```

- [ ] **Step 7: Verificar**

```
mcp__supabase__execute_sql(sql: "SELECT COUNT(*) FROM animales; SELECT COUNT(*) FROM testimonios;")
```
Esperado: 8 animales, 6 testimonios.

- [ ] **Step 8: Obtener credenciales**

```
mcp__supabase__get_project_url()
mcp__supabase__get_publishable_keys()
```
Guardar `SUPABASE_URL` y `SUPABASE_ANON_KEY` — se necesitan en Task 2.

- [ ] **Step 9: Commit**

```bash
git add supabase/
git commit -m "feat: supabase schema, RLS y seed inicial para Patitas Felices"
```

---

### Task 2: Scaffold del proyecto + Design System CSS

**Files:**
- Create: `css/main.css`
- Create: `css/admin.css`
- Create: `js/supabase-client.js`
- Create: `js/utils.js`
- Create: `assets/img/.gitkeep`
- Create: `assets/icons/.gitkeep`

**Interfaces:**
- Produce: variables CSS globales, clases utilitarias reutilizables, cliente Supabase exportable como `window.supabaseClient`

- [ ] **Step 1: Crear estructura de directorios**

```bash
mkdir -p css js/admin assets/img assets/icons supabase/migrations admin
touch assets/img/.gitkeep assets/icons/.gitkeep
```

- [ ] **Step 2: Crear css/main.css**

```css
/* css/main.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* ===== VARIABLES ===== */
:root {
  --color-primary:      #F97316;
  --color-primary-dark: #EA580C;
  --color-primary-light:#FFF7F0;
  --color-dark:         #1A1A1A;
  --color-gray:         #6B7280;
  --color-gray-light:   #F3F4F6;
  --color-white:        #FFFFFF;
  --color-whatsapp:     #25D366;
  --color-adoptado:     #10B981;
  --color-badge-vol:    #0EA5E9;

  --font-family: 'Inter', system-ui, -apple-system, sans-serif;
  --shadow-sm:  0 1px 3px rgba(0,0,0,.08);
  --shadow-md:  0 4px 16px rgba(0,0,0,.10);
  --shadow-lg:  0 8px 32px rgba(0,0,0,.12);
  --radius-sm:  8px;
  --radius-md:  12px;
  --radius-lg:  20px;
  --transition: .2s ease;
}

/* ===== RESET ===== */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body { font-family: var(--font-family); color: var(--color-dark); background: var(--color-white); line-height: 1.6; }
img { max-width: 100%; display: block; }
a { text-decoration: none; color: inherit; }

/* ===== TIPOGRAFÍA ===== */
h1 { font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 700; line-height: 1.15; }
h2 { font-size: clamp(1.5rem, 3vw, 2.25rem); font-weight: 700; line-height: 1.2; }
h3 { font-size: 1.25rem; font-weight: 600; }
p  { font-size: 1rem; color: var(--color-gray); }

/* ===== BOTONES ===== */
.btn {
  display: inline-flex; align-items: center; gap: .5rem;
  padding: .75rem 1.75rem; border-radius: var(--radius-sm);
  font-weight: 600; font-size: 1rem; cursor: pointer;
  border: 2px solid transparent; transition: var(--transition);
  font-family: var(--font-family);
}
.btn-primary { background: var(--color-primary); color: #fff; }
.btn-primary:hover { background: var(--color-primary-dark); transform: translateY(-1px); box-shadow: var(--shadow-md); }
.btn-outline { background: transparent; color: var(--color-white); border-color: var(--color-white); }
.btn-outline:hover { background: var(--color-white); color: var(--color-primary); }
.btn-dark { background: var(--color-dark); color: #fff; }
.btn-dark:hover { background: #333; }

/* ===== CONTENEDOR ===== */
.container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }
.section { padding: 5rem 0; }
.section-title { text-align: center; margin-bottom: 1rem; }
.section-subtitle { text-align: center; color: var(--color-gray); max-width: 600px; margin: 0 auto 3rem; }

/* ===== NAV ===== */
.navbar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
  background: rgba(255,255,255,.95); backdrop-filter: blur(10px);
  box-shadow: var(--shadow-sm); transition: var(--transition);
}
.navbar__inner { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.5rem; max-width: 1200px; margin: 0 auto; }
.navbar__logo { font-size: 1.25rem; font-weight: 700; color: var(--color-primary); display: flex; align-items: center; gap: .5rem; }
.navbar__links { display: flex; gap: 2rem; list-style: none; }
.navbar__links a { font-weight: 500; color: var(--color-dark); transition: var(--transition); }
.navbar__links a:hover { color: var(--color-primary); }
.navbar__cta { display: flex; align-items: center; gap: 1rem; }
.hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; border: none; background: none; padding: .5rem; }
.hamburger span { display: block; width: 24px; height: 2px; background: var(--color-dark); transition: var(--transition); }
.mobile-menu { display: none; flex-direction: column; background: #fff; padding: 1rem 1.5rem; gap: 1rem; border-top: 1px solid var(--color-gray-light); }
.mobile-menu a { font-weight: 500; padding: .5rem 0; border-bottom: 1px solid var(--color-gray-light); }
.mobile-menu.open { display: flex; }

/* ===== CARDS ANIMALES ===== */
.animal-card {
  background: var(--color-white); border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm); overflow: hidden;
  transition: transform var(--transition), box-shadow var(--transition);
}
.animal-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
.animal-card__img { width: 100%; height: 220px; object-fit: cover; }
.animal-card__img-placeholder { width: 100%; height: 220px; background: var(--color-gray-light); display: flex; align-items: center; justify-content: center; font-size: 3rem; }
.animal-card__body { padding: 1.25rem; }
.animal-card__name { font-size: 1.1rem; font-weight: 700; margin-bottom: .25rem; }
.animal-card__meta { font-size: .875rem; color: var(--color-gray); margin-bottom: .75rem; }
.animal-card__historia { font-size: .875rem; color: var(--color-gray); display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.badge { display: inline-block; padding: .2rem .6rem; border-radius: 999px; font-size: .75rem; font-weight: 600; }
.badge-adoptado  { background: #D1FAE5; color: #065F46; }
.badge-perro     { background: #FEF3C7; color: #92400E; }
.badge-gato      { background: #DBEAFE; color: #1E40AF; }
.badge-otro      { background: var(--color-gray-light); color: var(--color-gray); }
.badge-adoptante { background: #FFEDD5; color: #9A3412; }
.badge-voluntario{ background: #DBEAFE; color: #1E40AF; }
.badge-donante   { background: #D1FAE5; color: #065F46; }

/* ===== GRID ANIMALES ===== */
.animales-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.5rem; }

/* ===== TESTIMONIOS ===== */
.testimonios-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
.testimonio-card { background: var(--color-white); border-radius: var(--radius-md); box-shadow: var(--shadow-sm); padding: 1.5rem; }
.testimonio-card__header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
.testimonio-card__avatar { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; background: var(--color-gray-light); display: flex; align-items: center; justify-content: center; font-weight: 700; color: var(--color-primary); font-size: 1.1rem; flex-shrink: 0; overflow: hidden; }
.testimonio-card__nombre { font-weight: 600; font-size: .95rem; }
.testimonio-card__texto { font-size: .9rem; color: var(--color-gray); line-height: 1.7; font-style: italic; }
.testimonio-card__texto::before { content: '"'; font-size: 1.5rem; color: var(--color-primary); line-height: 0; vertical-align: -.4rem; margin-right: .1rem; }

/* ===== REVEAL ANIMATION ===== */
.reveal { opacity: 0; transform: translateY(24px); transition: opacity .5s ease, transform .5s ease; }
.reveal.revealed { opacity: 1; transform: translateY(0); }

/* ===== BOTÓN WHATSAPP FLOTANTE ===== */
.whatsapp-fab {
  position: fixed; bottom: 24px; right: 24px; z-index: 999;
  width: 56px; height: 56px; border-radius: 50%;
  background: var(--color-whatsapp); display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 16px rgba(37,211,102,.4); transition: transform var(--transition), box-shadow var(--transition);
  cursor: pointer;
}
.whatsapp-fab:hover { transform: scale(1.08); box-shadow: 0 6px 24px rgba(37,211,102,.5); }
.whatsapp-fab svg { width: 30px; height: 30px; fill: #fff; }

/* ===== FILTROS ===== */
.filtros { display: flex; gap: .75rem; flex-wrap: wrap; margin-bottom: 2rem; }
.filtro-btn { padding: .5rem 1.25rem; border-radius: 999px; border: 2px solid var(--color-gray-light); background: var(--color-white); font-weight: 500; cursor: pointer; font-family: var(--font-family); transition: var(--transition); }
.filtro-btn:hover, .filtro-btn.active { border-color: var(--color-primary); background: var(--color-primary); color: #fff; }

/* ===== LOADING STATE ===== */
.loading { text-align: center; padding: 3rem; color: var(--color-gray); }
.spinner { width: 40px; height: 40px; border: 3px solid var(--color-gray-light); border-top-color: var(--color-primary); border-radius: 50%; animation: spin .8s linear infinite; margin: 0 auto 1rem; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ===== COPY BUTTON ===== */
.copy-field { display: flex; align-items: center; gap: .75rem; background: #fff; border: 2px solid var(--color-primary-light); border-radius: var(--radius-sm); padding: .75rem 1rem; }
.copy-field__text { flex: 1; font-weight: 600; font-size: 1rem; font-family: monospace; }
.copy-btn { flex-shrink: 0; background: var(--color-primary); color: #fff; border: none; border-radius: 6px; padding: .5rem .875rem; font-size: .875rem; font-weight: 600; cursor: pointer; font-family: var(--font-family); transition: var(--transition); }
.copy-btn:hover { background: var(--color-primary-dark); }
.copy-btn.copied { background: var(--color-adoptado); }

/* ===== FOOTER ===== */
.footer { background: var(--color-dark); color: #fff; padding: 3rem 0 1.5rem; }
.footer__grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 2rem; margin-bottom: 2rem; }
.footer__brand { font-size: 1.1rem; font-weight: 700; color: var(--color-primary); margin-bottom: .5rem; }
.footer p { color: #9CA3AF; font-size: .875rem; }
.footer h4 { font-size: .875rem; font-weight: 600; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: .05em; color: #9CA3AF; }
.footer ul { list-style: none; display: flex; flex-direction: column; gap: .5rem; }
.footer ul a { color: #D1D5DB; font-size: .875rem; transition: var(--transition); }
.footer ul a:hover { color: var(--color-primary); }
.footer__bottom { border-top: 1px solid #374151; padding-top: 1.5rem; text-align: center; color: #6B7280; font-size: .8rem; }
.social-icons { display: flex; gap: 1rem; margin-top: 1rem; }
.social-icon { width: 36px; height: 36px; border-radius: 50%; background: #374151; display: flex; align-items: center; justify-content: center; transition: var(--transition); }
.social-icon:hover { background: var(--color-primary); }
.social-icon svg { width: 18px; height: 18px; fill: #fff; }

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .navbar__links { display: none; }
  .navbar__cta .btn { display: none; }
  .hamburger { display: flex; }
  .footer__grid { grid-template-columns: 1fr; }
  .section { padding: 3rem 0; }
}
```

- [ ] **Step 3: Crear css/admin.css**

```css
/* css/admin.css */
body { font-family: 'Inter', system-ui, sans-serif; background: #F9FAFB; }
.admin-sidebar { width: 240px; background: #1A1A1A; min-height: 100vh; position: fixed; top: 0; left: 0; padding: 1.5rem; }
.admin-sidebar__logo { color: #F97316; font-weight: 700; font-size: 1.1rem; margin-bottom: 2rem; display: block; }
.admin-sidebar__nav { display: flex; flex-direction: column; gap: .5rem; }
.admin-sidebar__nav a { color: #D1D5DB; padding: .75rem 1rem; border-radius: 8px; font-size: .9rem; font-weight: 500; transition: .2s; }
.admin-sidebar__nav a:hover, .admin-sidebar__nav a.active { background: #F97316; color: #fff; }
.admin-main { margin-left: 240px; padding: 2rem; }
.admin-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; }
.admin-header h1 { font-size: 1.5rem; font-weight: 700; }
.admin-table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
.admin-table th { background: #F9FAFB; padding: .875rem 1rem; text-align: left; font-size: .8rem; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; color: #6B7280; }
.admin-table td { padding: .875rem 1rem; border-top: 1px solid #F3F4F6; font-size: .9rem; vertical-align: middle; }
.admin-table tr:hover td { background: #FFF7F0; }
.admin-thumb { width: 48px; height: 48px; object-fit: cover; border-radius: 8px; }
.toggle-btn { position: relative; width: 40px; height: 22px; display: inline-block; }
.toggle-btn input { opacity: 0; width: 0; height: 0; }
.toggle-slider { position: absolute; inset: 0; background: #D1D5DB; border-radius: 999px; cursor: pointer; transition: .2s; }
.toggle-slider::before { content: ''; position: absolute; width: 16px; height: 16px; background: #fff; border-radius: 50%; top: 3px; left: 3px; transition: .2s; }
.toggle-btn input:checked + .toggle-slider { background: #F97316; }
.toggle-btn input:checked + .toggle-slider::before { transform: translateX(18px); }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.5); z-index: 50; display: flex; align-items: center; justify-content: center; padding: 1rem; }
.modal-box { background: #fff; border-radius: 16px; padding: 2rem; width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto; }
.modal-box h2 { font-size: 1.25rem; font-weight: 700; margin-bottom: 1.5rem; }
.form-group { margin-bottom: 1.25rem; }
.form-group label { display: block; font-size: .875rem; font-weight: 600; margin-bottom: .375rem; color: #374151; }
.form-group input, .form-group select, .form-group textarea { width: 100%; padding: .625rem .875rem; border: 2px solid #E5E7EB; border-radius: 8px; font-family: inherit; font-size: .9rem; outline: none; transition: .2s; }
.form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #F97316; }
.form-group textarea { min-height: 100px; resize: vertical; }
.btn-admin { padding: .625rem 1.25rem; border-radius: 8px; font-weight: 600; font-size: .9rem; cursor: pointer; border: none; font-family: inherit; transition: .2s; }
.btn-admin-primary { background: #F97316; color: #fff; }
.btn-admin-primary:hover { background: #EA580C; }
.btn-admin-danger { background: #FEE2E2; color: #B91C1C; }
.btn-admin-danger:hover { background: #FCA5A5; }
.btn-admin-ghost { background: transparent; color: #6B7280; border: 2px solid #E5E7EB; }
.img-preview { width: 80px; height: 80px; object-fit: cover; border-radius: 8px; margin-top: .5rem; display: none; }
.img-preview.visible { display: block; }
```

- [ ] **Step 4: Crear js/supabase-client.js**

```js
// js/supabase-client.js
// Reemplazar con las credenciales reales de Supabase (Task 1, Step 8)
const SUPABASE_URL  = '[SUPABASE_URL]';
const SUPABASE_ANON = '[SUPABASE_ANON_KEY]';

const { createClient } = supabase;
window.supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON);
```

- [ ] **Step 5: Crear js/utils.js**

```js
// js/utils.js

// Scroll reveal
function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); observer.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// Counter animado
function animateCounter(el, target, duration = 1800) {
  let start = 0;
  const step = timestamp => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    el.textContent = Math.floor(progress * target).toLocaleString('es-AR') + (el.dataset.suffix || '');
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCounter(e.target, parseInt(e.target.dataset.counter));
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => observer.observe(c));
}

// Clipboard copy
function initCopyButtons() {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const text = btn.closest('.copy-field').querySelector('.copy-field__text').textContent.trim();
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = '✓ Copiado';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = 'Copiar'; btn.classList.remove('copied'); }, 2000);
      } catch { btn.textContent = 'Error'; }
    });
  });
}

// Hamburger menu
function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (!hamburger || !mobileMenu) return;
  hamburger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileMenu.classList.remove('open')));
}

// Truncar texto
function truncate(text, length = 100) {
  return text && text.length > length ? text.slice(0, length) + '…' : (text || '');
}

// Inicializar todo
document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initCounters();
  initCopyButtons();
  initMobileMenu();
});
```

- [ ] **Step 6: Commit**

```bash
git add css/ js/supabase-client.js js/utils.js assets/ supabase/
git commit -m "feat: design system CSS y utilidades JS base"
```

---

### Task 3: Landing — Nav + Hero + Impacto

**Files:**
- Create: `index.html` (secciones 1-2)

**Interfaces:**
- Consumes: `css/main.css`, `js/utils.js`
- Produce: `index.html` con estructura base, nav sticky, hero con parallax, sección de contadores

- [ ] **Step 1: Crear index.html — estructura base + nav + hero**

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Patitas Felices — Refugio Animal</title>
  <meta name="description" content="Refugio animal Patitas Felices — rescatamos, rehabilitamos y buscamos hogar para animales en [CIUDAD]. Ayudanos con tu donación.">
  <meta property="og:title" content="Patitas Felices — Refugio Animal">
  <meta property="og:description" content="Cada vida importa. Ayudanos a salvarlas.">
  <meta property="og:image" content="/assets/img/og-image.jpg">
  <meta property="og:type" content="website">
  <meta name="theme-color" content="#F97316">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "NGO",
    "name": "Patitas Felices",
    "description": "Refugio animal sin fines de lucro",
    "url": "https://[DOMINIO]",
    "sameAs": ["[INSTAGRAM_URL]","[FACEBOOK_URL]","[TIKTOK_URL]"],
    "contactPoint": { "@type": "ContactPoint", "contactType": "customer service", "availableLanguage": "Spanish" }
  }
  </script>
  <link rel="stylesheet" href="css/main.css">
</head>
<body>

<!-- NAV -->
<nav class="navbar" id="navbar">
  <div class="navbar__inner">
    <a href="/" class="navbar__logo">🐾 Patitas Felices</a>
    <ul class="navbar__links">
      <li><a href="#animales">Animales</a></li>
      <li><a href="#como-ayudar">Cómo ayudar</a></li>
      <li><a href="#testimonios">Testimonios</a></li>
      <li><a href="galeria.html">Galería completa</a></li>
    </ul>
    <div class="navbar__cta">
      <a href="#donacion" class="btn btn-primary">❤️ Donar</a>
      <button class="hamburger" aria-label="Menú">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>
  <div class="mobile-menu">
    <a href="#animales">Animales</a>
    <a href="#como-ayudar">Cómo ayudar</a>
    <a href="#testimonios">Testimonios</a>
    <a href="galeria.html">Galería completa</a>
    <a href="#donacion" class="btn btn-primary" style="text-align:center">❤️ Donar</a>
  </div>
</nav>

<!-- HERO -->
<section class="hero" id="inicio">
  <div class="hero__bg" style="background-image:url('assets/img/hero.jpg')"></div>
  <div class="hero__overlay"></div>
  <div class="hero__content container">
    <p class="hero__label">🐾 Refugio animal desde [AÑO]</p>
    <h1>Cada vida importa.<br>Ayudanos a salvarlas.</h1>
    <p class="hero__sub">Somos Patitas Felices, un refugio en [CIUDAD] dedicado a rescatar, rehabilitar y encontrar hogar para animales en situación de calle.</p>
    <div class="hero__ctas">
      <a href="#donacion" class="btn btn-primary">❤️ Quiero donar</a>
      <a href="#animales" class="btn btn-outline">🐾 Conocé los animales</a>
    </div>
  </div>
</section>

<!-- IMPACTO -->
<section class="impacto">
  <div class="container">
    <div class="impacto__grid">
      <div class="impacto__item reveal">
        <span class="impacto__num" data-counter="120" data-suffix="+">0+</span>
        <span class="impacto__label">Animales rescatados</span>
      </div>
      <div class="impacto__item reveal">
        <span class="impacto__num" data-counter="80" data-suffix="+">0+</span>
        <span class="impacto__label">Animales adoptados</span>
      </div>
      <div class="impacto__item reveal">
        <span class="impacto__num" data-counter="200" data-suffix="+">0+</span>
        <span class="impacto__label">Familias colaboradoras</span>
      </div>
      <div class="impacto__item reveal">
        <span class="impacto__num" data-counter="150" data-suffix="kg">0kg</span>
        <span class="impacto__label">Alimento por mes</span>
      </div>
    </div>
  </div>
</section>

<!-- El resto de las secciones se agregan en Task 4, 5, 6 -->

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="js/supabase-client.js"></script>
<script src="js/utils.js"></script>
</body>
</html>
```

- [ ] **Step 2: Agregar estilos hero + impacto en main.css**

Agregar al final de `css/main.css`:

```css
/* ===== HERO ===== */
.hero { position: relative; min-height: 100vh; display: flex; align-items: center; padding-top: 80px; }
.hero__bg { position: absolute; inset: 0; background-size: cover; background-position: center; background-attachment: fixed; }
.hero__overlay { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(0,0,0,.7) 0%, rgba(0,0,0,.4) 100%); }
.hero__content { position: relative; color: #fff; max-width: 700px; }
.hero__label { font-size: .95rem; font-weight: 600; color: var(--color-primary); margin-bottom: 1rem; letter-spacing: .05em; text-transform: uppercase; }
.hero__content h1 { color: #fff; margin-bottom: 1.25rem; }
.hero__sub { font-size: 1.1rem; color: rgba(255,255,255,.85); margin-bottom: 2rem; max-width: 540px; }
.hero__ctas { display: flex; gap: 1rem; flex-wrap: wrap; }

/* ===== IMPACTO ===== */
.impacto { background: var(--color-primary); padding: 3rem 0; }
.impacto__grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem; text-align: center; }
.impacto__num { display: block; font-size: clamp(2rem, 4vw, 3rem); font-weight: 700; color: #fff; }
.impacto__label { display: block; font-size: .9rem; color: rgba(255,255,255,.85); margin-top: .25rem; }
@media (max-width: 768px) { .impacto__grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 480px) { .impacto__grid { grid-template-columns: 1fr 1fr; } }
```

- [ ] **Step 3: Verificar en browser**

Abrir `index.html` en browser. Verificar:
- Nav sticky visible y funcional
- Hero a full-height con overlay oscuro
- Texto del hero legible
- Sección naranja de impacto visible debajo
- Hamburger funciona en mobile (DevTools → 375px)
- Contadores animados al hacer scroll hasta la sección naranja

- [ ] **Step 4: Commit**

```bash
git add index.html css/main.css
git commit -m "feat: landing — nav sticky, hero parallax y contadores de impacto"
```

---

### Task 4: Landing — Cómo Ayudar + Galería Preview

**Files:**
- Modify: `index.html` (agregar secciones)
- Create: `js/galeria.js`

**Interfaces:**
- Consumes: `window.supabaseClient`, tablas `animales`
- Produce: sección "Cómo Ayudar" estática + galería preview con 8 cards dinámicas

- [ ] **Step 1: Crear js/galeria.js**

```js
// js/galeria.js
const WHATSAPP_NUM = '[NUMERO_WHATSAPP]'; // ej: 5491112345678

function buildAnimalCard(animal) {
  const especie = animal.especie || 'otro';
  const badgeEspecie = `<span class="badge badge-${especie}">${especie}</span>`;
  const badgeAdoptado = animal.adoptado ? `<span class="badge badge-adoptado">✓ Adoptado</span>` : '';
  const img = animal.foto_url
    ? `<img class="animal-card__img" src="${animal.foto_url}" alt="Foto de ${animal.nombre}" loading="lazy">`
    : `<div class="animal-card__img-placeholder">🐾</div>`;

  return `
    <div class="animal-card reveal" data-especie="${especie}" data-adoptado="${animal.adoptado}">
      ${img}
      <div class="animal-card__body">
        <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:.5rem">${badgeEspecie}${badgeAdoptado}</div>
        <div class="animal-card__name">${animal.nombre}</div>
        <div class="animal-card__meta">${animal.edad || ''}</div>
        <div class="animal-card__historia">${animal.historia || ''}</div>
      </div>
    </div>`;
}

async function loadGaleriaPreview() {
  const container = document.getElementById('galeria-preview');
  if (!container) return;
  container.innerHTML = '<div class="loading"><div class="spinner"></div><p>Cargando animales…</p></div>';
  try {
    const { data, error } = await window.supabaseClient
      .from('animales')
      .select('*')
      .eq('destacado', true)
      .order('created_at', { ascending: false })
      .limit(8);
    if (error) throw error;
    container.innerHTML = data.length
      ? data.map(buildAnimalCard).join('')
      : '<p style="text-align:center;color:#6B7280">No hay animales destacados aún.</p>';
    // Re-init reveal para las nuevas cards
    document.querySelectorAll('.reveal:not(.revealed)').forEach(el => {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); observer.unobserve(e.target); } });
      }, { threshold: 0.1 });
      observer.observe(el);
    });
  } catch (err) {
    container.innerHTML = '<p style="text-align:center;color:#B91C1C">Error al cargar animales. Intentá de nuevo.</p>';
    console.error(err);
  }
}

document.addEventListener('DOMContentLoaded', loadGaleriaPreview);
```

- [ ] **Step 2: Agregar secciones en index.html (antes del cierre `</body>`)**

Insertar entre la sección `impacto` y los scripts:

```html
<!-- CÓMO AYUDAR -->
<section class="section como-ayudar" id="como-ayudar">
  <div class="container">
    <h2 class="section-title reveal">¿Cómo podés ayudar?</h2>
    <p class="section-subtitle reveal">Cada forma de apoyo marca una diferencia real en la vida de un animal.</p>
    <div class="como-ayudar__grid">
      <div class="como-ayudar__card reveal">
        <div class="como-ayudar__icon">💰</div>
        <h3>Donar dinero</h3>
        <p>Con tu donación compramos alimento, medicamentos y cubrimos gastos veterinarios.</p>
        <a href="#donacion" class="btn btn-primary" style="margin-top:1rem">Donar ahora</a>
      </div>
      <div class="como-ayudar__card reveal">
        <div class="como-ayudar__icon">🛒</div>
        <h3>Donar alimentos</h3>
        <p>Aceptamos alimento seco, húmedo y materiales para el refugio. Coordinamos la entrega.</p>
        <a href="https://wa.me/[NUMERO_WHATSAPP]?text=Hola! Quiero donar alimentos al refugio Patitas Felices" target="_blank" class="btn btn-dark" style="margin-top:1rem">Coordinar por WhatsApp</a>
      </div>
      <div class="como-ayudar__card reveal">
        <div class="como-ayudar__icon">🙋</div>
        <h3>Ser voluntario</h3>
        <p>Necesitamos manos que ayuden con el cuidado diario, paseos, socialización y más.</p>
        <a href="https://wa.me/[NUMERO_WHATSAPP]?text=Hola! Me gustaría ser voluntario en Patitas Felices" target="_blank" class="btn btn-dark" style="margin-top:1rem">Sumarme como voluntario</a>
      </div>
    </div>
  </div>
</section>

<!-- GALERÍA PREVIEW -->
<section class="section" id="animales" style="background:var(--color-gray-light)">
  <div class="container">
    <h2 class="section-title reveal">Animales que esperan tu ayuda</h2>
    <p class="section-subtitle reveal">Rescatados, rehabilitados y listos para encontrar una familia.</p>
    <div class="animales-grid" id="galeria-preview"></div>
    <div style="text-align:center;margin-top:2.5rem">
      <a href="galeria.html" class="btn btn-primary reveal">Ver todos los animales →</a>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Agregar estilos como-ayudar en main.css**

```css
/* ===== CÓMO AYUDAR ===== */
.como-ayudar__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
.como-ayudar__card { background: var(--color-white); border-radius: var(--radius-md); padding: 2rem; box-shadow: var(--shadow-sm); text-align: center; transition: transform var(--transition), box-shadow var(--transition); }
.como-ayudar__card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
.como-ayudar__icon { font-size: 2.5rem; margin-bottom: 1rem; }
.como-ayudar__card h3 { margin-bottom: .75rem; }
@media (max-width: 768px) { .como-ayudar__grid { grid-template-columns: 1fr; } }
```

- [ ] **Step 4: Agregar script galeria.js en index.html**

```html
<script src="js/galeria.js"></script>
```

- [ ] **Step 5: Verificar**

Con Supabase configurado y seed aplicado:
- La sección "Cómo Ayudar" muestra 3 cards con íconos
- La galería preview carga 8 animals desde Supabase
- Las cards se revelan con animación al scrollear
- Sin Supabase configurado: muestra estado de loading y luego error (correcto)

- [ ] **Step 6: Commit**

```bash
git add index.html css/main.css js/galeria.js
git commit -m "feat: secciones cómo ayudar y galería preview dinámica desde Supabase"
```

---

### Task 5: Landing — Donación + Testimonios + Social + WhatsApp + Footer

**Files:**
- Modify: `index.html` (secciones finales)
- Create: `js/testimonios.js`
- Create: `js/whatsapp.js`

**Interfaces:**
- Consumes: `window.supabaseClient`, tabla `testimonios`
- Produce: landing completo y funcional

- [ ] **Step 1: Crear js/testimonios.js**

```js
// js/testimonios.js
function getAvatar(nombre, fotoUrl) {
  if (fotoUrl) return `<img class="testimonio-card__avatar" src="${fotoUrl}" alt="${nombre}" loading="lazy">`;
  const inicial = nombre ? nombre.charAt(0).toUpperCase() : '?';
  return `<div class="testimonio-card__avatar">${inicial}</div>`;
}

function buildTestimonioCard(t) {
  const badges = { adoptante: 'badge-adoptante', voluntario: 'badge-voluntario', donante: 'badge-donante' };
  return `
    <div class="testimonio-card reveal" data-tipo="${t.tipo}">
      <div class="testimonio-card__header">
        ${getAvatar(t.nombre, t.foto_url)}
        <div>
          <div class="testimonio-card__nombre">${t.nombre}</div>
          <span class="badge ${badges[t.tipo] || ''}">${t.tipo}</span>
        </div>
      </div>
      <p class="testimonio-card__texto">${t.texto}</p>
    </div>`;
}

async function loadTestimoniosPreview() {
  const container = document.getElementById('testimonios-preview');
  if (!container) return;
  container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  try {
    const { data, error } = await window.supabaseClient
      .from('testimonios')
      .select('*')
      .eq('destacado', true)
      .order('created_at', { ascending: false })
      .limit(6);
    if (error) throw error;
    container.innerHTML = data.length
      ? data.map(buildTestimonioCard).join('')
      : '<p style="text-align:center">No hay testimonios aún.</p>';
    document.querySelectorAll('.reveal:not(.revealed)').forEach(el => {
      new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); } });
      }, { threshold: 0.1 }).observe(el);
    });
  } catch (err) {
    container.innerHTML = '<p style="color:#B91C1C;text-align:center">Error al cargar testimonios.</p>';
  }
}

async function loadTestimoniosFull() {
  const container = document.getElementById('testimonios-full');
  if (!container) return;
  container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  const { data } = await window.supabaseClient
    .from('testimonios')
    .select('*')
    .order('created_at', { ascending: false });
  container.innerHTML = (data || []).map(buildTestimonioCard).join('') || '<p style="text-align:center">Sin testimonios.</p>';
}

document.addEventListener('DOMContentLoaded', () => {
  loadTestimoniosPreview();
  loadTestimoniosFull();
});
```

- [ ] **Step 2: Crear js/whatsapp.js**

```js
// js/whatsapp.js
const WA_NUM = '[NUMERO_WHATSAPP]'; // ej: 5491112345678
const WA_MSG = encodeURIComponent('Hola! Me comunico desde la web de Patitas Felices.');

document.addEventListener('DOMContentLoaded', () => {
  const fab = document.createElement('a');
  fab.href = `https://wa.me/${WA_NUM}?text=${WA_MSG}`;
  fab.target = '_blank';
  fab.rel = 'noopener noreferrer';
  fab.className = 'whatsapp-fab';
  fab.setAttribute('aria-label', 'Contactar por WhatsApp');
  fab.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`;
  document.body.appendChild(fab);
});
```

- [ ] **Step 3: Agregar secciones finales en index.html**

Agregar antes de los scripts:

```html
<!-- DONACIÓN -->
<section class="section donacion" id="donacion">
  <div class="container">
    <div class="donacion__inner">
      <div class="donacion__texto reveal">
        <h2>Tu donación salva vidas reales</h2>
        <p style="margin:1rem 0">Cada peso llega directamente al refugio. Sin intermediarios, sin burocracia.</p>
        <ul class="donacion__lista">
          <li>🍖 Con $1.000 compramos alimento para 5 días</li>
          <li>💊 Con $3.000 cubrimos un turno veterinario</li>
          <li>🏥 Con $10.000 financiamos una cirugía básica</li>
        </ul>
      </div>
      <div class="donacion__datos reveal">
        <div style="background:#fff;border-radius:16px;padding:2rem;box-shadow:0 4px 24px rgba(249,115,22,.15)">
          <img src="assets/img/mercadopago-logo.png" alt="MercadoPago" style="height:32px;margin-bottom:1.5rem" onerror="this.style.display='none'">
          <p style="font-size:.875rem;color:#6B7280;margin-bottom:.5rem;font-weight:600">ALIAS</p>
          <div class="copy-field" style="margin-bottom:1rem">
            <span class="copy-field__text">[ALIAS_MERCADOPAGO]</span>
            <button class="copy-btn">Copiar</button>
          </div>
          <p style="font-size:.875rem;color:#6B7280;margin-bottom:.5rem;font-weight:600">CVU</p>
          <div class="copy-field">
            <span class="copy-field__text">[CVU_MERCADOPAGO]</span>
            <button class="copy-btn">Copiar</button>
          </div>
          <p style="font-size:.8rem;color:#9CA3AF;margin-top:1rem;text-align:center">¡Gracias por tu generosidad! 🐾</p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- TESTIMONIOS -->
<section class="section" id="testimonios" style="background:var(--color-gray-light)">
  <div class="container">
    <h2 class="section-title reveal">Lo que dice nuestra comunidad</h2>
    <p class="section-subtitle reveal">Adoptantes, voluntarios y donantes comparten su experiencia.</p>
    <div class="testimonios-grid" id="testimonios-preview"></div>
    <div style="text-align:center;margin-top:2.5rem">
      <a href="testimonios.html" class="btn btn-primary reveal">Ver todos los testimonios →</a>
    </div>
  </div>
</section>

<!-- REDES SOCIALES -->
<section class="section redes" id="redes">
  <div class="container" style="text-align:center">
    <h2 class="reveal">Seguinos en redes</h2>
    <p class="reveal" style="margin:.75rem auto 2rem;max-width:500px">Cada like, comentario y compartido nos ayuda a llegar a más familias. ¡Sumáte!</p>
    <div class="redes__icons reveal">
      <a href="[INSTAGRAM_URL]" target="_blank" rel="noopener" class="red-btn red-ig">📸 Instagram</a>
      <a href="[FACEBOOK_URL]" target="_blank" rel="noopener" class="red-btn red-fb">👍 Facebook</a>
      <a href="[TIKTOK_URL]"   target="_blank" rel="noopener" class="red-btn red-tk">🎵 TikTok</a>
    </div>
  </div>
</section>

<!-- FOOTER -->
<footer class="footer">
  <div class="container">
    <div class="footer__grid">
      <div>
        <div class="footer__brand">🐾 Patitas Felices</div>
        <p>Refugio animal sin fines de lucro.<br>[CIUDAD], Argentina.</p>
        <div class="social-icons" style="margin-top:1rem">
          <a href="[INSTAGRAM_URL]" target="_blank" class="social-icon" aria-label="Instagram">
            <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
          </a>
          <a href="[FACEBOOK_URL]" target="_blank" class="social-icon" aria-label="Facebook">
            <svg viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </a>
          <a href="[TIKTOK_URL]" target="_blank" class="social-icon" aria-label="TikTok">
            <svg viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
          </a>
        </div>
      </div>
      <div>
        <h4>Links rápidos</h4>
        <ul>
          <li><a href="#inicio">Inicio</a></li>
          <li><a href="galeria.html">Animales</a></li>
          <li><a href="testimonios.html">Testimonios</a></li>
          <li><a href="#donacion">Donar</a></li>
          <li><a href="#como-ayudar">Cómo ayudar</a></li>
        </ul>
      </div>
      <div>
        <h4>Contacto</h4>
        <ul>
          <li><a href="mailto:[EMAIL_REFUGIO]">✉ [EMAIL_REFUGIO]</a></li>
          <li><a href="https://wa.me/[NUMERO_WHATSAPP]" target="_blank">💬 WhatsApp</a></li>
          <li><a href="admin/">🔒 Acceso admin</a></li>
        </ul>
      </div>
    </div>
    <div class="footer__bottom">
      © 2026 Patitas Felices — Refugio animal sin fines de lucro · Hecho con ❤️ para los animales
    </div>
  </div>
</footer>
```

- [ ] **Step 4: Agregar estilos donación + redes en main.css**

```css
/* ===== DONACIÓN ===== */
.donacion { background: var(--color-primary-light); }
.donacion__inner { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; }
.donacion__lista { list-style: none; display: flex; flex-direction: column; gap: .75rem; margin-top: 1.5rem; }
.donacion__lista li { font-size: .95rem; color: var(--color-dark); }
@media (max-width: 768px) { .donacion__inner { grid-template-columns: 1fr; gap: 2rem; } }

/* ===== REDES ===== */
.redes__icons { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
.red-btn { display: inline-flex; align-items: center; gap: .5rem; padding: .875rem 1.75rem; border-radius: var(--radius-sm); font-weight: 600; font-size: 1rem; transition: var(--transition); }
.red-ig { background: linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366); color: #fff; }
.red-fb { background: #1877F2; color: #fff; }
.red-tk { background: #000; color: #fff; }
.red-btn:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
```

- [ ] **Step 5: Agregar scripts finales en index.html**

```html
<script src="js/testimonios.js"></script>
<script src="js/whatsapp.js"></script>
```

- [ ] **Step 6: Verificar landing completo**

Scroll completo por el landing. Verificar:
- Sección donación muestra alias/CVU con botón copiar funcional
- Click en "Copiar" → texto cambia a "✓ Copiado" por 2 segundos
- Testimonios cargan desde Supabase (6 cards)
- Redes sociales: 3 botones coloridos con íconos
- Footer completo visible
- Botón WhatsApp flotante (naranja → verde) en bottom-right
- Sin errores en consola del browser

- [ ] **Step 7: Commit**

```bash
git add index.html css/main.css js/testimonios.js js/whatsapp.js
git commit -m "feat: landing completo — donación, testimonios, redes, footer y WhatsApp fab"
```

---

### Task 6: galeria.html — Página completa con filtros

**Files:**
- Create: `galeria.html`
- Modify: `js/galeria.js` (agregar función `loadGaleriaFull`)

**Interfaces:**
- Consumes: `window.supabaseClient`, `buildAnimalCard` de galeria.js
- Produce: galería completa con filtros, paginación y estados vacíos

- [ ] **Step 1: Agregar loadGaleriaFull en js/galeria.js**

Agregar al final del archivo:

```js
// Paginación
let currentPage = 0;
const PAGE_SIZE = 20;
let currentEspecie = 'todos';
let currentAdoptado = 'todos';
let allAnimales = [];

async function loadGaleriaFull() {
  const container = document.getElementById('galeria-full');
  if (!container) return;

  container.innerHTML = '<div class="loading"><div class="spinner"></div><p>Cargando…</p></div>';

  const { data, error } = await window.supabaseClient
    .from('animales')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) { container.innerHTML = '<p style="color:#B91C1C;text-align:center">Error al cargar.</p>'; return; }

  allAnimales = data || [];
  renderFiltered();
}

function renderFiltered() {
  const container = document.getElementById('galeria-full');
  const btnMore   = document.getElementById('btn-mas');
  currentPage = 0;

  let filtered = allAnimales.filter(a => {
    const matchEspecie  = currentEspecie === 'todos' || a.especie === currentEspecie;
    const matchAdoptado = currentAdoptado === 'todos' || (currentAdoptado === 'disponibles' ? !a.adoptado : a.adoptado);
    return matchEspecie && matchAdoptado;
  });

  if (!filtered.length) {
    container.innerHTML = '<p style="text-align:center;color:#6B7280;grid-column:1/-1">No hay animales en esta categoría.</p>';
    if (btnMore) btnMore.style.display = 'none';
    return;
  }

  const page = filtered.slice(0, PAGE_SIZE);
  container.innerHTML = page.map(buildAnimalCard).join('');

  if (btnMore) {
    btnMore.style.display = filtered.length > PAGE_SIZE ? 'inline-flex' : 'none';
    btnMore.onclick = () => {
      currentPage++;
      const next = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
      container.insertAdjacentHTML('beforeend', next.map(buildAnimalCard).join(''));
      if ((currentPage + 1) * PAGE_SIZE >= filtered.length) btnMore.style.display = 'none';
    };
  }
}

function initFiltros() {
  document.querySelectorAll('[data-filtro-especie]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-filtro-especie]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentEspecie = btn.dataset.filtroEspecie;
      renderFiltered();
    });
  });
  document.querySelectorAll('[data-filtro-estado]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-filtro-estado]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentAdoptado = btn.dataset.filtroEstado;
      renderFiltered();
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadGaleriaFull();
  initFiltros();
});
```

- [ ] **Step 2: Crear galeria.html**

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Galería de Animales — Patitas Felices</title>
  <meta name="description" content="Conocé a todos los animales rescatados en Patitas Felices. Adoptá, donÁ o hacete voluntario.">
  <link rel="stylesheet" href="css/main.css">
</head>
<body>

<nav class="navbar">
  <div class="navbar__inner">
    <a href="/" class="navbar__logo">🐾 Patitas Felices</a>
    <ul class="navbar__links">
      <li><a href="/#animales">Animales</a></li>
      <li><a href="/#como-ayudar">Cómo ayudar</a></li>
      <li><a href="testimonios.html">Testimonios</a></li>
      <li><a href="/#donacion">Donar</a></li>
    </ul>
    <div class="navbar__cta">
      <a href="/#donacion" class="btn btn-primary">❤️ Donar</a>
      <button class="hamburger"><span></span><span></span><span></span></button>
    </div>
  </div>
  <div class="mobile-menu">
    <a href="/">Inicio</a>
    <a href="testimonios.html">Testimonios</a>
    <a href="/#donacion" class="btn btn-primary" style="text-align:center">❤️ Donar</a>
  </div>
</nav>

<main style="padding-top:80px">
  <section class="section">
    <div class="container">
      <h1 class="reveal" style="margin-bottom:.5rem">Animales rescatados</h1>
      <p class="reveal" style="margin-bottom:2rem">Cada uno tiene una historia. Todos merecen un hogar.</p>

      <div style="display:flex;gap:2rem;flex-wrap:wrap;margin-bottom:1.5rem">
        <div>
          <p style="font-size:.8rem;font-weight:600;color:#6B7280;margin-bottom:.5rem;text-transform:uppercase;letter-spacing:.05em">Especie</p>
          <div class="filtros">
            <button class="filtro-btn active" data-filtro-especie="todos">Todos</button>
            <button class="filtro-btn" data-filtro-especie="perro">🐕 Perros</button>
            <button class="filtro-btn" data-filtro-especie="gato">🐈 Gatos</button>
            <button class="filtro-btn" data-filtro-especie="otro">🐇 Otros</button>
          </div>
        </div>
        <div>
          <p style="font-size:.8rem;font-weight:600;color:#6B7280;margin-bottom:.5rem;text-transform:uppercase;letter-spacing:.05em">Estado</p>
          <div class="filtros">
            <button class="filtro-btn active" data-filtro-estado="todos">Todos</button>
            <button class="filtro-btn" data-filtro-estado="disponibles">Disponibles</button>
            <button class="filtro-btn" data-filtro-estado="adoptados">Adoptados</button>
          </div>
        </div>
      </div>

      <div class="animales-grid" id="galeria-full"></div>

      <div style="text-align:center;margin-top:2.5rem">
        <button id="btn-mas" class="btn btn-primary" style="display:none">Ver más animales</button>
      </div>
    </div>
  </section>
</main>

<footer class="footer">
  <div class="container">
    <div class="footer__bottom">© 2026 Patitas Felices — <a href="/" style="color:var(--color-primary)">Volver al inicio</a></div>
  </div>
</footer>

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="js/supabase-client.js"></script>
<script src="js/utils.js"></script>
<script src="js/galeria.js"></script>
<script src="js/whatsapp.js"></script>
</body>
</html>
```

- [ ] **Step 3: Verificar galeria.html**

- Todos los animales del seed cargan en grid
- Filtro "Perros" → solo perros visibles
- Filtro "Gatos" → solo gatos
- Filtro "Adoptados" → solo con badge adoptado
- Botón "Ver más" aparece solo si hay >20 animales
- WhatsApp fab visible

- [ ] **Step 4: Commit**

```bash
git add galeria.html js/galeria.js
git commit -m "feat: galeria.html completa con filtros por especie y estado"
```

---

### Task 7: testimonios.html — Página completa

**Files:**
- Create: `testimonios.html`

**Interfaces:**
- Consumes: `loadTestimoniosFull` de testimonios.js

- [ ] **Step 1: Crear testimonios.html**

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Testimonios — Patitas Felices</title>
  <meta name="description" content="Lo que dicen adoptantes, voluntarios y donantes de Patitas Felices.">
  <link rel="stylesheet" href="css/main.css">
</head>
<body>

<nav class="navbar">
  <div class="navbar__inner">
    <a href="/" class="navbar__logo">🐾 Patitas Felices</a>
    <ul class="navbar__links">
      <li><a href="galeria.html">Animales</a></li>
      <li><a href="/#como-ayudar">Cómo ayudar</a></li>
      <li><a href="/#donacion">Donar</a></li>
    </ul>
    <div class="navbar__cta">
      <a href="/#donacion" class="btn btn-primary">❤️ Donar</a>
      <button class="hamburger"><span></span><span></span><span></span></button>
    </div>
  </div>
  <div class="mobile-menu">
    <a href="/">Inicio</a>
    <a href="galeria.html">Animales</a>
    <a href="/#donacion" class="btn btn-primary" style="text-align:center">❤️ Donar</a>
  </div>
</nav>

<main style="padding-top:80px">
  <section class="section">
    <div class="container">
      <h1 class="reveal" style="margin-bottom:.5rem">Testimonios</h1>
      <p class="reveal" style="margin-bottom:2rem">Adoptantes, voluntarios y donantes comparten su experiencia con Patitas Felices.</p>

      <div class="filtros reveal" id="filtros-tipo">
        <button class="filtro-btn active" data-filtro-tipo="todos">Todos</button>
        <button class="filtro-btn" data-filtro-tipo="adoptante">Adoptantes</button>
        <button class="filtro-btn" data-filtro-tipo="voluntario">Voluntarios</button>
        <button class="filtro-btn" data-filtro-tipo="donante">Donantes</button>
      </div>

      <div class="testimonios-grid" id="testimonios-full" style="margin-top:2rem"></div>
    </div>
  </section>
</main>

<footer class="footer">
  <div class="container">
    <div class="footer__bottom">© 2026 Patitas Felices — <a href="/" style="color:var(--color-primary)">Volver al inicio</a></div>
  </div>
</footer>

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="js/supabase-client.js"></script>
<script src="js/utils.js"></script>
<script src="js/testimonios.js"></script>
<script src="js/whatsapp.js"></script>
<script>
// Filtro por tipo en testimonios.html
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-filtro-tipo]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tipo = btn.dataset.filtroTipo;
      document.querySelectorAll('[data-filtro-tipo]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('#testimonios-full .testimonio-card').forEach(card => {
        card.style.display = (tipo === 'todos' || card.dataset.tipo === tipo) ? '' : 'none';
      });
    });
  });
});
</script>
</body>
</html>
```

- [ ] **Step 2: Verificar**

- Todos los testimonios del seed visibles
- Filtro "Adoptantes" → solo tipo adoptante
- Filtro "Voluntarios" → solo voluntarios
- WhatsApp fab visible

- [ ] **Step 3: Commit**

```bash
git add testimonios.html
git commit -m "feat: testimonios.html con filtros por tipo"
```

---

### Task 8: Panel Admin — Login + Auth Guard

**Files:**
- Create: `admin/index.html`
- Create: `js/admin/auth.js`

**Interfaces:**
- Consumes: `window.supabaseClient`, Supabase Auth
- Produce: login funcional con redirect a admin/animales.html; guard exportable como `checkAuth()`

- [ ] **Step 1: Crear js/admin/auth.js**

```js
// js/admin/auth.js

async function checkAuth() {
  const { data: { session } } = await window.supabaseClient.auth.getSession();
  if (!session) { window.location.href = '/admin/'; return false; }
  return true;
}

async function logout() {
  await window.supabaseClient.auth.signOut();
  window.location.href = '/admin/';
}

// En login page: manejar submit
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const pass  = document.getElementById('password').value;
  const errEl = document.getElementById('login-error');
  const btn   = document.getElementById('login-btn');

  btn.disabled = true;
  btn.textContent = 'Ingresando…';
  errEl.style.display = 'none';

  const { error } = await window.supabaseClient.auth.signInWithPassword({ email, password: pass });

  if (error) {
    errEl.textContent = 'Email o contraseña incorrectos.';
    errEl.style.display = 'block';
    btn.disabled = false;
    btn.textContent = 'Ingresar';
  } else {
    window.location.href = '/admin/animales.html';
  }
}
```

- [ ] **Step 2: Crear admin/index.html**

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin — Patitas Felices</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>body { font-family: 'Inter', sans-serif; }</style>
</head>
<body class="min-h-screen bg-gray-50 flex items-center justify-center p-4">

<div class="w-full max-w-sm">
  <div class="text-center mb-8">
    <div class="text-4xl mb-2">🐾</div>
    <h1 class="text-2xl font-bold text-gray-900">Patitas Felices</h1>
    <p class="text-gray-500 text-sm mt-1">Panel de administración</p>
  </div>

  <form id="login-form" onsubmit="handleLogin(event)" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
    <div class="mb-4">
      <label class="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
      <input id="email" type="email" required placeholder="admin@refugio.com"
        class="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 text-sm">
    </div>
    <div class="mb-6">
      <label class="block text-sm font-semibold text-gray-700 mb-1.5">Contraseña</label>
      <input id="password" type="password" required placeholder="••••••••"
        class="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 text-sm">
    </div>
    <div id="login-error" class="hidden mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"></div>
    <button id="login-btn" type="submit"
      class="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-lg transition-colors">
      Ingresar
    </button>
  </form>
  <p class="text-center mt-4 text-sm"><a href="/" class="text-orange-500 hover:underline">← Volver al sitio</a></p>
</div>

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="/js/supabase-client.js"></script>
<script src="/js/admin/auth.js"></script>
<script>
  // Si ya está logueado, redirigir
  window.supabaseClient.auth.getSession().then(({ data: { session } }) => {
    if (session) window.location.href = '/admin/animales.html';
  });
</script>
</body>
</html>
```

- [ ] **Step 3: Verificar**

- Abrir `/admin/` → muestra formulario de login
- Credenciales incorrectas → mensaje de error en rojo
- Credenciales correctas → redirect a `/admin/animales.html` (404 por ahora, OK)
- Si ya está logueado → redirect automático

- [ ] **Step 4: Commit**

```bash
git add admin/ js/admin/
git commit -m "feat: admin login con Supabase Auth y session guard"
```

---

### Task 9: Panel Admin — Gestión de Animales

**Files:**
- Create: `admin/animales.html`
- Create: `js/admin/animales-admin.js`

**Interfaces:**
- Consumes: `checkAuth()`, `window.supabaseClient`, bucket `animales-fotos`
- Produce: CRUD completo de animales con upload de fotos y toggles inline

- [ ] **Step 1: Crear js/admin/animales-admin.js**

```js
// js/admin/animales-admin.js

let editingId = null;

async function loadAnimales() {
  const tbody = document.getElementById('animales-tbody');
  tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-gray-400">Cargando…</td></tr>';
  const { data, error } = await window.supabaseClient
    .from('animales').select('*').order('created_at', { ascending: false });
  if (error) { tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-red-500">Error al cargar.</td></tr>'; return; }
  tbody.innerHTML = data.map(a => `
    <tr>
      <td>${a.foto_url ? `<img src="${a.foto_url}" class="admin-thumb">` : '🐾'}</td>
      <td class="font-semibold">${a.nombre}</td>
      <td>${a.especie}</td>
      <td>
        <label class="toggle-btn">
          <input type="checkbox" ${a.destacado ? 'checked' : ''} onchange="toggleField('${a.id}','destacado',this.checked)">
          <span class="toggle-slider"></span>
        </label>
      </td>
      <td>
        <label class="toggle-btn">
          <input type="checkbox" ${a.adoptado ? 'checked' : ''} onchange="toggleField('${a.id}','adoptado',this.checked)">
          <span class="toggle-slider"></span>
        </label>
      </td>
      <td>
        <div style="display:flex;gap:.5rem">
          <button onclick="openEdit(${JSON.stringify(a).replace(/"/g,'&quot;')})" class="btn-admin btn-admin-ghost">Editar</button>
          <button onclick="deleteAnimal('${a.id}','${a.nombre}')" class="btn-admin btn-admin-danger">Eliminar</button>
        </div>
      </td>
    </tr>`).join('') || '<tr><td colspan="6" class="text-center py-8 text-gray-400">No hay animales aún.</td></tr>';
}

async function toggleField(id, field, value) {
  await window.supabaseClient.from('animales').update({ [field]: value }).eq('id', id);
}

function openModal(animal = null) {
  editingId = animal ? animal.id : null;
  document.getElementById('modal-title').textContent = animal ? 'Editar animal' : 'Nuevo animal';
  document.getElementById('f-nombre').value    = animal?.nombre    || '';
  document.getElementById('f-especie').value   = animal?.especie   || 'perro';
  document.getElementById('f-edad').value      = animal?.edad      || '';
  document.getElementById('f-historia').value  = animal?.historia  || '';
  const preview = document.getElementById('img-preview');
  if (animal?.foto_url) { preview.src = animal.foto_url; preview.classList.add('visible'); }
  else { preview.classList.remove('visible'); }
  document.getElementById('modal').style.display = 'flex';
}

function openEdit(animal) { openModal(animal); }

function closeModal() {
  document.getElementById('modal').style.display = 'none';
  document.getElementById('animal-form').reset();
  editingId = null;
}

document.getElementById('f-foto').addEventListener('change', function() {
  const preview = document.getElementById('img-preview');
  if (this.files[0]) { preview.src = URL.createObjectURL(this.files[0]); preview.classList.add('visible'); }
});

async function saveAnimal(e) {
  e.preventDefault();
  const btn = document.getElementById('save-btn');
  btn.disabled = true; btn.textContent = 'Guardando…';

  let foto_url = null;
  const file = document.getElementById('f-foto').files[0];

  if (file) {
    const ext  = file.name.split('.').pop();
    const path = `${Date.now()}.${ext}`;
    const { error: uploadErr } = await window.supabaseClient.storage
      .from('animales-fotos').upload(path, file, { upsert: true });
    if (uploadErr) { alert('Error al subir la foto.'); btn.disabled = false; btn.textContent = 'Guardar'; return; }
    const { data: { publicUrl } } = window.supabaseClient.storage.from('animales-fotos').getPublicUrl(path);
    foto_url = publicUrl;
  }

  const payload = {
    nombre:   document.getElementById('f-nombre').value.trim(),
    especie:  document.getElementById('f-especie').value,
    edad:     document.getElementById('f-edad').value.trim(),
    historia: document.getElementById('f-historia').value.trim(),
    ...(foto_url && { foto_url })
  };

  const { error } = editingId
    ? await window.supabaseClient.from('animales').update(payload).eq('id', editingId)
    : await window.supabaseClient.from('animales').insert(payload);

  if (error) { alert('Error al guardar: ' + error.message); }
  else { closeModal(); await loadAnimales(); }

  btn.disabled = false; btn.textContent = 'Guardar';
}

async function deleteAnimal(id, nombre) {
  if (!confirm(`¿Eliminar a ${nombre}? Esta acción no se puede deshacer.`)) return;
  await window.supabaseClient.from('animales').delete().eq('id', id);
  await loadAnimales();
}

document.addEventListener('DOMContentLoaded', async () => {
  if (!await checkAuth()) return;
  document.getElementById('admin-email').textContent =
    (await window.supabaseClient.auth.getUser()).data.user?.email || '';
  await loadAnimales();
  document.getElementById('animal-form').addEventListener('submit', saveAnimal);
});
```

- [ ] **Step 2: Crear admin/animales.html**

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Animales — Admin Patitas Felices</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="/css/admin.css">
</head>
<body>

<aside class="admin-sidebar">
  <a href="/" class="admin-sidebar__logo">🐾 Patitas Felices</a>
  <nav class="admin-sidebar__nav">
    <a href="animales.html" class="active">🐾 Animales</a>
    <a href="testimonios.html">💬 Testimonios</a>
    <a href="/" target="_blank">🌐 Ver sitio</a>
    <a href="#" onclick="logout(); return false;" style="margin-top:auto;color:#9CA3AF">↩ Cerrar sesión</a>
  </nav>
</aside>

<main class="admin-main">
  <div class="admin-header">
    <h1>Animales</h1>
    <div style="display:flex;align-items:center;gap:1rem">
      <span id="admin-email" style="font-size:.875rem;color:#6B7280"></span>
      <button onclick="openModal()" class="btn-admin btn-admin-primary">+ Nuevo animal</button>
    </div>
  </div>

  <div style="background:#fff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.08);overflow:hidden">
    <table class="admin-table">
      <thead>
        <tr>
          <th>Foto</th>
          <th>Nombre</th>
          <th>Especie</th>
          <th>Destacado</th>
          <th>Adoptado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody id="animales-tbody"></tbody>
    </table>
  </div>
</main>

<!-- MODAL -->
<div id="modal" class="modal-overlay" style="display:none" onclick="if(event.target===this)closeModal()">
  <div class="modal-box">
    <h2 id="modal-title">Nuevo animal</h2>
    <form id="animal-form">
      <div class="form-group">
        <label>Nombre *</label>
        <input id="f-nombre" type="text" required placeholder="Ej: Luna">
      </div>
      <div class="form-group">
        <label>Especie *</label>
        <select id="f-especie">
          <option value="perro">Perro</option>
          <option value="gato">Gato</option>
          <option value="otro">Otro</option>
        </select>
      </div>
      <div class="form-group">
        <label>Edad</label>
        <input id="f-edad" type="text" placeholder="Ej: 2 años, 6 meses">
      </div>
      <div class="form-group">
        <label>Historia</label>
        <textarea id="f-historia" placeholder="Contá brevemente la historia de rescate…"></textarea>
      </div>
      <div class="form-group">
        <label>Foto</label>
        <input id="f-foto" type="file" accept="image/jpeg,image/png,image/webp">
        <img id="img-preview" class="img-preview" alt="Preview">
      </div>
      <div style="display:flex;gap:.75rem;justify-content:flex-end;margin-top:1.5rem">
        <button type="button" onclick="closeModal()" class="btn-admin btn-admin-ghost">Cancelar</button>
        <button type="submit" id="save-btn" class="btn-admin btn-admin-primary">Guardar</button>
      </div>
    </form>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="/js/supabase-client.js"></script>
<script src="/js/admin/auth.js"></script>
<script src="/js/admin/animales-admin.js"></script>
</body>
</html>
```

- [ ] **Step 3: Verificar**

- Sin sesión → redirect a `/admin/`
- Con sesión: tabla muestra 8 animales del seed
- Toggle "Destacado" → cambia en Supabase al instante
- "Nuevo animal" → modal se abre, se puede subir foto, guardar
- El animal nuevo aparece en la tabla y en el sitio público
- "Eliminar" → confirm → animal desaparece

- [ ] **Step 4: Commit**

```bash
git add admin/animales.html js/admin/animales-admin.js
git commit -m "feat: admin CRUD completo de animales con upload a Supabase Storage"
```

---

### Task 10: Panel Admin — Gestión de Testimonios

**Files:**
- Create: `admin/testimonios.html`
- Create: `js/admin/testimonios-admin.js`

**Interfaces:**
- Consumes: `checkAuth()`, `window.supabaseClient`, tabla `testimonios`
- Produce: CRUD de testimonios

- [ ] **Step 1: Crear js/admin/testimonios-admin.js**

```js
// js/admin/testimonios-admin.js
let editingId = null;

async function loadTestimonios() {
  const tbody = document.getElementById('test-tbody');
  tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-gray-400">Cargando…</td></tr>';
  const { data } = await window.supabaseClient
    .from('testimonios').select('*').order('created_at', { ascending: false });
  tbody.innerHTML = (data || []).map(t => `
    <tr>
      <td class="font-semibold">${t.nombre}</td>
      <td><span class="badge badge-${t.tipo}">${t.tipo}</span></td>
      <td style="max-width:300px;font-size:.85rem;color:#6B7280">${t.texto.slice(0,80)}…</td>
      <td>
        <label class="toggle-btn">
          <input type="checkbox" ${t.destacado ? 'checked' : ''} onchange="toggleDestacado('${t.id}',this.checked)">
          <span class="toggle-slider"></span>
        </label>
      </td>
      <td>
        <div style="display:flex;gap:.5rem">
          <button onclick="openEdit(${JSON.stringify(t).replace(/"/g,'&quot;')})" class="btn-admin btn-admin-ghost">Editar</button>
          <button onclick="deleteTest('${t.id}','${t.nombre}')" class="btn-admin btn-admin-danger">Eliminar</button>
        </div>
      </td>
    </tr>`).join('') || '<tr><td colspan="5" class="text-center py-8 text-gray-400">No hay testimonios.</td></tr>';
}

async function toggleDestacado(id, value) {
  await window.supabaseClient.from('testimonios').update({ destacado: value }).eq('id', id);
}

function openModal(t = null) {
  editingId = t ? t.id : null;
  document.getElementById('modal-title').textContent = t ? 'Editar testimonio' : 'Nuevo testimonio';
  document.getElementById('f-nombre').value = t?.nombre || '';
  document.getElementById('f-tipo').value   = t?.tipo   || 'adoptante';
  document.getElementById('f-texto').value  = t?.texto  || '';
  document.getElementById('modal').style.display = 'flex';
}

function openEdit(t) { openModal(t); }
function closeModal() { document.getElementById('modal').style.display = 'none'; editingId = null; }

async function saveTestimonio(e) {
  e.preventDefault();
  const btn = document.getElementById('save-btn');
  btn.disabled = true; btn.textContent = 'Guardando…';
  const payload = {
    nombre: document.getElementById('f-nombre').value.trim(),
    tipo:   document.getElementById('f-tipo').value,
    texto:  document.getElementById('f-texto').value.trim(),
  };
  const { error } = editingId
    ? await window.supabaseClient.from('testimonios').update(payload).eq('id', editingId)
    : await window.supabaseClient.from('testimonios').insert(payload);
  if (error) { alert('Error: ' + error.message); }
  else { closeModal(); await loadTestimonios(); }
  btn.disabled = false; btn.textContent = 'Guardar';
}

async function deleteTest(id, nombre) {
  if (!confirm(`¿Eliminar el testimonio de ${nombre}?`)) return;
  await window.supabaseClient.from('testimonios').delete().eq('id', id);
  await loadTestimonios();
}

document.addEventListener('DOMContentLoaded', async () => {
  if (!await checkAuth()) return;
  await loadTestimonios();
  document.getElementById('test-form').addEventListener('submit', saveTestimonio);
});
```

- [ ] **Step 2: Crear admin/testimonios.html**

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Testimonios — Admin Patitas Felices</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="/css/admin.css">
</head>
<body>

<aside class="admin-sidebar">
  <a href="/" class="admin-sidebar__logo">🐾 Patitas Felices</a>
  <nav class="admin-sidebar__nav">
    <a href="animales.html">🐾 Animales</a>
    <a href="testimonios.html" class="active">💬 Testimonios</a>
    <a href="/" target="_blank">🌐 Ver sitio</a>
    <a href="#" onclick="logout(); return false;" style="margin-top:auto;color:#9CA3AF">↩ Cerrar sesión</a>
  </nav>
</aside>

<main class="admin-main">
  <div class="admin-header">
    <h1>Testimonios</h1>
    <button onclick="openModal()" class="btn-admin btn-admin-primary">+ Nuevo testimonio</button>
  </div>

  <div style="background:#fff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.08);overflow:hidden">
    <table class="admin-table">
      <thead>
        <tr>
          <th>Nombre</th><th>Tipo</th><th>Texto</th><th>Destacado</th><th>Acciones</th>
        </tr>
      </thead>
      <tbody id="test-tbody"></tbody>
    </table>
  </div>
</main>

<div id="modal" class="modal-overlay" style="display:none" onclick="if(event.target===this)closeModal()">
  <div class="modal-box">
    <h2 id="modal-title">Nuevo testimonio</h2>
    <form id="test-form">
      <div class="form-group">
        <label>Nombre *</label>
        <input id="f-nombre" type="text" required placeholder="Ej: Martina G.">
      </div>
      <div class="form-group">
        <label>Tipo *</label>
        <select id="f-tipo">
          <option value="adoptante">Adoptante</option>
          <option value="voluntario">Voluntario</option>
          <option value="donante">Donante</option>
        </select>
      </div>
      <div class="form-group">
        <label>Testimonio *</label>
        <textarea id="f-texto" required placeholder="Escribí el testimonio…" style="min-height:140px"></textarea>
      </div>
      <div style="display:flex;gap:.75rem;justify-content:flex-end;margin-top:1.5rem">
        <button type="button" onclick="closeModal()" class="btn-admin btn-admin-ghost">Cancelar</button>
        <button type="submit" id="save-btn" class="btn-admin btn-admin-primary">Guardar</button>
      </div>
    </form>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="/js/supabase-client.js"></script>
<script src="/js/admin/auth.js"></script>
<script src="/js/admin/testimonios-admin.js"></script>
</body>
</html>
```

- [ ] **Step 3: Verificar**

- Tabla muestra 6 testimonios del seed
- Toggle destacado funciona
- Nuevo testimonio → aparece en tabla y en el sitio público
- Eliminar → confirm → desaparece

- [ ] **Step 4: Commit**

```bash
git add admin/testimonios.html js/admin/testimonios-admin.js
git commit -m "feat: admin CRUD testimonios completo"
```

---

### Task 11: Completar credenciales y deploy a Vercel

**Files:**
- Modify: `js/supabase-client.js` (credenciales reales)
- Modify: todos los `[DATO_PENDIENTE]` con datos reales

**Interfaces:**
- Produce: sitio en producción en Vercel

- [ ] **Step 1: Reemplazar credenciales Supabase**

En `js/supabase-client.js` reemplazar:
```js
const SUPABASE_URL  = 'https://[PROYECTO].supabase.co'; // URL real de Task 1 Step 8
const SUPABASE_ANON = '[ANON_KEY_REAL]';                // Key real de Task 1 Step 8
```

- [ ] **Step 2: Reemplazar todos los placeholders**

Buscar y reemplazar en todos los archivos:
- `[NUMERO_WHATSAPP]` → ej: `5491112345678`
- `[ALIAS_MERCADOPAGO]` → alias real del refugio
- `[CVU_MERCADOPAGO]` → CVU real
- `[INSTAGRAM_URL]` → URL del perfil
- `[FACEBOOK_URL]` → URL del perfil
- `[TIKTOK_URL]` → URL del perfil
- `[EMAIL_REFUGIO]` → email real
- `[CIUDAD]` → ciudad del refugio
- `[AÑO]` → año de fundación
- `[DOMINIO]` → dominio final (actualizar post-deploy)

- [ ] **Step 3: Agregar imagen hero placeholder**

Si no hay foto real, crear un `assets/img/hero.jpg` de placeholder o cambiar temporalmente la sección hero:
```css
/* Fallback sin imagen */
.hero__bg { background: linear-gradient(135deg, #1A1A1A 0%, #374151 100%); }
```

- [ ] **Step 4: Commit final**

```bash
git add .
git commit -m "feat: credenciales Supabase y datos reales del refugio"
```

- [ ] **Step 5: Deploy via MCP Vercel**

```
1. mcp__claude_ai_Vercel__list_teams()
   → teamId: team_czYbIu3XXy0EUAcWG2oboM3b

2. mcp__claude_ai_Vercel__deploy_to_vercel(
     files: todos los archivos del proyecto,
     teamId: "team_czYbIu3XXy0EUAcWG2oboM3b"
   )

3. mcp__claude_ai_Vercel__list_deployments(teamId) → verificar estado READY

4. mcp__claude_ai_Vercel__web_fetch_vercel_url(url) → verificar HTTP 200
```

- [ ] **Step 6: Verificar producción**

- Landing completo carga sin errores
- Galería preview muestra 8 animales
- Testimonios cargan
- Botón copiar alias/CVU funciona
- WhatsApp abre con mensaje predefinido
- `/admin/` → login funciona
- Admin puede subir un animal nuevo → aparece en el sitio

---

## Self-Review del Plan

**Spec coverage:**
- ✅ Hero con CTA → Task 3
- ✅ Contador impacto → Task 3
- ✅ Cómo ayudar (3 formas) → Task 4
- ✅ Galería preview 8 animals → Task 4
- ✅ Sección donación con alias/CVU copiable → Task 5
- ✅ Testimonios preview → Task 5
- ✅ Redes sociales → Task 5
- ✅ Footer → Task 5
- ✅ WhatsApp fab → Task 5
- ✅ galeria.html con filtros y paginación → Task 6
- ✅ testimonios.html con filtros → Task 7
- ✅ Admin login + auth guard → Task 8
- ✅ Admin animales CRUD + photo upload → Task 9
- ✅ Admin testimonios CRUD → Task 10
- ✅ Deploy Vercel → Task 11
- ✅ SEO meta tags y schema.org → incluidos en index.html Task 3
- ✅ RLS Supabase → Task 1
- ✅ Responsive mobile-first → CSS en Task 2

**Placeholders:** Todos los `[DATO_PENDIENTE]` están documentados y centralizados en Task 11 Step 2. Intencional — el refugio los provee antes del go-live.

**Tipo consistency:** `buildAnimalCard`, `buildTestimonioCard`, `checkAuth`, `loadGaleriaFull`, `loadTestimoniosFull` — nombres consistentes entre tasks.

**Scope:** 11 tasks, 1 sitio, sin subsistemas independientes. Correcto.
