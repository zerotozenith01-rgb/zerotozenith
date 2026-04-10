import { motion } from "motion/react";
import { LucideIcon } from "lucide-react";

interface FeatureSectionProps {
  icon: LucideIcon;
  title: string;
  description: string;
  details: string[];
  image?: string;
  reverse?: boolean;
  index: number;
}

export function FeatureSection({
  icon: Icon,
  title,
  description,
  details,
  reverse = false,
  index,
}: FeatureSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={`grid lg:grid-cols-2 gap-12 items-center ${reverse ? "lg:flex-row-reverse" : ""}`}
    >
      {/* Content */}
      <div className={reverse ? "lg:order-2" : ""}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 + index * 0.1 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 shadow-lg shadow-cyan-500/30 mb-6"
        >
          <Icon className="w-8 h-8 text-white" />
        </motion.div>

        <h2 className="text-3xl mb-4">{title}</h2>
        <p className="text-lg text-muted-foreground mb-6 leading-relaxed">{description}</p>

        <ul className="space-y-3">
          {details.map((detail, idx) => (
            <motion.li
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              className="flex items-start gap-3"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-2 flex-shrink-0" />
              <span className="text-muted-foreground leading-relaxed">{detail}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* Visual */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 + index * 0.1 }}
        className={`relative ${reverse ? "lg:order-1" : ""}`}
      >
        <div className="relative bg-gradient-to-br from-cyan-50 to-teal-50 rounded-2xl p-8 border border-cyan-100 shadow-xl">
          <div className="aspect-video bg-white rounded-xl shadow-inner flex items-center justify-center border border-cyan-100/50">
            <Icon className="w-24 h-24 text-cyan-200" />
          </div>

          {/* Floating decoration */}
          <motion.div
            animate={{
              y: [0, -10, 0],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 shadow-lg shadow-cyan-500/40 flex items-center justify-center"
          >
            <Icon className="w-10 h-10 text-white" />
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
