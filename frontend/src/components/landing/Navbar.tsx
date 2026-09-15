"use client";

import Link from "next/link";
import { BrainCircuit } from "lucide-react";
import { motion } from "framer-motion";

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7 }}
      className="fixed left-0 top-0 z-50 w-full"
    >
      <div className="mx-auto mt-5 flex w-[95%] max-w-7xl items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-xl">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3"
        >
          <div className="rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 p-2">
            <BrainCircuit className="h-6 w-6 text-white" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-white">
              OmniMind AI
            </h1>

            <p className="text-xs text-gray-400">
              Enterprise Intelligence
            </p>
          </div>
        </Link>

        {/* Navigation */}
        <div className="hidden gap-8 text-sm text-gray-300 lg:flex">
          <a
            href="#features"
            className="transition-colors hover:text-white"
          >
            Features
          </a>

          <a
            href="#demo"
            className="transition-colors hover:text-white"
          >
            Demo
          </a>

          <a
            href="#pricing"
            className="transition-colors hover:text-white"
          >
            Pricing
          </a>

          <a
            href="#faq"
            className="transition-colors hover:text-white"
          >
            FAQ
          </a>
        </div>

        {/* Login / Get Started */}
        <div className="flex items-center gap-3">

          <Link href="/login">
            <motion.span
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.95,
              }}
              className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:border-blue-400/40 hover:bg-white/10"
            >
              Login
            </motion.span>
          </Link>

          <Link href="/login">
            <motion.span
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.95,
              }}
              className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30"
            >
              Get Started
            </motion.span>
          </Link>

        </div>

      </div>
    </motion.nav>
  );
}



