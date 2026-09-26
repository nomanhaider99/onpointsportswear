/**
 * Bounce the in-app browser back into the native app so
 * WebBrowser.openAuthSessionAsync can complete.
 */
export function bounceToApp(appReturn: string, extras: { orderId?: string; paid?: boolean } = {}) {
  if (!appReturn || typeof window === "undefined") return false;

  const orderId = extras.orderId || "";
  const paid = extras.paid ? "1" : "0";

  const withParams = (raw: string) => {
    try {
      const url = new URL(raw);
      if (orderId) url.searchParams.set("orderId", orderId);
      url.searchParams.set("paid", paid);
      return url.toString();
    } catch {
      const join = raw.includes("?") ? "&" : "?";
      const bits = [`paid=${paid}`];
      if (orderId) bits.unshift(`orderId=${encodeURIComponent(orderId)}`);
      return `${raw}${join}${bits.join("&")}`;
    }
  };

  const target = withParams(appReturn);

  try {
    window.location.replace(target);
  } catch {
    try {
      window.location.href = target;
    } catch {
      return false;
    }
  }

  // Android Chrome sometimes needs an intent:// fallback a moment later.
  if (/^onpoint:/i.test(target)) {
    window.setTimeout(() => {
      try {
        const path = target.replace(/^onpoint:\/\//i, "");
        const intent = `intent://${path}#Intent;scheme=onpoint;package=com.anonymous.sportsapp;end`;
        window.location.href = intent;
      } catch {
        /* ignore */
      }
    }, 400);
  }

  return true;
}

export function buildAppReturnHref(
  appReturn: string,
  extras: { orderId?: string; paid?: boolean } = {},
) {
  const orderId = extras.orderId || "";
  const paid = extras.paid ? "1" : "0";
  try {
    const url = new URL(appReturn);
    if (orderId) url.searchParams.set("orderId", orderId);
    url.searchParams.set("paid", paid);
    return url.toString();
  } catch {
    const join = appReturn.includes("?") ? "&" : "?";
    return `${appReturn}${join}orderId=${encodeURIComponent(orderId)}&paid=${paid}`;
  }
}
