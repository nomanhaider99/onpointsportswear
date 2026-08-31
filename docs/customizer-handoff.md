# Product Logo Customizer — Backend Handoff

The customizer is **frontend only**. It performs no network calls: the uploaded
logo never leaves the browser, and nothing is persisted beyond a lightweight
summary on the cart line. This document is what a backend developer needs to
connect it.

---

## 1. Where the seam is

One function. Everything else is UI.

`src/lib/customization.ts` → `handleAddCustomizedProduct({ product, variant, customization, quantity })`

It currently registers the payload in an in-memory map, logs it in development,
and returns a summary for the cart. The `// TODO: Connect to backend/cart API`
comment marks the exact line where the upload/order call belongs.

Called from `src/components/products/ProductDetail.tsx` when a customized
product is added to cart, immediately before the existing `addItem(...)`.

---

## 2. The two product types

The catalogue splits on two independent axes:

| Axis | Field | Values |
| --- | --- | --- |
| What the garment is | `category` | Jerseys, Hoodies, Shorts, T-Shirts, Accessories |
| Whether it takes a logo | `customizable` | `true` (customizable) / `false` (standard) |

`customizable` is **required** on every product and is the single gate:
`getCustomizerConfig()` returns `null` for a standard product regardless of what
customizer config exists, so the Customize button never renders and the canvas
bundle is never downloaded. Both axes are filterable on `/products`, and
customizable cards carry a "Customizable" badge.

Helpers in `src/data/products.ts`: `ProductType`, `getProductType(product)`,
`productTypeLabels`, `customizableProducts`, `standardProducts`.

### Ordering rules

Two rules are enforced in `src/lib/cart.ts` (not just in the UI, so no caller can
route around them). `getAddToCartIssue(product, items, hasCustomization)` returns
the reason a product cannot be added, or `null`; `addItem` re-checks and returns
`{ ok, reason }`.

1. **A customizable product cannot be ordered without a logo.** Add to cart is
   disabled with the reason shown beside it until a customization is applied,
   and the archive card offers "Customize" (a link to the product page) instead
   of "Add to cart", so the grid cannot bypass the rule.
2. **A cart holds custom-logo items or standard items, never both.** Adding the
   wrong type is refused and explained. `CartItem.customizable` records each
   line's type so the rule survives a reload; it is optional, and carts stored
   before the field existed read as standard.

The cart-conflict check runs first, so a customer is never told to add a logo to
something they could not order anyway. `useCart()` exposes `kind`
(`"empty" | "standard" | "customizable"`).

A product flagged `customizable: true` but with no usable print areas is treated
as standard rather than becoming unbuyable.

**When the order API arrives**, re-validate both rules server-side.

---

## 3. Product data the backend should return

`customizable` is required; `customizer` is optional. When present, `customizer`
takes priority over the mock config in `src/data/customizer.ts`.

```ts
{
  id: string;
  customizable: boolean;           // false = standard: no Customize button
  customizer?: {
    enabled: boolean;              // false also hides the button
    baseImage: string;             // mockup the logo is composited onto
    productImage?: string;         // accepted as an alias for baseImage
    baseWidth?: number;            // design space; defaults to 576
    baseHeight?: number;           // design space; defaults to 240
    overlayImage?: string;         // optional art drawn ABOVE the logo
    printAreas: {
      id: string;
      name: string;                // shown on the placement buttons
      x: number;                   // top-left, in design-space units
      y: number;
      width: number;
      height: number;
      allowed?: boolean;           // false = listed but not selectable
    }[];
    allowedFileTypes?: string[];   // MIME types; defaults to png/jpeg/webp/svg
    maxFileSizeMB?: number;        // defaults to 10
  };
}
```

Resolution order is implemented in `getCustomizerConfig(product)`. A product with
no config and no mock entry simply shows no Customize button — the product page
renders exactly as it does today.

### Product imagery: use blank mockups for customizable products

A customizable product needs **unbranded** artwork, otherwise the customer's
logo lands on top of a garment that already has someone else's logo on it. The
architecture already separates the two images:

| Field | Purpose |
| --- | --- |
| `product.image` | Catalogue/marketing photo, shown on cards and the product page |
| `customizer.baseImage` | The blank garment the logo is composited onto |

They can differ. `Custom Printed T-Shirt` is the worked example: its picture is a
blank white/black tee on a clean light ground, generated from the supplied
reference art, and it is used for both fields.

