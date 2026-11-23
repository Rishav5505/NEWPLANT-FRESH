import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { CatalogProvider } from "./context/CatalogContext";
import { CompareProvider } from "./context/CompareContext";
import { markBroken } from "./lib/brokenImages";

// Some catalogue images are dead links upstream. Any <img data-fallback="..."> that
// fails to load swaps to our own HD category photo instead of showing alt text.
window.addEventListener(
  "error",
  (e) => {
    const img = e.target;
    if (img?.tagName !== "IMG" || !img.dataset.fallback || img.dataset.failed) return;
    img.dataset.failed = "1";
    markBroken(img.getAttribute("src"));
    img.removeAttribute("srcset");
    img.src = img.dataset.fallback;
  },
  true
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <CatalogProvider>
              <CartProvider>
                <WishlistProvider>
                  <CompareProvider>
                    <App />
                  </CompareProvider>
                </WishlistProvider>
              </CartProvider>
            </CatalogProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
