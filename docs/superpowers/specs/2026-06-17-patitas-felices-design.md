# Design Spec: Sitio Web Patitas Felices

**Fecha:** 2026-06-17  
**Proyecto:** Refugio Animal "Patitas Felices" (nombre provisional)  
**Stack:** HTML/CSS/JS vanilla + Supabase + Vercel  
**Estado:** Aprobado para implementación

---

## 1. Objetivo

Crear un sitio web completo para un refugio animal ya existente, cuyo objetivo principal es **captar donaciones y colaboradores** (dinero, alimentos, voluntariado). El sitio debe transmitir emoción, confianza y urgencia a través de contenido real: animales rescatados, testimonios genuinos y métricas de impacto.

---

## 2. Arquitectura

### Estructura de archivos

```
patitas-felices/
├── index.html                  ← Landing principal (pública)
├── galeria.html                ← Galería completa de animales
├── testimonios.html            ← Todos los testimonios
├── admin/
│   ├── index.html              ← Login admin (Supabase Auth)
│   ├── animales.html           ← CRUD galería de animales
│   └── testimonios.html        ← CRUD testimonios
├── css/
│   ├── main.css                ← Estilos del sitio público
│   └── admin.css               ← Estilos del panel admin
├── js/
│   ├── supabase-client.js      ← Inicialización cliente Supabase
│   ├── galeria.js              ← Carga dinámica de animales
│   ├── testimonios.js          ← Carga dinámica de testimonios
│   ├── donacion.js             ← Copy de alias/CVU
│   ├── whatsapp.js             ← Botón flotante WhatsApp
│   └── admin/
│       ├── auth.js             ← Login/logout/session guard
│       ├── animales-admin.js   ← CRUD animales + upload fotos
│       └── testimonios-admin.js← CRUD testimonios
└── assets/
    ├── img/                    ← Imágenes estáticas (logo, hero, og-image)
    └── icons/                  ← SVGs de redes sociales
```

### Stack técnico

| Capa | Tecnología | Rol |
|---|---|---|
| Frontend público | HTML5 + CSS3 + JS vanilla | Sitio estático servido por Vercel |
| Panel admin | HTML + Tailwind CDN + JS vanilla | Interface de gestión de contenido |
| Base de datos | Supabase PostgreSQL | Almacena animales y testimonios |
| Archivos/fotos | Supabase Storage | Bucket público para fotos de animales |
| Autenticación | Supabase Auth (email/password) | Protege el panel admin |
| Seguridad | Row Level Security (RLS) | Público solo lee; admin puede escribir |
| Deploy | Vercel (MCP) | Hosting estático con CDN global |

---

## 3. Base de Datos Supabase

### Tabla `animales`

```sql
CREATE TABLE animales (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      text NOT NULL,
  especie     text NOT NULL CHECK (especie IN ('perro', 'gato', 'otro')),
  edad        text,
  historia    text,
  foto_url    text,
  adoptado    boolean DEFAULT false,
  destacado   boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);
```

### Tabla `testimonios`

```sql
CREATE TABLE testimonios (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      text NOT NULL,
  tipo        text NOT NULL CHECK (tipo IN ('adoptante', 'voluntario', 'donante')),
  texto       text NOT NULL,
  foto_url    text,
  destacado   boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);
```

### Storage

- **Bucket:** `animales-fotos` (público para lectura)
- Las URLs son permanentes y directas desde Supabase CDN

### RLS Policies

```sql
-- Animales: lectura pública
CREATE POLICY "public_read_animales" ON animales FOR SELECT USING (true);

-- Animales: escritura solo autenticados
CREATE POLICY "admin_write_animales" ON animales FOR ALL USING (auth.role() = 'authenticated');

-- Testimonios: lectura pública
CREATE POLICY "public_read_testimonios" ON testimonios FOR SELECT USING (true);

-- Testimonios: escritura solo autenticados
CREATE POLICY "admin_write_testimonios" ON testimonios FOR ALL USING (auth.role() = 'authenticated');
```

---

## 4. Diseño Visual

### Paleta de colores

| Token | Valor | Uso |
|---|---|---|
| `--color-primary` | `#F97316` | Naranja cálido — CTA, acentos |
| `--color-primary-dark` | `#EA580C` | Hover de botones |
| `--color-dark` | `#1A1A1A` | Textos principales |
| `--color-gray` | `#6B7280` | Textos secundarios |
| `--color-light` | `#FFF7F0` | Fondos alternos |
| `--color-white` | `#FFFFFF` | Fondo principal |
| `--color-whatsapp` | `#25D366` | Botón WhatsApp |

