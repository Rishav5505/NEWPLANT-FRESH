// Curated plant profiles used by the Plant Finder quiz and the Care Library.
// light: 1 (low) – 3 (bright/sun) · water: 1 (rarely) – 3 (often) · care: 1 (easy) – 3 (expert)
export const PLANT_PROFILES = [
  {
    id: "snake-plant", name: "Snake Plant", latin: "Dracaena trifasciata", image: "/images/hd/snake-plant.jpg",
    light: 1, water: 1, care: 1, petSafe: false, size: "medium", airPurifier: true, search: "snake",
    summary: "Nearly indestructible. Tolerates low light, forgets-to-water owners and dry AC air.",
    tips: ["Water only when soil is fully dry — roughly every 2–3 weeks.", "Happy in a dim corner, grows faster in bright indirect light.", "Overwatering is the only real way to kill it."],
  },
  {
    id: "pothos", name: "Money Plant", latin: "Epipremnum aureum", image: "/images/hd/pothos.jpg",
    light: 1, water: 2, care: 1, petSafe: false, size: "trailing", airPurifier: true, search: "money",
    summary: "The classic Indian home vine. Trails beautifully from shelves and hanging planters.",
    tips: ["Water when the top 2 cm of soil feels dry.", "Pinch back long vines to make it bushier.", "Grows happily in a glass of water too."],
  },
  {
    id: "monstera", name: "Monstera", latin: "Monstera deliciosa", image: "/images/hd/monstera-hands.jpg",
    light: 2, water: 2, care: 2, petSafe: false, size: "large", airPurifier: true, search: "monstera",
    summary: "Dramatic split leaves that make any room feel like a tropical studio.",
    tips: ["Bright, indirect light gives bigger leaf splits.", "Give it a moss pole to climb.", "Wipe leaves monthly to keep them glossy."],
  },
  {
    id: "peace-lily", name: "Peace Lily", latin: "Spathiphyllum wallisii", image: "/images/hd/peace-lily.jpg",
    light: 1, water: 3, care: 2, petSafe: false, size: "medium", airPurifier: true, search: "lily",
    summary: "Elegant white blooms even in low light. Droops dramatically to tell you it's thirsty.",
    tips: ["Keep soil lightly moist, never soggy.", "Brown tips mean it wants filtered water or more humidity.", "Blooms more with bright, indirect light."],
  },
  {
    id: "aloe", name: "Aloe Vera", latin: "Aloe barbadensis", image: "/images/hd/aloe.jpg",
    light: 3, water: 1, care: 1, petSafe: false, size: "small", airPurifier: false, search: "aloe",
    summary: "A sunny-window succulent with soothing gel inside every leaf.",
    tips: ["Loves a sunny balcony or south-facing window.", "Water deeply, then let it dry out completely.", "Use a gritty, fast-draining soil mix."],
  },
  {
    id: "lucky-bamboo", name: "Lucky Bamboo", latin: "Dracaena sanderiana", image: "/images/hd/bamboo.jpg",
    light: 1, water: 2, care: 1, petSafe: false, size: "small", airPurifier: false, search: "bamboo",
    summary: "A Vastu favourite that grows in water — perfect for desks and gifting.",
    tips: ["Change the water every week.", "Keep away from harsh direct sun.", "Use filtered or RO water to avoid yellow tips."],
  },
  {
    id: "spider-plant", name: "Spider Plant", latin: "Chlorophytum comosum", image: "/images/hd/spider-plant.jpg",
    light: 2, water: 2, care: 1, petSafe: true, size: "small", airPurifier: true, search: "spider",
    summary: "Pet-friendly, fast-growing and generous — it makes baby plants you can share.",
    tips: ["Bright, indirect light keeps the stripes vivid.", "Water when the top inch is dry.", "Pot up the 'pups' to grow new plants."],
  },
  {
    id: "bonsai", name: "Ficus Bonsai", latin: "Ficus microcarpa", image: "/images/hd/bonsai.jpg",
    light: 2, water: 3, care: 3, petSafe: false, size: "small", airPurifier: false, search: "bonsai",
    summary: "A living sculpture for the patient gardener. Rewarding and meditative.",
    tips: ["Check soil daily — small pots dry fast.", "Prune new growth to keep its shape.", "Rotate weekly for even growth."],
  },
  {
    id: "cactus", name: "Golden Barrel Cactus", latin: "Echinocactus grusonii", image: "/images/hd/cactus.jpg",
    light: 3, water: 1, care: 1, petSafe: true, size: "small", airPurifier: false, search: "cactus",
    summary: "Sculptural, sun-loving and happy to be ignored for weeks.",
    tips: ["Needs 4+ hours of direct sun.", "Water roughly once a month in winter.", "Use terracotta pots for better drainage."],
  },
  {
    id: "haworthia", name: "Zebra Haworthia", latin: "Haworthiopsis attenuata", image: "/images/hd/haworthia.jpg",
    light: 2, water: 1, care: 1, petSafe: true, size: "small", airPurifier: false, search: "succulent",
    summary: "A tiny striped succulent that's safe around cats and dogs.",
    tips: ["Bright, indirect light — too much sun turns it red.", "Water every 2–3 weeks.", "Perfect on a work desk."],
  },
  {
    id: "rubber-plant", name: "Rubber Plant", latin: "Ficus elastica", image: "/images/hd/rubber-plant.jpg",
    light: 2, water: 2, care: 2, petSafe: false, size: "large", airPurifier: true, search: "rubber",
    summary: "Glossy, deep-green leaves that grow into a statement indoor tree.",
    tips: ["Bright, indirect light.", "Water when the top 3 cm are dry.", "Dust the big leaves so they can breathe."],
  },
  {
    id: "fiddle-leaf", name: "Fiddle Leaf Fig", latin: "Ficus lyrata", image: "/images/hd/fiddle-leaf.jpg",
    light: 3, water: 2, care: 3, petSafe: false, size: "large", airPurifier: false, search: "ficus",
    summary: "The designer's favourite. Dramatic and architectural, but likes a stable routine.",
    tips: ["Find a bright spot and don't move it.", "Water evenly when the top layer dries.", "Rotate a quarter turn each month."],
  },
];

