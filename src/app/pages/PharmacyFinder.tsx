import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import {
  MapPin,
  Navigation,
  Clock,
  Phone,
  Search,
  CheckCircle2,
  XCircle,
  Star,
  MessageSquare,
  Send,
  ExternalLink,
} from "lucide-react";

interface Medicine {
  id: number;
  brand_name: string;
  generic_name: string;
  price: number;
}

interface Pharmacy {
  id: number;
  name: string;
  address: string;
  phone: string;
  open_time: string;
  rating: number;
  distance: string;
  distance_value: number;
  in_stock: boolean;
  medicine_price: number;
}

export default function PharmacyFinder() {
  const [searchQuery, setSearchQuery] = useState("");
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(false);
  const [showMedicineDropdown, setShowMedicineDropdown] = useState(false);
  const [requestSent, setRequestSent] = useState<Record<number, boolean>>({});
  const [requestMessages, setRequestMessages] = useState<Record<number, string>>({});

  // Search medicines for dropdown
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
        setShowMedicineDropdown(true);
      } catch (err) {
        console.error(err);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectMedicine = async (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setSearchQuery(medicine.brand_name);
    setShowMedicineDropdown(false);
    setLoading(true);

    try {
      const res = await fetch(`/api/pharmacies/nearby?medicine_id=${medicine.id}`);
      const data = await res.json();
      setPharmacies(data.pharmacies);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (pharmacy: Pharmacy) => {
    if (!selectedMedicine) return;
    try {
      const res = await fetch("/api/shopkeeper/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pharmacy_id: pharmacy.id,
          medicine_id: selectedMedicine.id,
        }),
      });
      const data = await res.json();
      setRequestSent((prev) => ({ ...prev, [pharmacy.id]: true }));
      setRequestMessages((prev) => ({
        ...prev,
        [pharmacy.id]: data.message,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const loadAllPharmacies = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pharmacies/nearby");
      const data = await res.json();
      setPharmacies(data.pharmacies);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllPharmacies();
  }, []);

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
        <h3 className="text-lg text-gray-800 mb-1">Find Pharmacies</h3>
        <p className="text-sm text-gray-500 mb-4">Select a medicine to check availability at nearby pharmacies</p>

        <div className="relative">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-100 transition-all">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => medicines.length > 0 && setShowMedicineDropdown(true)}
              placeholder="Search medicine to check availability..."
              className="flex-1 bg-transparent border-none outline-none text-gray-800 placeholder:text-gray-400"
            />
          </div>

          {/* Medicine dropdown */}
          <AnimatePresence>
            {showMedicineDropdown && medicines.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-20 max-h-64 overflow-y-auto"
              >
                {medicines.map((med) => (
                  <button
                    key={med.id}
                    onClick={() => handleSelectMedicine(med)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-cyan-50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-cyan-600" />
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

        {selectedMedicine && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center gap-3 p-3 bg-cyan-50 rounded-xl border border-cyan-100"
          >
            <CheckCircle2 className="w-5 h-5 text-cyan-600" />
            <div>
              <p className="text-sm text-cyan-800">
                Showing availability for <strong>{selectedMedicine.brand_name}</strong>
              </p>
              <p className="text-xs text-cyan-600">{selectedMedicine.generic_name} • MRP ₹{selectedMedicine.price}</p>
            </div>
          </motion.div>
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

      {/* Pharmacy List */}
      {!loading && pharmacies.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              <span className="text-gray-800 font-medium">{pharmacies.length}</span> pharmacies nearby
              {selectedMedicine && (
                <span>
                  {" "}• <span className="text-emerald-600">{pharmacies.filter((p) => p.in_stock).length}</span> have stock
                </span>
              )}
            </p>
          </div>

          <div className="grid gap-4">
            {pharmacies.map((pharmacy, index) => (
              <motion.div
                key={pharmacy.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                whileHover={{ y: -2 }}
                className={`bg-white rounded-2xl p-6 shadow-sm border transition-all ${
                  selectedMedicine
                    ? pharmacy.in_stock
                      ? "border-emerald-100 hover:border-emerald-300"
                      : "border-red-100 hover:border-red-200 opacity-75"
                    : "border-gray-100 hover:border-cyan-200"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base text-gray-800">{pharmacy.name}</h3>
                      {selectedMedicine && (
                        pharmacy.in_stock ? (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs">
                            <CheckCircle2 className="w-3 h-3" /> In Stock
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-xs">
                            <XCircle className="w-3 h-3" /> Out of Stock
                          </span>
                        )
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{pharmacy.address}</p>
                  </div>

                  <div className="text-right">
                    {selectedMedicine && pharmacy.in_stock && (
                      <div className="text-xl text-gray-800 mb-1">₹{pharmacy.medicine_price}</div>
                    )}
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-sm text-gray-600">{pharmacy.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Navigation className="w-4 h-4 text-cyan-600" />
                    <span>{pharmacy.distance}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-cyan-600" />
                    <span>{pharmacy.open_time}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-cyan-600" />
                    <span>{pharmacy.phone}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <motion.a
                    href={`https://www.google.com/maps/search/${encodeURIComponent(pharmacy.name + " " + pharmacy.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Get Directions
                  </motion.a>

                  <motion.a
                    href={`tel:${pharmacy.phone}`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors text-sm"
                  >
                    <Phone className="w-4 h-4" />
                    Call
                  </motion.a>

                  {selectedMedicine && !pharmacy.in_stock && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSendRequest(pharmacy)}
                      disabled={requestSent[pharmacy.id]}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ml-auto transition-all ${
                        requestSent[pharmacy.id]
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-cyan-500 text-white shadow-md hover:shadow-lg"
                      }`}
                    >
                      {requestSent[pharmacy.id] ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Request Sent
                        </>
                      ) : (
                        <>
                          <MessageSquare className="w-4 h-4" />
                          Request Stock
                        </>
                      )}
                    </motion.button>
                  )}

                  {selectedMedicine && pharmacy.in_stock && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSendRequest(pharmacy)}
                      disabled={requestSent[pharmacy.id]}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ml-auto transition-all ${
                        requestSent[pharmacy.id]
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-md hover:shadow-lg"
                      }`}
                    >
                      {requestSent[pharmacy.id] ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Reserved
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Reserve Medicine
                        </>
                      )}
                    </motion.button>
                  )}
                </div>

                {/* Request confirmation message */}
                <AnimatePresence>
                  {requestMessages[pharmacy.id] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 p-3 rounded-lg bg-cyan-50 border border-cyan-100 text-sm text-cyan-700"
                    >
                      {requestMessages[pharmacy.id]}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
