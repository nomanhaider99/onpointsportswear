import type { SVGProps } from "react";

/** Redrawn from the source header's 28px bag/cart glyph. */
export function CartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M5 7h14l-1.2 12.1a2 2 0 0 1-2 1.9H8.2a2 2 0 0 1-2-1.9L5 7Z" />
      <path d="M9 9V5.8a3 3 0 0 1 6 0V9" />
    </svg>
  );
}
