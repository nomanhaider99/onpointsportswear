import type { Product } from "@/data/products";

/**
 * Frontend-only customizer configuration.
 *
 * These types mirror the shape the backend is expected to return later
 * (see docs/customizer-handoff.md). Nothing here talks to an API - the mock
 * map below simply stands in until real product data arrives.
 */

export interface PrintArea {
  id: string;
  name: string;
  /** Top-left of the printable box, in design-space units. */
  x: number;
  y: number;
  width: number;
  height: number;
  /** Defaults to true. A false area is listed but not selectable. */
  allowed?: boolean;
}

export interface ProductCustomizerConfig {
  enabled: boolean;
  /** Mockup the logo is composited onto. `productImage` is accepted as an alias. */
  baseImage?: string;
  productImage?: string;
  /**
   * Coordinate space the print areas are expressed in. Defaults to the design
   * space below so a backend can omit it and still line up with these mocks.
   */
  baseWidth?: number;
  baseHeight?: number;
  /** Optional transparent highlight/shadow art drawn above the logo. */
  overlayImage?: string;
  printAreas: PrintArea[];
  allowedFileTypes?: string[];
  maxFileSizeMB?: number;
}

/** Config after defaults are applied - this is what the UI consumes. */
export interface ResolvedCustomizerConfig {
  baseImage: string;
  baseWidth: number;
  baseHeight: number;
  overlayImage?: string;
  printAreas: PrintArea[];
  allowedFileTypes: string[];
  maxFileSizeMB: number;
}

/** Every product mockup in /public/images/products is 576x240. */
export const DESIGN_WIDTH = 576;
export const DESIGN_HEIGHT = 240;

export const DEFAULT_ALLOWED_FILE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
];

export const DEFAULT_MAX_FILE_SIZE_MB = 10;

/**
 * Mock configuration, keyed by product id.
 *
 * Print-area boxes were measured against each mockup so the logo lands on the
 * garment rather than on the backdrop. Replace this map with backend data by
 * populating `product.customizer` - `getCustomizerConfig` already prefers it.
 */
