import type { ProductCustomizerConfig } from "@/data/customizer";

export type ProductCategory = "Jerseys" | "Hoodies" | "Shorts" | "T-Shirts" | "Accessories";

/**
 * The catalogue splits on two independent axes:
 *  - `category`  - what the garment is (Jerseys, Hoodies, ...)
 *  - `type`      - whether a customer can put their own logo on it
 *
 * "standard" products are sold as shown and never open the customizer.
 */
export type ProductType = "standard" | "customizable";

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  priceMin: number;
  priceMax: number;
  image: string;
  /** Source WooCommerce variations: SM maps to priceMin, MD maps to priceMax. */
  sizes: { label: string; price: number }[];
  /** Shown on the products archive / featured grid in source order. */
  featured: boolean;
  /**
   * Single source of truth for which of the two product types this is.
   * `false` means standard: no Customize button, ever, whatever config exists.
   */
  customizable: boolean;
  originalPrice?: number;
  description?: string;
  colors?: string[];
  stock?: number;
  images?: string[];
  /**
   * Per-product customizer config. Optional so records stay valid without it.
   * When the backend starts returning this it takes priority over the mock
   * config in `@/data/customizer`. See docs/customizer-handoff.md.
   */
  customizer?: ProductCustomizerConfig;
}

export const productCategories: Array<"All" | ProductCategory> = [
  "All",
  "Jerseys",
  "Hoodies",
  "Shorts",
  "T-Shirts",
  "Accessories",
];

export const products: Product[] = [
  {
    id: "custom-embroidered-team-cap",
    slug: "custom-embroidered-team-cap",
    name: "Custom Embroidered Team Cap",
    category: "Accessories",
    priceMin: 25,
    priceMax: 35,
    image: "/images/products/custom-embroidered-team-cap.png",
    sizes: [
      { label: "SM", price: 25 },
      { label: "MD", price: 35 },
    ],
    featured: true,
    customizable: true,
  },
  {
    id: "pro-grade-athletic-team-hoodie",
    slug: "pro-grade-athletic-team-hoodie",
    name: "Pro-Grade Athletic Team Hoodie",
    category: "Hoodies",
    priceMin: 65,
    priceMax: 85,
    image: "/images/products/pro-grade-athletic-team-hoodie.png",
    sizes: [
      { label: "SM", price: 65 },
      { label: "MD", price: 85 },
    ],
    featured: true,
    customizable: true,
  },
  {
    id: "custom-baseball-jersey-sublimation-embroidery",
    slug: "custom-baseball-jersey-sublimation-embroidery",
    name: "Custom Baseball Jersey (Sublimation + Embroidery)",
    category: "Jerseys",
    priceMin: 59,
    priceMax: 88,
    image: "/images/products/custom-baseball-jersey-sublimation-embroidery.png",
    sizes: [
      { label: "SM", price: 59 },
      { label: "MD", price: 88 },
    ],
    featured: true,
    customizable: true,
  },
  {
    id: "custom-sublimated-soccer-jersey",
    slug: "custom-sublimated-soccer-jersey",
    name: "Custom Sublimated Soccer Jersey",
    category: "Jerseys",
    priceMin: 40,
    priceMax: 62,
    image: "/images/products/custom-sublimated-soccer-jersey.png",
    sizes: [
      { label: "SM", price: 40 },
      { label: "MD", price: 62 },
    ],
    featured: true,
    customizable: true,
  },
  {
    id: "school-uniform-bundle-jersey-shorts-socks",
    slug: "school-uniform-bundle-jersey-shorts-socks",
    name: "School Uniform Bundle (Jersey, Shorts & Socks)",
    category: "Jerseys",
    priceMin: 66,
    priceMax: 95,
    image: "/images/products/school-uniform-bundle-jersey-shorts-socks.png",
    sizes: [
      { label: "SM", price: 66 },
      { label: "MD", price: 95 },
    ],
    featured: true,
    customizable: false,
  },
  {
    id: "embroidered-team-polo",
    slug: "embroidered-team-polo",
    name: "Embroidered Team Polo",
    category: "Accessories",
    priceMin: 30,
    priceMax: 44,
    image: "/images/products/embroidered-team-polo.png",
    sizes: [
      { label: "SM", price: 30 },
      { label: "MD", price: 44 },
    ],
    featured: true,
    customizable: true,
  },
  {
    id: "custom-basketball-jersey-shorts-set",
    slug: "custom-basketball-jersey-shorts-set",
    name: "Custom Basketball Jersey & Shorts Set",
    category: "Shorts",
    priceMin: 55,
    priceMax: 80,
    image: "/images/products/custom-basketball-jersey-shorts-set.png",
    sizes: [
      { label: "SM", price: 55 },
      { label: "MD", price: 80 },
    ],
    featured: true,
    customizable: true,
  },
  {
    id: "custom-sublimated-hockey-jersey",
    slug: "custom-sublimated-hockey-jersey",
    name: "Custom Sublimated Hockey Jersey",
    category: "Jerseys",
    priceMin: 48,
    priceMax: 70,
    image: "/images/products/custom-sublimated-hockey-jersey.png",
    sizes: [
      { label: "SM", price: 48 },
      { label: "MD", price: 70 },
    ],
    featured: true,
    customizable: true,
  },
  {
    /**
     * Blank-mockup product: its picture is the garment with no branding on it,
     * which is what makes an uploaded logo read correctly in the customizer.
     * Built from the supplied reference art - see docs/customizer-handoff.md.
     */
    id: "custom-printed-t-shirt",
    slug: "custom-printed-t-shirt",
    name: "Custom Printed T-Shirt",
    category: "T-Shirts",
    priceMin: 22,
    priceMax: 30,
    image: "/images/customizer/tshirt-mockup.png",
    sizes: [
      { label: "SM", price: 22 },
      { label: "MD", price: 30 },
    ],
    featured: false,
    customizable: true,
  },
];

export const productTypes: Array<"All" | ProductType> = ["All", "customizable", "standard"];

/** Human label for a product type, used on filters and card badges. */
export const productTypeLabels: Record<ProductType, string> = {
  customizable: "Customizable",
  standard: "Standard",
};

export function getProductType(product: Product): ProductType {
  return product.customizable ? "customizable" : "standard";
}

export const customizableProducts: Product[] = products.filter((p) => p.customizable);
export const standardProducts: Product[] = products.filter((p) => !p.customizable);

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function getRelatedProducts(product: Product, limit = 3): Product[] {
  const sameCategory = products.filter(
    (candidate) => candidate.category === product.category && candidate.slug !== product.slug,
  );
  const filler = products.filter(
    (candidate) => candidate.category !== product.category && candidate.slug !== product.slug,
  );
  return [...sameCategory, ...filler].slice(0, limit);
}
