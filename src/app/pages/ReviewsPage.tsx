import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import {
  Star,
  Search,
  Send,
  CheckCircle2,
  User,
  ThumbsUp,
  Calendar,
  Filter,
} from "lucide-react";

interface Medicine {
  id: number;
  brand_name: string;
  generic_name: string;
  price: number;
}

interface Review {
  id: number;
  medicine_id: number;
  user_name: string;
  rating: number;
  comment: string;
  date: string;
  verified_purchase: boolean;
}

interface ReviewsData {
  reviews: Review[];
  total: number;
  average_rating: number;
  rating_distribution: Record<number, number>;
}

export default function ReviewsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [reviewsData, setReviewsData] = useState<ReviewsData | null>(null);
  const [loading, setLoading] = useState(false);

  // New review form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    user_name: "",
    rating: 5,
    comment: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [sortBy, setSortBy] = useState<"recent" | "rating">("recent");

  useEffect(() => {
    if (searchQuery.length < 2) {
      setMedicines([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/medicines/search?q=${searchQuery}`);
        const data = await res.json();
        setMedicines(data.medicines);
        setShowDropdown(true);
      } catch (err) {
        console.error(err);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelect = async (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setSearchQuery(medicine.brand_name);
    setShowDropdown(false);
    await loadReviews(medicine.id);
  };

  const loadReviews = async (medicineId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews/${medicineId}`);
      const data = await res.json();
      setReviewsData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedMedicine || !newReview.user_name || !newReview.comment) return;
    setSubmitting(true);
    try {
      await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicine_id: selectedMedicine.id,
          ...newReview,
        }),
      });
      setSubmitSuccess(true);
      setNewReview({ user_name: "", rating: 5, comment: "" });
      setTimeout(() => {
        setSubmitSuccess(false);
        setShowReviewForm(false);
      }, 2000);
      await loadReviews(selectedMedicine.id);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const sortedReviews = reviewsData?.reviews.slice().sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const renderStars = (rating: number, interactive = false, onChange?: (val: number) => void) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            disabled={!interactive}
            onClick={() => onChange?.(star)}
            className={interactive ? "cursor-pointer" : "cursor-default"}
          >
            <Star
              className={`w-4 h-4 ${
                star <= rating
                  ? "text-amber-400 fill-amber-400"
                  : "text-gray-200"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Search */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg text-gray-800 mb-1">Medicine Reviews</h3>
        <p className="text-sm text-gray-500 mb-4">
          Read and share experiences about medicines
        </p>

        <div className="relative">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-100 transition-all">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => medicines.length > 0 && setShowDropdown(true)}
              placeholder="Search for a medicine to see reviews..."
              className="flex-1 bg-transparent border-none outline-none text-gray-800 placeholder:text-gray-400"
            />
          </div>

          <AnimatePresence>
            {showDropdown && medicines.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-20 max-h-64 overflow-y-auto"
              >
                {medicines.map((med) => (
                  <button
                    key={med.id}
                    onClick={() => handleSelect(med)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-cyan-50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                      <Star className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-800">{med.brand_name}</p>
                      <p className="text-xs text-gray-500">{med.generic_name}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full"
          />
        </div>
      )}

      {/* Reviews Content */}
      {!loading && reviewsData && selectedMedicine && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Summary */}
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Rating Overview */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-base text-gray-800 mb-4">{selectedMedicine.brand_name} - Reviews</h3>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-5xl text-gray-800 mb-1">{reviewsData.average_rating}</div>
                  <div className="flex items-center gap-0.5 justify-center mb-1">
                    {renderStars(Math.round(reviewsData.average_rating))}
                  </div>
                  <p className="text-xs text-gray-500">{reviewsData.total} reviews</p>
                </div>

                <div className="flex-1 space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviewsData.rating_distribution[star] || 0;
                    const pct = reviewsData.total > 0 ? (count / reviewsData.total) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-3">{star}</span>
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: (5 - star) * 0.1 }}
                            className="h-full bg-amber-400 rounded-full"
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-6">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Write Review */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-base text-gray-800 mb-4">Write a Review</h3>
              {!showReviewForm ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 mb-4">Share your experience with {selectedMedicine.brand_name}</p>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowReviewForm(true)}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white text-sm shadow-md"
                  >
                    Write Review
                  </motion.button>
                </div>
              ) : submitSuccess ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-6"
                >
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <p className="text-gray-800">Review submitted successfully!</p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-sm text-gray-600 mb-1.5 block">Your Name</label>
                    <input
                      type="text"
                      value={newReview.user_name}
                      onChange={(e) => setNewReview({ ...newReview, user_name: e.target.value })}
                      className="w-full px-3 py-2. rounded-lg bg-gray-50 border border-gray-200 text-sm outline-none focus:border-cyan-400"
                      placeholder="Enter your name"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-600 mb-1.5 block">Rating</label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setNewReview({ ...newReview, rating: star })}
                          className="p-0.5"
                        >
                          <Star
                            className={`w-6 h-6 transition-colors ${
                              star <= newReview.rating
                                ? "text-amber-400 fill-amber-400"
                                : "text-gray-200 hover:text-amber-200"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-600 mb-1.5 block">Your Review</label>
                    <textarea
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm outline-none focus:border-cyan-400 resize-none"
                      placeholder="Share your experience..."
                    />
                  </div>

                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setShowReviewForm(false)}
                      className="flex-1 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSubmitReview}
                      disabled={submitting || !newReview.user_name || !newReview.comment}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 text-white text-sm shadow-md disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      {submitting ? "Submitting..." : "Submit"}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Sort & Filter */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              <span className="text-gray-800 font-medium">{reviewsData.total}</span> reviews
            </p>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "recent" | "rating")}
                className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-cyan-400"
              >
                <option value="recent">Most Recent</option>
                <option value="rating">Highest Rating</option>
              </select>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {sortedReviews?.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-800">{review.user_name}</p>
                        {review.verified_purchase && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(review.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>

                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
                  <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-cyan-600 transition-colors">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    Helpful
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {reviewsData.total === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <Star className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg text-gray-600 mb-2">No reviews yet</h3>
              <p className="text-sm text-gray-400">Be the first to review this medicine!</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Empty state */}
      {!loading && !reviewsData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Star className="w-16 h-16 text-gray-200 mx-auto mb-6" />
          </motion.div>
          <h3 className="text-xl text-gray-600 mb-2">Medicine Reviews</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Search for any medicine to read reviews and share your experience
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
