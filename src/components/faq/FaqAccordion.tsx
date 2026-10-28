"use client";

import { useState } from "react";
import type { FaqItem } from "@/data/faq";
import { FaqText } from "./FaqText";

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <div className="mx-auto mt-[50px] flex max-w-3xl flex-col gap-3">
      {items.map((item, index) => {
        const open = openId === item.id;
        return (
          <div
            key={item.id}
            className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.03]"
          >
            <button
              type="button"
              aria-expanded={open}
              className="flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-white/[0.04] sm:px-5"
              onClick={() => setOpenId(open ? null : item.id)}
            >
              <span className="mt-0.5 shrink-0 text-sm font-bold text-primary">{index + 1}.</span>
              <span className="flex-1 text-base font-semibold text-white sm:text-lg">
                {item.question}
              </span>
              <span
                aria-hidden
                className={`mt-1 shrink-0 text-lg leading-none text-white/60 transition-transform ${
                  open ? "rotate-45" : ""
                }`}
              >
                +
              </span>
            </button>
            {open ? (
              <div className="space-y-3 border-t border-white/10 px-4 pb-5 pt-3 sm:px-5 sm:pl-12">
                {item.answer.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-relaxed text-white/75 sm:text-base">
                    <FaqText text={paragraph} />
                  </p>
                ))}
                {item.bullets?.length ? (
                  <ul className="list-disc space-y-1.5 pl-5 text-sm text-white/75 sm:text-base">
                    {item.bullets.map((bullet) => (
                      <li key={bullet}>
                        <FaqText text={bullet} />
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
