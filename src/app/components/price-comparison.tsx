import { motion } from "motion/react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface PriceData {
  name: string;
  price: number;
  type: "original" | "generic" | "alternative";
}

interface PriceComparisonProps {
  data: PriceData[];
}

export function PriceComparison({ data }: PriceComparisonProps) {
  const getColor = (type: string) => {
    switch (type) {
      case "original":
        return "#dc2626";
      case "generic":
        return "#06b6d4";
      case "alternative":
        return "#0e7490";
      default:
        return "#64748b";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="bg-white rounded-xl p-8 shadow-lg border border-border"
    >
      <div className="mb-6">
        <h2 className="mb-2">Price Comparison</h2>
        <p className="text-muted-foreground">Compare prices across different brands and formulations</p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fill: "#64748b", fontSize: 12 }}
            />
            <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              }}
              formatter={(value: number) => [`₹${value}`, "Price"]}
            />
            <Bar dataKey="price" radius={[8, 8, 0, 0]} maxBarSize={60}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.type)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-600" />
          <span className="text-sm text-muted-foreground">Original Brand</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-cyan-500" />
          <span className="text-sm text-muted-foreground">Generic</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-cyan-700" />
          <span className="text-sm text-muted-foreground">Alternative</span>
        </div>
      </div>
    </motion.div>
  );
}
