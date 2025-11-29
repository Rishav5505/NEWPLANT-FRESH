import React from "react";
import { formatINRFromUSD } from "../utils/priceUtils";

const Product = ({ product, addToCart }) => {
  if (!product) return null;

  return (
    <section className="min-h-screen px-0 py-20">
      <div className="max-w-4xl mx-auto bg-gradient-to-br from-green-900/20 to-black/40 border border-green-700 p-8 rounded-3xl">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="text-9xl flex-shrink-0">{product.emoji}</div>
          <div>
            <h2 className="text-4xl font-bold mb-2">{product.name}</h2>
            <p className="text-gray-300 mb-4">{product.desc}</p>
            <p className="text-3xl text-green-400 font-bold mb-4">{formatINRFromUSD(product.price)}</p>
            <div className="flex gap-4">
              <button
                onClick={() => addToCart?.({ id: product.id, name: product.name, price: product.price, emoji: product.emoji })}
                className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg"
              >
                Add to Cart
              </button>
              <button className="px-6 py-3 border border-green-600 hover:bg-green-600/10 text-white rounded-lg">Buy Now</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Product;
