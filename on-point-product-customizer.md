# CRITICAL UI REQUIREMENT — DO NOT CHANGE EXISTING UI

**The existing On Point Sportswear website UI is approved and must remain exactly as it is.**

The customizer is an **additive feature only**, NOT a redesign. Do not change or redesign the homepage, header, footer, navigation, typography, colors, spacing, buttons, product cards, product-page layout, or any existing visual component.

Before coding, inspect the existing UI and reuse its existing components, styles, buttons, modals/drawers, typography, spacing, and responsive behavior wherever possible. If a new customizer component is required, make it visually match the existing site. Make the **minimum possible UI changes** needed to add the customization feature.

Do not make unrelated visual improvements, refactors, or design changes while implementing this feature.

> **Rule: Add the product customizer to the existing website; do not redesign the website.**

---

# On Point Sportswear — Product Logo Customizer

## Project Goal

Add a **frontend-only product customizer** to the existing On Point Sportswear website:

https://onpointsportswear.vercel.app/

Customers should be able to open a product (shirt, jersey, hoodie, etc.), upload their own logo, position it on the product preview, resize it, and see a realistic live preview.

**Important:** Do NOT build, modify, or assume any backend functionality. Another developer will build the backend separately. This task is strictly the frontend customizer and its integration points.

---

## Existing Website

The current website is an On Point Sportswear ecommerce site with products such as custom jerseys, hoodies, caps, polos, basketball sets, hockey jerseys, etc.

Keep the existing website design, branding, typography, spacing, navigation, product-card design, and overall UX intact.

Do not redesign the homepage.

The customizer should feel like a natural extension of the existing product page.

---

# 1. Core User Flow

When a customer opens a customizable product:

1. Customer sees the normal product gallery/details.
2. Add a prominent **"Customize This Product"** button.
3. Clicking it opens the product customizer.
4. Customer can upload a logo/image.
5. Uploaded logo appears on top of the shirt/product preview.
6. Customer can:
   - Move the logo
   - Resize the logo
   - Rotate the logo
   - Delete/remove the logo
7. Customer sees changes instantly on the product.
8. Customer can reset the design.
9. Customer can finish customization and continue with the normal product flow.
10. The selected product + customization state should be available in frontend state so the future backend developer can connect it to cart/order APIs.

---

# 2. Customizer UI

Create a polished, modern customization interface.

## Desktop Layout

Use a two-column layout:

### Left / Main Area

Large product preview.

Example:

- Shirt/jersey image
- Logo layered over the shirt
- Clean background
- Zoom-friendly preview

### Right / Controls Panel

Controls should include:

### Upload Logo

Button:

**Upload Your Logo**

Supported formats:

- PNG
- JPG/JPEG
- WEBP
- SVG if safe to support

Prefer PNG for transparent logos.

After upload:

- Show uploaded logo
- Place it in the default printable area
- Preserve aspect ratio

### Logo Controls

Provide:

- Size slider
- Rotation slider
- Position controls or drag-and-drop
- Delete button
- Reset button

Optional but preferred:

- X/Y position values
- Zoom controls
- Center horizontally
- Center vertically

---

# 3. Drag & Resize

Use a reliable frontend library rather than implementing complex canvas transformations manually if an appropriate library is already available.

Recommended approach:

**Fabric.js** or **Konva.js**

Alternative:

**react-konva**

The implementation should support:

- Dragging
- Scaling
- Rotation
- Bounding box
- Corner handles
- Aspect-ratio preservation
- Delete/remove
- Selection state

Do not allow the logo to be dragged outside the printable/customizable area.

---

# 4. Product Image / Print Area Architecture

The backend developer will later provide product data.

Design the frontend so each product can eventually contain configuration similar to:

```ts
type ProductCustomizerConfig = {
  enabled: boolean;

  productImage: string;

  printAreas: {
    id: string;
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    allowed?: boolean;
  }[];

  allowedFileTypes?: string[];

  maxFileSizeMB?: number;
};
```

