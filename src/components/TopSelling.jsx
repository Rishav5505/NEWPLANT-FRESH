import React, { useState } from "react";
import { formatINRFromUSD } from "../utils/priceUtils";
import Product from "./Product";
import R1 from "../assets/r1.jpg";
import R2 from "../assets/r2.jpg";
import R3 from "../assets/r3.jpg";
import R4 from "../assets/r4.jpg";
import R5 from "../assets/r5.jpg";
import R6 from "../assets/r6.jpg";

const plants = [
  { 
    id: 1,
    name: "Calathea Plant", 
    price: 35.99, 
    rating: 4.8,
    reviews: 156,
    
    image: R1,
    description: "Beautiful tropical plant with stunning patterned leaves",
    features: ["Low maintenance", "Air purifying", "Pet-friendly"]
  },
  { 
    id: 2,
    name: "Monstera Deliciosa", 
    price: 45.99, 
    rating: 4.9,
    reviews: 234,
    
    image: R2,
    description: "Popular Swiss cheese plant perfect for any room",
    features: ["Fast growing", "Statement plant", "Easy care"]
  },
  { 
    id: 3,
    name: "Snake Plant", 
    price: 29.99, 
    rating: 4.7,
    reviews: 189,
   
    image: R3,
    description: "Hardy succulent that thrives in any light condition",
    features: ["Very hardy", "Low water", "Oxygen producer"]
  },
  { 
    id: 4,
    name: "Fiddle Leaf Fig", 
    price: 55.99, 
    rating: 4.6,
    reviews: 142,
   
    image: R4,
    description: "Stunning floor plant that makes a bold statement",
    features: ["Elegant", "Statement piece", "Indoor tree"]
  },
  { 
    id: 5,
    name: "Pothos Plant", 
    price: 25.99, 
    rating: 4.9,
    reviews: 312,
    
    image: R5,
    description: "Climbing vine perfect for shelves and hanging baskets",
    features: ["Trainable", "Fast grower", "Air clean"]
  },
  { 
    id: 6,
    name: "Bird of Paradise", 
    price: 65.99, 
    rating: 4.8,
    reviews: 98,
   
    image: R6,
    description: "Exotic flowering plant with vibrant orange blooms",
    features: ["Exotic", "Blooming", "Tropical vibe"]
  },
];

const TopSelling = ({ addToCart }) => {
  const [hoveredId, setHoveredId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  return (
    <section className="px-0 py-16 bg-gradient-to-b from-transparent to-green-950/10">
      
      <div className="max-w-full mx-auto px-8">
        <h2 className="text-center text-4xl md:text-5xl font-bold mb-4">
          <span className="text-green-400">🏆 Our</span> Top Selling Plants
        </h2>
        <p className="text-center text-gray-300 mb-12 text-lg">Choose from our premium collection of healthy, handpicked plants</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {plants.map((p) => (
            <div 
              key={p.id} 
              onClick={() => setSelectedProduct?.(p)}
              className="group relative bg-gradient-to-br from-green-900/20 to-black/40 border border-green-700 p-6 rounded-2xl backdrop-blur-md hover:border-green-500 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl cursor-pointer"
              onMouseEnter={() => setHoveredId(p.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Discount Badge */}
              <div className="absolute top-4 right-4 bg-red-500/80 text-white px-3 py-2 rounded-full text-sm font-bold z-10">
                -15%
              </div>

              {/* Plant Image */}
              <div className="w-full h-56 bg-gradient-to-b from-green-600/10 to-emerald-700/20 rounded-xl mb-4 border border-green-600/30 group-hover:border-green-500/60 transition relative overflow-hidden flex items-center justify-center">
                <img 
                  src={p.image} 
                  alt={p.name}
                  className="w-full h-full object-cover rounded-xl group-hover:scale-110 transition transform"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-green-600/20 to-emerald-700/30" style={{pointerEvents: 'none'}}>
                  <span className="text-5xl drop-shadow-lg">{p.emoji}</span>
                </div>
              </div>

              {/* Plant Info */}
              <h3 className="text-xl font-bold mb-2 text-white line-clamp-2">{p.name}</h3>
              <p className="text-gray-300 text-sm mb-3 line-clamp-2">{p.description}</p>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-yellow-400 text-base">⭐ {p.rating}</span>
                <span className="text-gray-400 text-sm">({p.reviews})</span>
              </div>

              {/* Features */}
              <div className="mb-4 flex flex-wrap gap-2">
                {p.features.slice(0, 2).map((feature, idx) => (
                  <span key={idx} className="text-sm bg-green-700/30 text-green-300 px-3 py-1 rounded-full border border-green-600/50">
                    {feature}
                  </span>
                ))}
              </div>

              {/* Price and Button */}
              <div className="flex justify-between items-center pt-3 border-t border-green-700/50">
                <div>
                  <p className="text-gray-400 line-through text-sm">{formatINRFromUSD(p.price * 1.15)}</p>
                  <p className="text-2xl font-bold text-green-400">{formatINRFromUSD(p.price)}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); addToCart?.({ id: p.id, name: p.name, price: p.price, emoji: p.emoji }); }}
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold transition transform hover:scale-110 text-base"
                >
                  🛒 Add
                </button>
              </div>

              {/* Hover Effect */}
              {hoveredId === p.id && (
                <div className="absolute inset-0 bg-green-500/5 rounded-2xl pointer-events-none"></div>
              )}
            </div>
          ))}
        </div>

        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-6">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedProduct(null)} />
            <div className="relative w-full max-w-4xl mx-auto overflow-auto" style={{ maxHeight: '90vh' }}>
              <div className="rounded-lg overflow-hidden">
                <Product product={selectedProduct} addToCart={addToCart} onClose={() => setSelectedProduct(null)} />
              </div>
            </div>
          </div>
        )}
      </div>

    </section>
  );
};

export default TopSelling;

