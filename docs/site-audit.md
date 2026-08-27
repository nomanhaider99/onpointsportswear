# Source Site Audit

Audit of the existing On Point Sportswear site (WordPress + Elementor Pro + WooCommerce +
Hello Elementor theme), captured before the Next.js rebuild.

Everything below was read out of the live site's rendered HTML and its generated Elementor
stylesheets (`/wp-content/uploads/elementor/css/*.css`), not estimated from screenshots.

## Templates and post IDs

| Elementor template | Post ID | Stylesheet |
|---|---|---|
| Global kit (defaults, unmodified) | 5 | `post-5.css` |
| Header | 29 | `post-29.css` |
| Footer | 102 | `post-102.css` |
| Home | 10 | `post-10.css` |
| About Us | 12 | `post-12.css` |
| Services | 16 | `post-16.css` |
| Products | 18 | `post-18.css` |
| Gallery | 20 | `post-20.css` |
| Contact | 14 | `post-14.css` |

The global kit is left at Elementor's factory values (Roboto / `#6EC1E4`), so **no** design token
comes from it. Every real value is set per-widget in the per-post stylesheets.

## Routes found

Public pages: `/`, `/about-us/`, `/services/`, `/products/`, `/gallery/`, `/contact/`, `/cart/`,
`/shop/`.

Products live at `/product/<slug>/` (WooCommerce single-product), with category archives at
`/product-category/{jerseys,hoodies,shorts,accessories}/`.

`/privacy-policy/` and `/terms-of-service/` are **linked from the footer but return 404** on the
source site — the footer list items have no `href`. These two pages were authored for the rebuild
(see "Deviations" below).

## Design tokens

| Token | Value | Where it is used |
|---|---|---|
| Page background | `#0B1020` | `body` on every page, and the header |
| Foreground | `#FFFFFF` / `#FFFFFFCC` | headings / body copy |
| Primary (brand green) | `#00AC3B` | eyebrows, accents, buttons, active nav |
| Primary on green | `#0B1020` | button label over the green fill |
| Card surface | `#111827` | service cards, product cards, team cards |
| Card border | `#1F2937` | same cards, gallery frames |
| Light text | `#F8FAFC` | product titles and prices, form labels |
| Form field | `#F5F5F3` | contact input backgrounds |
| Section tint | `#032BEC33` | Featured Products + Contact sections |
| Footer | `#0A1649` | footer band (the flattened equivalent of the tint) |
| Soft primary | `#00AC3B1F` bg / `#00AC3B40` border | "OUR MISSION" and "GET IN TOUCH" badges |
| Cart badge | `#d9534f` on `#fff` | Elementor menu-cart bubble default |
| Muted UI text | `#69727d` | cart toggle text (hidden), `#A6A5A5` mobile nav links |

Container max-width is **1440px** on every section.
Section rhythm is **50px** top and bottom; product detail uses **100px**.

## Typography

Three separate local families are registered — the source does not use one family with several
weights, so browsers synthesise bold within each family. The rebuild registers them identically.

| Family | File |
|---|---|
| `Halyard Display` | `fonnts.com-Halyard_Display_Book.ttf` |
| `Halyard Display Bold` | `fonnts.com-Halyard_Display_Bold.ttf` |
| `Halyard Display Black` | `fonnts.com-Halyard_Display_Black.ttf` |

`Inter` is loaded from Google Fonts and used for product category/price, team names and roles,
stat labels, filter tabs, and the footer credit line.

| Element | Font | Size (desktop / ≤1024 / ≤767) | Weight | Other |
|---|---|---|---|---|
| Hero `h1` | Halyard Display Bold | 64 / 48 / 30 | 600 | `letter-spacing: -0.2px` |
| Section heading | Halyard Display Bold | 48 / 36 / 30 | 600 | `letter-spacing: -0.2px` |
| Final CTA heading | Halyard Display Bold | 64 / 48 / 36 | 600 | 75% width, centred |
| Eyebrow | Halyard Display | 14 | 900 | uppercase, `#00AC3B` |
| Mission heading | Halyard Display | 32 / – / 30 | 600 | 90% width |
| Nav item | Halyard Display | 16 | 600 | uppercase, `#FFFFFFCC` → `#00AC3B` |
| Service card title | Halyard Display | 20 | 700 | uppercase |
| Service card body | Halyard Display | 14 | 400 | `#FFFFFFCC` |
| Product title | Halyard Display | 18 | 600 | `#F8FAFC` |
| Product category | Inter | 12 | 700 | uppercase, `#00AC3B` |
| Product price | Inter | 14 | 500 | `#F8FAFC` |
| Add-to-cart / filter tab | Inter | 12 / 14 | 700 | uppercase |
| Stat number | Halyard Display | 48 | 600 | third stat is green |
| Stat label | Inter | 14 | 600 | `#FFFFFFCC` |
| Team name / role | Inter | 20 / 14 | 700 / 400 | `#F8FAFC` / `#00AC3B` |
| PDP title | Halyard Display | 36 | 500 | |
| PDP price | Halyard Display | 30 | 800 | `#00AC3B` |
| Form label | Halyard Display | 18 | 400 | `line-height: 32px`, `#F8FAFC` |
| Footer column heading | Halyard Display | 12 | 700 | uppercase, `#00AC3B` |
| Footer link | Halyard Display | 14 | 400 | `#FFFFFFCC` |
| Footer credit / legal | Inter | 13 | 400 | `#FFFFFFCC` |
| Gallery tile category | Halyard Display | 14 | 900 | uppercase, `#00AC3B`, at `top: 80%` |
| Gallery tile title | Halyard Display | 20 | 600 | white, at `top: 85%` |