export const mockCustomizerConfigs: Record<string, ProductCustomizerConfig> = {
  "custom-embroidered-team-cap": {
    enabled: true,
    baseImage: "/images/products/custom-embroidered-team-cap.png",
    printAreas: [
      { id: "front-crown", name: "Front Crown", x: 198, y: 52, width: 104, height: 98 },
      { id: "side-panel", name: "Side Panel", x: 352, y: 62, width: 74, height: 62 },
    ],
  },
  "pro-grade-athletic-team-hoodie": {
    enabled: true,
    baseImage: "/images/products/pro-grade-athletic-team-hoodie.png",
    printAreas: [
      { id: "front-center", name: "Front Center", x: 244, y: 46, width: 118, height: 92 },
      { id: "left-chest", name: "Left Chest", x: 250, y: 50, width: 50, height: 46 },
    ],
  },
  "custom-baseball-jersey-sublimation-embroidery": {
    enabled: true,
    baseImage: "/images/products/custom-baseball-jersey-sublimation-embroidery.png",
    printAreas: [
      { id: "back-center", name: "Back Center", x: 228, y: 96, width: 126, height: 98 },
      { id: "back-name", name: "Back Name Bar", x: 214, y: 50, width: 152, height: 42 },
      { id: "left-sleeve", name: "Left Sleeve", x: 142, y: 74, width: 50, height: 46 },
    ],
  },
  "custom-sublimated-soccer-jersey": {
    enabled: true,
    baseImage: "/images/products/custom-sublimated-soccer-jersey.png",
    printAreas: [
      { id: "front-center", name: "Front Center", x: 100, y: 80, width: 112, height: 58 },
      { id: "left-chest", name: "Left Chest", x: 158, y: 32, width: 38, height: 36 },
      { id: "back-center", name: "Back Center", x: 344, y: 58, width: 112, height: 112 },
    ],
  },
  /**
   * Kept ready but unused: this product is `customizable: false` in the product
   * data, which is the real gate. Flip that flag and this config takes effect.
   */
  "school-uniform-bundle-jersey-shorts-socks": {
    enabled: true,
    baseImage: "/images/products/school-uniform-bundle-jersey-shorts-socks.png",
    printAreas: [
      { id: "front-center", name: "Front Center", x: 282, y: 24, width: 66, height: 58 },
      { id: "shorts-leg", name: "Shorts Leg", x: 204, y: 158, width: 60, height: 44 },
    ],
  },
  "embroidered-team-polo": {
    enabled: true,
    baseImage: "/images/products/embroidered-team-polo.png",
    printAreas: [
      { id: "front-crest", name: "Front Crest", x: 176, y: 48, width: 238, height: 152 },
    ],
  },
  "custom-basketball-jersey-shorts-set": {
    enabled: true,
    baseImage: "/images/products/custom-basketball-jersey-shorts-set.png",
    printAreas: [
      { id: "front-center", name: "Front Center", x: 92, y: 42, width: 126, height: 64 },
      { id: "front-number", name: "Front Number", x: 108, y: 108, width: 92, height: 58 },
      { id: "shorts-leg", name: "Shorts Leg", x: 392, y: 148, width: 72, height: 60 },
    ],
  },
  /**
   * The blank-mockup product. Both colourways live in one 576x240 frame, so the
   * placement picker doubles as a colour preview: the customer sees their logo
   * on white or black before ordering.
   *
   * Boxes were measured from the generated mockup - white tee occupies
   * x 36-270, black tee x 306-540, both y 12-228.
   */
  "custom-printed-t-shirt": {
    enabled: true,
    baseImage: "/images/customizer/tshirt-mockup.png",
    printAreas: [
      { id: "white-front", name: "White · Front", x: 101, y: 66, width: 105, height: 91 },
      { id: "white-left-chest", name: "White · Left Chest", x: 168, y: 62, width: 44, height: 40 },
      { id: "black-front", name: "Black · Front", x: 371, y: 66, width: 105, height: 91 },
      { id: "black-left-chest", name: "Black · Left Chest", x: 438, y: 62, width: 44, height: 40 },
    ],
  },
  "custom-sublimated-hockey-jersey": {
    enabled: true,
    baseImage: "/images/products/custom-sublimated-hockey-jersey.png",
    printAreas: [
      { id: "front-center", name: "Front Center", x: 224, y: 58, width: 128, height: 90 },
      { id: "right-shoulder", name: "Right Shoulder", x: 142, y: 24, width: 62, height: 46 },
    ],
  },
};

function resolve(
  config: ProductCustomizerConfig,
  fallbackImage: string,
): ResolvedCustomizerConfig | null {
  const printAreas = config.printAreas.filter((area) => area.allowed !== false);
  if (printAreas.length === 0) return null;

  return {
    baseImage: config.baseImage ?? config.productImage ?? fallbackImage,
    baseWidth: config.baseWidth ?? DESIGN_WIDTH,
    baseHeight: config.baseHeight ?? DESIGN_HEIGHT,
    overlayImage: config.overlayImage,
    printAreas,
    allowedFileTypes: config.allowedFileTypes ?? DEFAULT_ALLOWED_FILE_TYPES,
    maxFileSizeMB: config.maxFileSizeMB ?? DEFAULT_MAX_FILE_SIZE_MB,
  };
}

/**
 * Returns the customizer config for a product, or null when the product is not
 * customizable. Backend-provided `product.customizer` wins; the mock map is the
 * fallback so the feature is demonstrable today.
 *
 * `product.customizable` is the gate: a standard product returns null here no
 * matter what config exists, which is what keeps the Customize button off the
 * page and the customizer bundle out of the download.
 */
export function getCustomizerConfig(product: Product): ResolvedCustomizerConfig | null {
  if (!product.customizable) return null;

  const config = product.customizer ?? mockCustomizerConfigs[product.id];
  if (!config || !config.enabled) return null;

  return resolve(config, product.image);
}

export function isCustomizable(product: Product): boolean {
  return getCustomizerConfig(product) !== null;
}