Example:

```ts
{
  enabled: true,
  productImage: "/products/jersey-front.png",
  printAreas: [
    {
      id: "front-center",
      name: "Front Center",
      x: 180,
      y: 140,
      width: 240,
      height: 260,
      allowed: true
    }
  ]
}
```

Do NOT hardcode this as a permanent backend structure.

For now, create frontend mock data/configuration so the customizer can be demonstrated.

---

# 5. Multiple Print Areas

Build the architecture so products can eventually support multiple logo locations.

Possible locations:

- Front Center
- Left Chest
- Right Chest
- Back Center
- Left Sleeve
- Right Sleeve

The UI could eventually show:

**Logo Placement**

- Front
- Back
- Left Sleeve
- Right Sleeve

For this first implementation, make the architecture ready for multiple areas even if only one area is active in the initial UI.

---

# 6. Product-Specific Customization

Do NOT assume every product is customizable.

The product data should eventually contain:

```ts
customizable: true
```

or:

```ts
customizer: {
  enabled: true
}
```

If customization is disabled:

- Do not show the Customize button.

If enabled:

- Show the Customize button.

Since the backend is not being created in this task, use a frontend mock property.

---

# 7. Preview Rendering

The preview should look professional.

Preferred layering:

```text
Product Base Image
        ↓
Printable Area / Mask
        ↓
Uploaded Logo
        ↓
Optional Product Overlay
```

If the product has a transparent PNG mockup, use:

```text
Shirt Base
Logo
Shirt Highlight/Overlay
```

This makes the logo appear more naturally integrated with the shirt.

If an overlay is not available, keep the logo clean and centered within the printable area.

---

# 8. Important: Do Not Distort Product Images

The uploaded logo should:

- Maintain aspect ratio
- Never stretch disproportionately
- Never leave the printable area
- Start at a reasonable default size
- Stay draggable inside the print area

The product itself should preserve its aspect ratio.

---

# 9. Upload Validation

Frontend validation only.

Validate:

- File type
- File size
- Image loading
- Invalid/corrupt images

Suggested maximum:

```text
10 MB
```

Show a clean error message such as:

**"Please upload a PNG, JPG, WEBP, or SVG image under 10MB."**

Do not upload the file to a server.

Use a browser object URL / local state for preview.

---

# 10. Mobile Experience

The customizer MUST be responsive.

On mobile:

```text
Product Preview
      ↓
Customization Controls
      ↓
Upload / Position / Size / Rotate
```

Controls should be touch friendly.

Dragging and resizing must work on touch devices.

Do not create tiny controls.

---

# 11. Desktop Experience

Desktop should use:

```text
┌──────────────────────────────────────────┐
│              Product Preview             │
│                                          │
│                [ SHIRT ]                 │
│                 [LOGO]                   │
│                                          │
└──────────────────────┬───────────────────┘
                       │
              Customization Panel
              ─────────────────
              Upload Logo
              Logo Size
              Rotation
              Position
              Reset
              Remove
```

Make the interface feel premium and ecommerce-ready.

---

# 12. Save Customization State

Do not build backend persistence.

Keep customization in frontend state.

Create a serializable structure such as:

```ts
type LogoTransform = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
};

type ProductCustomization = {
  productId: string;
  productVariantId?: string;
  printAreaId: string;
  logoFileName?: string;
  logoDataUrl?: string;
  transform: LogoTransform;
};
```

This object will later be passed to the backend/cart system.

---

# 13. Cart Integration Point

Do NOT implement the backend cart API.

Instead, create a clean frontend function/interface such as:

```ts
handleAddCustomizedProduct({
  product,
  variant,
  customization
});
```

For now it can:

- Store the object in frontend state
- Log the customization object during development
- Continue to the existing cart flow where possible

