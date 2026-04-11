import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, useCallback } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Save,
  CheckCircle2,
  Heart,
  Clock,
  TrendingDown,
  Plus,
  X,
  Pill,
  Stethoscope,
  AlertTriangle,
  FileText,
  Lightbulb,
  Trash2,
  Calendar,
  Activity,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Treatment {
  id: number;
  condition: string;
  doctor: string;
  date: string;
  medicines_used: string[];
  notes: string;
}

interface CurrentMedicine {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  since: string;
  prescribed_by: string;
}

interface Recommendation {
  title: string;
  description: string;
  type: "warning" | "suggestion" | "info";
  related_medicine: string;
}

// ─────────────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  // Pull logged-in user data from auth context
  const authUser = (() => {
    try {
      const stored = localStorage.getItem("smartmeds_user");
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  })();

  const [profile, setProfile] = useState({
    name: authUser?.name || "Guest",
    email: authUser?.email || "",
    phone: authUser?.phone || "",
    location: authUser?.location || "",
    allergies: authUser?.allergies || "",
    blood_group: authUser?.blood_group || "",
  });
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [currentMeds, setCurrentMeds] = useState<CurrentMedicine[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [saved, setSaved] = useState(false);
  const [showTreatmentForm, setShowTreatmentForm] = useState(false);
  const [showMedicineForm, setShowMedicineForm] = useState(false);
  const [recsLoading, setRecsLoading] = useState(false);

  // Treatment form state
  const [treatmentForm, setTreatmentForm] = useState({
    condition: "",
    doctor: "",
    date: "",
    medicines_used: "",
    notes: "",
  });

  // Medicine form state
  const [medicineForm, setMedicineForm] = useState({
    name: "",
    dosage: "",
    frequency: "Once daily",
    since: "",
    prescribed_by: "",
  });

  // ── Load treatments & medicines on mount (personal info comes from auth) ──
  useEffect(() => {
    fetch(`${API_BASE}/api/profile`)
      .then((r) => r.json())
      .then((data) => {
        // Only load treatments and medicines from API, NOT personal info
        setTreatments(data.past_treatments || []);
        setCurrentMeds(data.current_medicines || []);
      })
      .catch(() => {});
  }, []);

  // ── Save profile ──
  const handleSave = async () => {
    try {
      await fetch(`${API_BASE}/api/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
  };

  // ── Add treatment ──
  const addTreatment = async () => {
    if (!treatmentForm.condition) return;
    try {
      const res = await fetch(`${API_BASE}/api/profile/treatment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...treatmentForm,
          medicines_used: treatmentForm.medicines_used
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTreatments((prev) => [...prev, data.treatment]);
        setTreatmentForm({ condition: "", doctor: "", date: "", medicines_used: "", notes: "" });
        setShowTreatmentForm(false);
      }
    } catch {}
  };

  // ── Remove treatment ──
  const removeTreatment = async (id: number) => {
    try {
      await fetch(`${API_BASE}/api/profile/treatment?id=${id}`, { method: "DELETE" });
      setTreatments((prev) => prev.filter((t) => t.id !== id));
    } catch {}
  };

  // ── Add medicine ──
  const addMedicine = async () => {
    if (!medicineForm.name) return;
    try {
      const res = await fetch(`${API_BASE}/api/profile/medicine`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(medicineForm),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentMeds((prev) => [...prev, data.medicine]);
        setMedicineForm({ name: "", dosage: "", frequency: "Once daily", since: "", prescribed_by: "" });
        setShowMedicineForm(false);
      }
    } catch {}
  };

  // ── Remove medicine ──
  const removeMedicine = async (id: number) => {
    try {
      await fetch(`${API_BASE}/api/profile/medicine?id=${id}`, { method: "DELETE" });
      setCurrentMeds((prev) => prev.filter((m) => m.id !== id));
    } catch {}
  };

  // ── Load recommendations based on history ──
  const loadRecommendations = useCallback(async () => {
    setRecsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/profile/recommendations`);
      const data = await res.json();
      setRecommendations(data.recommendations || []);
    } catch {}
    setRecsLoading(false);
  }, []);

  useEffect(() => {
    if (treatments.length > 0 || currentMeds.length > 0) {
      loadRecommendations();
    }
  }, [treatments.length, currentMeds.length, loadRecommendations]);

  // ─── Helpers ──
  const recIcon = (type: string) => {
    switch (type) {
      case "warning": return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "suggestion": return <Lightbulb className="w-4 h-4 text-cyan-500" />;
      default: return <FileText className="w-4 h-4 text-blue-500" />;
    }
  };
  const recColor = (type: string) => {
    switch (type) {
      case "warning": return "border-amber-200 bg-amber-50";
      case "suggestion": return "border-cyan-200 bg-cyan-50";
      default: return "border-blue-200 bg-blue-50";
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
      {/* ── Profile Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <span className="text-3xl text-white">{profile.name.charAt(0)}</span>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl text-gray-800 mb-1">{profile.name}</h2>
            <p className="text-gray-500">Premium Member since April 2026</p>
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs">
                <Shield className="w-3.5 h-3.5" /> Verified Account
              </span>
              {profile.blood_group && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs">
                  <Heart className="w-3.5 h-3.5" /> {profile.blood_group}
                </span>
              )}
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-xs">
                <Activity className="w-3.5 h-3.5" /> {treatments.length} Treatments · {currentMeds.length} Active Meds
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Row 1: Personal Info + Health Info ── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg text-gray-800 mb-5">Personal Information</h3>
          <div className="space-y-3">
            {[
              { icon: User, label: "Full Name", key: "name" as const, type: "text" },
              { icon: Mail, label: "Email", key: "email" as const, type: "email" },
              { icon: Phone, label: "Phone", key: "phone" as const, type: "tel" },
              { icon: MapPin, label: "Location", key: "location" as const, type: "text" },
            ].map((f) => (
              <div key={f.key}>
                <label className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  <f.icon className="w-3.5 h-3.5" /> {f.label}
                </label>
                <input
                  type={f.type}
                  value={profile[f.key]}
                  onChange={(e) => setProfile({ ...profile, [f.key]: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all"
                />
              </div>
            ))}
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
              {saved ? (<><CheckCircle2 className="w-4 h-4" /> Saved!</>) : (<><Save className="w-4 h-4" /> Save Changes</>)}
            </motion.button>
          </div>
        </motion.div>

        {/* Health Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg text-gray-800 mb-5">Health Information</h3>
          <div className="space-y-3">
            <div>
              <label className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <Heart className="w-3.5 h-3.5" /> Blood Group
              </label>
              <select
                value={profile.blood_group}
                onChange={(e) => setProfile({ ...profile, blood_group: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm outline-none focus:border-cyan-400"
              >
                <option value="">Select Blood Group</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Known Allergies
              </label>
              <textarea
                value={profile.allergies}
                onChange={(e) => setProfile({ ...profile, allergies: e.target.value })}
                placeholder="e.g., Penicillin, Sulfa drugs, Aspirin…"
                rows={3}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm outline-none focus:border-cyan-400 resize-none"
              />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              {[
                { label: "Treatments", value: treatments.length, color: "bg-violet-50 text-violet-700" },
                { label: "Active Meds", value: currentMeds.length, color: "bg-cyan-50 text-cyan-700" },
                { label: "Recommendations", value: recommendations.length, color: "bg-amber-50 text-amber-700" },
              ].map((s) => (
                <div key={s.label} className={`${s.color} rounded-xl p-3 text-center`}>
                  <p className="text-xl font-bold">{s.value}</p>
                  <p className="text-[10px] mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Row 2: Past Treatments ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg text-gray-800 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-violet-500" />
            Past Treatments & Consultations
          </h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowTreatmentForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-50 text-violet-700 text-xs hover:bg-violet-100 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Treatment
          </motion.button>
        </div>

        {/* Treatment form */}
        <AnimatePresence>
          {showTreatmentForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 overflow-hidden"
            >
              <div className="p-4 rounded-xl bg-violet-50 border border-violet-100 space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <input placeholder="Condition / Diagnosis *" value={treatmentForm.condition}
                    onChange={(e) => setTreatmentForm({ ...treatmentForm, condition: e.target.value })}
                    className="px-3 py-2 rounded-lg bg-white border border-violet-200 text-sm outline-none focus:border-violet-400" />
                  <input placeholder="Doctor Name" value={treatmentForm.doctor}
                    onChange={(e) => setTreatmentForm({ ...treatmentForm, doctor: e.target.value })}
                    className="px-3 py-2 rounded-lg bg-white border border-violet-200 text-sm outline-none focus:border-violet-400" />
                  <input type="date" value={treatmentForm.date}
                    onChange={(e) => setTreatmentForm({ ...treatmentForm, date: e.target.value })}
                    className="px-3 py-2 rounded-lg bg-white border border-violet-200 text-sm outline-none focus:border-violet-400" />
                  <input placeholder="Medicines used (comma-separated)" value={treatmentForm.medicines_used}
                    onChange={(e) => setTreatmentForm({ ...treatmentForm, medicines_used: e.target.value })}
                    className="px-3 py-2 rounded-lg bg-white border border-violet-200 text-sm outline-none focus:border-violet-400" />
                </div>
                <textarea placeholder="Notes" value={treatmentForm.notes} rows={2}
                  onChange={(e) => setTreatmentForm({ ...treatmentForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-violet-200 text-sm outline-none focus:border-violet-400 resize-none" />
                <div className="flex gap-2">
                  <button onClick={addTreatment} className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm hover:bg-violet-700 transition-colors">
                    Save Treatment
                  </button>
                  <button onClick={() => setShowTreatmentForm(false)} className="px-4 py-2 rounded-lg bg-white text-gray-600 text-sm border hover:bg-gray-50">
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {treatments.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No past treatments recorded yet. Add your medical history to get personalized recommendations.</p>
        ) : (
          <div className="space-y-3">
            {treatments.map((t) => (
              <motion.div key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex gap-4 p-4 rounded-xl border border-gray-100 hover:border-violet-200 hover:bg-violet-50/30 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                  <Stethoscope className="w-5 h-5 text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{t.condition}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {t.doctor && (t.doctor.toLowerCase().startsWith("dr") ? t.doctor : `Dr. ${t.doctor}`)} {t.date && `· ${t.date}`}
                      </p>
                    </div>
                    <button onClick={() => removeTreatment(t.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {t.medicines_used.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {t.medicines_used.map((m, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-violet-100 text-violet-700 text-[11px]">
                          {m}
                        </span>
                      ))}
                    </div>
                  )}
                  {t.notes && <p className="text-xs text-gray-500 mt-1.5 italic">{t.notes}</p>}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* ── Row 3: Current Medicines ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg text-gray-800 flex items-center gap-2">
            <Pill className="w-5 h-5 text-cyan-500" />
            Current Medicines
          </h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowMedicineForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-50 text-cyan-700 text-xs hover:bg-cyan-100 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Medicine
          </motion.button>
        </div>

        {/* Medicine form */}
        <AnimatePresence>
          {showMedicineForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 overflow-hidden"
            >
              <div className="p-4 rounded-xl bg-cyan-50 border border-cyan-100 space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <input placeholder="Medicine Name *" value={medicineForm.name}
                    onChange={(e) => setMedicineForm({ ...medicineForm, name: e.target.value })}
                    className="px-3 py-2 rounded-lg bg-white border border-cyan-200 text-sm outline-none focus:border-cyan-400" />
                  <input placeholder="Dosage (e.g., 500mg)" value={medicineForm.dosage}
                    onChange={(e) => setMedicineForm({ ...medicineForm, dosage: e.target.value })}
                    className="px-3 py-2 rounded-lg bg-white border border-cyan-200 text-sm outline-none focus:border-cyan-400" />
                  <select value={medicineForm.frequency}
                    onChange={(e) => setMedicineForm({ ...medicineForm, frequency: e.target.value })}
                    className="px-3 py-2 rounded-lg bg-white border border-cyan-200 text-sm outline-none focus:border-cyan-400">
                    {["Once daily", "Twice daily", "Three times daily", "As needed", "Weekly"].map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                  <input type="date" placeholder="Since" value={medicineForm.since}
                    onChange={(e) => setMedicineForm({ ...medicineForm, since: e.target.value })}
                    className="px-3 py-2 rounded-lg bg-white border border-cyan-200 text-sm outline-none focus:border-cyan-400" />
                </div>
                <input placeholder="Prescribed by (Doctor name)" value={medicineForm.prescribed_by}
                  onChange={(e) => setMedicineForm({ ...medicineForm, prescribed_by: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-cyan-200 text-sm outline-none focus:border-cyan-400" />
                <div className="flex gap-2">
                  <button onClick={addMedicine} className="px-4 py-2 rounded-lg bg-cyan-600 text-white text-sm hover:bg-cyan-700 transition-colors">
                    Save Medicine
                  </button>
                  <button onClick={() => setShowMedicineForm(false)} className="px-4 py-2 rounded-lg bg-white text-gray-600 text-sm border hover:bg-gray-50">
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {currentMeds.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No current medicines recorded. Add your active prescriptions for better recommendations.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {currentMeds.map((m) => (
              <motion.div key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="p-4 rounded-xl border border-gray-100 hover:border-cyan-200 hover:bg-cyan-50/30 transition-all group relative"
              >
                <button onClick={() => removeMedicine(m.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center">
                    <Pill className="w-4 h-4 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{m.name}</p>
                    <p className="text-[11px] text-gray-500">{m.dosage}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-gray-500">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {m.frequency}</span>
                  {m.since && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Since {m.since}</span>}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* ── Row 4: AI Recommendations ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg text-gray-800 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            Personalized Recommendations
          </h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadRecommendations}
            disabled={recsLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-xs hover:bg-amber-100 transition-colors disabled:opacity-50"
          >
            {recsLoading ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-3.5 h-3.5 border-2 border-amber-600 border-t-transparent rounded-full" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            Refresh
          </motion.button>
        </div>

        {recommendations.length === 0 && !recsLoading ? (
          <p className="text-sm text-gray-400 text-center py-8">
            Add your treatments and current medicines above to receive AI-powered personalized health recommendations.
          </p>
        ) : recsLoading ? (
          <div className="flex items-center justify-center py-8">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-[3px] border-amber-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="space-y-3">
            {recommendations.map((rec, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex gap-3 p-4 rounded-xl border ${recColor(rec.type)} transition-all`}
              >
                <div className="mt-0.5 flex-shrink-0">{recIcon(rec.type)}</div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{rec.title}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{rec.description}</p>
                  {rec.related_medicine && (
                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md bg-white/70 text-[11px] text-gray-600 border border-gray-200">
                      💊 {rec.related_medicine}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
