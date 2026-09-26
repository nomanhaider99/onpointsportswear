import { getStoredToken } from "@/lib/api/client";

/** Build /account login URL that returns the user to `returnTo` after sign-in. */
export function accountLoginHref(returnTo: string) {
  const target = returnTo || "/";
  return `/account?login=1&returnTo=${encodeURIComponent(target)}`;
}

export function isSignedIn() {
  if (typeof window === "undefined") return false;
  return Boolean(getStoredToken());
}
