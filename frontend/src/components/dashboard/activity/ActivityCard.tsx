"use client";

import { Clock } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  title: string;
  description: string;
  time: string;
}

export default function ActivityCard({
  title,
  description,
  time,
}: Props) {
  return (
    <motion.div
      whileHover={{ x: 8 }}
      className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-5"
    >
      <div className="rounded-full bg-cyan-500/20 p-3">
        <Clock className="text-cyan-400" size={18} />
      </div>

      <div className="flex-1">
        <h3 className="font-semibold">{title}</h3>

        <p className="mt-1 text-sm text-gray-400">
          {description}
        </p>

        <p className="mt-3 text-xs text-cyan-400">
          {time}
        </p>
      </div>
    </motion.div>
  );
}