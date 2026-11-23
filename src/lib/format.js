// All prices in the catalogue and in orders are stored in Indian Rupees.
export const formatINR = (value) => {
  const n = Number(value) || 0;
  return "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
};

export const FREE_SHIPPING_THRESHOLD = 999;
export const SHIPPING_FEE = 79;
export const TAX_RATE = 0.05;

export const GIFT_WRAP_FEE = 49;

export const cartTotals = (items, discount = 0, giftWrap = false) => {
  const subtotal = items.reduce((s, it) => s + (Number(it.price) || 0) * it.quantity, 0);
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const discounted = Math.max(0, subtotal - discount);
  const tax = Math.round(discounted * TAX_RATE);
  const wrap = giftWrap && subtotal > 0 ? GIFT_WRAP_FEE : 0;
  return { subtotal, discount: Math.min(discount, subtotal), shipping, tax, giftWrap: wrap, total: discounted + tax + shipping + wrap };
};

export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";

// Product names in the scraped datasets look like "Buy X online from Nurserylive at lowest price."
export const cleanName = (name = "") =>
  name
    .replace(/^buy\s+/i, "")
    .replace(/\s+online from .*$/i, "")
    .replace(/\s*\|\s*/g, " · ")
    .trim();

// Descriptions may contain HTML. Convert to plain text paragraphs.
export const plainText = (html = "") => {
  if (!html) return "";
  try {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return (doc.body.textContent || "").replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  } catch {
    return html.replace(/<[^>]+>/g, " ");
  }
};

// Shopify CDN images accept a width parameter — request a crisp, right-sized version.
export const hdImage = (url, width = 900) => {
  // Never return "" — an empty src makes the browser re-request the page.
  if (!url) return "/images/placeholder.svg";
  if (/cdn\.shopify\.com|\/cdn\/shop\//.test(url)) {
    const u = url.replace(/([?&])width=\d+&?/, "$1").replace(/[?&]$/, "");
    return `${u}${u.includes("?") ? "&" : "?"}width=${width}`;
  }
  return url;
};

export const discountPct = (sale, old) => (old && old > sale ? Math.round(((old - sale) / old) * 100) : 0);
