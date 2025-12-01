import React, { useState, useEffect } from "react";
import { formatINRFromUSD } from "../utils/priceUtils";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const IndorePlants = ({ addToCart }) => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchIndoorPlants();
  }, []);

  const fetchIndoorPlants = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/plants/indoor`);
      const data = await response.json();
      
      if (data.success) {
        setPlants(data.plants);
        setError(null);
      } else {
        setError("Failed to load plants");
      }
    } catch (err) {
      console.error("Error fetching plants:", err);
      setError("Error loading plants");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen px-0 py-16 bg-gradient-to-b from-transparent to-green-950/10">
      <div className="max-w-full mx-auto px-8">
        <div className="mb-12 text-center">
          <h2 className="text-5xl font-bold mb-4">🌿 Indore Plants Collection</h2>
          <p className="text-xl text-gray-300 mb-2">Handpicked plants perfect for indoor living</p>
          <p className="text-gray-400">Fresh & healthy plants delivered to your doorstep</p>
        </div>

        {loading && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-300">Loading plants...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12 bg-red-900/20 border border-red-700 rounded-lg p-6">
            <p className="text-red-400 text-lg">{error}</p>
            <button 
              onClick={fetchIndoorPlants}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && plants.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg">No plants available at the moment</p>
          </div>
        )}

        {!loading && !error && plants.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {plants.map((p) => (
              <div 
                key={p._id} 
                className="bg-gradient-to-br from-green-900/20 to-black/40 border border-green-700 p-6 rounded-2xl backdrop-blur-md hover:border-green-500 hover:shadow-lg hover:shadow-green-500/20 transition duration-300 cursor-pointer transform hover:-translate-y-1 group relative overflow-hidden"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition" style={{
                  backgroundImage: "radial-gradient(circle, #22c55e 1px, transparent 1px)",
                  backgroundSize: "25px 25px"
                }}></div>
                
                {p.imageUrl && (
                  <div className="w-full h-32 mb-4 rounded-lg overflow-hidden bg-gray-700 relative z-10">
                    <img 
                      src={p.imageUrl} 
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition transform"
                    />
                  </div>
                )}
                
                <h3 className="text-xl font-bold mb-2 h-12 flex items-center">{p.name}</h3>
                
                {p.description && (
                  <p className="text-gray-300 mb-4 text-sm h-20 overflow-hidden line-clamp-3">
                    {p.description.replace(/<[^>]*>/g, '')}
                  </p>
                )}
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-green-700/30">
                  <div>
                    <p className="text-green-400 font-bold text-lg">₹{p.salePrice}</p>
                    {p.oldPrice && (
                      <p className="text-gray-500 line-through text-sm">₹{p.oldPrice}</p>
                    )}
                  </div>
                  <button
                    onClick={() => addToCart({ 
                      id: p._id, 
                      name: p.name, 
                      price: p.salePrice,
                      image: p.imageUrl 
                    })}
                    className="px-3 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold transition"
                  >
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-16 p-8 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-700 rounded-2xl text-center">
          <h3 className="text-2xl font-bold mb-3">Why Choose Our Indoor Plants?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div>
              <p className="text-3xl mb-2">✅</p>
              <p className="text-gray-200 font-semibold">Healthy & Fresh</p>
              <p className="text-gray-400 text-sm">All plants are carefully grown & inspected</p>
            </div>
            <div>
              <p className="text-3xl mb-2">📦</p>
              <p className="text-gray-200 font-semibold">Easy Delivery</p>
              <p className="text-gray-400 text-sm">Safe packaging & quick delivery to Indore</p>
            </div>
            <div>
              <p className="text-3xl mb-2">🎯</p>
              <p className="text-gray-200 font-semibold">Perfect Advice</p>
              <p className="text-gray-400 text-sm">Care guides included with every order</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IndorePlants;
