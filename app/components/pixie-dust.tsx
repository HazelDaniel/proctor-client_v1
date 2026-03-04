import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export const PixieDust = () => {
  const [dots, setDots] = useState<{ id: number; x: number; y: number; delay: number; duration: number }[]>([]);

  useEffect(() => {
    const newDots = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 2 + Math.random() * 3,
    }));
    setDots(newDots);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg width="100%" height="100%" className="absolute inset-0">
        {dots.map((dot) => (
          <motion.circle
            key={dot.id}
            cx={`${dot.x}%`}
            cy={`${dot.y}%`}
            r="1.5"
            fill="rgb(var(--accent-color))"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: dot.duration,
              repeat: Infinity,
              delay: dot.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </svg>
    </div>
  );
};
