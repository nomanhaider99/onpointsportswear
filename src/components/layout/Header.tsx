"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu } from "lucide-react";
import { mainNav } from "@/data/navigation";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { CartIcon } from "./CartIcon";
import { CartDrawer } from "./CartDrawer";
import { MobileMenu } from "./MobileMenu";

export function Header() {
  const pathname = usePathname();
  const { count, subtotal } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);

  // Close the menu and cart when the route changes (covers browser back/forward too).
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMenuOpen(false);
    setCartOpen(false);
  }

  return (
    <header className="bg-background">
      <div className="container-site flex items-center justify-between gap-4 py-3">
        <Link href="/" className="shrink-0" aria-label="On Point Sportswear - home">
          <Image
            src="/images/logo.png"
            alt="On Point Sportswear"
            width={131}
            height={87}
            priority
            className="h-auto w-[90px] lg:w-[131px]"
          />
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {mainNav.map((item) => {
              const active =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "text-base font-semibold uppercase transition-colors duration-300",
                      active ? "text-primary" : "text-white/80 hover:text-primary",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Mobile order matches the source: logo, menu toggle, cart. */}
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          className="rounded p-1 text-white transition-colors hover:text-primary lg:hidden"
        >
          <Menu size={28} aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={() => setCartOpen(true)}
          aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}, subtotal ${formatPrice(subtotal)}`}
          aria-expanded={cartOpen}
          className="rounded border border-transparent py-3 pl-3 pr-4 text-white transition-colors lg:pl-6"
        >
          {/* The source keeps the subtotal in the DOM but hides it visually. */}
          <span className="sr-only">{formatPrice(subtotal)}</span>
          <span className="relative inline-flex items-center transition-colors hover:text-primary">
            <span
              className="absolute -right-[0.7em] -top-[0.7em] flex h-[1.6em] min-w-[1.6em] items-center justify-center rounded-full bg-[#d9534f] text-[10px] leading-[1.5em] text-white"
              aria-hidden="true"
            >
              {count}
            </span>
            <CartIcon />
            <span className="sr-only">Cart</span>
          </span>
        </button>
      </div>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} pathname={pathname} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
}
