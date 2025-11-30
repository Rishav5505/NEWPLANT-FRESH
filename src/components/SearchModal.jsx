import React, { useState, useEffect } from "react";
import { formatINRFromUSD } from "../utils/priceUtils";

const plants = [
  { id: 1, name: "Calathea Plant", price: 35.99, category: "indoor" },
  { id: 2, name: "Monstera Deliciosa", price: 45.99, category: "indoor" },
  { id: 3, name: "Snake Plant", price: 25.99, category: "indoor" },
  { id: 4, name: "Fiddle Leaf Fig", price: 55.99, category: "indoor" },
  { id: 5, name: "Pothos Plant", price: 29.99, category: "indoor" },
  { id: 6, name: "Bird of Paradise", price: 65.99, category: "outdoor" },
  { id: 7, name: "Orchid", price: 49.99, category: "indoor" },
  { id: 8, name: "Tulip", price: 19.99, category: "flowering" },
  { id: 9, name: "Rose", price: 39.99, category: "flowering" },
  { id: 10, name: "Sunflower", price: 34.99, category: "outdoor" },
  { id: 11, name: "Succulent", price: 15.99, category: "indoor" },
  { id: 12, name: "Fern", price: 22.99, category: "indoor" },
];

const SearchModal = ({ showSearch, setShowSearch, setCurrentPage }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPlants, setFilteredPlants] = useState([]);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = plants.filter((plant) =>
        plant.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPlants(filtered);
    } else {
      setFilteredPlants([]);
    }
  }, [searchTerm]);

  const handleClose = () => {
    setShowSearch(false);
    setSearchTerm("");
  };

  const handleSearch = (plantName) => {
    // Navigate to shop or search results
    setCurrentPage?.("shop");
    handleClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      handleSearch(searchTerm);
    }
  };

  return (
    <>
      {showSearch && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-20 p-4">
          <div className="w-full max-w-2xl bg-[#0a1a12] border-2 border-green-600 rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center gap-4 p-6 bg-green-900/20 border-b border-green-700">
              <input
                type="text"
                placeholder="🔍 Search plants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                autoFocus
                className="flex-1 px-4 py-3 bg-[#0b2a1a] border border-green-600 rounded-lg text-white outline-none focus:border-green-400 text-lg"
              />
              <button
                onClick={handleClose}
                className="text-3xl text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {searchTerm && (
              <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
                {filteredPlants.length > 0 ? (
                  filteredPlants.map((plant) => (
                    <button
                      key={plant.id}
                      onClick={() => handleSearch(plant.name)}
                      className="w-full text-left px-4 py-3 hover:bg-green-900/30 border border-green-700/50 rounded-lg transition flex items-center gap-3"
                    >
                      <span className="text-2xl">🌿</span>
                      <div>
                        <p className="font-bold">{plant.name}</p>
                        <p className="text-sm text-gray-400">{formatINRFromUSD(plant.price)}</p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <p className="text-2xl mb-2">🔍</p>
                    <p>No plants found for "{searchTerm}"</p>
                  </div>
                )}
              </div>
            )}

            {!searchTerm && (
              <div className="p-6 text-center text-gray-400">
                <p className="text-lg">Start typing to search...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default SearchModal;
