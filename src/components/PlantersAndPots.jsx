import React from "react";
import { formatINRFromUSD } from "../utils/priceUtils";

const plantersAndPots = [
  { id: 1, name: "Ceramic Pot", price: 25.99, emoji: "🪴", desc: "Beautiful ceramic planter" },
  { id: 2, name: "Terracotta Pot", price: 18.99, emoji: "🍶", desc: "Classic terracotta pot" },
  { id: 3, name: "Wooden Planter", price: 35.99, emoji: "🪵", desc: "Rustic wooden planter" },
  { id: 4, name: "Glass Vase", price: 28.99, emoji: "🍯", desc: "Elegant glass vase" },
  { id: 5, name: "Concrete Pot", price: 32.99, emoji: "⚙️", desc: "Modern concrete planter" },
  { id: 6, name: "Hanging Basket", price: 22.99, emoji: "🧺", desc: "Hanging plant basket" },
  { id: 7, name: "Metal Planter", price: 38.99, emoji: "🪣", desc: "Contemporary metal pot" },
  { id: 8, name: "Self-watering Pot", price: 42.99, emoji: "💧", desc: "Auto-watering planter" },
  { id: 9, name: "Decorative Urn", price: 45.99, emoji: "⚱️", desc: "Decorative urn planter" },
  { id: 10, name: "Succulent Pot", price: 15.99, emoji: "🍲", desc: "Small succulent pot" },
  { id: 11, name: "Macrame Holder", price: 24.99, emoji: "🎀", desc: "Macrame plant holder" },
  { id: 12, name: "Square Planter", price: 36.99, emoji: "📦", desc: "Modern square planter" },
];

const PlantersAndPots = ({ addToCart }) => {
  return (
    <section className="min-h-screen px-0 py-16 bg-gradient-to-b from-transparent to-green-950/10">
      <div className="max-w-full mx-auto px-8">
        <div className="mb-12 text-center">
          <h2 className="text-5xl font-bold mb-4">🪴 Planters & Pots Collection</h2>
          <p className="text-xl text-gray-300 mb-2">Stylish containers for your plants</p>
          <p className="text-gray-400">Add elegance to your indoor & outdoor spaces</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {plantersAndPots.map((p) => (
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

export default PlantersAndPots;
