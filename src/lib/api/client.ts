import { API_URL, API_ORIGIN } from "@/lib/config";

export { API_URL, API_ORIGIN } from "@/lib/config";

const TOKEN_KEY = "op-auth-token";

export function getStoredToken() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(TOKEN_KEY) || "";
}

export function setStoredToken(token: string) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    // Error.name is getter-only in some runtimes — never assign directly.
    Object.defineProperty(this, "name", {
      value: "ApiError",
      configurable: true,
      writable: true,
    });
    this.status = status;
  }
}

function statusFallback(status: number) {
  if (status === 0) return "Cannot reach the server. Check your connection and try again.";
  if (status === 400) return "That request could not be completed. Check the details and try again.";
  if (status === 401) return "Please sign in to continue.";
  if (status === 403) return "You do not have permission to do that.";
  if (status === 404) return "We could not find what you were looking for.";
  if (status === 409) return "That action conflicts with the current data.";
  if (status === 422) return "Please check the form details and try again.";
  if (status === 429) return "Too many requests. Please wait a moment and try again.";
  if (status >= 500) return "The server had a problem. Please try again shortly.";
  return "Request failed";
}

function readApiMessage(data: unknown) {
  if (!data || typeof data !== "object") return "";
  const row = data as { message?: unknown; error?: unknown; errors?: unknown };
  if (typeof row.message === "string" && row.message.trim()) return row.message.trim();
  if (typeof row.error === "string" && row.error.trim()) return row.error.trim();
  if (Array.isArray(row.errors) && row.errors.length) {
    const first = row.errors[0];
    if (typeof first === "string") return first;
    if (first && typeof first === "object" && "msg" in first) return String((first as { msg: string }).msg);
    if (first && typeof first === "object" && "message" in first) {
      return String((first as { message: string }).message);
    }
  }
  return "";
}

export function apiMessage(error: unknown, fallback = "Something went wrong. Please try again.") {
  if (error instanceof ApiError) {
    return error.message || statusFallback(error.status) || fallback;
  }
  if (error instanceof Error) {
    if (/failed to fetch|networkerror|load failed|network request failed/i.test(error.message)) {
      return "Cannot reach the server. Check your connection and try again.";
    }
    return error.message || fallback;
  }
  return fallback;
}

export function mediaUrl(url?: string | null) {
  if (!url) return "";
  if (/^(data:|blob:)/i.test(url)) return url;
  if (/unsplash\.com/i.test(url)) return url;

  const proxied = proxyS3Url(url);
  if (proxied) return proxied;

  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(url)) {
    return url.replace(/^https?:\/\/[^/]+/i, API_ORIGIN);
  }
  // Relative API / uploads / media keys from the backend
  if (url.startsWith("/")) return `${API_ORIGIN}${url}`;
  if (/^(custom|products|categories|coupons|avatars)\//i.test(url)) {
    return `${API_ORIGIN}/api/media/${url
      .split("/")
      .map((part) => encodeURIComponent(part))
      .join("/")}`;
  }
  return url;
}

