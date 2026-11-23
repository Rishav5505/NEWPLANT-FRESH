import { cleanName } from "./format";

export const CATEGORIES = [
  {
    slug: "indoor",
    title: "Indoor Plants",
    latin: "Flora domestica",
    blurb: "Air-purifying foliage that thrives in Indian homes and offices.",
    image: "/images/hd/cat-indoor.jpg",
  },
  {
    slug: "flowering",
    title: "Flowering Plants",
    latin: "Flora florens",
    blurb: "Fragrant jasmine, hibiscus and orchids that bloom season after season.",
    image: "/images/hd/cat-flowering.jpg",
  },
  {
    slug: "outdoor",
    title: "Outdoor & Garden",
    latin: "Flora hortensis",
    blurb: "Sun-loving plants, seeds and boosters for balconies and gardens.",
    image: "/images/hd/cat-outdoor.jpg",
  },
  {
    slug: "planters",
    title: "Planters & Pots",
    latin: "Vasa terrae",
    blurb: "Ceramic, terracotta and self-watering homes for your green friends.",
    image: "/images/hd/cat-planters.jpg",
  },
  {
    slug: "care-kits",
    title: "Care Kits",
    latin: "Cura plantae",
    blurb: "Curated packs, soil mixes and tools to keep every leaf thriving.",
    image: "/images/hd/cat-carekits.jpg",
  },
];

export const categoryBySlug = (slug) => CATEGORIES.find((c) => c.slug === slug);

// Shown when a product's own photo is missing or the link is broken. A neutral placeholder
// (not another plant's photo) so shoppers are never shown a picture of a different product.
export const fallbackImage = () => "/images/placeholder.svg";

// Normalise a plant document from the API into the shape the UI uses.
export const toProduct = (p) => ({
  id: p._id || p.id,
  name: cleanName(p.name),
  rawName: p.name,
  category: p.category,
  price: Number(p.salePrice) || 0,
  oldPrice: Number(p.oldPrice) || null,
  // Stock is only meaningful once an admin manages it; CSV rows default to 0.
  stock: p.stockManaged ? Number(p.stock) || 0 : null,
  image: p.imageUrl || p.image || "",
  description: p.description || "",
  rating: p.rating || null,
  reviewCount: p.reviewCount || 0,
});

// Keyword-based care hints. Only shown when the name clearly matches.
const CARE_RULES = [
  { re: /artificial|faux/i, light: "Anywhere", water: "Never", level: "Effortless" },
  // Non-living products: no care hints
  { re: /planter|vase|\bstand\b|fertili[sz]er|\bseeds?\b|boost|\bsoil\b|manure|\btools?\b|spray/i, none: true },
  { re: /cactus|succulent|aloe|haworthia|echeveria|jade|adenium|sedum/i, light: "Bright sun", water: "Every 2–3 weeks", level: "Easy" },
  { re: /snake|sansevieria|zz|zamioculcas/i, light: "Low to bright", water: "Every 2–3 weeks", level: "Easy" },
  { re: /money|pothos|scindapsus|philodendron|syngonium/i, light: "Indirect light", water: "Weekly", level: "Easy" },
  { re: /monstera|fiddle|rubber|ficus|areca|palm/i, light: "Bright indirect", water: "Weekly", level: "Moderate" },
  { re: /fern|calathea|maranta|peace lily|spathiphyllum/i, light: "Shade to medium", water: "Keep moist", level: "Moderate" },
  { re: /jasmin|mogra|hibiscus|rose|bougainvillea|marigold|petunia|lily|orchid|flower/i, light: "Full sun", water: "Every 2–3 days", level: "Moderate" },
  { re: /bamboo|lucky/i, light: "Indirect light", water: "Change water weekly", level: "Easy" },
  { re: /bonsai/i, light: "Bright light", water: "Check daily", level: "Expert" },
];

export const careHints = (name = "") => {
  const rule = CARE_RULES.find((r) => r.re.test(name));
  return rule && !rule.none ? rule : null;
};
