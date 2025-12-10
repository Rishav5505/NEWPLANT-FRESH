import React from "react";
import { formatINRFromUSD } from "../utils/priceUtils";

const Product = ({ product, addToCart, onClose }) => {
  if (!product) return null;

  const price = product.price || product.salePrice || product.sale_price || 0;
  const description = product.desc || product.description || product.longDescription || '';
  const id = product.id || product._id || (product._id && product._id.toString && product._id.toString());

  return (
    <section className="min-h-screen px-4 py-10 flex items-start justify-center">
      <div className="w-full max-w-5xl mx-auto bg-gradient-to-br from-green-900/20 to-black/40 border border-green-700 p-6 rounded-3xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-300 hover:text-white">✕</button>
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-full md:w-1/2 rounded-lg overflow-hidden bg-white flex items-center justify-center p-6 shadow-lg">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="max-h-96 w-full object-contain" />
            ) : (
              <div className="text-9xl py-12">{product.emoji || '🌿'}</div>
            )}
          </div>

          <div className="w-full md:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">{product.name}</h2>
            <p className="text-green-400 font-bold text-2xl mb-4">₹{Number(price || 0).toFixed(2)}</p>
            <div className="mb-4 text-gray-300 text-sm leading-relaxed" style={{ maxHeight: '360px', overflowY: 'auto' }}>
              {description ? (
                <div dangerouslySetInnerHTML={{ __html: description }} />
              ) : (
                <p className="text-gray-400">No description available.</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => addToCart?.({ id, name: product.name, price, image: product.imageUrl || '' })}
                className="px-5 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold"
              >
                🛒 Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Product;
