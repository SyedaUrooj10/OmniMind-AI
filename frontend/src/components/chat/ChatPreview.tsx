"use client";

import { motion } from "framer-motion";
import {
  Bot,
  Sparkles,
} from "lucide-react"; 

export default function ChatPreview() {
  return (
    <section className="py-40 px-8">

      <div className="mx-auto max-w-7xl">

        <motion.h2
          initial={{ opacity:0,y:40 }}
          whileInView={{ opacity:1,y:0 }}
          viewport={{ once:true }}
          className="text-center text-5xl font-black"
        >
          AI Assistant
        </motion.h2>

        <p className="mt-5 text-center text-gray-400 max-w-2xl mx-auto">
          Experience real-time AI conversations with enterprise-grade intelligence.
        </p>

        <motion.div
          initial={{ opacity:0,scale:.95 }}
          whileInView={{ opacity:1,scale:1 }}
          viewport={{ once:true }}
          transition={{ duration:.7 }}
          className="glass mt-20 rounded-3xl p-8 shadow-2xl"
        >

          {/* Header */}

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="rounded-full bg-cyan-500 p-2">

                <Bot />

              </div>

              <div>

                <h3 className="font-bold">
                  OmniMind Assistant
                </h3>

                <p className="text-xs text-green-400">
                  Online
                </p>

              </div>

            </div>

            <Sparkles className="text-cyan-400" />

          </div>

          {/* Messages */}

          <div className="mt-10 space-y-6">

            <div className="flex justify-end">

              <div className="max-w-md rounded-2xl bg-blue-600 px-5 py-4">
                Summarize this quarterly financial report.
              </div>

            </div>

            <div className="flex gap-4">

              <div className="rounded-full bg-cyan-500 p-2 h-fit">

                <Bot size={20}/>

              </div>

              <div className="glass max-w-lg rounded-2xl p-5">

                <p>
                  Here is the executive summary:
                </p>

                <ul className="mt-4 space-y-2 text-gray-300">

                  <li>✓ Revenue increased by 14%</li>

                  <li>✓ Operational costs reduced by 8%</li>

                  <li>✓ Customer satisfaction reached 96%</li>

                  <li>✓ AI recommends expanding into APAC.</li>

                </ul>

              </div>

            </div>

            <div className="flex gap-2 items-center text-cyan-400">

              <Bot size={18}/>

              <span className="animate-pulse">
                Typing...
              </span>

            </div>

          </div>

        </motion.div>

      </div>

    </section>
  );
}