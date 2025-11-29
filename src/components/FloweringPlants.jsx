import React from "react";
import { formatINRFromUSD } from "../utils/priceUtils";

const floweringPlants = [
  { id: 1, name: "Roses", price: 45.99, emoji: "🌹", desc: "Beautiful red & pink roses" },
  { id: 2, name: "Orchids", price: 55.99, emoji: "🌺", desc: "Exotic tropical flowers" },
  { id: 3, name: "Sunflowers", price: 35.99, emoji: "🌻", desc: "Bright yellow sunflowers" },
  { id: 4, name: "Tulips", price: 38.99, emoji: "🌷", desc: "Elegant spring flowers" },
  { id: 5, name: "Hibiscus", price: 42.99, emoji: "🌸", desc: "Colorful tropical blooms" },
  { id: 6, name: "Bougainvillea", price: 48.99, emoji: "🎨", desc: "Vibrant purple flowers" },
  { id: 7, name: "Marigolds", price: 28.99, emoji: "🌼", desc: "Golden yellow flowers" },
  { id: 8, name: "Jasmine", price: 32.99, emoji: "💐", desc: "Fragrant white flowers" },
  { id: 9, name: "Dahlia", price: 44.99, emoji: "🌺", desc: "Large blooming flowers" },
  { id: 10, name: "Lotus", price: 52.99, emoji: "🪷", desc: "Sacred water flowers" },
  { id: 11, name: "Carnation", price: 36.99, emoji: "🌹", desc: "Pink & red carnations" },
  { id: 12, name: "Peony", price: 58.99, emoji: "🌸", desc: "Lush pink peonies" },
];

const FloweringPlants = ({ addToCart }) => {
  return (
    <section className="min-h-screen px-0 py-16 bg-gradient-to-b from-transparent to-green-950/10">
      <div className="max-w-full mx-auto px-8">
        <div className="mb-12 text-center">
          <h2 className="text-5xl font-bold mb-4">🌸 Flowering Plants Collection</h2>
          <p className="text-xl text-gray-300 mb-2">Beautiful blooming flowers for every occasion</p>
          <p className="text-gray-400">Bring nature's colors to your home</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {floweringPlants.map((p) => (
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

export default FloweringPlants;
