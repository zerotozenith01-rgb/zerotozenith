import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import {
  Search,
  Upload,
  Camera,
  Filter,
  CheckCircle2,
  TrendingDown,
  MapPin,
  AlertCircle,
  ArrowRight,
  Pill,
  Shield,
  X,
  ChevronDown,
  Star,
} from "lucide-react";

interface Medicine {
  id: number;
  brand_name: string;
  generic_name: string;
  salt_composition: string;
  category: string;
  manufacturer: string;
  price: number;
  price_per_unit: number;
  dosage_form: string;
  strength: string;
  pack_size: string;
  is_verified: boolean;
  rating: number;
  review_count: number;
  description: string;
}

interface Alternative {
  id: number;
  brand_name: string;
  manufacturer: string;
  price: number;
  savings_percent: number;
  safe_substitute: boolean;
  composition_match: string;
  salt_composition: string;
  rating: number;
  pack_size: string;
  is_verified: boolean;
}

interface AlternativesData {
  original: Medicine;
  exact_matches: Alternative[];
  similar_matches: Alternative[];
  total_alternatives: number;
}

const CATEGORIES = ["All", "Pain Relief", "Antibiotic", "Gastro", "Diabetes", "Cardiac", "Allergy", "Respiratory", "Supplements"];

export default function SearchMedicine() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [results, setResults] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [alternatives, setAlternatives] = useState<AlternativesData | null>(null);
  const [altLoading, setAltLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setQuery(q);
      handleSearch(q);
    }
  }, []);

  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim() && selectedCategory === "All") return;
    setLoading(true);
    setSearched(true);
    setSelectedMedicine(null);
    setAlternatives(null);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (selectedCategory !== "All") params.set("category", selectedCategory);
      const res = await fetch(`/api/medicines/search?${params}`);
      const data = await res.json();
      setResults(data.medicines);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFindAlternatives = async (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setAltLoading(true);
    try {
      const res = await fetch(`/api/medicines/${medicine.id}/alternatives`);
      const data = await res.json();
      setAlternatives(data);
    } catch (err) {
      console.error(err);
    } finally {
      setAltLoading(false);
    }
  };

  const handleUpload = async () => {
    setShowUploadModal(false);
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch("/api/upload/prescription", { method: "POST" });
      const data = await res.json();
      if (data.detected_medicines?.length > 0) {
        setQuery(data.detected_medicines[0].name);
        const searchRes = await fetch(`/api/medicines/search?q=${data.detected_medicines[0].name}`);
        const searchData = await searchRes.json();
        setResults(searchData.medicines);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Search Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
        >
          <div className="flex items-center gap-3 p-5">
            <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by medicine name, generic name, or salt composition..."
              className="flex-1 bg-transparent border-none outline-none text-gray-800 placeholder:text-gray-400"
            />
            {query && (
              <button type="button" onClick={() => { setQuery(""); setResults([]); setSearched(false); }}>
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 px-5 pb-5 pt-2 border-t border-gray-100 flex-wrap">
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors text-sm"
            >
              <Upload className="w-4 h-4" />
              Upload Prescription
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleUpload}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors text-sm"
            >
              <Camera className="w-4 h-4" />
              Scan
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                showFilters ? "bg-cyan-50 text-cyan-700" : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="ml-auto px-8 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-md shadow-cyan-500/25 hover:shadow-lg hover:shadow-cyan-500/30 transition-all text-sm"
            >
              Search
            </motion.button>
          </div>
        </form>

        {/* Category Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
                {CATEGORIES.map((cat) => (
                  <motion.button
                    key={cat}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedCategory(cat);
                      if (cat !== "All" || query) handleSearch();
                    }}
                    className={`px-4 py-2 rounded-full text-sm transition-all ${
                      selectedCategory === cat
                        ? "bg-cyan-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {cat}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full"
          />
        </div>
      )}

      {/* Results */}
      {!loading && searched && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Found <span className="text-gray-800 font-medium">{results.length}</span> medicines
            </p>
          </div>

          {results.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 bg-white rounded-2xl border border-gray-100"
            >
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg text-gray-600 mb-2">No medicines found</h3>
              <p className="text-sm text-gray-400">Try a different search term or category</p>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {results.map((medicine, index) => (
                <motion.div
                  key={medicine.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-cyan-200 transition-all group cursor-pointer"
                  onClick={() => handleFindAlternatives(medicine)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base text-gray-800 truncate">{medicine.brand_name}</h3>
                        {medicine.is_verified && (
                          <CheckCircle2 className="w-4 h-4 text-cyan-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{medicine.manufacturer}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs flex-shrink-0">
                      {medicine.category}
                    </span>
                  </div>

                  <div className="space-y-1.5 mb-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Pill className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-gray-600">{medicine.salt_composition}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-gray-600">{medicine.dosage_form} • {medicine.strength} • {medicine.pack_size}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div>
                      <span className="text-xl text-gray-800">₹{medicine.price}</span>
                      <span className="text-xs text-gray-500 ml-1">/ pack</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-sm text-gray-600">{medicine.rating}</span>
                      </div>
                      <motion.span
                        className="text-xs text-cyan-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Find Alternatives <ArrowRight className="w-3 h-3" />
                      </motion.span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Alternatives Panel */}
      <AnimatePresence>
        {selectedMedicine && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl text-gray-800">
                  Alternatives for{" "}
                  <span className="text-cyan-600">{selectedMedicine.brand_name}</span>
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedMedicine.salt_composition} • {selectedMedicine.strength}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => { setSelectedMedicine(null); setAlternatives(null); }}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </motion.button>
            </div>

            {altLoading ? (
              <div className="flex items-center justify-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full"
                />
              </div>
            ) : alternatives ? (
              <div className="space-y-6">
                {/* Exact Matches */}
                {alternatives.exact_matches.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <h3 className="text-base text-gray-800">
                        Exact Composition Matches ({alternatives.exact_matches.length})
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs">
                        Safe Substitutes
                      </span>
                    </div>
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {alternatives.exact_matches.map((alt, index) => (
                        <motion.div
                          key={alt.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.08 }}
                          whileHover={{ y: -3 }}
                          className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100 hover:shadow-md transition-all relative overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-bl-[40px]" />
                          <div className="absolute top-2 right-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          </div>

                          <div className="mb-3 pr-8">
                            <h4 className="text-base text-gray-800">{alt.brand_name}</h4>
                            <p className="text-xs text-gray-500">{alt.manufacturer}</p>
                          </div>

                          <p className="text-xs text-gray-500 mb-3">{alt.salt_composition}</p>

                          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                            <div>
                              <span className="text-xl text-gray-800">₹{alt.price}</span>
                              <span className="text-xs text-gray-500 ml-1">/ {alt.pack_size}</span>
                            </div>
                            {alt.savings_percent > 0 && (
                              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50">
                                <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-xs text-emerald-700">Save {alt.savings_percent}%</span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Similar Matches */}
                {alternatives.similar_matches.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <AlertCircle className="w-5 h-5 text-amber-500" />
                      <h3 className="text-base text-gray-800">
                        Similar Medicines ({alternatives.similar_matches.length})
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs">
                        Consult Doctor
                      </span>
                    </div>
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {alternatives.similar_matches.map((alt, index) => (
                        <motion.div
                          key={alt.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.08 }}
                          whileHover={{ y: -3 }}
                          className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100 hover:shadow-md transition-all relative overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-50 rounded-bl-[40px]" />
                          <div className="absolute top-2 right-2">
                            <AlertCircle className="w-5 h-5 text-amber-500" />
                          </div>

                          <div className="mb-3 pr-8">
                            <h4 className="text-base text-gray-800">{alt.brand_name}</h4>
                            <p className="text-xs text-gray-500">{alt.manufacturer}</p>
                          </div>

                          <p className="text-xs text-gray-500 mb-3">{alt.salt_composition}</p>

                          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                            <div>
                              <span className="text-xl text-gray-800">₹{alt.price}</span>
                            </div>
                            {alt.savings_percent > 0 && (
                              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50">
                                <TrendingDown className="w-3.5 h-3.5 text-amber-600" />
                                <span className="text-xs text-amber-700">Save {alt.savings_percent}%</span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {alternatives.exact_matches.length === 0 && alternatives.similar_matches.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                    <Pill className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg text-gray-600 mb-2">No alternatives found</h3>
                    <p className="text-sm text-gray-400">This medicine has no registered alternatives in our database</p>
                  </div>
                )}
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <h2 className="text-xl text-gray-800 mb-2">Upload Prescription</h2>
              <p className="text-sm text-gray-500 mb-6">
                Upload a photo of your prescription or medicine package. Our system will extract medicine information automatically.
              </p>

              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-cyan-300 transition-colors cursor-pointer mb-6"
                onClick={handleUpload}
              >
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-1">Click to upload or drag & drop</p>
                <p className="text-xs text-gray-400">PNG, JPG up to 10MB</p>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpload}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-cyan-500 text-white text-sm shadow-md"
                >
                  Process
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Initial state - no search yet */}
      {!searched && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Search className="w-16 h-16 text-gray-200 mx-auto mb-6" />
          </motion.div>
          <h3 className="text-xl text-gray-600 mb-2">Search for Medicines</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Enter a medicine name, generic name, or salt composition to find affordable alternatives
          </p>

          {/* Quick suggestions */}
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {["Paracetamol", "Azithromycin", "Pantoprazole", "Cetirizine", "Metformin"].map((suggestion) => (
              <motion.button
                key={suggestion}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setQuery(suggestion);
                  handleSearch(suggestion);
                }}
                className="px-4 py-2 rounded-full bg-white border border-gray-200 text-sm text-gray-600 hover:border-cyan-300 hover:text-cyan-700 transition-colors shadow-sm"
              >
                {suggestion}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
