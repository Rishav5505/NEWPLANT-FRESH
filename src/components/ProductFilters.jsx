import React, { useState } from "react";

const ProductFilters = ({ onFilter }) => {
  const [filters, setFilters] = useState({
    priceRange: [0, 5000],
    difficulty: [],
    type: [],
    inStock: true,
  });

  const handlePriceChange = (e) => {
    const newRange = [0, parseInt(e.target.value)];
    setFilters({ ...filters, priceRange: newRange });
    onFilter({ ...filters, priceRange: newRange });
  };

  const handleDifficultyToggle = (level) => {
    const updated = filters.difficulty.includes(level)
      ? filters.difficulty.filter((d) => d !== level)
      : [...filters.difficulty, level];
    setFilters({ ...filters, difficulty: updated });
    onFilter({ ...filters, difficulty: updated });
  };

  const handleTypeToggle = (type) => {
    const updated = filters.type.includes(type)
      ? filters.type.filter((t) => t !== type)
      : [...filters.type, type];
    setFilters({ ...filters, type: updated });
    onFilter({ ...filters, type: updated });
  };

  return (
    <div className="bg-gray-900/50 border border-green-700/30 rounded-lg p-6 space-y-6">
      <h3 className="text-xl font-bold text-green-400">Filter Products</h3>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-3">Price: ₹0 - ₹{filters.priceRange[1]}</label>
        <input
          type="range"
          min="0"
          max="5000"
          value={filters.priceRange[1]}
          onChange={handlePriceChange}
          className="w-full accent-green-600"
        />
      </div>

      {/* Difficulty Level */}
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-3">Difficulty</label>
        <div className="space-y-2">
          {["Beginner", "Intermediate", "Advanced"].map((level) => (
            <label key={level} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.difficulty.includes(level)}
                onChange={() => handleDifficultyToggle(level)}
                className="w-4 h-4 accent-green-600 mr-2"
              />
              <span className="text-gray-300">{level}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Plant Type */}
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-3">Type</label>
        <div className="space-y-2">
          {["Indoor", "Outdoor", "Flowering", "Succulents", "Herbs"].map((type) => (
            <label key={type} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.type.includes(type)}
                onChange={() => handleTypeToggle(type)}
                className="w-4 h-4 accent-green-600 mr-2"
              />
              <span className="text-gray-300">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* In Stock Only */}
      <label className="flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={filters.inStock}
          onChange={(e) => {
            setFilters({ ...filters, inStock: e.target.checked });
            onFilter({ ...filters, inStock: e.target.checked });
          }}
          className="w-4 h-4 accent-green-600 mr-2"
        />
        <span className="text-gray-300">In Stock Only</span>
      </label>

      {/* Reset Filters */}
      <button
        onClick={() => {
          const defaultFilters = {
            priceRange: [0, 5000],
            difficulty: [],
            type: [],
            inStock: true,
          };
          setFilters(defaultFilters);
          onFilter(defaultFilters);
        }}
        className="w-full bg-red-900/30 hover:bg-red-900/50 text-red-400 py-2 rounded-lg font-semibold transition"
      >
        Reset Filters
      </button>
    </div>
  );
};

export default ProductFilters;
