"use client";

import { Suspense } from "react";
import Link from "next/link";
import { Search, MapPin, ArrowLeft, Clock, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

const SKAUTE_BLUE = "#0052FF";
const SKAUTE_YELLOW = "#FFD700";

// 1. ISOLATED INNER NOT-FOUND LAYOUT
function NotFoundContent() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-white overflow-hidden px-6">
      {/* Background Decorative Grid */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(${SKAUTE_BLUE} 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-2xl bg-gray-50/50 border border-gray-100 rounded-[48px] p-8 md:p-16 text-center shadow-2xl shadow-gray-200/50"
      >
        {/* Status Icons Row */}
        <div className="flex justify-center -space-x-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center border-4 border-gray-50">
            <Clock size={24} className="text-gray-400" />
          </div>
          <div
            className="w-20 h-20 rounded-[28px] bg-white shadow-xl flex items-center justify-center border-4 border-gray-50 z-10"
            style={{ transform: "rotate(-5deg)" }}
          >
            <Search size={32} style={{ color: SKAUTE_YELLOW }} />
          </div>
          <div className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center border-4 border-gray-50">
            <ShieldAlert size={24} style={{ color: SKAUTE_BLUE }} />
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-gray-900 mb-6 leading-none">
          That Move is <span style={{ color: SKAUTE_BLUE }}>Off-Grid</span>
        </h1>

        <div className="space-y-4 mb-12">
          <p className="text-gray-600 font-bold text-lg">
            We can&apos;t track down this specific event right now.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
            <div className="p-4 rounded-2xl bg-white/80 border border-gray-100">
              <p className="text-[10px] font-black uppercase text-gray-400 mb-1">
                Status Check
              </p>
              <p className="text-xs font-bold text-gray-600">
                This event might be awaiting admin approval or has been
                completed.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white/80 border border-gray-100">
              <p className="text-[10px] font-black uppercase text-gray-400 mb-1">
                Link Check
              </p>
              <p className="text-xs font-bold text-gray-600">
                The event URL may have been updated, or the move is currently
                awaiting host verification
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/discover"
            className="group flex-1 py-5 px-8 rounded-[24px] font-black uppercase text-sm flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95"
            style={{ backgroundColor: SKAUTE_YELLOW, color: "#000" }}
          >
            <MapPin size={18} />
            Explore Other Moves
          </Link>

          <Link
            href="/"
            className="flex-1 py-5 px-8 rounded-[24px] font-black uppercase text-sm bg-white border-2 border-gray-100 flex items-center justify-center gap-3 hover:bg-gray-50 transition-all"
          >
            <ArrowLeft size={18} />
            Back to Home
          </Link>
        </div>

        {/* Rivers State Marker */}
        <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-center gap-2">
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: SKAUTE_BLUE }}
          />
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            skaute • Rivers State
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// 2. MAIN SYSTEM DELEGATE WRAPPED IN SUSPENSE
export default function NotFound() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex flex-col items-center justify-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 animate-pulse">
            Loading...
          </p>
        </div>
      }
    >
      <NotFoundContent />
    </Suspense>
  );
}
