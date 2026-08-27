# Asset Map

Every asset was downloaded from the source WordPress media library
(`/wp-content/uploads/2026/08/`) and renamed to something meaningful. Nothing is hotlinked, and
no stock replacement was used.

## Fonts — `public/fonts/`

| Local file | Source file | Registered as |
|---|---|---|
| `HalyardDisplay-Book.ttf` | `fonnts.com-Halyard_Display_Book.ttf` | `Halyard Display` (`--font-halyard-book`) |
| `HalyardDisplay-Bold.ttf` | `fonnts.com-Halyard_Display_Bold.ttf` | `Halyard Display Bold` (`--font-halyard-bold-face`) |
| `HalyardDisplay-Black.ttf` | `fonnts.com-Halyard_Display_Black.ttf` | `Halyard Display Black` (`--font-halyard-black-face`) |

`Inter` is loaded through `next/font/google`.

## Brand and page imagery — `public/images/`

| Local file | Source file | Natural size | Used by |
|---|---|---|---|
| `logo.png` | `image-5-1.png` | 131×87 | Header, Footer |
| `hero-badge-1.png` | `Rectangle-8-2.png` | 210×222 | Home hero, left detail shot |
| `hero-badge-2.png` | `Rectangle-9.png` | 210×222 | Home hero, right detail shot |
| `hero-main.png` | `ChatGPT-Image-Aug-6-2026-12_04_03-AM-1.png` | 705×765 | Home hero garment |
| `about-main.png` | `About-Us-3D-Sportswear.png` | 895×502 | Home about, primary image |
| `about-side.png` | `Rectangle-10.png` | 329×390 | Home about, secondary image |
| `about-story.png` | `Story_Image.png` | 560×380 | About Us mission section |
| `service-1.png` | `Rectangle-12.png` | 300×203 | Services grid, row 1 |
| `service-2.png` | `Rectangle-11.png` | 300×203 | Services grid, row 2 |
| `cta-bg.png` | `image-1-1.png` | — | Final CTA background |

`image-1-1.png` is referenced only from a CSS `background-image` rule, so it does not appear in the
page HTML — it was recovered by scanning the generated Elementor stylesheets.

## Products — `public/images/products/`

Filenames match each product slug, so `products.ts` entries and image paths stay in step.

| Local file | Source file | Product |
|---|---|---|
| `custom-embroidered-team-cap.png` | `ProductImage-8.png` | Custom Embroidered Team Cap |
| `pro-grade-athletic-team-hoodie.png` | `ProductImage-7.png` | Pro-Grade Athletic Team Hoodie |
| `custom-baseball-jersey-sublimation-embroidery.png` | `ProductImage-6.png` | Custom Baseball Jersey (Sublimation + Embroidery) |
| `custom-sublimated-soccer-jersey.png` | `ProductImage-4.png` | Custom Sublimated Soccer Jersey |
| `school-uniform-bundle-jersey-shorts-socks.png` | `ProductImage-3.png` | School Uniform Bundle (Jersey, Shorts & Socks) |
| `embroidered-team-polo.png` | `ProductImage-2.png` | Embroidered Team Polo |
| `custom-basketball-jersey-shorts-set.png` | `ProductImage-1.png` | Custom Basketball Jersey & Shorts Set |
| `custom-sublimated-hockey-jersey.png` | `ProductImage.png` | Custom Sublimated Hockey Jersey |

`ProductImage-5.png` does not exist in the source library — the eight products use the eight files
above.

## Gallery — `public/images/gallery/`

| Local file | Source file | Natural size | Tile |
|---|---|---|---|
| `gallery-5.png` | `Image-5.png` | 608×400 | Action Shots — Championship Series |
| `gallery-6.png` | `Image-6.png` | 300×400 | Close-ups — Pro-Stitch Detail |
| `gallery-7.png` | `Image-7.png` | 300×400 | Teams — West High Basketball |
| `gallery-8.png` | `Image-8.png` | 400×350 | Close-ups — Sublimation Texture |
| `gallery-9.png` | `Image-9.png` | 400×350 | Action Shots — Premier Cup |
| `gallery-10.png` | `Image-10.png` | 400×350 | Teams — Apex Club Elite |
| `gallery-11.png` | `Image-11.png` | 1240×500 | Action Shots — Velocity Track |

## Team portraits — `public/images/team/`

| Local file | Source file | Natural size | Person |
|---|---|---|---|
| `marcus-vance.png` | `Photo.png` | 320×260 | Marcus Vance — Founder & Performance Director |
| `sarah-connor.png` | `Photo-1.png` | 320×260 | Sarah Connor — Lead Sublimation Engineer |
| `dave-miller.png` | `Photo-2.png` | 320×260 | Dave Miller — Elite Embroidery Specialist |

## Inline SVG (not files)

Three graphics were copied verbatim from the source markup rather than downloaded, because they are
inline SVG there:

- **Service icon** — `src/components/ui/ServiceIcon.tsx`. A 48×48 `#00AC3B` rounded square
  (`rx="12"`) with a `#0B1020` stroked jersey outline. All six service cards use this same icon on
  the source site.
- **Social marks** — `src/components/layout/SocialIcons.tsx`. Instagram, Facebook and X, each a
  36×36 circle with `fill-opacity="0.0392157"` white and a `stroke-opacity="0.101961"` white ring.
- **Cart glyph** — `src/components/layout/CartIcon.tsx`. The source embeds a base64 raster inside an
  SVG `<pattern>`; it was redrawn as a 28×28 stroked path so it stays crisp and inherits
  `currentColor`.

## WordPress artefacts intentionally not carried over

Responsive derivatives (`-300x168`, `-600x337`, `-768x431`, `-1024x413`, …) were skipped — Next.js
generates its own responsive sizes from the full-size originals via `next/image`.
