"use client";

import Link from "next/link";
import { useState } from "react";
import { AccountPageShell } from "@/components/account/AccountChrome";
import { faqClosing, faqs } from "@/data/faq";
import { FaqText } from "@/components/faq/FaqText";

export default function HelpPage() {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);

  return (
    <AccountPageShell title="Help & Support">
      <div className="space-y-4">
        <p className="text-sm text-white/70">
          Answers to common questions about custom jerseys, team orders, and shipping.
        </p>

        <div className="space-y-2">
          {faqs.map((item, index) => {
            const open = openId === item.id;
            return (
              <div
                key={item.id}
                className="overflow-hidden rounded-xl border border-white/10 bg-[#151822]"
              >
                <button
                  type="button"
                  aria-expanded={open}
                  className="flex w-full items-start gap-2 px-3.5 py-3.5 text-left"
                  onClick={() => setOpenId(open ? null : item.id)}
                >
                  <span className="mt-0.5 text-xs font-bold text-primary">{index + 1}.</span>
                  <span className="flex-1 text-sm font-semibold text-white">{item.question}</span>
                  <span className="text-white/50">{open ? "−" : "+"}</span>
                </button>
                {open ? (
                  <div className="space-y-2 border-t border-white/10 px-3.5 pb-3.5 pt-2 pl-8">
                    {item.answer.map((paragraph) => (
                      <p key={paragraph} className="text-sm leading-relaxed text-white/70">
                        <FaqText text={paragraph} />
                      </p>
                    ))}
                    {item.bullets?.length ? (
                      <ul className="list-disc space-y-1 pl-4 text-sm text-white/70">
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

        <div className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-4">
          <p className="text-sm font-semibold text-white">{faqClosing.title}</p>
          <p className="mt-1 text-sm text-white/70">{faqClosing.body}</p>
        </div>

        <Link
          href="/contact"
          className="block rounded-xl border border-primary/40 bg-primary/10 px-4 py-3.5 text-center text-sm font-semibold text-primary"
        >
          Contact support
        </Link>
        <Link
          href="/faq"
          className="block rounded-xl border border-white/10 bg-[#151822] px-4 py-3.5 text-center text-sm font-semibold text-white"
        >
          View full FAQ page
        </Link>
        <Link
          href="/account/orders"
          className="block rounded-xl border border-white/10 bg-[#151822] px-4 py-3.5 text-center text-sm font-semibold text-white"
        >
          View order history
        </Link>
      </div>
    </AccountPageShell>
  );
}
