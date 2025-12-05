/**
 * Analytics Tracking
 * Track user interactions and page views
 */

export const trackPageView = (pageName) => {
  if (window.gtag) {
    window.gtag("event", "page_view", {
      page_path: pageName,
      page_title: document.title,
    });
  }
  console.log(`Page view: ${pageName}`);
};

export const trackEvent = (eventName, eventData = {}) => {
  if (window.gtag) {
    window.gtag("event", eventName, eventData);
  }
  console.log(`Event: ${eventName}`, eventData);
};

export const trackAddToCart = (product) => {
  trackEvent("add_to_cart", {
    item_id: product.id,
    item_name: product.name,
    value: product.price,
    currency: product.currency || "USD",
  });
};

export const trackPurchase = (orderId, total) => {
  trackEvent("purchase", {
    transaction_id: orderId,
    value: total,
    currency: "USD",
  });
};

export const trackProductView = (product) => {
  trackEvent("view_item", {
    item_id: product.id,
    item_name: product.name,
    value: product.price,
  });
};

export const trackSearch = (searchQuery) => {
  trackEvent("search", {
    search_term: searchQuery,
  });
};
