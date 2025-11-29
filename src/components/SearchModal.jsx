import React, { useState } from "react";
import { formatINRFromUSD } from "../utils/priceUtils";

const plants = [
  "Calathea Plant",
  "Monstera Deliciosa",
  "Snake Plant",
  "Fiddle Leaf Fig",
  "Pothos Plant",
  "Bird of Paradise",
];

const SearchModal = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPlants = plants.filter((plant) =>
    plant.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                autoFocus
                className="flex-1 px-4 py-3 bg-[#0b2a1a] border border-green-600 rounded-lg text-white outline-none focus:border-green-400 text-lg"
              />
              <button
                onClick={() => {
                  setShowSearch(false);
                  setSearchTerm("");
                }}
                className="text-3xl text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {searchTerm && (
              <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
                {filteredPlants.length > 0 ? (
                  filteredPlants.map((plant, idx) => (
                    <button
                      key={idx}
                      className="w-full text-left px-4 py-3 hover:bg-green-900/30 border border-green-700/50 rounded-lg transition flex items-center gap-3"
                    >
                      <span className="text-2xl">🌿</span>
                      <div>
                        <p className="font-bold">{plant}</p>
                        <p className="text-sm text-gray-400">{formatINRFromUSD(35.99)} - {formatINRFromUSD(65.99)}</p>
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
