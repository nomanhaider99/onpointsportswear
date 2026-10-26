/** Mirrors sports_backend/utils/productSizes.js — keep in sync. */
const youthShort = ["XXS", "XS", "S", "M", "L", "XL"] as const;
const adultShort = ["S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"] as const;
const goalieYouth = ["YS", "YM", "YL", "YXL"] as const;
const goalieAdult = ["AS", "AM", "AL", "AXL", "A2XL", "A3XL", "A4XL"] as const;

export type ProductSizeGroup = {
  id: string;
  label: string;
  sizes: Array<{ code: string; short: string; label: string }>;
};

export const PRODUCT_SIZE_GROUPS: ProductSizeGroup[] = [
  {
    id: "youth",
    label: "Youth",
    sizes: youthShort.map((short) => ({
      code: `Youth ${short}`,
      short,
      label: `Youth ${short}`,
    })),
  },
  {
    id: "adult",
    label: "Adult",
    sizes: adultShort.map((short) => ({
      code: `Adult ${short}`,
      short,
      label: `Adult ${short}`,
    })),
  },
  {
    id: "goalie-youth",
    label: "Goalie (Youth)",
    sizes: goalieYouth.map((short) => ({ code: short, short, label: short })),
  },
  {
    id: "goalie-adult",
    label: "Goalie (Adult)",
    sizes: goalieAdult.map((short) => ({ code: short, short, label: short })),
  },
];

export const ALL_PRODUCT_SIZES = PRODUCT_SIZE_GROUPS.flatMap((group) =>
  group.sizes.map((row) => row.code),
);

export const DEFAULT_PRODUCT_SIZE = "Adult M";

export const SIZE_ORDER = [
  ...ALL_PRODUCT_SIZES,
  // legacy aliases for sort
  "XXS",
  "XS",
  "S",
  "SM",
  "M",
  "MD",
  "L",
  "LG",
  "XL",
  "XXL",
  "2XL",
  "XXXL",
  "3XL",
  "4XL",
  "5XL",
  "YS",
  "YM",
  "YL",
  "YXL",
  "AS",
  "AM",
  "AL",
  "AXL",
  "A2XL",
  "A3XL",
  "A4XL",
];

export function sizeRank(label: string) {
  const key = label.trim();
  const index = SIZE_ORDER.indexOf(key);
  if (index !== -1) return index;
  const upper = key.toUpperCase();
  const upperIndex = SIZE_ORDER.findIndex((item) => item.toUpperCase() === upper);
  return upperIndex === -1 ? 1000 + key.charCodeAt(0) : upperIndex;
}

function matchesSizeGroup(groupId: string, size: string, codes: Set<string>) {
  if (codes.has(size)) return true;
  if (groupId === "youth") return /^Youth\s/i.test(size);
  if (groupId === "adult") return /^(Adult|Women)\s/i.test(size);
  return false;
}

export function groupSelectedSizes(sizes: string[]) {
  return PRODUCT_SIZE_GROUPS.map((group) => {
    const codes = new Set(group.sizes.map((row) => row.code));
    const selected = sizes.filter((size) => matchesSizeGroup(group.id, size, codes));
    return { ...group, selected };
  }).filter((group) => group.selected.length > 0);
}

export function shortSizeLabel(code: string) {
  for (const group of PRODUCT_SIZE_GROUPS) {
    const row = group.sizes.find((item) => item.code === code);
    if (row) return row.short;
  }
  return code;
}