function proxyS3Url(value: string) {
  const mediaMatch = value.match(/\/api\/media\/(.+?)(?:\?|#|$)/i);
  if (mediaMatch) return `${API_ORIGIN}/api/media/${mediaMatch[1]}`;

  let key = "";
  if (value.startsWith("s3://")) {
    const rest = value.slice(5);
    const slash = rest.indexOf("/");
    key = slash >= 0 ? rest.slice(slash + 1) : "";
  } else {
    try {
      const parsed = new URL(value);
      const host = parsed.hostname.toLowerCase();
      const pathname = decodeURIComponent(parsed.pathname.replace(/^\/+/, ""));
      const isS3 =
        /(^|\.)s3([.-]|$)/i.test(host) ||
        host.endsWith("amazonaws.com") && host.includes("s3") ||
        /\.s3-website[.-]/i.test(host);
      if (!isS3) return "";
      const parts = pathname.split("/");
      if (parts.length > 1 && !pathname.includes(".")) {
        // path-style: bucket/key
      }
      if (host.startsWith("s3.") || host.startsWith("s3-")) {
        key = parts.slice(1).join("/");
      } else {
        key = pathname;
      }
    } catch {
      if (/^(products|categories|coupons)\//i.test(value.replace(/^\/+/, ""))) {
        key = value.replace(/^\/+/, "");
      }
    }
  }
  if (!key) return "";
  const encoded = key
    .split("/")
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join("/");
  return `${API_ORIGIN}/api/media/${encoded}`;
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string;
  query?: Record<string, string | number | boolean | undefined>;
};

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = options.token === "" ? "" : options.token ?? getStoredToken();
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(options.query || {})) {
    if (value === undefined || value === "") continue;
    query.set(key, String(value));
  }
  const suffix = query.toString() ? `?${query}` : "";
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.body !== undefined) headers["Content-Type"] = "application/json";

  let response: Response;
  try {
    let base = API_URL;
    if (
      typeof window !== "undefined" &&
      window.location.protocol === "https:" &&
      /^https?:\/\/(localhost|127\.0\.0\.1)/i.test(base)
    ) {
      base = "https://backend.betterbuildsc.com/api";
    }
    response = await fetch(`${base}${path}${suffix}`, {
      method: options.method || "GET",
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError(statusFallback(0), 0);
  }

  const data = (await response.json().catch(() => ({}))) as { message?: string } & T;
  if (!response.ok) {
    throw new ApiError(readApiMessage(data) || statusFallback(response.status), response.status);
  }
  return data;
}

export const authApi = {
  login: (email: string, password: string) =>
    api<{ token: string; user: AuthUser }>("/auth/login", { method: "POST", body: { email, password } }),
  register: (body: Record<string, unknown>) =>
    api<{ token?: string; user?: AuthUser; message?: string }>("/auth/register", { method: "POST", body }),
  me: (token?: string) => api<{ user: AuthUser }>("/auth/me", { token }),
  updateMe: (body: Record<string, unknown>) =>
    api<{ user: AuthUser }>("/auth/me", { method: "PATCH", body }),
  changePassword: (body: { currentPassword: string; newPassword: string }) =>
    api("/auth/password", { method: "PUT", body }),
  forgotPassword: (email: string) => api("/auth/forgot-password", { method: "POST", body: { email } }),
  resetPassword: (token: string, password: string) =>
    api("/auth/reset-password", { method: "POST", body: { token, password } }),
  verifyOtp: (email: string, otp: string) => api("/auth/verify-otp", { method: "POST", body: { email, otp } }),
  resendOtp: (email: string) => api("/auth/resend-otp", { method: "POST", body: { email } }),
};

export type AuthUser = {
  _id: string;
  name: string;
  email: string;
  role?: string;
  phone?: string;
  avatar?: string;
  notificationPrefs?: Record<string, boolean>;
};

export const catalogApi = {
  products: (query: Record<string, string | number | boolean | undefined> = {}) =>
    api<{ products: unknown[]; page?: number; pages?: number; total?: number }>("/products", { query }),
  product: (id: string) => api<Record<string, unknown>>(`/products/${id}`),
  searchProducts: (q: string) => api<{ products: unknown[] }>("/products/search", { query: { q, limit: 50 } }),
  categories: () => api<unknown[]>("/categories"),
  attributes: () => api<unknown[] | { attributes: unknown[] }>("/attributes"),
};

export const cartApi = {
  get: () => api<{ items?: unknown[] }>("/cart"),
  add: (body: { productId: string; quantity?: number; size?: string; color?: string; custom?: boolean }) =>
    api("/cart", { method: "POST", body }),
  update: (body: Record<string, unknown>) => api("/cart", { method: "PUT", body }),
  remove: (body: Record<string, unknown>) => api("/cart/item", { method: "DELETE", body }),
  applyCoupon: (code: string) => api("/cart/coupon", { method: "POST", body: { code } }),
  removeCoupon: () => api("/cart/coupon", { method: "DELETE" }),
  clear: () => api("/cart", { method: "DELETE" }),
};

export const ordersApi = {
  quote: (body: Record<string, unknown>) =>
    api<Record<string, unknown>>("/orders/quote", { method: "POST", body }),
  create: (body: Record<string, unknown>) =>
    api<{
      _id?: string;
      trackingId?: string;
      guestToken?: string;
      totalPrice?: number;
      paymentMethod?: string;
      order?: { _id?: string; trackingId?: string; guestToken?: string };
    }>("/orders/", {
      method: "POST",
      body,
    }),
  mine: () => api<unknown[]>("/orders/mine"),
  get: (id: string) => api<Record<string, unknown>>(`/orders/${id}`),
};

export type PaymentMethodId = "stripe" | "paypal" | "cod";

export const paymentsApi = {
  config: () =>
    api<{
      methods: PaymentMethodId[];
      stripePublishableKey: string;
      paypalClientId: string;
      paypalMode: string;
      currency: string;
    }>("/payments/config"),
  stripeCheckoutSession: (body: {
    orderId: string;
    guestToken?: string;
    successUrl: string;
    cancelUrl: string;
  }) =>
    api<{ url: string; sessionId: string; orderId: string; guestToken?: string }>(
      "/payments/stripe/checkout-session",
      { method: "POST", body },
    ),
  paypalCreate: (body: {
    orderId: string;
    guestToken?: string;
    returnUrl?: string;
    cancelUrl?: string;
  }) =>
    api<{ paypalOrderId: string; approveUrl: string; orderId: string; guestToken?: string }>(
      "/payments/paypal/create",
      { method: "POST", body },
    ),
  paypalCapture: (body: { orderId: string; guestToken?: string; paypalOrderId?: string }) =>
    api<{ paid: boolean; order: Record<string, unknown> }>("/payments/paypal/capture", {
      method: "POST",
      body,
    }),
  stripeSyncSession: (body: { orderId: string; guestToken?: string }) =>
    api<{ paid: boolean }>("/payments/stripe/sync-session", { method: "POST", body }),
  status: (orderId: string, guestToken = "") =>
    api<{ paid: boolean; paymentStatus: string; status: string; trackingId?: string }>(
      `/payments/status/${orderId}${guestToken ? `?guest=${encodeURIComponent(guestToken)}` : ""}`,
    ),
};

export const contactApi = {
  submit: (body: Record<string, unknown>) => api("/contact", { method: "POST", body }),
};

export const designsApi = {
  list: () => api<{ designs: Record<string, unknown>[] }>("/designs"),
  get: (id: string) => api<Record<string, unknown>>(`/designs/${id}`),
  create: (body: Record<string, unknown>) =>
    api<Record<string, unknown>>("/designs", { method: "POST", body }),
  update: (id: string, body: Record<string, unknown>) =>
    api<Record<string, unknown>>(`/designs/${id}`, { method: "PUT", body }),
  remove: (id: string) => api<{ message?: string }>(`/designs/${id}`, { method: "DELETE" }),
};

/** Upload a data-URL or remote image as a custom design preview. */
export async function uploadCustomPreview(dataUrl: string, filename = `jersey-${Date.now()}.jpg`) {
  if (!dataUrl) return "";
  const token = getStoredToken();
  const form = new FormData();
  if (dataUrl.startsWith("data:")) {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    form.append("file", blob, filename);
  } else {
    form.append("file", dataUrl);
  }
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_URL}/uploads/custom`, { method: "POST", headers, body: form });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Could not upload design preview");
  return String(data.url || data.previewUrl || "");
}

export const searchApi = {
  query: (q: string, type = "products") => api<{ products?: unknown[]; categories?: unknown[] }>("/search", { query: { q, type, limit: 12 } }),
};

export const addressApi = {
  list: () => api<{ addresses?: unknown[] } | unknown[]>("/addresses"),
  create: (body: Record<string, unknown>) => api("/addresses", { method: "POST", body }),
  update: (id: string, body: Record<string, unknown>) => api(`/addresses/${id}`, { method: "PUT", body }),
  setDefault: (id: string) => api(`/addresses/${id}/default`, { method: "PATCH" }),
  remove: (id: string) => api(`/addresses/${id}`, { method: "DELETE" }),
};
