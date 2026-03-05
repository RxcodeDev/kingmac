# 🗺️ SKILL MAESTRO — Mapa de Contexto del Proyecto

> **Cómo usar este archivo con IA:**
> Pega este archivo completo al inicio de cualquier conversación con IA
> para que entienda la arquitectura del proyecto al instante.

---

## Arquitectura General

```
ecomerse/                          ← Raíz del tema Shopify OS 2.0
│
├── layout/
│   └── theme.liquid               ← HTML shell, CSS/JS entries, Cart Drawer, OG meta
│
├── templates/
│   └── index.json                 ← Orden y configuración de secciones del home
│
├── sections/                      ← Un archivo por sección, 100% configurable
│   ├── announcement-bar.liquid
│   ├── header.liquid
│   ├── hero-slideshow.liquid
│   ├── product-grid.liquid
│   ├── featured-banner.liquid
│   ├── shipping-section.liquid
│   ├── content-highlight.liquid
│   ├── marquee.liquid
│   ├── logistics-notice.liquid
│   ├── promo-cards.liquid
│   ├── catalogs.liquid
│   └── footer.liquid
│
├── snippets/                      ← Componentes UI reutilizables
│   ├── product-card.liquid        ← Card de producto (real)
│   ├── product-card-placeholder.liquid  ← Card placeholder (editor)
│   ├── logo.liquid                ← Logo con fallback
│   ├── icon.liquid                ← SVG icons centralizados
│   └── social-icons.liquid        ← Links de redes sociales
│
├── assets/
│   ├── theme-base.css             ← 🎨 TOKENS MASTER + Reset + Botones + Utilities
│   ├── theme-header.css           ← Announcement bar, Header, Nav, Mobile
│   ├── theme-hero.css             ← Hero slideshow
│   ├── theme-products.css         ← Product card
│   ├── theme-sections.css         ← Todos los demás bloques de sección
│   ├── theme-footer.css           ← Footer
│   ├── theme-cart.css             ← Cart drawer + Toast
│   ├── theme-responsive.css       ← Media queries tablet/mobile
│   └── theme.js                   ← Cart, HeroSlideshow, MobileNav, Parallax, Marquee
│
└── config/
    ├── settings_schema.json       ← Expone tokens al Customizer de Shopify
    └── settings_data.json         ← Valores actuales guardados
```

---

## Índice de Archivos por Intención de Cambio

### 🎨 Quiero cambiar estilos visuales globales
→ [assets/theme-base.css](assets/theme-base.css) — variables de color, tipografía, spacing
→ [layout/theme.liquid](layout/theme.liquid) — `:root {}` block que inyecta los valores del customizer

### 🖌️ Quiero cambiar un color puntual sin tocar el código
→ Shopify Admin → Tienda Online → Personalizar → Colores
→ Eso edita [config/settings_data.json](config/settings_data.json) y se refleja en todas las variables CSS automáticamente

### 🧩 Quiero modificar un componente UI
| Componente | Liquid | CSS |
|-----------|--------|-----|
| Product card | [snippets/product-card.liquid](snippets/product-card.liquid) | `theme-products.css` |
| Product card placeholder | [snippets/product-card-placeholder.liquid](snippets/product-card-placeholder.liquid) | `theme-products.css` |
| Logo | [snippets/logo.liquid](snippets/logo.liquid) | — |
| Ícono SVG | [snippets/icon.liquid](snippets/icon.liquid) | — |
| Social icons | [snippets/social-icons.liquid](snippets/social-icons.liquid) | `theme-footer.css` |
| Carrito (drawer) | [layout/theme.liquid](layout/theme.liquid) línea ≈75 | `theme-cart.css` |
| Toast de carrito | [layout/theme.liquid](layout/theme.liquid) | `theme-cart.css` |

### 🖥️ Quiero editar una página específica

| Página | Template | Sección principal | Snippet clave |
|--------|----------|-------------------|---------------|
| Home | `templates/index.json` | `hero-slideshow` | — |
| Home — productos | `templates/index.json` | `product-grid` | `product-card` |
| Home — envíos | `templates/index.json` | `shipping-section` | `product-card` |
| Home — banners | `templates/index.json` | `featured-banner` | — |
| Home — marquee | `templates/index.json` | `marquee` | `icon` |
| Home — catalogs | `templates/index.json` | `catalogs` | — |
| Todas | `layout/theme.liquid` | `header`, `footer` | `logo`, `icon`, `social-icons` |

### ⚙️ Quiero cambiar lógica de negocio

