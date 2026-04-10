import { motion } from "motion/react";
import { LucideIcon } from "lucide-react";

interface InfoCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
  index: number;
}

export function InfoCard({ icon: Icon, title, description, badge, index }: InfoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotateX: -10 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        type: "spring",
        stiffness: 100,
      }}
      whileHover={{
        y: -8,
        transition: { duration: 0.2 },
      }}
      className="relative group"
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="relative bg-white/60 backdrop-blur-md rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(6,182,212,0.1)] transition-all duration-300 border border-white/50 overflow-hidden h-full">
        {badge && (
          <div className="absolute top-6 right-6">
            <span className="px-4 py-1.5 rounded-full bg-cyan-100/50 backdrop-blur-sm text-cyan-700 font-bold text-xs border border-cyan-200/50">
              {badge}
            </span>
          </div>
        )}

        <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 shadow-lg shadow-cyan-500/30 mb-6">
          <Icon className="w-7 h-7 text-white" />
        </div>

        <h3 className="text-xl font-bold text-slate-800 mb-3">{title}</h3>
        <p className="text-slate-600 font-medium leading-relaxed">{description}</p>

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
