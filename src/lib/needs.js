// "Shop by need" collections — keyword-based picks from the catalogue.
export const NEEDS = [
  {
    slug: "low-light",
    title: "Low-light heroes",
    blurb: "For north-facing rooms, offices and shady corners.",
    image: "/images/hd/snake-plant.jpg",
    test: (p) => /snake|sansevieria|zz|zamioculcas|pothos|money|philodendron|peace lily|spathiphyllum|aglaonema|dracaena|fern|syngonium/i.test(p.name),
  },
  {
    slug: "air-purifying",
    title: "Air purifiers",
    blurb: "Leafy classics known for freshening indoor air.",
    image: "/images/hd/peace-lily.jpg",
    test: (p) => /air purif|snake|sansevieria|areca|spider|peace lily|money|pothos|rubber|aloe|bamboo palm/i.test(p.name),
  },
  {
    slug: "beginner",
    title: "Hard to kill",
    blurb: "Forgiving plants for first-time plant parents.",
    image: "/images/hd/haworthia.jpg",
    test: (p) => /succulent|cactus|snake|sansevieria|zz|jade|money|pothos|aloe|haworthia|spider/i.test(p.name),
  },
  {
    slug: "gifting",
    title: "Gift-ready",
    blurb: "Bonsai, lucky bamboo, combos and blooms that delight.",
    image: "/images/hd/bonsai.jpg",
    test: (p) => /bonsai|lucky bamboo|jade|combo|pack|set of|gift|orchid|rose|anthurium|fragrant/i.test(p.name),
  },
  {
    slug: "flowering",
    title: "Blooms & fragrance",
    blurb: "Jasmine, hibiscus, roses and more colour.",
    image: "/images/hd/cat-flowering.jpg",
    test: (p) => /jasmin|mogra|hibiscus|rose|bougainvillea|marigold|petunia|lily|orchid|adenium|flower/i.test(p.name) && !/artificial|seed|booster/i.test(p.name),
  },
  {
    slug: "under-299",
    title: "Under ₹299",
    blurb: "Little joys that don't stretch the budget.",
    image: "/images/hd/cactus.jpg",
    test: (p) => p.price > 0 && p.price < 300,
  },
];

export const needBySlug = (slug) => NEEDS.find((n) => n.slug === slug);