| Funcionalidad | Archivo | Dónde |
|---------------|---------|-------|
| Agregar al carrito (AJAX) | `assets/theme.js` | `Cart.addItem()` |
| Renderizar items del carrito | `assets/theme.js` | `Cart.renderCart()` |
| Contadores del carrito | `assets/theme.js` | `Cart.updateCountBadges()` |
| Slideshow autoplay | `assets/theme.js` | `HeroSlideshow.init()` |
| Menú hamburguesa | `assets/theme.js` | `MobileNav.init()` |
| Parallax de Content Highlight | `assets/theme.js` | `Parallax.init()` |
| Marquee reduced-motion | `assets/theme.js` | `Marquee.init()` |

### 🛒 Quiero tocar el carrito / checkout
→ **Drawer HTML** → [layout/theme.liquid](layout/theme.liquid) línea ≈65–100
→ **Drawer CSS** → [assets/theme-cart.css](assets/theme-cart.css)
→ **Drawer JS** → [assets/theme.js](assets/theme.js) módulo `Cart`
→ **Textos configurables** → Shopify Admin → Personalizar → Carrito — textos

---

## Variables CSS Globales

Todas definidas en [assets/theme-base.css](assets/theme-base.css) y sobreescritas en runtime por [layout/theme.liquid](layout/theme.liquid) desde el Customizer.

### Colores
| Variable | Valor por defecto | Uso |
|----------|-------------------|-----|
| `--color-primary` | `#1B2A4A` | Botones, UI chrome, cart drawer |
| `--color-primary-dark` | `#14203a` | Hover de primary |
| `--color-secondary` | `#12448F` | Títulos de producto, precio |
| `--color-accent` | `#E87722` | Nav bar, badges, highlights |
| `--color-accent-dark` | `#d06b1a` | Hover de accent |
| `--color-background` | `#FFFFFF` | Fondo de página y tarjetas |
| `--color-text` | `#333333` | Texto del cuerpo |
| `--color-black` | `#000000` | Header, marquee, elementos oscuros |
| `--color-gray` | `#6B7280` | Texto secundario, iconos |
| `--color-light-gray` | `#F5F5F5` | Fondo sutil de secciones |
| `--color-neutral` | `#D5D5DB` | Bordes, fondos de tarjeta |
| `--color-header-bg` | `var(--color-black)` | Fondo del site header |
| `--color-nav-bg` | `var(--color-accent)` | Barra de navegación |
| `--color-announcement-bg` | `#4a4a4a` | Barra de anuncios superior |
| `--color-footer-bg` | `#1B3A6B` | Footer |
| `--color-highlight-bg` | `#dceeff` | Content highlight section |
| `--color-search-focus` | `var(--color-accent)` | Anillo de foco en búsqueda |
| `--color-input-icon` | `#666666` | Ícono del campo de búsqueda |
| `--color-input-placeholder` | `#999999` | Placeholder del input |

### Tipografía
| Variable | Valor | Uso |
|----------|-------|-----|
| `--font-primary` | `'Neue Plak', sans-serif` | Fuente única del tema |
| `--font-heading` | `var(--font-primary)` | Alias backward-compat |
| `--font-body` | `var(--font-primary)` | Alias backward-compat |
| `--font-weight-black` | `900` | Headings, emphasis |
| `--font-weight-bold` | `700` | Botones, labels |
| `--font-weight-light` | `300` | Cuerpo de texto |
| `--font-weight-ultralight` | `200` | Texto secundario |

### Spacing & Layout
| Variable | Valor |
|----------|-------|
| `--container-max` | `1280px` |
| `--spacing-xs` | `4px` |
| `--spacing-sm` | `8px` |
| `--spacing-md` | `16px` |
| `--spacing-lg` | `24px` |
| `--spacing-xl` | `40px` |
| `--spacing-xxl` | `64px` |
| `--border-radius` | `4px` |
| `--shadow` | `0 4px 20px rgba(0,0,0,0.12)` |
| `--shadow-hover` | `0 8px 32px rgba(0,0,0,0.20)` |
| `--transition` | `0.25s ease` |

---

## Snippets Disponibles y sus Parámetros

| Snippet | Parámetros | Usado en |
|---------|-----------|----------|
| `product-card` | `card_product` (req), `card_section` (opt), `show_compare` (bool, def: true) | `product-grid`, `shipping-section` |
| `product-card-placeholder` | `placeholder_index` (1–5, def: 1) | `product-grid`, `shipping-section` |
| `logo` | `logo_image` (opt), `logo_height` (px, def: 46), `logo_variant` ('white'\|'color', def: 'white'), `logo_loading` ('eager'\|'lazy', def: 'lazy') | `header`, `footer` |
| `icon` | `icon_name` (req), `icon_size` (px, def: 20), `icon_class` (string, opt) | `announcement-bar`, `header`, `hero-slideshow`, `footer`, `theme.liquid` |
| `social-icons` | `icon_size` (px, def: 28) | `footer` |

### Íconos disponibles en `icon.liquid`
`package` · `lock` · `truck` · `cart` · `search` · `close` · `chevron-left` · `chevron-right` · `tiktok` · `instagram` · `facebook`

