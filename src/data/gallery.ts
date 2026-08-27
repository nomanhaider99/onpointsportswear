export interface GalleryItem {
  id: string;
  /** Small uppercase label rendered above the title. */
  category: string;
  title: string;
  image: string;
  width: number;
  height: number;
}

/**
 * Three rows, matching the source layout:
 *  row 1 - one wide tile + two portrait tiles
 *  row 2 - three equal tiles
 *  row 3 - one full-width banner tile
 */
export const galleryRowOne: GalleryItem[] = [
  {
    id: "championship-series",
    category: "Action Shots",
    title: "Championship Series",
    image: "/images/gallery/gallery-5.png",
    width: 608,
    height: 400,
  },
  {
    id: "pro-stitch-detail",
    category: "Close-ups",
    title: "Pro-Stitch Detail",
    image: "/images/gallery/gallery-6.png",
    width: 300,
    height: 400,
  },
  {
    id: "west-high-basketball",
    category: "Teams",
    title: "West High Basketball",
    image: "/images/gallery/gallery-7.png",
    width: 300,
    height: 400,
  },
];

export const galleryRowTwo: GalleryItem[] = [
  {
    id: "sublimation-texture",
    category: "Close-ups",
    title: "Sublimation Texture",
    image: "/images/gallery/gallery-8.png",
    width: 400,
    height: 350,
  },
  {
    id: "premier-cup",
    category: "Action Shots",
    title: "Premier Cup",
    image: "/images/gallery/gallery-9.png",
    width: 400,
    height: 350,
  },
  {
    id: "apex-club-elite",
    category: "Teams",
    title: "Apex Club Elite",
    image: "/images/gallery/gallery-10.png",
    width: 400,
    height: 350,
  },
];

export const galleryRowThree: GalleryItem[] = [
  {
    id: "velocity-track",
    category: "Action Shots",
    title: "Velocity Track",
    image: "/images/gallery/gallery-11.png",
    width: 1240,
    height: 500,
  },
];

export const galleryItems: GalleryItem[] = [
  ...galleryRowOne,
  ...galleryRowTwo,
  ...galleryRowThree,
];
