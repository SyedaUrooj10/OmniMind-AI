"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

interface Props {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

export default function FeatureCard({
  icon,
  title,
  description,
  color,
}: Props) {
  return (
    <motion.div
      whileHover={{
        y: -12,
        scale: 1.03,
      }}
      transition={{ duration: .25 }}
      className="group glass rounded-3xl p-7 cursor-pointer"
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{
          background: color,
        }}
      >
        {icon}
      </div>

      <h2 className="mt-6 text-2xl font-bold">
        {title}
      </h2>

      <p className="mt-3 text-gray-400">
        {description}
      </p>

      <div className="mt-8 flex items-center gap-2 text-cyan-400 group-hover:translate-x-2 transition">
        Explore

        <ArrowUpRight size={18} />
      </div>
    </motion.div>
  );
}