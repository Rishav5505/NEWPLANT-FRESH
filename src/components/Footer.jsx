import React from "react";

const Footer = ({ setCurrentPage }) => {
  const go = (page, e) => { e?.preventDefault(); if (setCurrentPage) setCurrentPage(page); else window.location.hash = page; };
  return (
    <footer className="bg-[#0a1a12] border-t border-green-700">
      <div className="max-w-full mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold text-green-400 mb-4 flex items-center gap-2">
              🌿 Plants
            </h3>
            <p className="text-gray-400 text-sm">
              Your trusted source for premium indoor and outdoor plants. Bringing nature to your home!
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-green-400 transition">Shop All Plants</a></li>
              <li><a href="#" className="hover:text-green-400 transition">New Arrivals</a></li>
              <li><a href="#" className="hover:text-green-400 transition">Best Sellers</a></li>
              <li><a href="#" className="hover:text-green-400 transition">Plant Care Tips</a></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-bold text-lg mb-4">Customer Service</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-green-400 transition">Contact Us</a></li>
              <li><a href="#" className="hover:text-green-400 transition">Shipping Info</a></li>
              <li><a href="#" className="hover:text-green-400 transition">Returns & Refunds</a></li>
              <li><a href="#" className="hover:text-green-400 transition">FAQ</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-bold text-lg mb-4">Newsletter</h4>
            <p className="text-gray-400 text-sm mb-4">Subscribe for plant care tips and exclusive offers</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Your email"
                className="flex-1 px-3 py-2 bg-[#0b2a1a] border border-green-700 rounded-lg text-sm outline-none focus:border-green-400"
              />
              <button className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold transition text-sm">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-green-700 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
          <p>&copy; 2025 Plants Store. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" onClick={(e) => go('privacy', e)} className="hover:text-green-400 transition">Privacy Policy</a>
            <a href="#" onClick={(e) => go('terms', e)} className="hover:text-green-400 transition">Terms of Service</a>
            <a href="#" onClick={(e) => go('contact', e)} className="hover:text-green-400 transition">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