### Tipografía

- **Fuente:** Inter (Google Fonts)
- **H1:** 56px / 700 weight
- **H2:** 36px / 700 weight
- **H3:** 24px / 600 weight
- **Body:** 16px / 400 weight / line-height 1.6
- **Caption:** 14px / 400 weight

### Animaciones

- Scroll reveal: `opacity 0 → 1` + `translateY(20px → 0)` con `IntersectionObserver`
- Sin librerías externas — CSS puro con clases `.reveal` y `.revealed`
- Hero parallax suave: `background-attachment: fixed`

---

## 5. Secciones del Landing (index.html)

### 5.1 Hero

- Foto de fondo full-width del refugio con overlay oscuro semitransparente
- Logo del refugio (SVG/PNG)
- Headline: *"Cada vida importa. Ayudanos a salvarlas."*
- Subheadline: *"Somos [nombre], un refugio en [ciudad] rescatando animales desde [año]."*
- CTA primario: `[Quiero donar]` → ancla a sección donación
- CTA secundario: `[Conocé los animales]` → ancla a sección galería
- Navegación fija (sticky) con links a secciones

### 5.2 Contador de Impacto

- 4 métricas con animación de count-up al hacer scroll:
  - 🐾 Animales rescatados
  - 🏠 Animales adoptados
  - ❤️ Familias colaboradoras
  - 🍖 Kg de alimento al mes (aproximado)
- Fondo naranja (`--color-primary`) para contraste visual
- **Hardcodeado inicialmente** — el refugio provee los números reales

### 5.3 Cómo Ayudar

- 3 cards con ícono SVG + título + descripción corta + CTA:
  1. **Donar dinero** → ancla a sección donación
  2. **Donar alimentos** → abre WhatsApp con mensaje predefinido
  3. **Ser voluntario** → abre WhatsApp con mensaje predefinido
- Layout: flex row en desktop, stack en mobile

### 5.4 Galería Preview

- Título: *"Animales que esperan tu ayuda"*
- Grid de 8 cards (los 8 con `destacado = true` y `adoptado = false`)
- Cada card: foto, nombre, especie, edad, historia corta (truncada a 100 chars)
- Badge naranja "¡Adoptado!" si `adoptado = true`
- Botón: `[Ver todos los animales]` → link a `galeria.html`
- Cargado dinámicamente desde Supabase al hacer scroll (lazy load)

### 5.5 Sección Donación

- Fondo `--color-light` (naranja muy claro)
- Headline: *"Tu donación salva vidas reales"*
- Descripción del impacto de cada monto (ej: "Con $1.000 compramos alimento para 5 días")
- Datos bancarios con botón de copiar (clipboard API):
  - **Alias:** `patitas.felices` (a confirmar)
  - **CVU:** `[CVU real]` (a proveer por el refugio)
- Logo de MercadoPago
- Mensaje de agradecimiento: *"Cada peso llega directamente al refugio. Sin intermediarios."*

### 5.6 Testimonios Preview

- Grid 3 columnas (masonry-like) con 6 testimonios destacados
- Cada card: foto circular (o avatar generado si no hay foto), nombre, badge de tipo, texto
- Colores de badge por tipo:
  - Adoptante: naranja
  - Voluntario: verde teal
  - Donante: azul
- Botón: `[Ver todos los testimonios]` → link a `testimonios.html`

### 5.7 Redes Sociales

- Sección simple con los 3 íconos grandes de redes
- Link externo a cada perfil (abrir en nueva pestaña)
- Texto: *"Seguinos y compartí — cada compartido llega a una familia más"*
- Embed opcional de últimas fotos de Instagram (si tienen token de API)

### 5.8 Footer

- Logo + nombre del refugio
- Links rápidos: Inicio, Animales, Testimonios, Admin
- Datos de contacto: email + WhatsApp
- Redes sociales (íconos pequeños)
- Texto legal mínimo: "Refugio sin fines de lucro. [Ciudad], Argentina."

---

## 6. Páginas Secundarias

### galeria.html

