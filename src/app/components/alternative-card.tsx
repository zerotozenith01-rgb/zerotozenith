import { CheckCircle2, TrendingDown, MapPin, AlertCircle } from "lucide-react";
import { motion } from "motion/react";

interface AlternativeCardProps {
  name: string;
  manufacturer: string;
  activeIngredient: string;
  dosage: string;
  price: number;
  originalPrice: number;
  savings: number;
  availability: "in-stock" | "limited" | "out-of-stock";
  verified: boolean;
  pharmaciesCount: number;
  index: number;
}

export function AlternativeCard({
  name,
  manufacturer,
  activeIngredient,
  dosage,
  price,
  originalPrice,
  savings,
  availability,
  verified,
  pharmaciesCount,
  index,
}: AlternativeCardProps) {
  const availabilityConfig = {
    "in-stock": { color: "text-emerald-600", bg: "bg-emerald-50", label: "In Stock" },
    limited: { color: "text-amber-600", bg: "bg-amber-50", label: "Limited Stock" },
    "out-of-stock": { color: "text-red-600", bg: "bg-red-50", label: "Out of Stock" },
  };

  const config = availabilityConfig[availability];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotateX: -10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        type: "spring",
        stiffness: 100,
      }}
      whileHover={{
        y: -4,
        transition: { duration: 0.2 },
      }}
      style={{
        transformStyle: "preserve-3d",
      }}
      className="relative group"
    >
      <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-border relative overflow-hidden">
        {/* Verified badge */}
        {verified && (
          <div className="absolute top-4 right-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-50 border border-cyan-200">
              <CheckCircle2 className="w-4 h-4 text-cyan-600" />
              <span className="text-xs text-cyan-700">Verified</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-4 pr-24">
          <h3 className="mb-1">{name}</h3>
          <p className="text-sm text-muted-foreground">{manufacturer}</p>
        </div>

        {/* Medicine details */}
        <div className="space-y-2 mb-4 pb-4 border-b border-border/50">
          <div className="flex items-start gap-2">
            <span className="text-sm text-muted-foreground min-w-[120px]">Active Ingredient:</span>
            <span className="text-sm">{activeIngredient}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-sm text-muted-foreground min-w-[120px]">Dosage:</span>
            <span className="text-sm">{dosage}</span>
          </div>
        </div>

        {/* Price section */}
        <div className="mb-4">
          <div className="flex items-baseline gap-3 mb-2">
            <div>
              <span className="text-3xl text-primary">₹{price}</span>
              <span className="text-sm text-muted-foreground ml-2 line-through">₹{originalPrice}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50">
              <TrendingDown className="w-4 h-4 text-emerald-600" />
              <span className="text-sm text-emerald-700">Save {savings}%</span>
            </div>
          </div>
        </div>

        {/* Availability and pharmacies */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${config.bg}`}>
            <AlertCircle className={`w-4 h-4 ${config.color}`} />
            <span className={`text-xs ${config.color}`}>{config.label}</span>
          </div>

          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{pharmaciesCount} pharmacies</span>
          </div>
        </div>

        {/* Hover gradient effect */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl"
          style={{
            background: "radial-gradient(circle at top right, rgba(6, 182, 212, 0.05) 0%, transparent 50%)",
          }}
        />
      </div>
    </motion.div>
  );
}
