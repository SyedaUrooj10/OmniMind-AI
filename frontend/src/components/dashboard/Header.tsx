"use client";

import { Bell, Search } from "lucide-react";

export default function Header() {
  return (
    <header className="glass flex h-20 items-center justify-between border-b border-white/10 px-8">

      <h2 className="text-2xl font-bold">
        Dashboard
      </h2>

      <div className="flex items-center gap-5">

        <div className="flex items-center rounded-xl bg-white/5 px-4">

          <Search size={18} />

          <input
            placeholder="Search..."
            className="bg-transparent px-3 py-3 outline-none"
          />

        </div>

        <Bell />

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500 font-bold">
          S
        </div>

      </div>

    </header>
  );
}