import React, { useState, useEffect } from "react";

const IndorePlantDetail = ({ setCurrentPage, addToCart }) => {
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get plant from sessionStorage (set from carousel click)
    const storedPlant = sessionStorage.getItem('selectedPlant');
    if (storedPlant) {
      setPlant(JSON.parse(storedPlant));
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-300">Loading...</p>
      </div>
    );
  }

  if (!plant) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-xl text-gray-300">Plant details not found</p>
        <button
          onClick={() => setCurrentPage("indoreplants")}
          className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold transition"
        >
          Back to Collection
        </button>
      </div>
    );
  }

  return (
    <section className="min-h-screen px-0 py-16 bg-gradient-to-b from-transparent to-green-950/10">
      <div className="max-w-6xl mx-auto px-8">
        {/* Back button */}
        <button
          onClick={() => setCurrentPage("indoreplants")}
          className="mb-8 px-4 py-2 bg-green-600/20 hover:bg-green-600/40 border border-green-600 text-white rounded-lg font-semibold transition"
        >
          ← Back to Collection
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          {/* Left: Image */}
          <div className="flex items-center justify-center">
            {plant.imageUrl ? (
              <div className="w-full bg-gradient-to-br from-green-900/30 to-black/40 border border-green-700 rounded-2xl p-8 flex items-center justify-center">
                <img
                  src={plant.imageUrl}
                  alt={plant.name}
                  className="w-full max-h-96 object-contain"
                />
              </div>
            ) : (
              <div className="w-full h-96 bg-gray-700 rounded-lg flex items-center justify-center text-gray-400">
                No image available
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-3">{plant.name}</h1>
              <div className="flex items-baseline gap-3">
                <p className="text-3xl font-bold text-green-400">₹{plant.salePrice}</p>
                {plant.oldPrice && (
                  <p className="text-gray-500 line-through text-lg">₹{plant.oldPrice}</p>
                )}
              </div>
            </div>

            {/* Description */}
            {plant.description && (
              <div className="bg-gradient-to-br from-green-900/20 to-black/40 border border-green-700 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-3">About This Plant</h3>
                <div
                  className="text-gray-300 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: plant.description,
                  }}
                />
              </div>
            )}

            {/* Add to Cart Button */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={() => {
                  addToCart({
                    id: plant._id,
                    name: plant.name,
                    price: plant.salePrice,
                    currency: 'INR',
                    image: plant.imageUrl,
                  });
                  setCurrentPage("home");
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-lg font-bold transition transform hover:scale-105 shadow-lg text-lg"
              >
                🛒 Add to Cart
              </button>
              <button
                onClick={() => setCurrentPage("indoreplants")}
                className="px-6 py-3 border-2 border-green-500 hover:bg-green-500/20 text-white rounded-lg font-bold transition"
              >
                Continue Shopping
              </button>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="bg-gradient-to-br from-green-600/30 to-emerald-700/30 rounded-lg p-4 border border-green-600/50 text-center">
                <p className="text-2xl mb-2">✅</p>
                <p className="text-white font-bold text-sm">100% Fresh</p>
                <p className="text-gray-300 text-xs">Guarantee</p>
              </div>
              <div className="bg-gradient-to-br from-green-600/30 to-emerald-700/30 rounded-lg p-4 border border-green-600/50 text-center">
                <p className="text-2xl mb-2">📦</p>
                <p className="text-white font-bold text-sm">Free Shipping</p>
                <p className="text-gray-300 text-xs">Over ₹4,150</p>
              </div>
              <div className="bg-gradient-to-br from-green-600/30 to-emerald-700/30 rounded-lg p-4 border border-green-600/50 text-center">
                <p className="text-2xl mb-2">🎯</p>
                <p className="text-white font-bold text-sm">Expert Support</p>
                <p className="text-gray-300 text-xs">24/7 Available</p>
              </div>
              <div className="bg-gradient-to-br from-green-600/30 to-emerald-700/30 rounded-lg p-4 border border-green-600/50 text-center">
                <p className="text-2xl mb-2">🌿</p>
                <p className="text-white font-bold text-sm">Care Guide</p>
                <p className="text-gray-300 text-xs">Included</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IndorePlantDetail;
