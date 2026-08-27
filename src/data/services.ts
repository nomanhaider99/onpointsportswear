export interface Service {
  id: string;
  title: string;
  description: string;
}

export const services: Service[] = [
  {
    id: "custom-jerseys",
    title: "Custom Jerseys",
    description: "Full sublimation jerseys with custom logos, numbers, and names for any league.",
  },
  {
    id: "sublimation-printing",
    title: "Sublimation Printing",
    description: "Vibrant, all-over dye sublimation for jerseys, hoodies, and custom apparel.",
  },
  {
    id: "embroidery",
    title: "Embroidery",
    description: "High-density embroidery for logos, crests, and text on hats, jackets, and bags.",
  },
  {
    id: "sports-pants-shorts",
    title: "Sports Pants & Shorts",
    description: "Custom athletic bottoms with elastic waistbands and side stripes.",
  },
  {
    id: "school-spirit-wear",
    title: "School Spirit Wear",
    description: "T-shirts, hoodies, and hats for students, staff, and alumni.",
  },
  {
    id: "tournament-packages",
    title: "Tournament Packages",
    description: "Bundled pricing for large events with fast turnaround and no minimums.",
  },
];

/**
 * The source grid is two rows of four cells. An image occupies the last cell of
 * row one and the second cell of row two, so the six service cards sit around them.
 */
export const serviceImages = {
  rowOne: {
    src: "/images/service-1.png",
    alt: "Custom sublimated team jerseys",
    width: 300,
    height: 203,
  },
  rowTwo: {
    src: "/images/service-2.png",
    alt: "Embroidered team apparel",
    width: 300,
    height: 203,
  },
};
