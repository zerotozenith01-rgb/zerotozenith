import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Pill,
  TrendingDown,
  MapPin,
  Star,
  Search,
  ArrowRight,
  Clock,
  Sparkles,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Stats {
  total_medicines: number;
  total_pharmacies: number;
  total_reviews: number;
  average_savings: number;
  categories: { name: string; count: number; avg_price: number }[];
  recent_searches: { query: string; timestamp: string; results_count: number }[];
  top_savings: {
    expensive_brand: string;
    cheapest_brand: string;
    savings_percent: number;
    savings_amount: number;
    salt_composition: string;
  }[];
}

const CHART_COLORS = ["#06b6d4", "#0e7490", "#14b8a6", "#0891b2", "#22d3ee", "#2dd4bf", "#67e8f9"];

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);
  return <>{count}{suffix}</>;
}

export default function DashboardHome() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const statCards = [
    {
      icon: Pill,
      label: "Total Medicines",
      value: stats?.total_medicines || 0,
      suffix: "",
      color: "from-cyan-500 to-cyan-600",
      bgLight: "bg-cyan-50",
      textColor: "text-cyan-700",
    },
    {
      icon: TrendingDown,
      label: "Avg Savings",
      value: stats?.average_savings || 0,
      suffix: "%",
      color: "from-emerald-500 to-emerald-600",
      bgLight: "bg-emerald-50",
      textColor: "text-emerald-700",
    },
    {
      icon: MapPin,
      label: "Partner Pharmacies",
      value: stats?.total_pharmacies || 0,
      suffix: "",
      color: "from-violet-500 to-violet-600",
      bgLight: "bg-violet-50",
      textColor: "text-violet-700",
    },
    {
      icon: Star,
      label: "User Reviews",
      value: stats?.total_reviews || 0,
      suffix: "",
      color: "from-amber-500 to-amber-600",
      bgLight: "bg-amber-50",
      textColor: "text-amber-700",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-8"
        style={{
          background: "linear-gradient(135deg, #0e7490 0%, #0891b2 50%, #14b8a6 100%)",
        }}
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-cyan-200" />
            <span className="text-cyan-100 text-sm">Welcome back!</span>
          </div>
          <h1 className="text-3xl text-white mb-2">Find Affordable Medicines</h1>
          <p className="text-cyan-100 max-w-xl mb-6">
            Search for any medicine to discover safe, verified alternatives with identical compositions.
            Save up to 70% on your medical expenses.
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/dashboard/search")}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-cyan-700 shadow-lg hover:shadow-xl transition-all"
          >
            <Search className="w-4 h-4" />
            Search Medicines
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 right-20 w-40 h-40 rounded-full bg-white/5 translate-y-1/2" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-8 right-8 w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-sm hidden md:flex items-center justify-center"
        >
          <Pill className="w-10 h-10 text-white/50" />
        </motion.div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md border border-gray-100 transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${stat.bgLight} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
              <div className={`px-2.5 py-1 rounded-full bg-gradient-to-r ${stat.color}`}>
                <span className="text-xs text-white">Live</span>
              </div>
            </div>
            <div className="text-3xl text-gray-900 mb-1">
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
            </div>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg text-gray-800 mb-1">Medicines by Category</h3>
          <p className="text-sm text-gray-500 mb-6">Distribution across categories</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.categories || []} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={50}>
                  {(stats?.categories || []).map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Category Pie Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg text-gray-800 mb-1">Average Price by Category</h3>
          <p className="text-sm text-gray-500 mb-6">Average medicine prices (₹)</p>
          <div className="h-72 flex items-center">
            <ResponsiveContainer width="50%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.categories || []}
                  dataKey="avg_price"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {(stats?.categories || []).map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`₹${value.toFixed(0)}`, "Avg Price"]}
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {(stats?.categories || []).map((cat, index) => (
                <div key={cat.name} className="flex items-center gap-2 text-sm">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                  />
                  <span className="text-gray-600 truncate">{cat.name}</span>
                  <span className="ml-auto text-gray-800">₹{cat.avg_price}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Savings Opportunities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg text-gray-800">Top Savings Opportunities</h3>
              <p className="text-sm text-gray-500">Switch to affordable alternatives</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate("/dashboard/search")}
              className="text-sm text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3" />
            </motion.button>
          </div>

          <div className="space-y-4">
            {(stats?.top_savings || []).map((saving, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ x: 4 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-emerald-50/30 border border-gray-100 hover:border-emerald-200 transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <TrendingDown className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-gray-800 truncate">{saving.expensive_brand}</span>
                    <ArrowRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-emerald-700 truncate">{saving.cheapest_brand}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{saving.salt_composition}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-lg text-emerald-600">{saving.savings_percent}%</div>
                  <div className="text-xs text-gray-500">₹{saving.savings_amount} saved</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Searches */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg text-gray-800">Recent Searches</h3>
              <p className="text-sm text-gray-500">Your search history</p>
            </div>
          </div>

          <div className="space-y-3">
            {(stats?.recent_searches || []).map((search, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ x: 4 }}
                onClick={() => navigate(`/dashboard/search?q=${search.query}`)}
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-cyan-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 capitalize">{search.query}</p>
                  <p className="text-xs text-gray-500">
                    {search.results_count} results •{" "}
                    {new Date(search.timestamp).toLocaleString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </div>

          {/* Quick Search */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/dashboard/search")}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/30 transition-all"
            >
              <Search className="w-4 h-4" />
              Start New Search
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