Clearly mark the backend integration as:

```ts
// TODO: Connect to backend/cart API
```

---

# 14. Download Preview

Add an optional:

**Download Preview**

button.

The customer should be able to download a preview image containing:

- Product
- Uploaded logo
- Current logo position
- Current logo size
- Current rotation

This is frontend-only.

Use canvas export if using Fabric/Konva.

Do not upload the generated image to the server.

---

# 15. Accessibility

Include:

- Keyboard-accessible controls
- Visible focus states
- Proper button labels
- Alt text
- Accessible file input
- Clear error messages

Do not rely only on color to communicate state.

---

# 16. Performance

Avoid unnecessary rerenders.

Important:

- Use object URLs for uploaded images
- Revoke object URLs when no longer needed
- Keep canvas dimensions reasonable
- Do not continuously generate large base64 images unless necessary
- Do not store huge image data in React state unnecessarily

---

# 17. Security

Frontend only.

Do not execute uploaded SVG content as HTML.

If SVG support creates security or rendering problems, restrict uploads to:

- PNG
- JPG/JPEG
- WEBP

The backend developer will handle server-side validation later.

---

# 18. Components

Create clean reusable components.

Suggested structure:

```text
components/
  customizer/
    ProductCustomizer.tsx
    ProductCanvas.tsx
    LogoUploader.tsx
    CustomizerToolbar.tsx
    LogoControls.tsx
    PrintAreaSelector.tsx
    CustomizerPreview.tsx
    CustomizerMobileControls.tsx
```

Adjust the structure to match the existing project architecture.

Do not blindly create duplicate components if equivalent components already exist.

---

# 19. Hooks

If useful, create:

```text
hooks/
  useProductCustomizer.ts
  useLogoUpload.ts
```

The customizer hook can manage:

- Selected logo
- Position
- Size
- Rotation
- Active print area
- Reset
- Remove
- Serialization

---

# 20. State Model

Example:

```ts
type CustomizerState = {
  selectedLogo: string | null;

  transform: {
    x: number;
    y: number;
    scale: number;
    rotation: number;
  };

  activePrintArea: string;

  isUploading: boolean;

  error: string | null;
};
```

Keep the state independent from backend/API code.

---

# 21. Product Data Compatibility

The future backend developer may return products like:

```ts
{
  id: "123",
  name: "Custom Basketball Jersey",
  price: 65,
  images: [
    "/products/jersey-front.jpg",
    "/products/jersey-back.jpg"
  ],
  customizable: true,
  customizer: {
    baseImage: "/products/jersey-front.png",
    printAreas: [
      {
        id: "front",
        name: "Front",
        x: 100,
        y: 100,
        width: 200,
        height: 250
      }
    ]
  }
}
```

Make the frontend flexible enough to consume this later.

Do not build the backend schema.

---

# 22. Mock Product Configuration

For development, create a simple local mock configuration.

Example:

```ts
export const mockCustomizerProduct = {
  id: "demo-jersey",
  name: "Custom Basketball Jersey",
  customizable: true,

  customizer: {
    baseImage: "/products/demo-jersey.png",

    printAreas: [
      {
        id: "front",
        name: "Front Center",
        x: 160,
        y: 120,
        width: 220,
        height: 240
      }
    ]
  }
};
```

Use existing product imagery from the website/project where appropriate.

Do not depend on this mock data permanently.

---

# 23. Existing Website Integration

Before coding:

1. Inspect the existing project structure.
2. Identify the product detail page.
3. Identify the product data structure.
4. Identify the cart state/store.
5. Identify the current styling system.
6. Identify existing UI components.
7. Reuse existing components where possible.

Do not replace the existing ecommerce architecture.

Do not redesign unrelated pages.

---

# 24. Design Direction

The customizer should match the current On Point Sportswear website.

Use:

- Existing typography
- Existing colors
- Existing button styling
- Existing border radius
- Existing spacing system
- Existing header/footer
- Existing product page style