## Breakpoints

Elementor's defaults, which the rebuild mirrors with Tailwind:

- mobile: `≤767px`
- tablet: `768px–1024px`
- desktop: `≥1025px`

The nav collapses to a burger at the **tablet** breakpoint (`elementor-nav-menu--dropdown-tablet`),
i.e. below 1025px.

## Per-page structure

### Home
1. **Hero** — two columns. Left (52%): `h1`, supporting copy, two buttons, then a 40/60 row with
   the two detail shots pushed down 75px. Right (48%): the hero garment.
   The `h1` is the **only** heading on the site with accent `<span>`s in the home page.
2. **About** — heading row (75% width), then 70/30. The copy sits at the top of the narrow column
   with the secondary image bottom-aligned beneath it.
3. **Services** — heading, then two rows of four cells. An image occupies cell 4 of row 1 and
   cell 2 of row 2; the six service cards fill the rest.
4. **Featured Products** — tinted section, 3-column grid, transparent cards, **no** category label
   and **no** add-to-cart button, then a "VIEW ALL" outline button.
5. **Contact** — tinted section, 45/55 split: eyebrow + copy + email/phone list, and the form.
6. **Final CTA** — `image-1-1.png` background, `#000000B8` overlay at `opacity: 0.72`,
   `min-height: 400px`.

### About Us
Centred title, then mission (badge + 32px heading + copy + image), a stats band bordered top and
bottom with `#00AC3B40`, then the team grid.

**The stat counters animate.** The static HTML says `0`, but `data-to-value` gives the real
targets: **500+**, **10+ Years**, **100%**, **15+**, over a 2000ms duration.

### Services
Same heading + grid as the home services block, reused verbatim.

### Products
Centred title and description, then left-aligned filter tabs (All / Jerseys / Hoodies / Shorts /
Accessories). The source renders a separate pre-filtered grid per tab; the rebuild filters one
dataset client-side, which is the same result without five copies of the markup.

Grid is **2 columns** on desktop, 2 at ≤1024, 1 at ≤767, `gap: 20px`. Cards: `#111827`,
`border-radius: 12px`, `padding: 20px`, image `height: 320px; object-fit: cover; radius: 8px`.

### Product detail
Two columns: image left, then title, price, a panel holding the `Size` label and select, and a row
with the quantity input and "Add to cart". No description, tabs, breadcrumb or related products in
the source.

Every product is a WooCommerce variable product with exactly two size variations — **SM at the low
price and MD at the high price**.

### Gallery
Three rows: `608:300:300` (450px tall), three equal tiles (390px tall), one full-width banner
(570px tall). Images render at `opacity: 0.6` inside a `#1F2937` 1px frame with an 8px radius.
No lightbox exists on the source.

### Contact
Centred "GET IN TOUCH" badge and "CONTACT US" heading, then the same 45/55 block as the home page.

## Header

`#0B1020`, 1440px container. Logo (`image-5-1.png`, 131×87) left, centred nav, cart right.

The cart toggle's `$0.00` subtotal is **`display: none` at every viewport width** (verified with
`getComputedStyle` at 390px and 1440px), and the word "Cart" is `.elementor-screen-only`. Only the
bag icon and the red count bubble are visible.

## Footer

`#0A1649`, 50px padding, four equal columns: logo + two blurb lines, Quick Links, Services, Social.
Three custom 36×36 social marks (Instagram, Facebook, X) drawn as inline SVG with a white/4% fill
and a white/10% ring — they have **no `href`** on the source. Below a `#FFFFFF1A` divider, the
credit sits left and the legal links right.

## Deviations from the source, and why

| Deviation | Reason |
|---|---|
| Privacy Policy and Terms of Service pages authored | Required by the brief; both 404 on the source. Content is grounded in the site's real facts (no payments taken, custom made-to-order goods, the published email and phone). |
| Gallery lightbox added | Required by the brief ("if the design contains a lightbox, implement it") and by the "gallery images must open correctly" acceptance criterion. |
| Related products on the product detail page | The brief's data-architecture section lists related products as a consumer of the shared product data. |
| Stat counters use 500 / 10 / 100 / 15 | The source's own `data-to-value` attributes. The brief's "0+" reading came from the pre-animation markup. |
| `$0.00` kept in the DOM but visually hidden | Matches the source exactly (it is `display: none` there) while keeping the value available to screen readers. |
| Cart drawer, cart page, quantity controls | The source's WooCommerce cart is server-rendered; the brief requires a working client-side cart with localStorage persistence. |
| 20px horizontal container padding | Prevents content touching the viewport edge at and below 1440px. Without it the 1440px container has no gutter. |
| Social links point at `#` | The source has no URLs on them. |
