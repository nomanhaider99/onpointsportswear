# On Point Sportswear

The On Point Sportswear website rebuilt from WordPress/Elementor/WooCommerce as a
Next.js App Router application.

Content and assets were taken from the existing WordPress site, which stays the source of
truth for copy, products and imagery.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 · ESLint ·
`lucide-react` for the handful of UI glyphs.

Server Components by default. Only the pieces that need interactivity are client components:
the header, mobile menu, cart drawer, cart view, product filters, product detail form, the
gallery grid/lightbox, the contact form and the stat counters.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

```bash
npm run build      # production build
npm run start      # serve the production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```

## Project layout

```
public/
  fonts/           Halyard Display Book / Bold / Black (from the source site)
  images/          logo, hero, about, services, CTA background
    products/      one image per product, named by slug
    gallery/       seven gallery tiles
    team/          three team portraits
src/
  app/             routes, metadata, sitemap.ts, robots.ts
  components/
    layout/        Header, MobileMenu, CartDrawer, Footer, icons
    home/          Hero, AboutPreview, ServicesPreview, ServicesGrid,
                   FeaturedProducts, ContactSection, FinalCTA
    products/      ProductCard, ProductGrid, ProductFilters, ProductDetail, AddToCartButton
    gallery/       GalleryGrid, GalleryLightbox
    contact/       ContactForm, ContactDetails
    cart/          CartView
    about/         StatCounter
    ui/            Button, Container, Section, SectionHeading, ServiceIcon, LegalContent
  data/            products, services, gallery, team, navigation, site
  lib/             cart (external store), contact (submit seam), utils
docs/
  site-audit.md    what the source site actually does, with the extracted values
  assets.md        every asset, its original filename, and where it is used
```

## Routes

`/` · `/about-us` · `/services` · `/products` · `/products/[slug]` · `/gallery` · `/contact` ·
`/cart` · `/privacy-policy` · `/terms-of-service`

All 21 pages (including the eight product pages) prerender as static HTML.

## Data

`src/data/products.ts` is the single source of product truth. The product grid, category
filters, featured grid, product detail pages, related products and the cart all read from it.
Each product carries its two WooCommerce size variations (SM at the low price, MD at the high
price), matching the source's `data-product_variations`.

## Cart

`src/lib/cart.ts` keeps the cart in a module-level store that persists to `localStorage`
(`op-cart-v1`) and is read through `useSyncExternalStore`. The server snapshot is always empty,
so SSR and hydration agree and the persisted cart appears on the first client render.

Supports add, remove, increment, decrement, direct quantity entry, clear, subtotal and count.
It survives navigation and reload, and stays in sync across tabs via the `storage` event.
Storage failures (private mode, quota) are swallowed so the cart still works in-session.

## Contact form

Client-side validation (name required, valid email, message required) with accessible labels,
`role="alert"` errors, and loading/success/error states.

No email provider is wired up. `src/lib/contact.ts` is the single seam: set
`NEXT_PUBLIC_CONTACT_ENDPOINT` to a Route Handler you add (e.g. `/api/contact`) and it will POST
there. Keep provider credentials in server-side environment variables — never in `NEXT_PUBLIC_*`,
which ships to the browser.

## Design tokens

Defined once in `src/app/globals.css` under `@theme`, all extracted from the source's generated
Elementor stylesheets:

| Token | Value |
|---|---|
| `--color-background` | `#0b1020` |
| `--color-foreground` | `#ffffff` |
| `--color-primary` | `#00ac3b` |
| `--color-secondary` | `#f8fafc` |
| `--color-muted` | `#a6a5a5` |
| `--color-border` | `#1f2937` |
| `--color-card` | `#111827` |
| `--color-input` | `#f5f5f3` |
| `--color-tint` | `#032bec33` |
| `--container-site` | `1440px` |

Fonts are registered as three separate families (`Halyard Display`, `Halyard Display Bold`,
`Halyard Display Black`) exactly as the source does, plus Inter from `next/font/google`.

## Verification

Checked against the live source with headless Chrome:

- **Functional** — 23/23 checks: cart add/remove/quantity/clear/persistence/reload, category
  filtering, product-detail size gating and price updates, gallery lightbox open/navigate/escape,
  contact validation and success state.
- **Responsive** — 10 routes × 9 widths (320, 375, 390, 430, 768, 1024, 1280, 1440, 1920):
  no horizontal overflow, no broken images, no console errors, no hydration warnings.
- **Build** — `next build`, `tsc --noEmit` and `eslint` all clean.

See `docs/site-audit.md` for the extracted values and the list of deliberate deviations.
