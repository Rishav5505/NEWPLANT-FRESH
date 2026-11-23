// Recently viewed products, kept in this browser only.
const KEY = "jl_recent";
const MAX = 12;

export const getRecent = () => {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

export const pushRecent = (p) => {
  try {
    const entry = { id: p.id, name: p.name, price: p.price, oldPrice: p.oldPrice, image: p.image, category: p.category, stock: p.stock };
    const list = [entry, ...getRecent().filter((x) => x.id !== p.id)].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable */
  }
};
