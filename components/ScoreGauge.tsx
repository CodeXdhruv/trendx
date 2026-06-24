"use client";
import { motion } from "framer-motion";
import AnimatedNumber from "./AnimatedNumber";

export default function ScoreGauge({ score, max = 100 }: { score: number; max?: number }) {
  const percentage = (score / max) * 100;
  // Map percentage 0-100 to angle -90 to 90
  const rotation = -90 + (percentage / 100) * 180;
  
  // SVG arc calculation for semi-circle
  const radius = 40;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-32 h-24 flex flex-col items-center justify-end overflow-hidden">
      <svg className="absolute top-0 w-full h-32" viewBox="0 0 100 50" preserveAspectRatio="xMidYMax meet">
        {/* Background Arc */}
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke="var(--muted)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Foreground Arc */}
        <motion.path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        
        {/* Needle Placeholder (Using simple lines or a path) */}
        <motion.g
          initial={{ rotate: -90 }}
          animate={{ rotate: rotation }}
          transition={{ type: "spring", stiffness: 50, damping: 10, delay: 0.2 }}
          style={{ originX: "50%", originY: "100%" }}
        >
          <path d="M 48 50 L 50 15 L 52 50 Z" fill="var(--foreground)" />
          <circle cx="50" cy="50" r="4" fill="var(--foreground)" />
        </motion.g>
      </svg>
      <div className="absolute bottom-0 text-center pb-2">
        <div className="text-2xl font-bold font-mono">
          <AnimatedNumber value={score} format="number" />
          <span className="text-sm text-muted-foreground ml-1">/ {max}</span>
        </div>
      </div>
    </div>
  );
}
