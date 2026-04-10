import { motion } from "motion/react";
import { useEffect, useState } from "react";

export function Pill3D() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center perspective-1000">
      <motion.div
        className="relative"
        animate={{
          rotateY: mousePosition.x,
          rotateX: -mousePosition.y,
        }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* Main Capsule */}
        <motion.div
          className="relative w-48 h-96"
          animate={{ rotateZ: [0, 360] }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            transformStyle: "preserve-3d",
          }}
        >
          {/* Left half - Cyan */}
          <div
            className="absolute left-0 top-0 w-24 h-96 rounded-l-full overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)",
              boxShadow: "inset -4px 0 20px rgba(0,0,0,0.2), 0 20px 60px rgba(6, 182, 212, 0.4)",
            }}
          >
            <div
              className="absolute top-8 left-4 w-12 h-32 rounded-full opacity-30"
              style={{
                background: "linear-gradient(180deg, rgba(255,255,255,0.6) 0%, transparent 100%)",
              }}
            />
          </div>

          {/* Right half - Deep Cyan */}
          <div
            className="absolute right-0 top-0 w-24 h-96 rounded-r-full overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #0e7490 0%, #164e63 100%)",
              boxShadow: "inset 4px 0 20px rgba(0,0,0,0.3), 0 20px 60px rgba(14, 116, 144, 0.4)",
            }}
          >
            <div
              className="absolute top-8 right-4 w-12 h-32 rounded-full opacity-20"
              style={{
                background: "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)",
              }}
            />
          </div>

          {/* Center separator */}
          <div className="absolute left-1/2 top-0 w-0.5 h-96 bg-white/20 -translate-x-1/2" />

          {/* Highlight gloss */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div
              className="absolute top-12 left-8 w-32 h-24 rounded-full"
              style={{
                background: "radial-gradient(ellipse at center, rgba(255,255,255,0.4) 0%, transparent 70%)",
                filter: "blur(8px)",
              }}
            />
          </motion.div>
        </motion.div>

        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-cyan-400/40"
            style={{
              top: `${20 + i * 10}%`,
              left: `${-20 + (i % 2) * 140}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}
