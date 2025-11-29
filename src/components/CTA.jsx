import React from "react";

const CTA = () => {
  return (
    <section className="px-0 py-20 bg-gradient-to-r from-green-900/40 to-emerald-900/40 border-y border-green-700">
      <div className="max-w-full mx-auto px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Ready to Green Your Space? 🌱
        </h2>
        <p className="text-xl text-gray-300 mb-8">
          Join thousands of happy plant parents who've transformed their homes. 
          Start your plant journey today!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-4 bg-green-600 hover:bg-green-500 text-white text-lg font-bold rounded-lg transition transform hover:scale-105 shadow-lg">
            🛒 Start Shopping Now
          </button>
          <button className="px-8 py-4 border-2 border-green-400 hover:bg-green-400/10 text-white text-lg font-bold rounded-lg transition">
            📚 Learn Plant Care
          </button>
        </div>
      </div>
    </section>
  );
};

export default CTA;
