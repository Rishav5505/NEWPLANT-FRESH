import React from "react";
import { formatINRFromUSD } from "../utils/priceUtils";

const plantCareKits = [
  { id: 1, name: "Basic Care Kit", price: 32.99, emoji: "🧴", desc: "Essential plant care tools" },
  { id: 2, name: "Fertilizer Pack", price: 18.99, emoji: "🌱", desc: "Organic plant fertilizer" },
  { id: 3, name: "Pruning Kit", price: 28.99, emoji: "✂️", desc: "Professional pruning tools" },
  { id: 4, name: "Soil Mix Bundle", price: 22.99, emoji: "🌍", desc: "Premium potting soil mix" },
  { id: 5, name: "Pest Control Spray", price: 24.99, emoji: "🧪", desc: "Natural pest control" },
  { id: 6, name: "Watering Can Set", price: 35.99, emoji: "💦", desc: "Premium watering cans" },
  { id: 7, name: "Misting Bottle", price: 15.99, emoji: "💨", desc: "Plant misting bottle" },
  { id: 8, name: "Plant Support Stakes", price: 19.99, emoji: "🎯", desc: "Support sticks & ties" },
  { id: 9, name: "Gloves & Apron", price: 16.99, emoji: "🧤", desc: "Gardening gloves" },
  { id: 10, name: "pH Tester", price: 26.99, emoji: "⚗️", desc: "Soil pH testing kit" },
  { id: 11, name: "Compost Maker", price: 38.99, emoji: "♻️", desc: "Home composting kit" },
  { id: 12, name: "Complete Care Set", price: 52.99, emoji: "📦", desc: "All-in-one care package" },
];

const PlantCareKits = ({ addToCart }) => {
  return (
    <section className="min-h-screen px-0 py-16 bg-gradient-to-b from-transparent to-green-950/10">
      <div className="max-w-full mx-auto px-8">
        <div className="mb-12 text-center">
          <h2 className="text-5xl font-bold mb-4">🧴 Plant Care Kits Collection</h2>
          <p className="text-xl text-gray-300 mb-2">Everything you need to care for your plants</p>
          <p className="text-gray-400">Professional tools for plant enthusiasts</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {plantCareKits.map((p) => (
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

export default PlantCareKits;
