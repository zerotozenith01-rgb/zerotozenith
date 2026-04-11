import { useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "./AuthContext";
import {
  LayoutDashboard,
  Search,
  MapPin,
  BarChart3,
  Star,
  User,
  ChevronLeft,
  ChevronRight,
  Pill,
  LogOut,
  Bell,
  Menu,
} from "lucide-react";
import DashboardHome from "./pages/DashboardHome";
import SearchMedicine from "./pages/SearchMedicine";
import PharmacyFinder from "./pages/PharmacyFinder";
import PriceCompare from "./pages/PriceCompare";
import ReviewsPage from "./pages/ReviewsPage";
import ProfilePage from "./pages/ProfilePage";

const navItems = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Overview", exact: true },
  { path: "/dashboard/search", icon: Search, label: "Search Medicine" },
  { path: "/dashboard/pharmacies", icon: MapPin, label: "Nearby Pharmacies" },
  { path: "/dashboard/prices", icon: BarChart3, label: "Price Compare" },
  { path: "/dashboard/reviews", icon: Star, label: "Reviews" },
  { path: "/dashboard/profile", icon: User, label: "Profile" },
];

export default function Dashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-[#f0f4f8] overflow-hidden">
      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed lg:relative z-50 h-full flex flex-col
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          transition-transform lg:transition-none duration-300`}
        style={{
          background: "linear-gradient(180deg, #0c4a6e 0%, #0e7490 50%, #0891b2 100%)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-6 border-b border-white/10">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
            className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0"
          >
            <Pill className="w-5 h-5 text-white" />
          </motion.div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="text-white text-lg leading-tight">SmartMeds</h1>
                <p className="text-cyan-200 text-xs">Smart Medicine Platform</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.path, item.exact);
            return (
              <motion.button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group
                  ${active
                    ? "bg-white/20 text-white shadow-lg shadow-black/10 backdrop-blur-sm"
                    : "text-cyan-100 hover:bg-white/10 hover:text-white"
                  }`}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${active ? "text-cyan-300" : ""}`} />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="text-sm whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {active && !sidebarCollapsed && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-300"
                  />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="px-3 py-4 border-t border-white/10 space-y-1">
          {user && (
            <motion.button
              onClick={handleLogout}
              whileHover={{ x: 4 }}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-200 hover:bg-red-500/20 hover:text-white transition-all"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="text-sm">Sign Out</span>}
            </motion.button>
          )}
          <motion.button
            onClick={() => navigate("/")}
            whileHover={{ x: 4 }}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-cyan-200 hover:bg-white/10 hover:text-white transition-all"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="text-sm">Back to Home</span>}
          </motion.button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white shadow-lg items-center justify-center hover:bg-cyan-50 transition-colors z-10"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-3 h-3 text-cyan-700" />
          ) : (
            <ChevronLeft className="w-3 h-3 text-cyan-700" />
          )}
        </button>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60 px-6 py-4 flex items-center justify-between z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h2 className="text-lg text-gray-800">
                {navItems.find((item) =>
                  item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path) && !item.exact
                )?.label || "Dashboard"}
              </h2>
              <p className="text-xs text-gray-500">
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <Bell className="w-5 h-5 text-gray-600" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-500" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={() => navigate("/dashboard/profile")}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
                      <span className="text-white text-sm">{user.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.role === "vendor" ? "Vendor" : "Premium User"}</p>
                    </div>
                  </motion.button>
                </>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/login")}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white text-sm font-medium shadow-md"
                >
                  Log In
                </motion.button>
              )}
            </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
            <AnimatePresence mode="wait">
              <Routes>
                <Route index element={<DashboardHome />} />
                <Route path="search" element={<SearchMedicine />} />
                <Route path="pharmacies" element={<PharmacyFinder />} />
                <Route path="prices" element={<PriceCompare />} />
                <Route path="reviews" element={<ReviewsPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Routes>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
