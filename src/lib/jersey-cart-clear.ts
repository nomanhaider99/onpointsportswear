/** Session flag + iframe ping so the jersey studio cart clears after checkout. */
const FLAG = "op-clear-jersey-cart";

export function markJerseyStudioCartForClear() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(FLAG, "1");
  } catch {
    /* ignore */
  }
  pingJerseyStudioClearCart();
}

export function consumeJerseyStudioCartClearFlag() {
  if (typeof window === "undefined") return false;
  try {
    if (window.sessionStorage.getItem(FLAG) !== "1") return false;
    window.sessionStorage.removeItem(FLAG);
    return true;
  } catch {
    return false;
  }
}

export function pingJerseyStudioClearCart() {
  if (typeof window === "undefined") return;
  try {
    document.querySelectorAll("iframe").forEach((frame) => {
      frame.contentWindow?.postMessage({ type: "op-jersey-clear-cart" }, "*");
    });
  } catch {
    /* ignore */
  }
}
