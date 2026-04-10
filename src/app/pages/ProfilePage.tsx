import { motion } from "motion/react";
import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Bell,
  Moon,
  Globe,
  Save,
  CheckCircle2,
  Heart,
  Clock,
  TrendingDown,
} from "lucide-react";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: "Aditya",
    email: "aditya@example.com",
    phone: "+91 98765 43210",
    location: "Gurugram, Haryana",
  });
  const [notifications, setNotifications] = useState({
    priceAlerts: true,
    stockUpdates: true,
    newAlternatives: false,
    weeklyDigest: true,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const savedMedicines = [
    { name: "Dolo 650", generic: "Paracetamol", savings: "₹12 saved" },
    { name: "Azee 500", generic: "Azithromycin", savings: "₹18 saved" },
    { name: "Pan 40", generic: "Pantoprazole", savings: "₹35 saved" },
    { name: "Glimy M", generic: "Metformin + Glimepiride", savings: "₹40 saved" },
  ];

  const recentActivity = [
    { action: "Searched for", item: "Paracetamol", time: "2 hours ago" },
    { action: "Compared prices for", item: "Azithral 500", time: "5 hours ago" },
    { action: "Viewed alternatives for", item: "Combiflam", time: "1 day ago" },
    { action: "Reviewed", item: "Pantocid", time: "2 days ago" },
    { action: "Found pharmacy for", item: "Augmentin 625", time: "3 days ago" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <span className="text-3xl text-white">A</span>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl text-gray-800 mb-1">{profile.name}</h2>
            <p className="text-gray-500">Premium Member since April 2026</p>
            <div className="flex items-center gap-4 mt-3">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs">
                <Shield className="w-3.5 h-3.5" />
                Verified Account
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs">
                <TrendingDown className="w-3.5 h-3.5" />
                ₹105 Saved Total
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg text-gray-800 mb-6">Personal Information</h3>

          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-500 mb-1.5">
                <User className="w-4 h-4" /> Full Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm text-gray-500 mb-1.5">
                <Mail className="w-4 h-4" /> Email
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm text-gray-500 mb-1.5">
                <Phone className="w-4 h-4" /> Phone
              </label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm text-gray-500 mb-1.5">
                <MapPin className="w-4 h-4" /> Location
              </label>
              <input
                type="text"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all ${
                saved
                  ? "bg-emerald-500 text-white"
                  : "bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-md shadow-cyan-500/25"
              }`}
            >
              {saved ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Saved Successfully!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Notification Preferences */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg text-gray-800 mb-6">Notification Preferences</h3>

          <div className="space-y-5">
            {[
              {
                key: "priceAlerts" as const,
                icon: TrendingDown,
                label: "Price Drop Alerts",
                desc: "Get notified when medicine prices drop",
              },
              {
                key: "stockUpdates" as const,
                icon: Bell,
                label: "Stock Updates",
                desc: "Alerts when out-of-stock medicines become available",
              },
              {
                key: "newAlternatives" as const,
                icon: Heart,
                label: "New Alternatives",
                desc: "Notifications about new affordable alternatives",
              },
              {
                key: "weeklyDigest" as const,
                icon: Globe,
                label: "Weekly Digest",
                desc: "Weekly summary of savings and recommendations",
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-cyan-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
                <button
                  onClick={() =>
                    setNotifications((prev) => ({ ...prev, [item.key]: !prev[item.key] }))
                  }
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    notifications[item.key] ? "bg-cyan-500" : "bg-gray-200"
                  }`}
                >
                  <motion.div
                    animate={{ x: notifications[item.key] ? 20 : 2 }}
                    className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                  />
                </button>
              </div>
            ))}
          </div>

          {/* Theme Toggle */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
                <Moon className="w-5 h-5 text-violet-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-800">Dark Mode</p>
                <p className="text-xs text-gray-500">Coming soon</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-xs">Soon</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Saved Medicines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg text-gray-800 mb-4">Saved Medicines</h3>
          <div className="space-y-3">
            {savedMedicines.map((med, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-4 h-4 text-pink-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800">{med.name}</p>
                  <p className="text-xs text-gray-500">{med.generic}</p>
                </div>
                <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{med.savings}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-cyan-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700">
                    {activity.action} <span className="text-gray-800 font-medium">{activity.item}</span>
                  </p>
                  <p className="text-xs text-gray-400">{activity.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