The customizer should feel native to the site.

Do NOT make it look like a generic third-party customization widget.

---

# 25. UX Details

When no logo is uploaded:

Show:

**Upload your logo to start customizing**

When logo is uploaded:

Show:

**Your Logo**

Controls:

- Size
- Rotate
- Position
- Remove
- Reset

Primary action:

**Apply Customization**

Secondary:

**Reset Design**

Optional:

**Download Preview**

---

# 26. Important Backend Boundary

The following are OUT OF SCOPE:

❌ Database

❌ API routes

❌ Authentication

❌ Admin dashboard

❌ Product CRUD

❌ File storage

❌ Cloudinary/S3 uploads

❌ Order API

❌ Payment integration

❌ Server-side image processing

❌ Persistent customization storage

Another developer will handle these.

Only build the frontend architecture and clearly defined integration points.

---

# 27. Backend Handoff

At the end, document exactly what the future backend developer needs to provide.

Expected product data:

```ts
{
  id: string;
  customizable: boolean;

  customizer?: {
    baseImage: string;

    printAreas: {
      id: string;
      name: string;
      x: number;
      y: number;
      width: number;
      height: number;
    }[];
  };
}
```

Expected frontend customization payload:

```ts
{
  productId: string;
  variantId?: string;
  printAreaId: string;

  logo: {
    fileName?: string;
    preview?: string;
  };

  transform: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
  };
}
```

The backend developer can later replace `preview` with a stored file URL or upload reference.

---

# 28. Acceptance Criteria

The implementation is complete when:

- [ ] Product page has a Customize button for customizable products.
- [ ] Customizer opens without breaking the existing product page.
- [ ] User can upload a logo.
- [ ] Logo appears on the product.
- [ ] User can drag the logo.
- [ ] User can resize the logo.
- [ ] User can rotate the logo.
- [ ] Logo remains inside the print area.
- [ ] User can remove the logo.
- [ ] User can reset the design.
- [ ] Product image remains correctly proportioned.
- [ ] Customizer works on desktop.
- [ ] Customizer works on mobile/touch.
- [ ] Customization state is serializable.
- [ ] Frontend has a clean backend integration point.
- [ ] No backend/API/database functionality is created.
- [ ] No unrelated website design is changed.
- [ ] Existing cart/product functionality continues to work.
- [ ] Code is componentized and maintainable.
- [ ] TypeScript has no unnecessary `any` types.
- [ ] No console errors remain.

---

# 29. Claude Code Instructions

You are working inside an existing production-style Next.js ecommerce project.

Before modifying anything:

1. Inspect the complete project structure.
2. Read the existing product page and product components.
3. Read the existing cart implementation.
4. Read the styling/theme setup.
5. Determine whether Fabric.js, Konva, or another canvas library is already installed.
6. If no suitable library exists, install/use the most appropriate lightweight option.
7. Do not introduce unnecessary dependencies.

Then implement the customizer incrementally.

After implementation:

1. Run TypeScript checks.
2. Run linting.
3. Run the production build.
4. Fix all errors.
5. Test desktop interaction.
6. Test mobile/touch interaction.
7. Verify upload, drag, resize, rotate, reset, remove.
8. Verify existing product/cart functionality.
9. Verify no unrelated pages were changed.

Do not stop after creating a UI mockup. The customizer interactions must actually work.

---

# 30. Final Developer Note

The goal is NOT to create a backend.

The goal is to create a **production-quality frontend product customization experience** that can later be connected to an admin/backend system.

The backend developer should eventually be able to:

- Create/edit products
- Mark a product as customizable
- Set the product mockup image
- Define printable areas
- Configure multiple placement zones
- Receive the customer's uploaded logo
- Receive the final logo transformation data
- Store the customization with the order

Your frontend implementation must be designed with those future requirements in mind, without implementing them now.