- Header con filtros: Todos / Perros / Gatos / Otros / Disponibles / Adoptados
- Grid responsive: 4 cols desktop, 2 tablet, 1 mobile
- Paginación: carga de 20 en 20 con botón "Ver más" (no infinite scroll)
- Misma card que el landing pero con historia completa visible

### testimonios.html

- Grid masonry 3 columnas
- Filtro por tipo: Todos / Adoptantes / Voluntarios / Donantes
- Carga todos los testimonios (sin paginación salvo que sean +50)

---

## 7. Panel Admin

### admin/index.html — Login

- Formulario centrado: email + contraseña
- Submit → `supabase.auth.signInWithPassword()`
- Si session activa → redirect a `admin/animales.html`
- Error handling: mensaje claro en pantalla

### admin/animales.html

- Guard: si no hay session → redirect a `admin/index.html`
- Tabla con todos los animales: foto thumbnail, nombre, especie, estado
- Toggles inline para `destacado` y `adoptado`
- Botón `[+ Nuevo animal]` → abre modal/formulario lateral
- Formulario: nombre, especie (select), edad, historia (textarea), foto (file input → Supabase Storage)
- Botón eliminar con `confirm()` antes de ejecutar

### admin/testimonios.html

- Misma estructura que animales
- Formulario: nombre, tipo (select), texto (textarea), foto (file input, opcional)
- Toggle `destacado` inline

---

## 8. Componentes Transversales

### Botón flotante WhatsApp

- Presente en TODAS las páginas (public y admin excluido)
- Fixed bottom-right: `position: fixed; bottom: 24px; right: 24px`
- Ícono WhatsApp verde, tamaño 56px, shadow
- Link: `https://wa.me/[NUMERO]?text=Hola! Quiero ayudar al refugio Patitas Felices`
- El número real lo provee el refugio

### Navegación sticky

- Logo izquierda
- Links centro: Inicio, Animales, Testimonios, Cómo ayudar
- CTA derecha: `[Donar]` — botón naranja
- En mobile: hamburger menu con drawer lateral

### Meta tags y SEO

```html
<meta name="description" content="Refugio animal Patitas Felices — rescatamos, rehabilitamos y buscamos hogar para animales en [ciudad]. Ayudanos con tu donación.">
<meta property="og:title" content="Patitas Felices — Refugio Animal">
<meta property="og:description" content="Cada vida importa. Ayudanos a salvarlas.">
<meta property="og:image" content="/assets/img/og-image.jpg">
<meta property="og:type" content="website">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "NGO",
  "name": "Patitas Felices",
  "description": "Refugio animal sin fines de lucro",
  "url": "https://[dominio].vercel.app",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "availableLanguage": "Spanish"
  }
}
</script>
```

---

## 9. Variables de Entorno

```
SUPABASE_URL=https://[proyecto].supabase.co
SUPABASE_ANON_KEY=[anon-key-publica]
```

Ambas van en `js/supabase-client.js` directamente (son públicas por diseño de Supabase). La seguridad real la provee RLS.

---

## 10. Datos Pendientes del Refugio

Antes del deploy en producción, el refugio debe proveer:

- [ ] Nombre definitivo del refugio
- [ ] Ciudad/ubicación
- [ ] Año de fundación
- [ ] Número de WhatsApp (con código de país: 549...)
- [ ] Alias de MercadoPago
- [ ] CVU
- [ ] Email de contacto
- [ ] Links a Instagram, Facebook, TikTok
- [ ] Foto para el hero (alta resolución)
- [ ] Logo (SVG o PNG con fondo transparente)
- [ ] Métricas reales para el contador de impacto
- [ ] Mínimo 8 fotos de animales para la galería inicial
- [ ] Mínimo 6 testimonios para el lanzamiento
- [ ] Contraseña para la cuenta admin

---

## 11. Criterios de Éxito

- [ ] El sitio carga en menos de 3 segundos en mobile (3G)
- [ ] La galería y testimonios cargan dinámicamente desde Supabase sin error
- [ ] El panel admin permite subir un animal nuevo en menos de 2 minutos
- [ ] El alias/CVU se copia al portapapeles con un click
- [ ] El sitio es completamente responsive (mobile-first)
- [ ] Lighthouse score: Performance >85, SEO >95, Accessibility >90
- [ ] El botón de WhatsApp abre con mensaje predefinido en todas las páginas

---

*Spec aprobado por Juan Ignacio Cedrolla — Giovanni Servicios IA*