---

## Convenciones del Proyecto

- **Nomenclatura CSS:** BEM (`.bloque__elemento--modificador`)
- **Idioma de código:** Inglés (variables, clases, funciones)
- **Idioma de UI:** Español (textos visibles, labels del customizer)
- **Sin valores hardcodeados en componentes** — siempre usar variables CSS `var(--nombre)`
- **Snippets reciben parámetros** via `assign` + `render 'snippet', param: value`
- **JavaScript:** Vanilla JS, módulos IIFE con `init()`, sin jQuery
- **Imágenes:** siempre `loading="lazy"` excepto above-the-fold (`loading="eager"`)
- **Accesibilidad:** `aria-label` en íconos, `aria-hidden="true"` en SVG decorativos, `role` en regiones

---

## ⚠️ Deuda Técnica Pendiente

| # | Deuda | Archivo | Prioridad |
|---|-------|---------|-----------|
| 1 | `theme.liquid` inyecta `--font-heading` y `--font-body` pero el CSS usa `--font-primary` → las fuentes del customizer no tienen efecto real | `theme.liquid`, `theme-base.css` | 🔴 Alta |
| 2 | `settings_schema.json` expone `font_heading`/`font_body` como selects pero `theme-base.css` usa `'Neue Plak'` fijo → los usuarios no pueden cambiar la fuente sin editar CSS | `settings_schema.json`, `theme-base.css` | 🔴 Alta |
| 3 | `color_topbar` en settings_schema no se usa en ningún CSS ni Liquid actualmente | `settings_schema.json` | 🟡 Baja |
| 4 | Cart drawer `renderCart()` genera HTML sin sanitizar `item.title` contra XSS | `theme.js` | 🟠 Media |
| 5 | No existen templates para páginas internas: `/collections/`, `/products/`, `/cart`, `/search` | `templates/` | 🟠 Media |
| 6 | `srcset` del hero slideshow no usa `image_url` filter (Shopify 2.0) — usa el deprecated `img_url` | `hero-slideshow.liquid` | 🟡 Baja |
| 7 | Sin `preload` para la imagen del primer slide del hero | `hero-slideshow.liquid` | 🟡 Baja |
| 8 | `theme.liquid` carga todos los CSS como `<link>` bloqueantes — candidatos a `media="print" onload` para non-critical | `theme.liquid` | 🟡 Baja |

---

## Historial de Refactorización

| Fecha | Acción | Archivos |
|-------|--------|---------|
| 2026-03-02 | Fase 1: Análisis e inventario completo | — |
| 2026-03-02 | Fase 2: Creados 5 snippets (`product-card`, `product-card-placeholder`, `logo`, `icon`, `social-icons`) | `/snippets/` |
| 2026-03-02 | Fase 2: Tokenizados 14+ hardcodes en `theme-header.css` | `theme-header.css` |
| 2026-03-02 | Fase 2: Tokenizados 18+ hardcodes en `theme-sections.css` | `theme-sections.css` |
| 2026-03-02 | Fase 2: Tokenizado footer background `#1B3A6B` | `theme-footer.css` |
| 2026-03-02 | Fase 2: Corregido conflicto `--color-primary` default vs settings | `theme-base.css` |
| 2026-03-02 | Fase 2: Añadidos 7 nuevos tokens semánticos al archivo base | `theme-base.css` |
| 2026-03-02 | Fase 2: Eliminado `product-card` duplicado en `shipping-section` → usa snippet | `shipping-section.liquid`, `product-grid.liquid` |
| 2026-03-02 | Fase 2: Deduplicado nav fallback en header (era doble) | `header.liquid` |
| 2026-03-02 | Fase 2: Refactorizados logo y social icons a snippets | `header.liquid`, `footer.liquid` |
| 2026-03-02 | Fase 2: Centralizados todos los SVG icons al snippet `icon.liquid` | `announcement-bar.liquid`, `hero-slideshow.liquid`, `header.liquid`, `theme.liquid` |
| 2026-03-02 | Fase 2: Reparados 6 settings órfanos en `content-highlight` | `content-highlight.liquid`, `theme-sections.css` |
| 2026-03-02 | Fase 2: Añadidos OG/Twitter meta tags | `theme.liquid` |
| 2026-03-02 | Fase 2: Textos del cart drawer → configurables via settings | `theme.liquid`, `settings_schema.json`, `settings_data.json` |
| 2026-03-02 | Fase 2: Eliminado inline style en JS → clase BEM `.cart-item__qty` | `theme.js`, `theme-cart.css` |
| 2026-03-02 | Fase 2: Expuestos `color_secondary`, `color_footer_bg`, favicon en schema | `settings_schema.json`, `settings_data.json` |
| 2026-03-02 | Fase 2: Wired `color_secondary` y `color_footer_bg` al `:root` de runtime | `theme.liquid` |
