"use client";

import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string;
  delay?: number;
}

export default function StatCard({
  title,
  value,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.7,
        delay,
      }}
      whileHover={{
        scale: 1.05,
        y: -8,
      }}
      className="glass w-full rounded-2xl p-5 text-center shadow-xl"
    >
      <h2 className="text-3xl font-bold text-blue-400">
        {value}
      </h2>

      <p className="mt-2 text-sm text-gray-300">
        {title}
      </p>
    </motion.div>
  );
}