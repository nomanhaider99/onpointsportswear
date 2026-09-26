/**
 * Bounce the in-app browser back into the native app so
 * WebBrowser.openAuthSessionAsync can complete and the tab closes.
 */
export const DEFAULT_APP_RETURN = "onpoint://payment-return";

export function bounceToApp(appReturn: string, extras: { orderId?: string; paid?: boolean } = {}) {
  if (typeof window === "undefined") return false;

  const raw = String(appReturn || DEFAULT_APP_RETURN).trim() || DEFAULT_APP_RETURN;
  const orderId = extras.orderId || "";
  const paid = extras.paid ? "1" : "0";

  const withParams = (value: string) => {
    try {
      const url = new URL(value);
      if (orderId) url.searchParams.set("orderId", orderId);
      url.searchParams.set("paid", paid);
      return url.toString();
    } catch {
      const join = value.includes("?") ? "&" : "?";
      const bits = [`paid=${paid}`];
      if (orderId) bits.unshift(`orderId=${encodeURIComponent(orderId)}`);
      return `${value}${join}${bits.join("&")}`;
    }
  };

  const target = withParams(raw);

  // Multiple strategies — Custom Tabs / SFSafariViewController need a real navigation.
  try {
    window.location.replace(target);
  } catch {
    try {
      window.location.href = target;
    } catch {
      /* continue fallbacks */
    }
  }

  try {
    const anchor = document.createElement("a");
    anchor.href = target;
    anchor.rel = "noopener";
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  } catch {
    /* ignore */
  }

  // Android Chrome Custom Tabs: explicit intent
  if (/^onpoint:/i.test(target)) {
    window.setTimeout(() => {
      try {
        const path = target.replace(/^onpoint:\/\//i, "");
        window.location.href = `intent://${path}#Intent;scheme=onpoint;package=com.anonymous.sportsapp;end`;
      } catch {
        /* ignore */
      }
    }, 250);
  }

  return true;
}

export function buildAppReturnHref(
  appReturn: string,
  extras: { orderId?: string; paid?: boolean } = {},
) {
  const raw = String(appReturn || DEFAULT_APP_RETURN).trim() || DEFAULT_APP_RETURN;
  const orderId = extras.orderId || "";
  const paid = extras.paid ? "1" : "0";
  try {
    const url = new URL(raw);
    if (orderId) url.searchParams.set("orderId", orderId);
    url.searchParams.set("paid", paid);
    return url.toString();
  } catch {
    const join = raw.includes("?") ? "&" : "?";
    return `${raw}${join}orderId=${encodeURIComponent(orderId)}&paid=${paid}`;
  }
}
