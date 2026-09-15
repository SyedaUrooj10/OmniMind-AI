"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface Props {
  icon: ReactNode;
  title: string;
  subtitle: string;
  onClick?: () => void;
}

export default function ActionButton({
  icon,
  title,
  subtitle,
  onClick,
}: Props) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{
        y: -6,
        scale: 1.02,
      }}
      whileTap={{
        scale: 0.98,
      }}
      className="glass flex w-full items-center gap-4 rounded-2xl border border-white/10 p-5 text-left transition"
    >
      <div className="rounded-xl bg-cyan-500/20 p-3 text-cyan-400">
        {icon}
      </div>

      <div>
        <h3 className="font-semibold">
          {title}
        </h3>

        <p className="text-sm text-gray-400">
          {subtitle}
        </p>
      </div>
    </motion.button>
  );
}


