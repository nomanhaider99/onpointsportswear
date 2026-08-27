"use client";

import Image from "next/image";
import { useState } from "react";
import {
  galleryItems,
  galleryRowOne,
  galleryRowThree,
  galleryRowTwo,
  type GalleryItem,
} from "@/data/gallery";
import { GalleryLightbox } from "./GalleryLightbox";

/**
 * Source tiles: image at 0.6 opacity inside a 1px #1F2937 / 8px-radius frame,
 * with the green category label pinned at 80% height and the title at 85%.
 */
function GalleryTile({
  item,
  onOpen,
  className,
  heightClass,
  sizes,
}: {
  item: GalleryItem;
  onOpen: () => void;
  className?: string;
  heightClass: string;
  sizes: string;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`View ${item.title} - ${item.category}`}
      className={`group relative block w-full overflow-hidden rounded-lg border border-border text-left ${className ?? ""}`}
    >
      <Image
        src={item.image}
        alt={item.title}
        width={item.width}
        height={item.height}
        sizes={sizes}
        className={`w-full object-cover opacity-60 transition-all duration-300 group-hover:scale-105 group-hover:opacity-90 ${heightClass}`}
      />
      <span className="pointer-events-none absolute inset-x-[25px] top-[70%] lg:top-[80%]">
        <span className="block text-sm font-black uppercase text-primary">{item.category}</span>
        <span className="mt-1 block text-xl font-semibold text-white">{item.title}</span>
      </span>
    </button>
  );
}

export function GalleryGrid() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  function openItem(item: GalleryItem) {
    setActiveIndex(galleryItems.findIndex((entry) => entry.id === item.id));
  }

  return (
    <>
      <div className="container-site mt-[25px] space-y-5">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-[608fr_300fr_300fr]">
          <GalleryTile
            item={galleryRowOne[0]}
            onOpen={() => openItem(galleryRowOne[0])}
            heightClass="h-[300px] md:h-[400px] lg:h-[450px]"
            sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 48vw"
            className="md:col-span-2 lg:col-span-1"
          />
          {galleryRowOne.slice(1).map((item) => (
            <GalleryTile
              key={item.id}
              item={item}
              onOpen={() => openItem(item)}
              heightClass="h-[300px] md:h-[400px] lg:h-[450px]"
              sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 23vw"
            />
          ))}
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {galleryRowTwo.map((item) => (
            <GalleryTile
              key={item.id}
              item={item}
              onOpen={() => openItem(item)}
              heightClass="h-[280px] md:h-[340px] lg:h-[390px]"
              sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 32vw"
            />
          ))}
        </div>

        <div className="grid gap-5">
          {galleryRowThree.map((item) => (
            <GalleryTile
              key={item.id}
              item={item}
              onOpen={() => openItem(item)}
              heightClass="h-[220px] md:h-[400px] lg:h-[570px]"
              sizes="100vw"
            />
          ))}
        </div>
      </div>

      <GalleryLightbox
        items={galleryItems}
        activeIndex={activeIndex}
        onClose={() => setActiveIndex(null)}
        onNavigate={setActiveIndex}
      />
    </>
  );
}
