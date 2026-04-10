import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, useRef, useCallback } from "react";
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
  Sparkles,
  Loader2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface Suggestion {
  id: number;
  brand_name: string;
  score: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  "All", "Pain Relief", "Antibiotic", "Gastro",
  "Diabetes", "Cardiac", "Allergy", "Respiratory", "Supplements",
];

const QUICK_SUGGESTIONS = [
  "Paracetamol", "Azithromycin", "Pantoprazole", "Cetirizine", "Metformin",
];

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SearchMedicine() {
  const [searchParams] = useSearchParams();

  // Search state
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [results, setResults] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [parsedQuery, setParsedQuery] = useState<string | null>(null);

  // Autocomplete dropdown state
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // Alternatives state
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [alternatives, setAlternatives] = useState<AlternativesData | null>(null);
  const [altLoading, setAltLoading] = useState(false);

  // UI state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 280);

  // ── Close dropdown on outside click ──────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Fetch smart-search suggestions on debounced input ────────────────────
  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setSuggestions([]);
      setDropdownOpen(false);
      return;
    }

    let cancelled = false;
    setSuggestLoading(true);

    fetch(`/api/medicines/smart-search?q=${encodeURIComponent(debouncedQuery.trim())}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setSuggestions(data.suggestions ?? []);
        setDropdownOpen((data.suggestions ?? []).length > 0);
        setHighlightedIndex(-1);
      })
      .catch(() => {
        if (!cancelled) setSuggestions([]);
      })
      .finally(() => {
        if (!cancelled) setSuggestLoading(false);
      });

    return () => { cancelled = true; };
  }, [debouncedQuery]);

  // ── On mount: run search if ?q= param present ─────────────────────────────
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setQuery(q);
      handleSearch(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Full search (standard ilike) ─────────────────────────────────────────
  const handleSearch = useCallback(async (searchQuery?: string) => {
    const q = searchQuery ?? query;
    if (!q.trim() && selectedCategory === "All") return;

    setDropdownOpen(false);
    setLoading(true);
    setSearched(true);
    setSelectedMedicine(null);
    setAlternatives(null);
    setParsedQuery(null);

    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (selectedCategory !== "All") params.set("category", selectedCategory);

      const res = await fetch(`/api/medicines/search?${params}`);

      // SAFETY CHECK: Prevent parsing if server crashed
      if (!res.ok) {
        console.error("Search failed:", await res.text());
        setResults([]);
        return;
      }

      const data = await res.json();
      setResults(data.medicines ?? []);
    } catch (err) {
      console.error("Connection error:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query, selectedCategory]);

  // ── NLP search — parses natural language then searches ───────────────────
  const handleNlpSearch = useCallback(async () => {
    if (!query.trim()) return;

    setDropdownOpen(false);
    setLoading(true);
    setSearched(true);
    setSelectedMedicine(null);
    setAlternatives(null);

    try {
      const res = await fetch(
        `/api/medicines/nlp-search?q=${encodeURIComponent(query.trim())}`
      );
      const data = await res.json();
      setResults(data.medicines ?? []);
      setParsedQuery(data.parsed_query ?? null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [query]);

  // ── Suggestion selected from dropdown ────────────────────────────────────
  const handleSuggestionSelect = (suggestion: Suggestion) => {
    setQuery(suggestion.brand_name);
    setDropdownOpen(false);
    setSuggestions([]);
    handleSearch(suggestion.brand_name);
  };

  // ── Keyboard navigation inside dropdown ──────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!dropdownOpen || suggestions.length === 0) {
      if (e.key === "Enter") handleSearch();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0) {
        handleSuggestionSelect(suggestions[highlightedIndex]);
      } else {
        handleSearch();
      }
    } else if (e.key === "Escape") {
      setDropdownOpen(false);
      setHighlightedIndex(-1);
    }
  };

  // ── Find alternatives ─────────────────────────────────────────────────────
  const handleFindAlternatives = async (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setAltLoading(true);
    try {
      const res = await fetch(`/api/medicines/${medicine.id}/alternatives`);

      // SAFETY CHECK: Stop the "Unexpected token <" error
      if (!res.ok) {
        console.error("Alternatives fetch failed:", await res.text());
        setAlternatives(null);
        return;
      }

      const data = await res.json();
      setAlternatives(data);
    } catch (err) {
      console.error("Network error:", err);
    } finally {
      setAltLoading(false);
    }
  };

  // ── Prescription upload (mock) ────────────────────────────────────────────
  const handleUpload = async () => {
    setShowUploadModal(false);
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch("/api/medicines/scan-prescription", { method: "POST" });
      const data = await res.json();
      if (data.detected_medicines?.length > 0) {
        const name = data.detected_medicines[0].name;
        setQuery(name);
        const searchRes = await fetch(`/api/medicines/search?q=${name}`);
        const searchData = await searchRes.json();
        setResults(searchData.medicines ?? []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── Score badge colour ────────────────────────────────────────────────────
  const scoreBadgeClass = (score: number) =>
    score >= 90
      ? "bg-emerald-50 text-emerald-600"
      : score >= 75
        ? "bg-cyan-50 text-cyan-600"
        : "bg-gray-50 text-gray-500";

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* ── Search Card ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-visible">
        {/* Input row */}
        <div className="flex items-center gap-3 p-5 relative" ref={dropdownRef}>
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />

          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => suggestions.length > 0 && setDropdownOpen(true)}
              placeholder="Search by medicine name, salt, or describe your need…"
              className="w-full bg-transparent border-none outline-none text-gray-800 placeholder:text-gray-400"
              autoComplete="off"
            />

            {/* ── Autocomplete Dropdown ── */}
            <AnimatePresence>
              {dropdownOpen && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
                  style={{ minWidth: "100%" }}
                >
                  <div className="px-3 py-2 border-b border-gray-50 flex items-center justify-between">
                    <span className="text-xs text-gray-400 uppercase tracking-wide">
                      Suggestions
                    </span>
                    {suggestLoading && (
                      <Loader2 className="w-3 h-3 text-cyan-400 animate-spin" />
                    )}
                  </div>

                  {suggestions.map((s, i) => (
                    <motion.button
                      key={s.id}
                      onMouseDown={(e) => {
                        e.preventDefault(); // prevent input blur before click fires
                        handleSuggestionSelect(s);
                      }}
                      onMouseEnter={() => setHighlightedIndex(i)}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors
                        ${highlightedIndex === i
                          ? "bg-cyan-50"
                          : "hover:bg-gray-50"
                        }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Pill className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                        <span className="text-sm text-gray-700 truncate">
                          {/* Highlight matching portion */}
                          {highlightMatch(s.brand_name, query)}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${scoreBadgeClass(
                          s.score
                        )}`}
                      >
                        {s.score}%
                      </span>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Spinner while fetching suggestions */}
          {suggestLoading && !dropdownOpen && (
            <Loader2 className="w-4 h-4 text-cyan-400 animate-spin flex-shrink-0" />
          )}

          {query && !suggestLoading && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults([]);
                setSearched(false);
                setSuggestions([]);
                setDropdownOpen(false);
                setParsedQuery(null);
              }}
            >
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Action row */}
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

          {/* NLP Smart Search */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleNlpSearch}
            title="Describe your need in plain English — AI will extract the medicine name"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-50 text-violet-700 hover:bg-violet-100 transition-colors text-sm border border-violet-100"
          >
            <Sparkles className="w-4 h-4" />
            Smart Search
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${showFilters
                ? "bg-cyan-50 text-cyan-700"
                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown
              className={`w-3 h-3 transition-transform ${showFilters ? "rotate-180" : ""
                }`}
            />
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleSearch()}
            className="ml-auto px-8 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-md shadow-cyan-500/25 hover:shadow-lg hover:shadow-cyan-500/30 transition-all text-sm"
          >
            Search
          </motion.button>
        </div>

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
                    className={`px-4 py-2 rounded-full text-sm transition-all ${selectedCategory === cat
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

      {/* ── NLP parsed-query banner ── */}
      <AnimatePresence>
        {parsedQuery && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-50 border border-violet-100 text-sm text-violet-700"
          >
            <Sparkles className="w-4 h-4 flex-shrink-0" />
            <span>
              AI extracted: <strong>"{parsedQuery}"</strong> from your query
            </span>
            <button
              className="ml-auto text-violet-400 hover:text-violet-600"
              onClick={() => setParsedQuery(null)}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Loading spinner ── */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-[3px] border-cyan-500 border-t-transparent rounded-full"
          />
        </div>
      )}

      {/* ── Results grid ── */}
      {!loading && searched && !selectedMedicine && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Found{" "}
              <span className="text-gray-800 font-medium">{results.length}</span>{" "}
              medicines
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
              <p className="text-sm text-gray-400">
                Try a different search term or category
              </p>
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
                        <h3 className="text-base text-gray-800 truncate">
                          {medicine.brand_name}
                        </h3>
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
                    <div className="flex items-start gap-2 mb-2">
                      <Pill className="w-4 h-4 text-cyan-500 mt-0.5 flex-shrink-0" />
                      <div className="flex flex-wrap gap-1.5">
                        {medicine.salt_composition?.split(/[+,]/).map((salt, idx) => (
                          salt.trim() && (
                            <span key={idx} className="px-2 py-1 bg-cyan-50 text-cyan-700 text-[11px] font-medium rounded-md border border-cyan-100">
                              {salt.trim()}
                            </span>
                          )
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-gray-600">
                        {medicine.dosage_form} • {medicine.strength} •{" "}
                        {medicine.pack_size}
                      </span>
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
                      <span className="text-xs text-cyan-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Find Alternatives <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Alternatives Panel ── */}
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
                  <span className="text-cyan-600">
                    {selectedMedicine.brand_name}
                  </span>
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedMedicine.salt_composition} •{" "}
                  {selectedMedicine.strength}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => {
                  setSelectedMedicine(null);
                  setAlternatives(null);
                }}
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
                  className="w-8 h-8 border-[3px] border-cyan-500 border-t-transparent rounded-full"
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
                          <div className="flex flex-wrap gap-1 mb-3 pt-2 border-t border-gray-50/50">
                            {alt.salt_composition?.split(/[+,]/).map((salt, idx) => (
                              salt.trim() && (
                                <span key={idx} className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-medium rounded border border-emerald-100/50">
                                  {salt.trim()}
                                </span>
                              )
                            ))}
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                            <div>
                              <span className="text-xl text-gray-800">₹{alt.price}</span>
                              <span className="text-xs text-gray-500 ml-1">
                                / {alt.pack_size}
                              </span>
                            </div>
                            {alt.savings_percent > 0 && (
                              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50">
                                <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-xs text-emerald-700">
                                  Save {alt.savings_percent}%
                                </span>
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
                          <div className="flex flex-wrap gap-1 mb-3 pt-2 border-t border-gray-50/50">
                            {alt.salt_composition?.split(/[+,]/).map((salt, idx) => (
                              salt.trim() && (
                                <span key={idx} className="px-1.5 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-medium rounded border border-amber-100/50">
                                  {salt.trim()}
                                </span>
                              )
                            ))}
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                            <div>
                              <span className="text-xl text-gray-800">₹{alt.price}</span>
                            </div>
                            {alt.savings_percent > 0 && (
                              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50">
                                <TrendingDown className="w-3.5 h-3.5 text-amber-600" />
                                <span className="text-xs text-amber-700">
                                  Save {alt.savings_percent}%
                                </span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {alternatives.exact_matches.length === 0 &&
                  alternatives.similar_matches.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                      <Pill className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg text-gray-600 mb-2">
                        No alternatives found
                      </h3>
                      <p className="text-sm text-gray-400">
                        This medicine has no registered alternatives in our database
                      </p>
                    </div>
                  )}
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Upload Modal ── */}
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
                Upload a photo of your prescription or medicine package. Our
                system will extract medicine information automatically.
              </p>
              <div
                className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-cyan-300 transition-colors cursor-pointer mb-6"
                onClick={handleUpload}
              >
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-1">
                  Click to upload or drag & drop
                </p>
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

      {/* ── Initial empty state ── */}
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
            Type a medicine name and pick from the smart dropdown, or describe
            your need and hit <strong>Smart Search</strong> to let AI extract it.
          </p>

          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {QUICK_SUGGESTIONS.map((suggestion) => (
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

// ─── Helper: highlight the typed substring inside a suggestion label ──────────
function highlightMatch(text: string, query: string) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <span className="text-cyan-600 font-medium">
        {text.slice(idx, idx + query.length)}
      </span>
      {text.slice(idx + query.length)}
    </>
  );
}
