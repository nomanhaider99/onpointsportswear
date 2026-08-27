export type ProductCategory = "Jerseys" | "Hoodies" | "Shorts" | "Accessories";

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
}

export const productCategories: Array<"All" | ProductCategory> = [
  "All",
  "Jerseys",
  "Hoodies",
  "Shorts",
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
  },
];

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
