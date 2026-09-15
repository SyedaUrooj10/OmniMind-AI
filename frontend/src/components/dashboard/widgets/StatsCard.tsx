"use client";

import { motion } from "framer-motion";

interface Props {
  title: string;
  value: string;
  color: string;
}

export default function StatsCard({
  title,
  value,
  color,
}: Props) {
  return (
    <motion.div
      whileHover={{
        y: -8,
        scale: 1.02,
      }}
      className="glass rounded-3xl border border-white/10 p-6"
    >
      <div
        className="h-3 w-3 rounded-full"
        style={{
          background: color,
        }}
      />

      <h3 className="mt-5 text-gray-400">
        {title}
      </h3>

      <h2 className="mt-2 text-4xl font-black">
        {value}
      </h2>
    </motion.div>
  );
}