import { MapPin, Navigation, Clock, Phone } from "lucide-react";
import { motion } from "motion/react";

interface Pharmacy {
  name: string;
  address: string;
  distance: string;
  openTime: string;
  phone: string;
  inStock: boolean;
  price: number;
}

interface PharmacyLocatorProps {
  pharmacies: Pharmacy[];
}

export function PharmacyLocator({ pharmacies }: PharmacyLocatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="bg-white rounded-xl p-8 shadow-lg border border-border"
    >
      <div className="mb-6">
        <h2 className="mb-2">Nearby Pharmacies</h2>
        <p className="text-muted-foreground">Find pharmacies with your medicine in stock</p>
      </div>

      <div className="space-y-4">
        {pharmacies.map((pharmacy, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ x: 4 }}
            className="p-5 rounded-lg border border-border hover:border-cyan-300 hover:bg-cyan-50/30 transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg">{pharmacy.name}</h3>
                  {pharmacy.inStock && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs">
                      In Stock
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{pharmacy.address}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl text-primary">₹{pharmacy.price}</div>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-cyan-600" />
                <span>{pharmacy.distance}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-600" />
                <span>{pharmacy.openTime}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-cyan-600" />
                <span>{pharmacy.phone}</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-4 w-full px-4 py-2 rounded-lg bg-cyan-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Get Directions
            </motion.button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
