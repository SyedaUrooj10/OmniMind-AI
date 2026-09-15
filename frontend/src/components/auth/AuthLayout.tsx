"use client";

import { ReactNode } from "react";
import AnimatedBackground from "../background/AnimatedBackground";
import MouseGlow from "../background/MouseGlow";

interface Props {
  children: ReactNode;
}

export default function AuthLayout({ children }: Props) {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#050816] text-white">
      <MouseGlow />
      <AnimatedBackground />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6 lg:grid lg:grid-cols-2">
        {/* Left Side */}
        <div className="hidden lg:flex flex-col justify-center">
          <h1 className="text-6xl font-black leading-tight">
            Welcome to
            <br />
            OmniMind AI
          </h1>

          <p className="mt-6 max-w-md text-gray-300 text-lg">
            Enterprise AI Platform for Chat, Vision, Document Intelligence,
            Predictive Analytics, and AI Workflows.
          </p>
        </div>

        {/* Right Side */}
        <div className="flex justify-center">
          {children}
        </div>
      </div>
    </section>
  );
}