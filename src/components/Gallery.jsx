import React from "react";

const galleryItems = [
  { emoji: "🌿", title: "Indoor Collection", count: "2,500+ Items", page: "indoreplants" },
  { emoji: "🌸", title: "Flowering Plants", count: "1,200+ Items", page: "floweringplants" },
  { emoji: "🌴", title: "Outdoor Plants", count: "800+ Items", page: "outdoorplants" },
  { emoji: "🪴", title: "Planters & Pots", count: "600+ Items", page: "plantersandpots" },
  { emoji: "🧴", title: "Plant Care Kits", count: "400+ Items", page: "plantcarekits" },
  { emoji: "📚", title: "Care Guides", count: "100+ Guides", page: "careguides" },
];

const Gallery = ({ setCurrentPage }) => {
  return (
    <section className="px-0 py-12 bg-gradient-to-b from-green-950/10 to-transparent">
      <div className="max-w-full mx-auto px-6">
        <h2 className="text-center text-3xl md:text-4xl font-bold mb-8">
          Explore Our Collections
        </h2>

        {/* simple fade-in keyframes scoped to this component */}
        <style>{`
          @keyframes fadeInGallery { from { opacity: 0; transform: translateY(6px) scale(.995); } to { opacity: 1; transform: translateY(0) scale(1); } }
        `}</style>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {galleryItems.map((item, idx) => (
            <div
              key={idx}
              onClick={() => item.page && setCurrentPage?.(item.page)}
              className={`group relative bg-gradient-to-br from-green-900/40 to-black/50 border border-green-700 p-4 rounded-xl hover:border-green-500 hover:shadow-lg transition-transform duration-300 cursor-pointer overflow-hidden`}
              style={{ animation: `fadeInGallery 420ms ease ${idx * 80}ms both` }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition" style={{
                backgroundImage: "radial-gradient(circle, #22c55e 1px, transparent 1px)",
                backgroundSize: "20px 20px"
              }}></div>
              <div className="text-5xl mb-2 group-hover:scale-110 transition-transform transform-gpu drop-shadow-lg">{item.emoji}</div>
              <h3 className="text-lg font-bold mb-1">{item.title}</h3>
              <p className="text-green-400 text-sm font-semibold">{item.count}</p>
              <div className="absolute inset-0 bg-green-500/0 group-hover:bg-green-500/5 transition rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;