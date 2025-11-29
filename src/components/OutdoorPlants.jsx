import React from "react";
import { formatINRFromUSD } from "../utils/priceUtils";

const outdoorPlants = [
  { id: 1, name: "Neem Tree", price: 65.99, emoji: "🌳", desc: "Medicinal outdoor tree" },
  { id: 2, name: "Mango Plant", price: 72.99, emoji: "🥭", desc: "Fruit-bearing tree" },
  { id: 3, name: "Bamboo", price: 48.99, emoji: "🎋", desc: "Tall bamboo plant" },
  { id: 4, name: "Palm Tree", price: 85.99, emoji: "🌴", desc: "Tropical palm tree" },
  { id: 5, name: "Coconut Tree", price: 95.99, emoji: "🥥", desc: "Coconut bearing tree" },
  { id: 6, name: "Jasmine Vine", price: 38.99, emoji: "🌿", desc: "Climbing jasmine plant" },
  { id: 7, name: "Guava Plant", price: 58.99, emoji: "🍌", desc: "Guava fruit plant" },
  { id: 8, name: "Lemon Tree", price: 62.99, emoji: "🍋", desc: "Citrus lemon plant" },
  { id: 9, name: "Hibiscus Tree", price: 52.99, emoji: "🌺", desc: "Outdoor hibiscus" },
  { id: 10, name: "Eucalyptus", price: 44.99, emoji: "🌲", desc: "Tall eucalyptus tree" },
  { id: 11, name: "Ashoka Tree", price: 68.99, emoji: "🌳", desc: "Sacred ashoka tree" },
  { id: 12, name: "Bougainvillea Vine", price: 45.99, emoji: "🎨", desc: "Climbing bougainvillea" },
];

const OutdoorPlants = ({ addToCart }) => {
  return (
    <section className="min-h-screen px-0 py-16 bg-gradient-to-b from-transparent to-green-950/10">
      <div className="max-w-full mx-auto px-8">
        <div className="mb-12 text-center">
          <h2 className="text-5xl font-bold mb-4">🌴 Outdoor Plants Collection</h2>
          <p className="text-xl text-gray-300 mb-2">Hardy outdoor trees and plants for your garden</p>
          <p className="text-gray-400">Create a beautiful outdoor space</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {outdoorPlants.map((p) => (
            <div 
              key={p.id} 
              className="bg-gradient-to-br from-green-900/20 to-black/40 border border-green-700 p-6 rounded-2xl backdrop-blur-md hover:border-green-500 hover:shadow-lg hover:shadow-green-500/20 transition duration-300 cursor-pointer transform hover:-translate-y-1"
            >
              <div className="text-5xl mb-4 text-center">{p.emoji}</div>
              <h3 className="text-xl font-bold mb-2 h-12 flex items-center">{p.name}</h3>
              <p className="text-gray-300 mb-4 text-sm h-10">{p.desc}</p>
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-green-700/30">
                <p className="text-green-400 font-bold text-lg">{formatINRFromUSD(p.price)}</p>
                <button
                  onClick={() => addToCart({ id: p.id, name: p.name, price: p.price, emoji: p.emoji })}
                  className="px-3 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold transition"
                >
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OutdoorPlants;
