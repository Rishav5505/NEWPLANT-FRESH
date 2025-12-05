import React, { useState } from "react";

const Rating = ({ count = 5, value = 0, onChange, interactive = false }) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1">
      {Array(count).fill(0).map((_, i) => (
        <button
          key={i}
          onClick={() => interactive && onChange && onChange(i + 1)}
          onMouseEnter={() => interactive && setHovered(i + 1)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={`text-2xl transition ${
            (hovered || value) > i ? "text-yellow-400" : "text-gray-600"
          } ${interactive ? "cursor-pointer" : "cursor-default"}`}
          disabled={!interactive}
          aria-label={`Rate ${i + 1} stars`}
        >
          ★
        </button>
      ))}
    </div>
  );
};

const Reviews = ({ productId = "", reviews = [] }) => {
  const [newReview, setNewReview] = useState({ rating: 0, title: "", text: "", name: "" });
  const [allReviews, setAllReviews] = useState(reviews);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newReview.rating === 0 || !newReview.text.trim()) {
      alert("Please provide a rating and review text");
      return;
    }

    const review = {
      id: Date.now(),
      ...newReview,
      date: new Date().toLocaleDateString(),
    };

    setAllReviews([review, ...allReviews]);
    setNewReview({ rating: 0, title: "", text: "", name: "" });
  };

  const avgRating = allReviews.length
    ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
    : 0;

  return (
    <div className="bg-gray-900/50 border border-green-700/30 rounded-lg p-6 space-y-6">
      <h3 className="text-2xl font-bold text-green-400">Customer Reviews</h3>

      {/* Rating Summary */}
      <div className="bg-gray-800/50 p-4 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-400">{avgRating}</div>
            <Rating value={Math.round(avgRating)} />
            <p className="text-gray-400 text-sm mt-2">{allReviews.length} reviews</p>
          </div>
        </div>
      </div>

      {/* Add Review Form */}
      <form onSubmit={handleSubmit} className="bg-gray-800/30 p-4 rounded-lg space-y-4">
        <h4 className="font-semibold text-white">Share Your Experience</h4>

        <input
          type="text"
          placeholder="Your Name"
          value={newReview.name}
          onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
          className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
        />

        <input
          type="text"
          placeholder="Review Title (optional)"
          value={newReview.title}
          onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
          className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
        />

        <div>
          <label className="block text-sm text-gray-300 mb-2">Rating</label>
          <Rating value={newReview.rating} onChange={(r) => setNewReview({ ...newReview, rating: r })} interactive />
        </div>

        <textarea
          placeholder="Write your review..."
          value={newReview.text}
          onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
          rows="4"
          className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
        />

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition"
        >
          Submit Review
        </button>
      </form>

      {/* Reviews List */}
      <div className="space-y-4">
        {allReviews.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No reviews yet. Be the first to review!</p>
        ) : (
          allReviews.map((review) => (
            <div key={review.id} className="bg-gray-800/30 p-4 rounded-lg border border-gray-700/30">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-white">{review.name}</p>
                  <Rating value={review.rating} />
                </div>
                <p className="text-gray-400 text-sm">{review.date}</p>
              </div>
              {review.title && <p className="font-semibold text-green-400 mb-1">{review.title}</p>}
              <p className="text-gray-300">{review.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Reviews;
export { Rating };
