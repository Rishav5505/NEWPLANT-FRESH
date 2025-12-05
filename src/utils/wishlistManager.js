/**
 * Wishlist Manager
 * Handles wishlist persistence with localStorage
 */

const WISHLIST_KEY = "plants_wishlist";

export const getWishlist = () => {
  try {
    const data = localStorage.getItem(WISHLIST_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Error reading wishlist:", e);
    return [];
  }
};

export const addToWishlist = (product) => {
  try {
    const wishlist = getWishlist();
    const exists = wishlist.some((p) => p.id === product.id);
    if (!exists) {
      wishlist.push(product);
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
      return true;
    }
    return false;
  } catch (e) {
    console.error("Error adding to wishlist:", e);
    return false;
  }
};

export const removeFromWishlist = (productId) => {
  try {
    const wishlist = getWishlist().filter((p) => p.id !== productId);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    return true;
  } catch (e) {
    console.error("Error removing from wishlist:", e);
    return false;
  }
};

export const isInWishlist = (productId) => {
  const wishlist = getWishlist();
  return wishlist.some((p) => p.id === productId);
};

export const clearWishlist = () => {
  try {
    localStorage.removeItem(WISHLIST_KEY);
    return true;
  } catch (e) {
    console.error("Error clearing wishlist:", e);
    return false;
  }
};
