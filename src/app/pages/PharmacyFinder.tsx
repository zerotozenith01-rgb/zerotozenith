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
  Locate,
  Map as MapIcon,
  List,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icons (broken by bundlers)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const userIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});
const pharmacyInStockIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});
const pharmacyOutStockIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});
const pharmacyDefaultIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

interface Medicine { id: number; brand_name: string; generic_name: string; price: number; }
interface Pharmacy {
  id: number; name: string; address: string; phone: string; open_time: string;
  rating: number; distance: string; distance_value: number;
  in_stock: boolean; medicine_price: number; latitude: number; longitude: number;
}

function FlyToLocation({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) {
  const map = useMap();
  useEffect(() => { map.flyTo([lat, lng], zoom, { duration: 1.2 }); }, [lat, lng, zoom, map]);
  return null;
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
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number; zoom: number } | null>(null);
  const [highlightedPharmacy, setHighlightedPharmacy] = useState<number | null>(null);

  // Default center — Mohanpur, Jamshedpur
  const DEFAULT_CENTER: [number, number] = [22.7765, 86.1447];

  const getUserLocation = () => {
    setLocating(true);
    setLocationError("");
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported by your browser");
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setFlyTarget({ ...loc, zoom: 14 });
        setLocating(false);
        loadPharmacies(null, loc.lat, loc.lng);
      },
      (err) => {
        setLocationError(err.code === 1 ? "Location denied. Using Mohanpur default." : "Unable to locate. Using Mohanpur default.");
        setLocating(false);
        // Use default location
        setUserLocation({ lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1] });
        loadPharmacies(null, DEFAULT_CENTER[0], DEFAULT_CENTER[1]);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const loadPharmacies = async (medicineId?: string | null, lat?: number, lng?: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (medicineId) params.set("medicine_id", medicineId);
      const uLat = lat ?? userLocation?.lat;
      const uLng = lng ?? userLocation?.lng;
      if (uLat) params.set("lat", String(uLat));
      if (uLng) params.set("lng", String(uLng));
      const res = await fetch(`/api/pharmacies/nearby?${params}`);
      const data = await res.json();
      setPharmacies(data.pharmacies);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (searchQuery.length < 2) { setMedicines([]); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/medicines/search?q=${searchQuery}`);
        const data = await res.json();
        setMedicines(data.medicines);
        setShowMedicineDropdown(true);
      } catch (err) { console.error(err); }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectMedicine = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setSearchQuery(medicine.brand_name);
    setShowMedicineDropdown(false);
    loadPharmacies(String(medicine.id));
  };

  const handleSendRequest = async (pharmacy: Pharmacy) => {
    if (!selectedMedicine) return;
    try {
      const res = await fetch("/api/shopkeeper/request", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pharmacy_id: pharmacy.id, medicine_id: selectedMedicine.id }),
      });
      const data = await res.json();
      setRequestSent(p => ({ ...p, [pharmacy.id]: true }));
      setRequestMessages(p => ({ ...p, [pharmacy.id]: data.message }));
    } catch (err) { console.error(err); }
  };

  useEffect(() => { getUserLocation(); }, []);

  const mapCenter: [number, number] = userLocation ? [userLocation.lat, userLocation.lng] : DEFAULT_CENTER;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg text-gray-800">Find Nearby Pharmacies</h3>
            <p className="text-sm text-gray-500">
              {userLocation ? `📍 Location: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : "Detecting your location..."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={getUserLocation} disabled={locating}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-50 text-cyan-700 hover:bg-cyan-100 transition-colors text-sm">
              <Locate className={`w-4 h-4 ${locating ? "animate-spin" : ""}`} />
              {locating ? "Locating..." : "My Location"}
            </motion.button>
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
              <button onClick={() => setViewMode("map")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs transition-all ${viewMode === "map" ? "bg-white text-cyan-700 shadow-sm" : "text-gray-500"}`}>
                <MapIcon className="w-3.5 h-3.5" /> Map
              </button>
              <button onClick={() => setViewMode("list")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs transition-all ${viewMode === "list" ? "bg-white text-cyan-700 shadow-sm" : "text-gray-500"}`}>
                <List className="w-3.5 h-3.5" /> List
              </button>
            </div>
          </div>
        </div>

        {locationError && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-amber-50 border border-amber-100 text-xs text-amber-700">{locationError}</div>
        )}

        {/* Search */}
        <div className="relative">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-100 transition-all">
            <Search className="w-5 h-5 text-gray-400" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => medicines.length > 0 && setShowMedicineDropdown(true)}
              placeholder="Search medicine to check availability..."
              className="flex-1 bg-transparent border-none outline-none text-gray-800 placeholder:text-gray-400" />
          </div>
          <AnimatePresence>
            {showMedicineDropdown && medicines.length > 0 && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-[1000] max-h-64 overflow-y-auto">
                {medicines.map(med => (
                  <button key={med.id} onClick={() => handleSelectMedicine(med)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-cyan-50 transition-colors text-left">
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
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center gap-3 p-3 bg-cyan-50 rounded-xl border border-cyan-100">
            <CheckCircle2 className="w-5 h-5 text-cyan-600" />
            <div>
              <p className="text-sm text-cyan-800">Showing availability for <strong>{selectedMedicine.brand_name}</strong></p>
              <p className="text-xs text-cyan-600">{selectedMedicine.generic_name} • MRP ₹{selectedMedicine.price}</p>
            </div>
          </motion.div>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full" />
        </div>
      )}

      {/* ── MAP VIEW ──────────────────────────────────────────────────── */}
      {!loading && viewMode === "map" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Legend */}
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> You</span>
              {selectedMedicine ? (<>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> In Stock</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Out of Stock</span>
              </>) : (
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-orange-500 inline-block" /> Pharmacy</span>
              )}
            </div>
            <span className="text-xs text-gray-400">{pharmacies.length} nearby</span>
          </div>

          <div style={{ height: "420px", width: "100%" }}>
            <MapContainer center={mapCenter} zoom={13} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
              <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {flyTarget && <FlyToLocation lat={flyTarget.lat} lng={flyTarget.lng} zoom={flyTarget.zoom} />}

              {/* User */}
              {userLocation && (<>
                <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                  <Popup><strong>📍 You are here</strong><br />Mohanpur, Jamshedpur</Popup>
                </Marker>
                <Circle center={[userLocation.lat, userLocation.lng]} radius={800}
                  pathOptions={{ color: "#06b6d4", fillColor: "#06b6d4", fillOpacity: 0.08, weight: 1 }} />
              </>)}

              {/* Pharmacies */}
              {pharmacies.map(p => (
                <Marker key={p.id} position={[p.latitude, p.longitude]}
                  icon={selectedMedicine ? (p.in_stock ? pharmacyInStockIcon : pharmacyOutStockIcon) : pharmacyDefaultIcon}
                  eventHandlers={{ click: () => setHighlightedPharmacy(p.id) }}>
                  <Popup>
                    <div style={{ minWidth: 200 }}>
                      <div style={{ fontWeight: "bold", fontSize: 14, marginBottom: 4 }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>{p.address}</div>
                      <div style={{ fontSize: 12, marginBottom: 3 }}>📞 {p.phone}</div>
                      <div style={{ fontSize: 12, marginBottom: 3 }}>🕐 {p.open_time}</div>
                      <div style={{ fontSize: 12, marginBottom: 3 }}>📍 {p.distance} away</div>
                      <div style={{ fontSize: 12 }}>⭐ {p.rating}/5</div>
                      {selectedMedicine && (
                        <div style={{ marginTop: 8, padding: "4px 8px", borderRadius: 6, fontSize: 12, fontWeight: "bold",
                          background: p.in_stock ? "#d1fae5" : "#fef2f2", color: p.in_stock ? "#065f46" : "#991b1b" }}>
                          {p.in_stock ? `✅ In Stock — ₹${p.medicine_price}` : "❌ Out of Stock"}
                        </div>
                      )}
                      <a href={`https://www.google.com/maps/dir/?api=1&destination=${p.latitude},${p.longitude}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{ display: "inline-block", marginTop: 8, padding: "4px 10px", background: "#0891b2",
                          color: "white", borderRadius: 6, fontSize: 11, textDecoration: "none" }}>
                        🗺️ Get Directions
                      </a>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Quick cards */}
          <div className="px-4 py-3 border-t border-gray-100">
            <div className="flex gap-3 overflow-x-auto pb-2">
              {pharmacies.slice(0, 8).map(p => (
                <motion.button key={p.id} whileHover={{ y: -2 }}
                  onClick={() => { setFlyTarget({ lat: p.latitude, lng: p.longitude, zoom: 16 }); setHighlightedPharmacy(p.id); }}
                  className={`flex-shrink-0 px-4 py-3 rounded-xl border text-left transition-all ${highlightedPharmacy === p.id ? "border-cyan-400 bg-cyan-50" : "border-gray-200 bg-white hover:border-cyan-200"}`}
                  style={{ minWidth: 180 }}>
                  <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{p.distance} • ⭐ {p.rating}</p>
                  {selectedMedicine && <p className={`text-xs mt-1 font-medium ${p.in_stock ? "text-emerald-600" : "text-red-500"}`}>{p.in_stock ? `✓ ₹${p.medicine_price}` : "✗ Out of Stock"}</p>}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── LIST VIEW ─────────────────────────────────────────────────── */}
      {!loading && viewMode === "list" && pharmacies.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            <span className="text-gray-800 font-medium">{pharmacies.length}</span> pharmacies nearby
            {selectedMedicine && <span> • <span className="text-emerald-600">{pharmacies.filter(p => p.in_stock).length}</span> have stock</span>}
          </p>
          <div className="grid gap-4">
            {pharmacies.map((pharmacy, i) => (
              <motion.div key={pharmacy.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                whileHover={{ y: -2 }}
                className={`bg-white rounded-2xl p-6 shadow-sm border transition-all ${
                  selectedMedicine ? (pharmacy.in_stock ? "border-emerald-100 hover:border-emerald-300" : "border-red-100 hover:border-red-200 opacity-75")
                  : "border-gray-100 hover:border-cyan-200"}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base text-gray-800">{pharmacy.name}</h3>
                      {selectedMedicine && (pharmacy.in_stock
                        ? <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs"><CheckCircle2 className="w-3 h-3" /> In Stock</span>
                        : <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-xs"><XCircle className="w-3 h-3" /> Out of Stock</span>)}
                    </div>
                    <p className="text-sm text-gray-500">{pharmacy.address}</p>
                  </div>
                  <div className="text-right">
                    {selectedMedicine && pharmacy.in_stock && <div className="text-xl text-gray-800 mb-1">₹{pharmacy.medicine_price}</div>}
                    <div className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /><span className="text-sm text-gray-600">{pharmacy.rating}</span></div>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1.5"><Navigation className="w-4 h-4 text-cyan-600" /> {pharmacy.distance}</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-cyan-600" /> {pharmacy.open_time}</span>
                  <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-cyan-600" /> {pharmacy.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <motion.a href={`https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}`}
                    target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 text-sm">
                    <ExternalLink className="w-4 h-4" /> Directions
                  </motion.a>
                  <motion.a href={`tel:${pharmacy.phone}`} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 text-sm">
                    <Phone className="w-4 h-4" /> Call
                  </motion.a>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => { setViewMode("map"); setFlyTarget({ lat: pharmacy.latitude, lng: pharmacy.longitude, zoom: 17 }); setHighlightedPharmacy(pharmacy.id); }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-50 text-cyan-700 hover:bg-cyan-100 text-sm">
                    <MapIcon className="w-4 h-4" /> Map
                  </motion.button>
                  {selectedMedicine && !pharmacy.in_stock && (
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleSendRequest(pharmacy)}
                      disabled={requestSent[pharmacy.id]}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ml-auto ${requestSent[pharmacy.id] ? "bg-emerald-50 text-emerald-700" : "bg-cyan-500 text-white shadow-md"}`}>
                      {requestSent[pharmacy.id] ? <><CheckCircle2 className="w-4 h-4" /> Sent</> : <><MessageSquare className="w-4 h-4" /> Request</>}
                    </motion.button>
                  )}
                  {selectedMedicine && pharmacy.in_stock && (
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleSendRequest(pharmacy)}
                      disabled={requestSent[pharmacy.id]}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ml-auto ${requestSent[pharmacy.id] ? "bg-emerald-50 text-emerald-700" : "bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-md"}`}>
                      {requestSent[pharmacy.id] ? <><CheckCircle2 className="w-4 h-4" /> Reserved</> : <><Send className="w-4 h-4" /> Reserve</>}
                    </motion.button>
                  )}
                </div>
                <AnimatePresence>
                  {requestMessages[pharmacy.id] && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                      className="mt-3 p-3 rounded-lg bg-cyan-50 border border-cyan-100 text-sm text-cyan-700">
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
