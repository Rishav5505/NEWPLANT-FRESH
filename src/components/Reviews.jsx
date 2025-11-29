import React from "react";

const reviews = [
  {
    id: 1,
    name: "Sarah Johnson",
    avatar: "👩‍🌾",
    rating: 5,
    text: "Amazing plants! They arrived in perfect condition and have been thriving in my apartment. Customer service was incredibly helpful!",
    verified: true
  },
  {
    id: 2,
    name: "Mike Chen",
    avatar: "👨‍💼",
    rating: 5,
    text: "I bought 3 plants and all of them are healthy and beautiful. The packaging was excellent and delivery was super fast!",
    verified: true
  },
  {
    id: 3,
    name: "Emma Davis",
    avatar: "👩‍🎨",
    rating: 4,
    text: "Great quality plants at reasonable prices. The care instructions were detailed and helpful. Definitely ordering again!",
    verified: true
  },
  {
    id: 4,
    name: "James Wilson",
    avatar: "👨‍🌾",
    rating: 5,
    text: "Best online plant store! The Monstera I got is growing like crazy. Highly recommended for plant lovers!",
    verified: true
  },
];

const Reviews = () => {
  return (
    <section className="px-0 py-20 bg-gradient-to-b from-green-950/10 to-transparent">
      <div className="max-w-full mx-auto px-8">
        <h2 className="text-center text-4xl md:text-5xl font-bold mb-4">
          <span className="text-green-400">💬 Customer</span> Reviews
        </h2>
        <p className="text-center text-gray-400 mb-12">See what our happy customers have to say!</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {reviews.map((review) => (
            <div key={review.id} className="bg-gradient-to-br from-green-900/20 to-black/40 border border-green-700 p-8 rounded-2xl backdrop-blur-md hover:border-green-500 transition-all">
              <div className="flex items-start gap-4">
                <div className="text-5xl">{review.avatar}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg">{review.name}</h3>
                    {review.verified && <span className="text-xs bg-green-600 px-2 py-1 rounded text-white">✓ Verified</span>}
                  </div>
                  <div className="text-yellow-400 mb-2">{'⭐'.repeat(review.rating)}</div>
                  <p className="text-gray-200 leading-relaxed">"{review.text}"</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 text-center bg-green-900/20 border border-green-700 rounded-2xl p-8">
          <div>
            <p className="text-4xl font-bold text-green-400">4.8⭐</p>
            <p className="text-gray-300 mt-2">Average Rating</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-green-400">2,500+</p>
            <p className="text-gray-300 mt-2">Happy Customers</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-green-400">98%</p>
            <p className="text-gray-300 mt-2">Recommend Us</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Reviews;