**Outstanding:** the other customizable products still point `baseImage` at their
marketing photo, and those photos carry printed branding (GLOBAL CONNECT,
RAIDERS, OLYMPUS, PHOENIX FIRE, SHADOWHAWKS, ANDERSON 24, CRESTVILLE ACADEMY).
Supply a blank mockup per product, drop it in `public/images/customizer/`, point
that product's `baseImage` at it, and re-measure its print areas.

Mockup requirements:

- Blank garment, no existing print or embroidery.
- Plain, evenly lit background (or transparency composited onto one).
- 2.4:1 landscape to match the card layout, or set `baseWidth`/`baseHeight` to
  the ratio you actually use.
- Roughly 2x the design space in pixels (1152x480 for the 576x240 default) so the
  preview and the 2x PNG export stay sharp.

### Design space

`x/y/width/height` are **not pixels**. They are units in a coordinate space whose
size is `baseWidth × baseHeight` (576 × 240 for the current mockups, matching the
images in `/public/images/products`). The canvas applies a single scale factor to
map that space to whatever the viewport allows, so the same numbers are valid at
every screen size and can be scaled straight up to print resolution.

---

## 4. Payload the frontend produces

```ts
{
  productId: string;
  productVariantId?: string;       // the selected size label, when chosen
  printAreaId: string;
  printAreaName: string;
  logoFileName?: string;
  logoPreviewUrl?: string;         // object URL — valid for this page session only
  logoDataUrl?: string;            // absent by default; see below
  transform: {
    x: number;                     // top-left of the UNROTATED box, design space
    y: number;
    width: number;
    height: number;
    rotation: number;              // degrees, clockwise, about the box centre
  };
  designSpace: { width: number; height: number };
  placements: Record<string, LogoTransform>;   // every area the customer positioned
}
```

### Reproducing the composite server-side

1. Scale factor `s = printResolutionWidth / designSpace.width`.
2. Draw `baseImage` at the print resolution.
3. Translate to the transform's centre: `(x + width/2) * s`, `(y + height/2) * s`.
4. Rotate by `rotation` degrees.
5. Draw the logo at `width * s` × `height * s`, centred on the origin.
6. Draw `overlayImage` on top if the product has one.

`transform.width / transform.height` always equals the logo's natural aspect
ratio, and the rotated box is always fully inside its print area — both are
enforced in `src/lib/customizer-geometry.ts`, so no server-side correction is
needed.

### Getting the actual file

`ProductCustomization` intentionally does **not** carry base64. The `File` object
lives on the `UploadedLogo` returned by the customizer hook, which is what you
want for a multipart upload:

```ts
const form = new FormData();
form.append("logo", logo.file);              // the original File
form.append("customization", JSON.stringify(customization));
```

If an inline data URL is genuinely required, `withLogoDataUrl(customization, logo)`
produces one on demand. It is not held in state, because a base64 copy of a 10MB
upload in React state is exactly what the performance requirements rule out.

Replace `logoPreviewUrl` with the stored asset URL once the file is persisted.

---

## 5. Cart integration

`CartItem` gained one optional field, `customization`, holding a **summary only**
(`customizationId`, `printAreaId`, `printAreaName`, `logoFileName`, `transform`).
The cart persists to `localStorage`, so no image data goes in it.

The full payload is kept in memory, keyed by `customizationId`, and read back
with `getCustomization(id)`. Customized lines get a composite cart key
(`slug::size::customizationId`) so two different designs of the same product and
size stay separate rather than merging quantities.

**This means a full payload does not survive a page reload** — by design, since
persistence is explicitly out of scope. When the order API exists, post the
payload at add-to-cart time and store the returned asset reference on the line.

---

## 6. Server-side work still required

- **Validate uploads again.** Frontend checks (type, size, decodability) are for
  UX only and are trivially bypassed.
- **Sanitize SVG.** SVG is accepted and rendered via `<img>`/canvas, which does
  not execute scripts, and it is never injected into the DOM as markup. If you
  store SVGs and serve them back, sanitize them or rasterize on upload. Dropping
  `"image/svg+xml"` from `allowedFileTypes` disables SVG entirely with no code
  change.
- **Re-render the composite** at print resolution using the steps above; do not
  trust any client-generated preview image.
- **Enforce print-area rules** against your own product data.

---

## 7. File map

