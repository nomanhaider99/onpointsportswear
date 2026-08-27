"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { GalleryItem } from "@/data/gallery";

export function GalleryLightbox({
  items,
  activeIndex,
  onClose,
  onNavigate,
}: {
  items: GalleryItem[];
  activeIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = activeIndex !== null && activeIndex >= 0;

  const goPrevious = useCallback(() => {
    if (activeIndex === null) return;
    onNavigate((activeIndex - 1 + items.length) % items.length);
  }, [activeIndex, items.length, onNavigate]);

  const goNext = useCallback(() => {
    if (activeIndex === null) return;
    onNavigate((activeIndex + 1) % items.length);
  }, [activeIndex, items.length, onNavigate]);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") goPrevious();
      if (event.key === "ArrowRight") goNext();
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose, goPrevious, goNext]);

  if (!open || activeIndex === null) return null;
  const item = items[activeIndex];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${item.title} - ${item.category}`}
      className="fixed inset-0 z-70 flex items-center justify-center bg-black/90 p-4"
    >
      <button
        type="button"
        aria-label="Close gallery"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        tabIndex={-1}
      />

      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Close gallery"
        className="absolute right-4 top-4 z-10 rounded p-2 text-white transition-colors hover:text-primary"
      >
        <X size={28} aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={goPrevious}
        aria-label="Previous image"
        className="absolute left-2 z-10 rounded-full bg-black/50 p-2 text-white transition-colors hover:text-primary md:left-6"
      >
        <ChevronLeft size={32} aria-hidden="true" />
      </button>

      <figure className="relative z-0 flex max-h-full w-full max-w-5xl flex-col items-center">
        <Image
          src={item.image}
          alt={item.title}
          width={item.width}
          height={item.height}
          sizes="(max-width: 1023px) 92vw, 1024px"
          className="max-h-[75vh] w-auto max-w-full rounded-lg object-contain"
        />
        <figcaption className="mt-4 text-center">
          <span className="block text-sm font-black uppercase text-primary">{item.category}</span>
          <span className="mt-1 block text-xl font-semibold text-white">{item.title}</span>
        </figcaption>
      </figure>

      <button
        type="button"
        onClick={goNext}
        aria-label="Next image"
        className="absolute right-2 z-10 rounded-full bg-black/50 p-2 text-white transition-colors hover:text-primary md:right-6"
      >
        <ChevronRight size={32} aria-hidden="true" />
      </button>
    </div>
  );
}
