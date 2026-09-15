"use client";

import { motion } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import { ArrowRight, Play, Sparkles } from "lucide-react";

import AnimatedBackground from "../background/AnimatedBackground";
import StatCard from "../ui/StatCard";
import Scene from "../three/Scene";
import MouseGlow from "../background/MouseGlow";
import DashboardPreview from "../ui/DashboardPreview";

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden">

      <MouseGlow />
      <AnimatedBackground />

      {/* Ambient glow */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-blue-600/20 blur-[120px]"
      />

      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="pointer-events-none absolute right-1/4 top-1/3 h-96 w-96 rounded-full bg-violet-600/20 blur-[120px]"
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-8 pt-24">

        {/* LEFT */}
        <div className="flex-1">

          {/* AI badge */}
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
            }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-300"
          >
            <Sparkles className="h-4 w-4" />

            AI-Powered Decision Intelligence

          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{
              opacity: 0,
              x: -60,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.8,
              ease: "easeOut",
            }}
            className="max-w-3xl text-5xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl"
          >
            Enterprise AI
            <br />

            <span className="lg-gradient-to-r from-blue-400 via-cyan-300 to-violet-500 bg-clip-text text-transparent">
              Reimagined
            </span>
          </motion.h1>

          {/* Animated capability */}
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.7,
              delay: 0.2,
            }}
            className="mt-7 text-2xl font-semibold text-blue-300"
          >
            <TypeAnimation
              sequence={[
                "Build AI",
                2000,
                "Analyze Data",
                2000,
                "Predict Outcomes",
                2000,
                "Deploy Models",
                2000,
                "Automate Decisions",
                2000,
              ]}
              speed={50}
              repeat={Infinity}
            />
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.7,
              delay: 0.35,
            }}
            className="mt-7 max-w-xl text-lg leading-8 text-gray-300"
          >
            Transform raw data into intelligent decisions with
            predictive analytics, AI reasoning, automated
            workflows, document intelligence, and machine
            learning — all from one platform.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{
              opacity: 0,
              y: 25,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.7,
              delay: 0.5,
            }}
            className="mt-10 flex flex-wrap gap-4"
          >

            <motion.a
              href="/login"
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.97,
              }}
              className="group flex items-center gap-2 rounded-xl lg-gradient-to-r from-blue-500 to-violet-600 px-7 py-4 font-semibold text-white shadow-xl shadow-blue-500/20"
            >
              Start Free

              <ArrowRight
                className="h-5 w-5 transition-transform group-hover:translate-x-1"
              />
            </motion.a>

            <motion.a
              href="#demo"
              whileHover={{
                scale: 1.04,
              }}
              whileTap={{
                scale: 0.97,
              }}
              className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-7 py-4 font-semibold text-white backdrop-blur transition hover:bg-white/10"
            >
              <Play className="h-4 w-4 fill-current" />

              Watch Demo
            </motion.a>

          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{
              opacity: 0,
              y: 30,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.8,
              delay: 0.7,
            }}
            className="mt-16 grid grid-cols-2 gap-4 lg:grid-cols-4"
          >

            <StatCard
              title="AI Models"
              value="30+"
              delay={0.2}
            />

            <StatCard
              title="Countries"
              value="150+"
              delay={0.4}
            />

            <StatCard
              title="API Requests"
              value="500K+"
              delay={0.6}
            />

            <StatCard
              title="Uptime"
              value="99.99%"
              delay={0.8}
            />

          </motion.div>

        </div>

        {/* RIGHT */}
        <div className="relative hidden l-[650px] flex-1 lg:block">

          <Scene />

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
              x: 50,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              x: 0,
            }}
            transition={{
              duration: 1,
              delay: 0.4,
              ease: "easeOut",
            }}
          >
            <DashboardPreview />
          </motion.div>

        </div>

      </div>

    </section>
  );
}
