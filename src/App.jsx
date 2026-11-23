import { lazy, Suspense, useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import CartDrawer from "./components/layout/CartDrawer";
import AuthModal from "./components/layout/AuthModal";
import SearchOverlay from "./components/layout/SearchOverlay";
import ErrorBoundary from "./components/ErrorBoundary";
import BackToTop from "./components/BackToTop";
import WelcomePopup from "./components/WelcomePopup";
import WhatsAppButton from "./components/WhatsAppButton";
import MobileTabBar from "./components/layout/MobileTabBar";
import { CompareTray } from "./context/CompareContext";
import Home from "./pages/Home";

const Shop = lazy(() => import("./pages/Shop"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const PlantFinder = lazy(() => import("./pages/PlantFinder"));
const CareLibrary = lazy(() => import("./pages/CareLibrary"));
const Garden = lazy(() => import("./pages/Garden"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Payment = lazy(() => import("./pages/Payment"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Legal = lazy(() => import("./pages/Legal"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Track = lazy(() => import("./pages/Track"));
const Studio = lazy(() => import("./pages/Studio"));
const Compare = lazy(() => import("./pages/Compare"));
const SharedWishlist = lazy(() => import("./pages/SharedWishlist"));
const Account = lazy(() => import("./pages/account/Account"));
const Orders = lazy(() => import("./pages/account/Orders"));
const Wishlist = lazy(() => import("./pages/account/Wishlist"));
const WalletPage = lazy(() => import("./pages/account/Wallet"));
const AdminRoute = lazy(() => import("./pages/admin/AdminRoute"));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function PageFallback() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="size-10 animate-spin rounded-full border-2 border-line border-t-moss" />
    </div>
  );
}

export default function App() {
  const [searchOpen, setSearchOpen] = useState(false);
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <ErrorBoundary>
      <ScrollToTop />
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-full focus:bg-forest focus:px-4 focus:py-2 focus:text-on-forest">
        Skip to content
      </a>
      <Header onSearch={() => setSearchOpen(true)} />
      <main id="main" className="min-h-[70vh]">
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/shop/:category" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/plant-finder" element={<PlantFinder />} />
            <Route path="/care" element={<CareLibrary />} />
            <Route path="/garden" element={<Garden />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment/:orderId" element={<Payment />} />
            <Route path="/order-success/:orderId" element={<OrderSuccess />} />
            <Route path="/track" element={<Track />} />
            <Route path="/studio" element={<Studio />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/wishlist/shared" element={<SharedWishlist />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Legal kind="terms" />} />
            <Route path="/privacy" element={<Legal kind="privacy" />} />
            <Route path="/account" element={<Account />} />
            <Route path="/account/orders" element={<Orders />} />
            <Route path="/account/wishlist" element={<Wishlist />} />
            <Route path="/account/wallet" element={<WalletPage />} />
            <Route path="/admin/*" element={<AdminRoute />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      {!isAdmin && <Footer />}
      {/* room for the mobile tab bar */}
      <div className="h-16 md:hidden" aria-hidden="true" />
      <MobileTabBar onSearch={() => setSearchOpen(true)} />
      <CompareTray />
      {!isAdmin && <BackToTop />}
      {!isAdmin && <WhatsAppButton />}
      <WelcomePopup />
      <CartDrawer />
      <AuthModal />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </ErrorBoundary>
  );
}