| Path | Role |
| --- | --- |
| `src/data/customizer.ts` | Types, defaults, mock per-product config, `getCustomizerConfig` |
| `src/lib/customization.ts` | Payload types, in-memory registry, `handleAddCustomizedProduct` |
| `src/lib/cart.ts` | Cart store plus the two ordering rules (`getAddToCartIssue`) |
| `src/lib/checkout.ts` | Checkout types, validation, `buildOrderDraft`, `submitOrder` |
| `src/components/checkout/*` | Checkout steps, form, review, confirmation, summary |
| `src/lib/customizer-geometry.ts` | Aspect-ratio lock and print-area containment maths |
| `src/hooks/useProductCustomizer.ts` | State machine: logo, per-area transforms, reset, serialize |
| `src/hooks/useLogoUpload.ts` | Validation, object URL lifecycle |
| `src/hooks/useImageElement.ts` | Image loading for the canvas |
| `src/components/customizer/ProductCustomizer.tsx` | Dialog shell, export, apply |
| `src/components/customizer/ProductCanvas.tsx` | Konva stage, drag/resize/rotate |
| `src/components/customizer/CustomizerLauncher.tsx` | Customize button + applied-design summary |
| `src/components/customizer/LogoUploader.tsx` | File picker and drag-and-drop |
| `src/components/customizer/LogoControls.tsx` | Size, rotation, position controls |
| `src/components/customizer/PrintAreaSelector.tsx` | Placement picker (multi-area) |
| `src/components/customizer/CustomizerToolbar.tsx` | Zoom, reset, remove, download |

Changes to pre-existing files were kept minimal: two optional fields on
`Product`, an optional `customization` on `CartItem` plus an optional fourth
argument to `addItem`, the launcher mounted on the product detail page, and one
line each in the cart view and cart drawer showing the applied logo.

---

## 8. Checkout

`/checkout` runs details -> review -> confirmation as local state (not routes),
so a half-filled form survives a back/forward. It is frontend only: **no payment
is taken and no order is stored.**

**Seam:** `src/lib/checkout.ts` -> `submitOrder(draft)`. With no
`NEXT_PUBLIC_ORDER_ENDPOINT` set it resolves locally so the confirmation renders;
with one set it POSTs the draft. The real implementation belongs behind a Route
Handler so credentials stay server-side - `NEXT_PUBLIC_*` ships to the browser.

The `OrderDraft` it receives carries everything needed to fulfil the order:

```ts
{
  reference: string;              // client-generated placeholder, e.g. OP-260831-PEUE
  placedAt: string;               // ISO timestamp
  kind: "standard" | "customizable";
  details: CheckoutDetails;       // contact + delivery + neededBy + notes + acceptedTerms
  lines: OrderLine[];             // name, size, quantity, unitPrice, lineTotal,
                                  // printAreaName, logoFileName, artworkMissing
  customizations: ProductCustomization[];   // full transform payloads (section 4)
  totals: { itemCount: number; subtotal: number };
}
```

The order API must:

1. Upload each customization's logo file (`UploadedLogo.file`).
2. Re-validate the two ordering rules from section 2 - the frontend guards are
   UX, not security.
3. Recompute pricing and totals server-side; `subtotal` here is indicative only.
4. Issue a real order reference; `reference` is a client-side placeholder.
5. Take payment, if payment is in scope for the order flow.

### Artwork that is no longer attached

Uploaded files live in memory only, so a line added *before a page reload* keeps
its transform summary but loses the file. `buildOrderDraft` flags those lines
with `artworkMissing: true` rather than dropping them silently: the review step
warns the customer and links back to the product to re-apply, and the
confirmation tells them the artwork will be collected by email. The backend
should chase any line where `artworkMissing` is true.

This is a direct consequence of persistence being out of scope. Once artwork is
uploaded on apply, the flag becomes dead code and can be removed.

---

## 9. Removing the mock data

`mockCustomizerConfigs` in `src/data/customizer.ts` exists only so the feature is
demonstrable before the backend lands. Once products carry their own
`customizer` config, delete that map — `getCustomizerConfig` already prefers
`product.customizer` and returns `null` (no button) when neither exists.

Note: `school-uniform-bundle-jersey-shorts-socks` is currently configured with
`enabled: false` because a single mockup placement does not describe a
three-garment bundle. It doubles as the working example of the disabled path.
