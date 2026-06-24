"use client";
import { useEffect, useRef } from "react";
import { motion, useSpring, useTransform, useMotionValue } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  format?: "currency" | "percent" | "number";
  duration?: number;
  prefix?: string;
  suffix?: string;
}

export default function AnimatedNumber({
  value,
  format = "number",
  duration = 1200,
  prefix = "",
  suffix = ""
}: AnimatedNumberProps) {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  });

  useEffect(() => {
    motionValue.set(value);
  }, [motionValue, value]);

  const display = useTransform(springValue, (current) => {
    let formatted = current.toFixed(format === "number" ? 0 : 2);
    if (format === "currency") {
      formatted = parseFloat(formatted).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else if (format === "percent" || format === "number") {
      formatted = parseFloat(formatted).toLocaleString("en-US", { maximumFractionDigits: 2 });
    }
    return `${prefix}${formatted}${suffix}`;
  });

  return <motion.span>{display}</motion.span>;
}
