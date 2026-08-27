"use client";

import { useEffect, useRef } from "react";
import type { AboutStat } from "@/data/team";
import { cn } from "@/lib/utils";

/**
 * Mirrors the Elementor counter widget: counts 0 -> value over 2s once the stat
 * scrolls into view. The final value is rendered on the server, so it is correct
 * without JavaScript and for anyone who prefers reduced motion; the animation is
 * a DOM-level effect layered on top.
 */
export function StatCounter({ stat }: { stat: AboutStat }) {
  const numberRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const numberNode = numberRef.current;
    const containerNode = containerRef.current;
    if (!numberNode || !containerNode) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || typeof IntersectionObserver === "undefined") return;

    const format = (value: number) => value.toLocaleString("en-US");
    numberNode.textContent = format(0);

    let frame = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        observer.disconnect();

        const duration = 2000;
        const start = performance.now();

        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          // easeOutQuad, matching the widget's deceleration
          const eased = 1 - (1 - progress) * (1 - progress);
          numberNode.textContent = format(Math.round(eased * stat.value));
          if (progress < 1) frame = requestAnimationFrame(tick);
        };

        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );

    observer.observe(containerNode);

    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
      numberNode.textContent = format(stat.value);
    };
  }, [stat.value]);

  return (
    <div ref={containerRef} className="text-center">
      <p
        className={cn(
          "text-[36px] font-semibold leading-none md:text-[48px]",
          stat.accent ? "text-primary" : "text-white",
        )}
      >
        <span ref={numberRef}>{stat.value.toLocaleString("en-US")}</span>
        <span>{stat.suffix}</span>
      </p>
      <p className="mt-2 font-[family-name:var(--font-inter)] text-sm font-semibold text-white/80">
        {stat.label}
      </p>
    </div>
  );
}