export const QUIZ = [
  {
    key: "light",
    question: "How much light does your spot get?",
    options: [
      { value: 1, label: "Low light", hint: "A corner or north-facing room" },
      { value: 2, label: "Bright, indirect", hint: "Near a window, no direct rays" },
      { value: 3, label: "Direct sun", hint: "A sunny sill or balcony" },
    ],
  },
  {
    key: "water",
    question: "How often will you remember to water?",
    options: [
      { value: 1, label: "I travel a lot", hint: "Every couple of weeks, maybe" },
      { value: 2, label: "Once a week", hint: "A steady weekend routine" },
      { value: 3, label: "I love fussing", hint: "Every few days, happily" },
    ],
  },
  {
    key: "care",
    question: "Your plant parenting experience?",
    options: [
      { value: 1, label: "Beginner", hint: "Something forgiving, please" },
      { value: 2, label: "Some wins", hint: "I've kept a few alive" },
      { value: 3, label: "Green thumb", hint: "Bring on a challenge" },
    ],
  },
  {
    key: "pets",
    question: "Any curious pets or toddlers at home?",
    options: [
      { value: true, label: "Yes", hint: "Pet-friendly plants only" },
      { value: false, label: "No", hint: "Show me everything" },
    ],
  },
];

export function scoreProfiles(answers) {
  return PLANT_PROFILES.map((p) => {
    let score = 0;
    if (answers.light != null) score += 3 - Math.abs(p.light - answers.light) * 1.5;
    if (answers.water != null) score += 3 - Math.abs(p.water - answers.water) * 1.5;
    if (answers.care != null) score += p.care <= answers.care ? 2 : -2 * (p.care - answers.care);
    if (answers.pets === true && !p.petSafe) score -= 10;
    return { ...p, score };
  })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((p) => ({ ...p, match: Math.max(55, Math.min(99, Math.round(60 + p.score * 4))) }));
}
