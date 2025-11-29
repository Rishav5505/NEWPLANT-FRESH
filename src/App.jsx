import React, { useState } from "react";
import HeroSection from "./components/HeroSection";
import Navbar from "./components/Navbar";
import TopSelling from "./components/TopSelling";
import Reviews from "./components/Reviews";
import Features from "./components/Features";
import Gallery from "./components/Gallery";
import CTA from "./components/CTA";
import Footer from "./components/Footer";
import PaymentTest from "./components/PaymentTest";
import AdminDashboard from "./components/AdminDashboard";
import Contact from "./components/Contact";
import Menu from "./components/Menu";
import Notifications from "./components/Notifications";
import Cart from "./components/Cart";
import Shop from "./components/Shop";
import About from "./components/About";
import Checkout from "./components/Checkout";
import IndorePlants from "./components/IndorePlants";
import FloweringPlants from "./components/FloweringPlants";
import OutdoorPlants from "./components/OutdoorPlants";
import PlantersAndPots from "./components/PlantersAndPots";
import PlantCareKits from "./components/PlantCareKits";
import CareGuides from "./components/CareGuides";
import MyOrders from "./components/MyOrders";
import Wishlist from "./components/Wishlist";
import Wallet from "./components/Wallet";

const App = () => {
  const [currentPage, setCurrentPage] = useState("home");
  const [showCart, setShowCart] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [paymentOrderId, setPaymentOrderId] = useState(null);

  const addToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (existing) {
        return prev.map((p) => (p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p));
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setShowCart(true);
  };

  const updateQuantity = (id, quantity) => {
    setCartItems((prev) => prev.flatMap((p) => (p.id === id ? (quantity > 0 ? [{ ...p, quantity }] : []) : [p])));
  };

  const removeItem = (id) => {
    setCartItems((prev) => prev.filter((p) => p.id !== id));
  };

  const cartCount = cartItems.reduce((s, it) => s + it.quantity, 0);

  return (
    <div className="w-full bg-[#0a1a12] text-white overflow-x-hidden">
      {/* Gradient Background */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          background: "radial-gradient(circle at 20% 50%, rgba(34, 197, 94, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(34, 197, 94, 0.05) 0%, transparent 50%)",
        }}
      />

      {/* All Modals and Floating Buttons */}
      <Menu />
      <Notifications />

      {/* Main Content */}
      <Navbar setCurrentPage={setCurrentPage} setShowCart={setShowCart} cartCount={cartCount} />
      <Cart
        showCart={showCart}
        setShowCart={setShowCart}
        cartItems={cartItems}
        updateQuantity={updateQuantity}
        removeItem={removeItem}
        setCurrentPage={setCurrentPage}
        setPaymentOrderId={setPaymentOrderId}
      />

      {currentPage === 'payment' && (
        <>
          <PaymentTest orderId={paymentOrderId} setCurrentPage={setCurrentPage} onPaymentSuccess={() => {
            // clear paymentOrderId and empty cart after successful payment
            setPaymentOrderId(null);
            setCartItems([]);
          }} />
          <Footer />
        </>
      )}
      {currentPage === 'admin' && (
        <>
          <AdminDashboard setCurrentPage={setCurrentPage} />
          <Footer />
        </>
      )}
      
      {currentPage === "home" && (
        <>
          <HeroSection setCurrentPage={setCurrentPage} />
          <TopSelling addToCart={addToCart} />
          <Gallery setCurrentPage={setCurrentPage} />
          <Features />
          <Reviews />
          <CTA />
          <Footer />
        </>
      )}

      {currentPage === "shop" && (
        <>
          <Gallery setCurrentPage={setCurrentPage} />
          <Features />
          <Footer />
        </>
      )}

      {currentPage === "about" && (
        <>
          <About />
          <Footer />
        </>
      )}

      {currentPage === "contact" && (
        <>
          <Contact />
          <Footer />
        </>
      )}
      {currentPage === "checkout" && (
        <>
          <Checkout 
            cartItems={cartItems}
            setCurrentPage={setCurrentPage}
            setPaymentOrderId={setPaymentOrderId}
            removeItem={removeItem}
          />
          <Footer />
        </>
      )}

      {currentPage === "indoreplants" && (
        <>
          <IndorePlants addToCart={addToCart} />
          <Footer />
        </>
      )}

      {currentPage === "floweringplants" && (
        <>
          <FloweringPlants addToCart={addToCart} />
          <Footer />
        </>
      )}

      {currentPage === "outdoorplants" && (
        <>
          <OutdoorPlants addToCart={addToCart} />
          <Footer />
        </>
      )}

      {currentPage === "plantersandpots" && (
        <>
          <PlantersAndPots addToCart={addToCart} />
          <Footer />
        </>
      )}

      {currentPage === "plantcarekits" && (
        <>
          <PlantCareKits addToCart={addToCart} />
          <Footer />
        </>
      )}

      {currentPage === "careguides" && (
        <>
          <CareGuides />
          <Footer />
        </>
      )}

      {currentPage === "myorders" && (
        <>
          <MyOrders setCurrentPage={setCurrentPage} />
          <Footer />
        </>
      )}

      {currentPage === "wishlist" && (
        <>
          <Wishlist setCurrentPage={setCurrentPage} />
          <Footer />
        </>
      )}

      {currentPage === "wallet" && (
        <>
          <Wallet setCurrentPage={setCurrentPage} />
          <Footer />
        </>
      )}

      {currentPage !== "home" && currentPage !== "contact" && currentPage !== "shop" && currentPage !== "about" && currentPage !== "checkout" && currentPage !== "indoreplants" && currentPage !== "floweringplants" && currentPage !== "outdoorplants" && currentPage !== "plantersandpots" && currentPage !== "plantcarekits" && currentPage !== "careguides" && currentPage !== "myorders" && currentPage !== "wishlist" && currentPage !== "wallet" && (
        <>
          <HeroSection setCurrentPage={setCurrentPage} />
          <TopSelling addToCart={addToCart} />
          <Gallery setCurrentPage={setCurrentPage} />
          <Features />
          <Reviews />
          <CTA />
          <Footer />
        </>
      )}
    </div>
  );
};

export default App;
