import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import {
  Search,
  TrendingDown,
  ArrowRight,
  DollarSign,
  BarChart3,
  CheckCircle2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
} from "recharts";

interface Medicine {
  id: number;
  brand_name: string;
  generic_name: string;
  price: number;
  salt_composition: string;
}

interface PriceData {
  name: string;
  price: number;
  type: string;
  manufacturer: string;
  price_per_unit: number;
}

interface PharmacyPrice {
  pharmacy_name: string;
  price: number;
  address: string;
}

interface CompareData {
  medicine: Medicine;
  alternatives_comparison: PriceData[];
  pharmacy_prices: PharmacyPrice[];
  cheapest: PriceData | null;
  most_expensive: PriceData | null;
  potential_savings: number;
}

export default function PriceCompare() {
  const [searchQuery, setSearchQuery] = useState("");
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [compareData, setCompareData] = useState<CompareData | null>(null);
  const [loading, setLoading] = useState(false);

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
    setLoading(true);

    try {
      const res = await fetch(`/api/prices/compare?medicine_id=${medicine.id}`);
      const data = await res.json();
      setCompareData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getBarColor = (type: string) => {
    switch (type) {
      case "original": return "#ef4444";
      case "generic": return "#06b6d4";
      default: return "#0e7490";
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
      {/* Search Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg text-gray-800 mb-1">Compare Prices</h3>
        <p className="text-sm text-gray-500 mb-4">
          Select a medicine to compare prices across brands and pharmacies
        </p>

        <div className="relative">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-100 transition-all">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => medicines.length > 0 && setShowDropdown(true)}
              placeholder="Search for a medicine to compare prices..."
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
                    <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center flex-shrink-0">
                      <BarChart3 className="w-4 h-4 text-cyan-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-800">{med.brand_name}</p>
                      <p className="text-xs text-gray-500">{med.generic_name} • ₹{med.price}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick suggestions */}
        {!selectedMedicine && (
          <div className="flex flex-wrap gap-2 mt-4">
            {["Crocin Advance", "Combiflam", "Azithral 500", "Pantocid", "Augmentin 625"].map((name) => (
              <motion.button
                key={name}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSearchQuery(name);
                }}
                className="px-3 py-1.5 rounded-full bg-gray-100 text-xs text-gray-600 hover:bg-cyan-50 hover:text-cyan-700 transition-colors"
              >
                {name}
              </motion.button>
            ))}
          </div>
        )}
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

      {/* Comparison Results */}
      {!loading && compareData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-red-500" />
                </div>
                <span className="text-sm text-gray-500">Most Expensive</span>
              </div>
              <p className="text-2xl text-gray-800">₹{compareData.most_expensive?.price || 0}</p>
              <p className="text-xs text-gray-500 mt-1">{compareData.most_expensive?.name}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <span className="text-sm text-gray-500">Cheapest Option</span>
              </div>
              <p className="text-2xl text-emerald-600">₹{compareData.cheapest?.price || 0}</p>
              <p className="text-xs text-gray-500 mt-1">{compareData.cheapest?.name}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-cyan-500 to-teal-500 rounded-2xl p-5 shadow-md"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm text-white/80">Potential Savings</span>
              </div>
              <p className="text-2xl text-white">₹{compareData.potential_savings}</p>
              <p className="text-xs text-white/70 mt-1">By switching to the cheapest alternative</p>
            </motion.div>
          </div>

          {/* Brand Price Chart */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <h3 className="text-lg text-gray-800 mb-1">Brand Comparison</h3>
            <p className="text-sm text-gray-500 mb-6">
              Price comparison across brands with the same composition
            </p>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={compareData.alternatives_comparison} margin={{ top: 10, right: 10, left: -10, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    angle={-20}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
                    }}
                    formatter={(value: number) => [`₹${value}`, "Price"]}
                  />
                  <Bar dataKey="price" radius={[8, 8, 0, 0]} maxBarSize={60}>
                    {compareData.alternatives_comparison.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(entry.type)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-500" />
                <span className="text-xs text-gray-500">Selected Brand</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-cyan-500" />
                <span className="text-xs text-gray-500">Generic/Affordable</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-cyan-700" />
                <span className="text-xs text-gray-500">Other Alternatives</span>
              </div>
            </div>
          </motion.div>

          {/* Pharmacy Prices */}
          {compareData.pharmacy_prices.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <h3 className="text-lg text-gray-800 mb-1">Pharmacy Prices</h3>
              <p className="text-sm text-gray-500 mb-6">
                Price of {selectedMedicine?.brand_name} at nearby pharmacies
              </p>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={compareData.pharmacy_prices} margin={{ top: 10, right: 30, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="pharmacy_name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
                      }}
                      formatter={(value: number) => [`₹${value}`, "Price"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#06b6d4"
                      strokeWidth={3}
                      dot={{ r: 6, fill: "#06b6d4", stroke: "#fff", strokeWidth: 2 }}
                      activeDot={{ r: 8, fill: "#0e7490" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Table view */}
              <div className="mt-6 border border-gray-100 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-4 py-3 text-gray-500 font-medium">Pharmacy</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-medium">Address</th>
                      <th className="text-right px-4 py-3 text-gray-500 font-medium">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compareData.pharmacy_prices.map((pp, index) => (
                      <tr key={index} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-800">{pp.pharmacy_name}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{pp.address}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`font-medium ${
                            pp.price === Math.min(...compareData.pharmacy_prices.map((p) => p.price))
                              ? "text-emerald-600"
                              : "text-gray-800"
                          }`}>
                            ₹{pp.price}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Detailed Comparison Table */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <h3 className="text-lg text-gray-800 mb-1">Detailed Comparison</h3>
            <p className="text-sm text-gray-500 mb-6">Side-by-side brand comparison</p>

            <div className="border border-gray-100 rounded-xl overflow-hidden overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Brand</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Manufacturer</th>
                    <th className="text-right px-4 py-3 text-gray-500 font-medium">Pack Price</th>
                    <th className="text-right px-4 py-3 text-gray-500 font-medium">Per Unit</th>
                    <th className="text-right px-4 py-3 text-gray-500 font-medium">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {compareData.alternatives_comparison.map((alt, index) => (
                    <tr key={index} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-800">{alt.name}</span>
                          {alt.price === Math.min(...compareData.alternatives_comparison.map((a) => a.price)) && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs">Best</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{alt.manufacturer}</td>
                      <td className="px-4 py-3 text-right text-gray-800">₹{alt.price}</td>
                      <td className="px-4 py-3 text-right text-gray-600">₹{alt.price_per_unit}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          alt.type === "original"
                            ? "bg-red-50 text-red-700"
                            : alt.type === "generic"
                            ? "bg-cyan-50 text-cyan-700"
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          {alt.type === "original" ? "Original" : alt.type === "generic" ? "Generic" : "Alternative"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Empty state */}
      {!loading && !compareData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <BarChart3 className="w-16 h-16 text-gray-200 mx-auto mb-6" />
          </motion.div>
          <h3 className="text-xl text-gray-600 mb-2">Compare Medicine Prices</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Search for any medicine to see price comparisons across brands and nearby pharmacies
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
