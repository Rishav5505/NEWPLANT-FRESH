import React from 'react';

const Wishlist = ({ setCurrentPage }) => {
  const [wishlist, setWishlist] = React.useState(() => {
    try {
      const raw = localStorage.getItem('wishlist');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  const removeFromWishlist = (id) => {
    const updated = wishlist.filter(item => item.id !== id);
    setWishlist(updated);
    localStorage.setItem('wishlist', JSON.stringify(updated));
  };

  const addToCart = (item) => {
    // Dispatch event for App to add to cart
    window.dispatchEvent(new CustomEvent('add-to-cart', { detail: item }));
    alert(`${item.name} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1a12] to-[#051108] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-green-300">❤️ Your Wishlist</h1>
          <button 
            onClick={() => setCurrentPage?.('home')} 
            className="px-4 py-2 bg-green-700 rounded hover:bg-green-600 text-white"
          >
            ← Back
          </button>
        </div>

        {wishlist.length === 0 ? (
          <div className="bg-[#07110a] p-8 rounded-lg border border-green-700 text-center">
            <p className="text-2xl mb-4">💔</p>
            <p className="text-gray-300 text-lg mb-4">Your wishlist is empty</p>
            <button 
              onClick={() => setCurrentPage?.('home')} 
              className="px-4 py-2 bg-green-600 rounded text-white hover:bg-green-500"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item) => (
              <div key={item.id} className="bg-[#07110a] p-4 rounded-lg border border-green-700 hover:border-green-600 transition">
                <div className="text-5xl mb-3">{item.emoji}</div>
                <h3 className="text-lg font-bold text-green-300 mb-1">{item.name}</h3>
                <p className="text-gray-400 text-sm mb-3">{item.description || 'Beautiful plant'}</p>
                
                <div className="flex justify-between items-center mb-4">
                  <div className="text-lg font-bold text-green-400">₹{(item.price * 83).toFixed(0)}</div>
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="text-red-400 hover:text-red-300 transition"
                  >
                    🗑️
                  </button>
                </div>

                <button
                  onClick={() => addToCart(item)}
                  className="w-full py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold transition"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
