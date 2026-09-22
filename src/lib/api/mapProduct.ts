import type { Product, ProductCategory } from "@/data/products";
import type { ProductCustomizerConfig } from "@/data/customizer";
import { mediaUrl } from "./client";

export interface ApiCategory {
  _id: string;
  name: string;
  slug?: string;
  type?: string;
  productCount?: number;
}

export interface ApiProduct {
  _id?: string;
  id?: string;
  name: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  thumbnail?: string;
  images?: string[];
  price?: number;
  salePrice?: number;
  originalPrice?: number;
  featured?: boolean;
  type?: string;
  sizes?: string[] | string;
  colors?: string[];
  stock?: number;
  category?: ApiCategory | string;
  variants?: Array<{
    options?: Array<{ value?: string; attributeTitle?: string }>;
    price?: number;
    salePrice?: number;
    isActive?: boolean;
  }>;
  customizer?: ProductCustomizerConfig;
}

function slugify(value: string) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function categoryName(raw: ApiProduct): ProductCategory {
  if (raw.category && typeof raw.category === "object" && raw.category.name) {
    return raw.category.name as ProductCategory;
  }
  return "Accessories";
}

function isCustomizableType(raw: ApiProduct) {
  if (raw.type === "customizable") return true;
  if (raw.category && typeof raw.category === "object") {
    return raw.category.type === "customizable";
  }
  return false;
}

const SIZE_ORDER = ["XXS", "XS", "S", "SM", "M", "MD", "L", "LG", "XL", "XXL", "2XL", "XXXL", "3XL", "4XL"];

function sizeRank(label: string) {
  const key = label.trim().toUpperCase();
  const index = SIZE_ORDER.indexOf(key);
  return index === -1 ? 100 + key.charCodeAt(0) : index;
}

function sizeLabel(value: unknown) {
  if (typeof value === "string") return value.trim();
  if (value && typeof value === "object") {
    const row = value as { label?: string; name?: string; value?: string };
    return String(row.label || row.name || row.value || "").trim();
  }
  return "";
}

function sizeRows(raw: ApiProduct, sale: number) {
  let labels: string[] = [];
  if (Array.isArray(raw.sizes)) {
    labels = raw.sizes.map(sizeLabel).filter(Boolean);
  } else if (typeof raw.sizes === "string") {
    labels = raw.sizes.split(/[,|/]+/).map((item) => item.trim()).filter(Boolean);
  }

  if (!labels.length && Array.isArray(raw.variants)) {
    const fromVariants = (raw.variants || [])
      .filter((variant) => variant.isActive !== false)
      .map((variant) => {
        const sizeOption = (variant.options || []).find((option) =>
          /size/i.test(String(option.attributeTitle || "")),
        );
        const label = String(sizeOption?.value || variant.options?.[0]?.value || "").trim();
        const price = Number(variant.salePrice || variant.price || sale);
        return label ? { label, price: Number.isFinite(price) ? price : sale } : null;
      })
      .filter((row): row is { label: string; price: number } => Boolean(row));
    if (fromVariants.length) {
      return [...fromVariants].sort((a, b) => sizeRank(a.label) - sizeRank(b.label));
    }
  }

  const unique = Array.from(new Set(labels));
  if (!unique.length) return [{ label: "One size", price: sale }];
  return unique
    .sort((a, b) => sizeRank(a) - sizeRank(b))
    .map((label) => ({ label, price: sale }));
}

export function mapProduct(raw: ApiProduct): Product {
  const sale = Number(raw.salePrice ?? raw.price ?? 0);
  const sizes = sizeRows(raw, Number.isFinite(sale) ? sale : 0);
  const prices = sizes.map((entry) => entry.price);
  const image = mediaUrl(raw.thumbnail || raw.images?.[0] || "");

  return {
    id: String(raw._id || raw.id || slugify(raw.name)),
    slug: raw.slug || slugify(raw.name),
    name: raw.name,
    category: categoryName(raw),
    priceMin: Math.min(...prices),
    priceMax: Math.max(...prices),
    image: image || "/images/logo.png",
    sizes,
    featured: Boolean(raw.featured),
    customizable: isCustomizableType(raw),
    originalPrice: Number(raw.originalPrice ?? raw.price ?? sale) || undefined,
    description: raw.shortDescription || raw.description || "",
    colors: (raw.colors || []).map(String).filter(Boolean),
    stock: Number(raw.stock || 0),
    images: (raw.images || []).map((src) => mediaUrl(src)).filter(Boolean),
    customizer: raw.customizer,
  };
}

export function mapCategories(raw: unknown): ApiCategory[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is ApiCategory => Boolean(item && typeof item === "object" && "_id" in item && "name" in item));
}

export function mapProductList(raw: unknown): Product[] {
  const rows = Array.isArray(raw) ? raw : [];
  return rows
    .filter((item): item is ApiProduct => Boolean(item && typeof item === "object" && ("name" in item)))
    .map(mapProduct);
}
