import React from "react";

const careGuides = [
  { id: 1, name: "Beginner's Plant Care", price: 0, emoji: "📚", desc: "Complete guide for beginners" },
  { id: 2, name: "Watering Guide", price: 0, emoji: "💧", desc: "How to water plants properly" },
  { id: 3, name: "Sunlight Guide", price: 0, emoji: "☀️", desc: "Understanding plant light needs" },
  { id: 4, name: "Fertilizing Basics", price: 0, emoji: "🌱", desc: "Plant nutrition essentials" },
  { id: 5, name: "Pest Control Guide", price: 0, emoji: "🐛", desc: "Natural pest management" },
  { id: 6, name: "Propagation Guide", price: 0, emoji: "🌿", desc: "Growing plants from cuttings" },
  { id: 7, name: "Indoor Plant Care", price: 0, emoji: "🏠", desc: "Complete indoor plant guide" },
  { id: 8, name: "Outdoor Gardening", price: 0, emoji: "🌳", desc: "Outdoor garden essentials" },
  { id: 9, name: "Seasonal Care Tips", price: 0, emoji: "🍂", desc: "Season-wise plant care" },
  { id: 10, name: "Soil & Potting", price: 0, emoji: "🌍", desc: "Soil types and potting guide" },
  { id: 11, name: "Repotting Guide", price: 0, emoji: "🪴", desc: "How to repot plants" },
  { id: 12, name: "Plant Troubleshooting", price: 0, emoji: "🔧", desc: "Common problems & solutions" },
];

const CareGuides = () => {
  return (
    <section className="min-h-screen px-0 py-16 bg-gradient-to-b from-transparent to-green-950/10">
      <div className="max-w-full mx-auto px-8">
        <div className="mb-12 text-center">
          <h2 className="text-5xl font-bold mb-4">📚 Plant Care Guides</h2>
          <p className="text-xl text-gray-300 mb-2">Expert guides to help you grow healthy plants</p>
          <p className="text-gray-400">All guides are FREE - Learn at your own pace!</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {careGuides.map((g) => (
            <div 
              key={g.id} 
              className="bg-gradient-to-br from-green-900/20 to-black/40 border border-green-700 p-6 rounded-2xl backdrop-blur-md hover:border-green-500 hover:shadow-lg hover:shadow-green-500/20 transition duration-300 cursor-pointer transform hover:-translate-y-1"
            >
              <div className="text-5xl mb-4 text-center">{g.emoji}</div>
              <h3 className="text-xl font-bold mb-2 h-12 flex items-center">{g.name}</h3>
              <p className="text-gray-300 mb-4 text-sm h-10">{g.desc}</p>
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-green-700/30">
                <p className="text-green-400 font-bold text-lg">FREE</p>
                <button
                  className="px-3 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold transition"
                >
                  Read
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 p-8 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-700 rounded-2xl text-center">
          <h3 className="text-2xl font-bold mb-4">📖 Learn & Grow</h3>
          <p className="text-gray-300 mb-6">
            Our comprehensive guides cover everything from basic plant care to advanced gardening techniques. 
            Whether you're a beginner or an experienced gardener, you'll find valuable information here.
          </p>
          <button className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold transition">
            Start Learning Today
          </button>
        </div>
      </div>
    </section>
  );
};

export default CareGuides;
