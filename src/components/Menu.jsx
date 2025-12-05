import React, { useState } from "react";

const Menu = () => {
  const [showMenu, setShowMenu] = useState(false);

  const menuItems = [
    { icon: "🏠", label: "Home", action: "#home" },
    { icon: "🌿", label: "Shop All Plants", action: "#shop" },
    { icon: "🏆", label: "Best Sellers", action: "#bestsellers" },
    { icon: "🆕", label: "New Arrivals", action: "#new" },
    { icon: "📚", label: "Plant Care Tips", action: "#care" },
    { icon: "❓", label: "FAQ", action: "#faq" },
    { icon: "📞", label: "Contact Us", action: "#contact" },
    { icon: "ℹ️", label: "About Us", action: "#about" },
    { icon: "🚚", label: "Shipping Info", action: "#shipping" },
    { icon: "↩️", label: "Returns", action: "#returns" },
  ];

  return (
    <>
      {showMenu && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start">
          <div className="w-full md:w-80 bg-[#071018] border-r-2 border-green-600 rounded-r-3xl p-6 max-h-screen overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-green-400">📋 Menu</h2>
              <button onClick={() => setShowMenu(false)} className="text-3xl text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-2">
              {menuItems.map((item, idx) => (
                <a
                  key={idx}
                  href={item.action}
                  onClick={() => setShowMenu(false)}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-green-900/30 border border-green-700/50 rounded-lg transition"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="font-semibold">{item.label}</span>
                </a>
              ))}
            </div>

            {/* Footer in Menu */}
            <div className="mt-8 pt-6 border-t border-green-700">
              <p className="text-sm text-gray-400 text-center">
                Follow us on social media for plant tips & updates! 📱
              </p>
              <div className="flex justify-center gap-4 mt-4 text-2xl">
                <button className="hover:scale-125 transition">📘</button>
                <button className="hover:scale-125 transition">📷</button>
                <button className="hover:scale-125 transition">🐦</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Menu Button */}
      <button
        onClick={() => setShowMenu(true)}
        className="fixed top-8 left-8 px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg transition transform hover:scale-110 shadow-lg z-40 md:hidden"
      >
        ☰ Menu
      </button>
    </>
  );
};

export default Menu;
