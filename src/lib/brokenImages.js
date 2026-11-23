// Remembers product photo URLs that failed to load (dead links in the source catalogue),
// so "Featured" sorting can push those products below ones with real photos.
const KEY = "jl_broken_imgs";
const base = (url = "") => String(url).replace(/([?&])width=\d+&?/, "$1").replace(/[?&]$/, "");

let broken;
const load = () => {
  if (broken) return broken;
  try {
    broken = new Set(JSON.parse(localStorage.getItem(KEY) || "[]"));
  } catch {
    broken = new Set();
  }
  return broken;
};

export const markBroken = (url) => {
  const set = load();
  const b = base(url);
  if (!b || set.has(b)) return;
  set.add(b);
  try {
    localStorage.setItem(KEY, JSON.stringify([...set].slice(-500)));
  } catch {
    /* storage unavailable */
  }
};

export const isBroken = (url) => !url || load().has(base(url));
