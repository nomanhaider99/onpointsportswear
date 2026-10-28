export type FaqItem = {
  id: string;
  question: string;
  /** Paragraphs; wrap text in **double asterisks** to bold it. Use bullets for lists. */
  answer: string[];
  bullets?: string[];
};

export const faqIntro =
  "Have questions about custom jerseys, team orders, or shipping? We've got you covered! Find answers to our most commonly asked questions below.";

export const faqClosing = {
  title: "Still Have Questions?",
  body: "Our team is here to help with custom designs, sizing, pricing, and anything else you need. Contact On Point Sportswear today and let's bring your vision to life!",
};

export const faqs: FaqItem[] = [
  {
    id: "turnaround",
    question: "What is your turnaround time?",
    answer: ["Our estimated production turnaround times are:"],
    bullets: ["**Hockey: 4–5 weeks**", "**All Other Sports: 3–4 weeks**"],
  },
  {
    id: "ordering-process",
    question: "What is the ordering process?",
    answer: [
      "**Step 1 – Create Your Design:** Use our online jersey customizer, send us your own design, or contact our team to help create your dream jersey.",
      "**Step 2 – Submit Your Order:** Finalize all your order details on our website and submit your order.",
      "**Step 3 – Review Your Digital Proof:** We'll send you a digital proof of your custom jersey for review and approval.",
      "**Step 4 – Approve & Start Production:** Once you approve your digital proof, we'll begin production of your custom order.",
    ],
  },
  {
    id: "minimum-order",
    question: "What is your minimum order quantity?",
    answer: [
      "**Our minimum order quantity is 6 pieces. For reorders, there is no minimum quantity required.**",
    ],
  },
  {
    id: "shipping",
    question: "How much is shipping, and where do you ship?",
    answer: [
      "We proudly ship across Canada and the USA!",
      "**Enjoy FREE SHIPPING on team orders of 12 or more jerseys!**",
      "For orders of fewer than 12 jerseys, including smaller reorders, shipping fees will apply. Shipping costs will be confirmed before your order is finalized.",
    ],
  },
  {
    id: "sizes",
    question: "Do you offer youth and adult sizes?",
    answer: [
      "Yes! We offer youth, adult, and women's sizes to accommodate your entire team.",
    ],
  },
  {
    id: "customizer-help",
    question: "What if I can't create the jersey I want using your customizer?",
    answer: [
      "No problem! Our team can help design your dream jersey at no additional charge. If you already have a design, simply send it to us, and we can recreate it for you.",
    ],
  },
  {
    id: "print-or-stitch",
    question: "Are your jerseys printed or stitched?",
    answer: [
      "We offer both options! Most jersey prices listed on our website are for fully sublimated jerseys. If you're interested in embroidered or stitched jerseys, please contact us for a custom quote.",
    ],
  },
  {
    id: "whats-included",
    question: "Are logos, names, and numbers included in the price?",
    answer: [
      "Absolutely! The price you see includes customization such as team logos, player names, numbers, sponsor logos, and more. No extra charges for these details.",
    ],
  },
  {
    id: "no-logo",
    question: "What if I don't have a logo?",
    answer: [
      "We've got you covered! If you need a custom logo, our team would be happy to help create something amazing for you. Contact us with your ideas and details to get started.",
    ],
  },
  {
    id: "returns",
    question: "What is your return policy?",
    answer: [
      "Because every order is custom-made, all sales are final. Custom orders are not eligible for returns.",
    ],
  },
];
