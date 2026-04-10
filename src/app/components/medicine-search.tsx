import { Search, Upload, Camera } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

interface MedicineSearchProps {
  onSearch: (query: string) => void;
}

export function MedicineSearch({ onSearch }: MedicineSearchProps) {
  const [query, setQuery] = useState("");
  const [isActive, setIsActive] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSearch}>
        <motion.div
          className="relative"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div
            className={`relative bg-white rounded-2xl shadow-lg transition-all duration-300 ${
              isActive ? "ring-2 ring-cyan-500 shadow-xl shadow-cyan-500/20" : ""
            }`}
          >
            <div className="flex items-center gap-3 p-6">
              <Search className="w-6 h-6 text-muted-foreground flex-shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsActive(true)}
                onBlur={() => setIsActive(false)}
                placeholder="Enter medicine name or active ingredient..."
                className="flex-1 bg-transparent border-none outline-none text-lg placeholder:text-muted-foreground"
              />
            </div>

            <div className="flex items-center gap-2 px-6 pb-6 pt-2 border-t border-border/40">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span className="text-sm">Upload Prescription</span>
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                <Camera className="w-4 h-4" />
                <span className="text-sm">Scan</span>
              </motion.button>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="ml-auto px-8 py-2.5 rounded-lg bg-accent text-accent-foreground shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 transition-all"
              >
                Search
              </motion.button>
            </div>
          </div>

          {/* Animated glow */}
          {isActive && (
            <motion.div
              className="absolute inset-0 -z-10 rounded-2xl blur-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                background: "radial-gradient(circle at center, rgba(6, 182, 212, 0.15) 0%, transparent 70%)",
              }}
            />
          )}
        </motion.div>
      </form>
    </div>
  );
}
