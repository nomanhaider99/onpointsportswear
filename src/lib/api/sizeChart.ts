import { API_ORIGIN, mediaUrl } from "@/lib/api/client";

export type SizeChartInfo = {
  title: string;
  description: string;
  image: string;
};

type ApiChart = {
  _id?: string;
  title?: string;
  description?: string;
  image?: string;
  product?: string | { _id?: string; name?: string } | null;
  category?: string | { _id?: string; name?: string } | null;
};

function chartProductId(chart: ApiChart) {
  if (!chart?.product) return "";
  if (typeof chart.product === "object") return String(chart.product._id || "");
  return String(chart.product);
}

function chartCategoryId(chart: ApiChart) {
  if (!chart?.category) return "";
  if (typeof chart.category === "object") return String(chart.category._id || "");
  return String(chart.category);
}

function chartCategoryName(chart: ApiChart) {
  if (chart?.category && typeof chart.category === "object") {
    return String(chart.category.name || "").toLowerCase();
  }
  return "";
}

function pack(chart: ApiChart | null | undefined): SizeChartInfo | null {
  if (!chart?.image) return null;
  const image = mediaUrl(chart.image);
  if (!image) return null;
  return {
    title: String(chart.title || "Size guide").trim() || "Size guide",
    description: String(chart.description || "").trim(),
    image,
  };
}

function norm(value: string) {
  return String(value || "")
    .toLowerCase()
    .replace(/size\s*chart/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Prefer product chart, then category chart, then name fuzzy match. */
export async function resolveSizeChart(options: {
  productId?: string;
  categoryId?: string;
  categoryName?: string;
  productName?: string;
  embedded?: { title?: string; description?: string; image?: string } | null;
}): Promise<SizeChartInfo | null> {
  const embedded = options.embedded?.image
    ? {
        title: options.embedded.title || "Size guide",
        description: options.embedded.description || "",
        image: mediaUrl(options.embedded.image),
      }
    : null;
  if (embedded?.image) return embedded;

  const productId = String(options.productId || "").trim();
  const categoryId = String(options.categoryId || "").trim();

  try {
    if (productId && /^[a-f0-9]{24}$/i.test(productId)) {
      const res = await fetch(`${API_ORIGIN}/api/size-charts/by-product/${encodeURIComponent(productId)}`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (res.ok) {
        const packed = pack(await res.json());
        if (packed) return packed;
      }
    }
  } catch {
    /* fall through */
  }

  try {
    if (categoryId && /^[a-f0-9]{24}$/i.test(categoryId)) {
      const res = await fetch(
        `${API_ORIGIN}/api/size-charts/by-category/${encodeURIComponent(categoryId)}`,
        { headers: { Accept: "application/json" }, cache: "no-store" },
      );
      if (res.ok) {
        const packed = pack(await res.json());
        if (packed) return packed;
      }
    }
  } catch {
    /* fall through */
  }

  try {
    const res = await fetch(`${API_ORIGIN}/api/size-charts`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const rows = (await res.json()) as ApiChart[];
    const charts = Array.isArray(rows) ? rows : [];

    if (productId) {
      const byProduct = charts.find((row) => chartProductId(row) === productId);
      const packed = pack(byProduct);
      if (packed) return packed;
    }

    if (categoryId) {
      const byCategory = charts.find(
        (row) => !chartProductId(row) && chartCategoryId(row) === categoryId,
      );
      const packed = pack(byCategory);
      if (packed) return packed;
    }

    const catName = norm(options.categoryName || "");
    if (catName) {
      const byCatName = charts.find(
        (row) => !chartProductId(row) && chartCategoryName(row) === catName,
      );
      const packed = pack(byCatName);
      if (packed) return packed;

      // Any chart in that category (product-level) — e.g. first Volleyball chart.
      const anyInCategory = charts.find(
        (row) => chartCategoryName(row) === catName || chartCategoryName(row).includes(catName),
      );
      const packedAny = pack(anyInCategory);
      if (packedAny) return packedAny;
    }

    const productName = norm(options.productName || "");
    if (productName) {
      const byName = charts.find((row) => {
        const title = norm(row.title || "");
        return title && (productName.includes(title) || title.split(" ").every((w) => productName.includes(w)));
      });
      const packed = pack(byName);
      if (packed) return packed;
    }
  } catch {
    /* ignore */
  }

  return null;
}
