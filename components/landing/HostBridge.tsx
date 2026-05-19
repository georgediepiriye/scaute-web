/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion } from "framer-motion";
import { Plus, Globe, Map as MapIcon, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

/**
 * skaute HOST BRIDGE COMPONENT
 * Location: Port Harcourt focused
 */

const MOCK_PINS = [
  {
    top: "22%",
    left: "35%",
    label: "Aggrey Road",
    color: "#0052FF",
    delay: 0,
    users: 12,
  },
  {
    top: "65%",
    left: "72%",
    label: "Forces Ave",
    color: "#FBBF24",
    delay: 1,
    users: 45,
  },
  {
    top: "45%",
    left: "50%",
    label: "Pleasure Park",
    color: "#0052FF",
    delay: 0.5,
    users: 120,
  },
  {
    top: "82%",
    left: "25%",
    label: "Old GRA",
    color: "#FBBF24",
    delay: 1.5,
    users: 8,
  },
  {
    top: "35%",
    left: "85%",
    label: "Trans Amadi",
    color: "#0052FF",
    delay: 0.2,
    users: 33,
  },
  {
    top: "18%",
    left: "65%",
    label: "D-Line",
    color: "#FBBF24",
    delay: 0.8,
    users: 19,
  },
];

export default function HostBridge() {
  return (
    <section className="py-32 px-6 relative overflow-hidden bg-[#fafafa]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* 1. TEXT CONTENT SECTION */}
        <div className="lg:col-span-5 space-y-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-[#FBBF24] border-2 border-slate-950 px-4 py-1.5 rounded-full shadow-[4px_4px_0_0_#0f172a]"
          >
            <Plus size={16} strokeWidth={3} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Start a move
            </span>
          </motion.div>

          <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] uppercase text-slate-950">
            OWN THE <br />
            <span className="text-[#0052FF] italic">MAP.</span>
          </h2>

          <p className="text-xl font-bold text-slate-500 max-w-md leading-relaxed">
            Turn your idea into a city-wide activity. Whether it&apos;s a
            rooftop hangout or a digital workshop, put it on the skaute map and
            watch the community join.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[#0052FF]">
                <MapIcon size={20} strokeWidth={3} />
                <span className="font-black text-xs uppercase tracking-widest">
                  Physical
                </span>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                Pin your location in PH
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-purple-600">
                <Globe size={20} strokeWidth={3} />
                <span className="font-black text-xs uppercase tracking-widest">
                  Digital
                </span>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                Global reach from anywhere
              </p>
            </div>
          </div>

          <Link href="/create" className="block w-fit group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-slate-950 text-white px-10 py-6 rounded-2xl flex items-center gap-4 shadow-[8px_8px_0_0_#0052FF] transition-all hover:shadow-none hover:translate-x-1 hover:translate-y-1"
            >
              <span className="font-black uppercase tracking-widest text-sm">
                Become a Host
              </span>
              <ArrowRight size={20} strokeWidth={3} />
            </motion.div>
          </Link>
        </div>

        {/* 2. ENHANCED DYNAMIC MAP VISUAL */}
        <div className="lg:col-span-7 relative h-[500px] md:h-[650px] w-full bg-white rounded-[40px] md:rounded-[60px] border-[4px] border-slate-950 overflow-hidden shadow-2xl">
          {/* Subtle Grid Pattern */}
          <div
            className="absolute inset-0 opacity-[0.1]"
            style={{
              backgroundImage:
                "radial-gradient(#0f172a 1.5px, transparent 1.5px)",
              backgroundSize: "32px 32px",
            }}
          />

          {/* Large Area Watermark */}
          <div className="absolute inset-0 pointer-events-none opacity-5 font-black text-[120px] md:text-[180px] text-slate-950 italic flex items-center justify-center select-none uppercase tracking-tighter leading-none text-center">
            PORT <br /> HARCOURT
          </div>

          {/* The Pins Layer */}
          <div className="absolute inset-0 z-20">
            {MOCK_PINS.map((pin, i) => (
              <MapPinPulse key={i} {...pin} />
            ))}
          </div>

          {/* Activity Paths (Connecting Lines) */}
          <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
            <motion.path
              d="M 35% 22% Q 45% 35%, 50% 45%"
              fill="transparent"
              stroke="#0052FF"
              strokeWidth="3"
              strokeDasharray="10 10"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.path
              d="M 72% 65% Q 65% 55%, 50% 45%"
              fill="transparent"
              stroke="#FBBF24"
              strokeWidth="3"
              strokeDasharray="10 10"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              transition={{ duration: 3, delay: 1, repeat: Infinity }}
            />
          </svg>

          {/* Floating Social Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-8 left-8 right-8 md:left-auto md:w-72 bg-white border-2 border-slate-950 p-5 rounded-3xl shadow-[10px_10px_0_0_#0f172a] z-30"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 overflow-hidden relative"
                  >
                    <Image
                      src={`https://i.pravatar.cc/100?img=${i + 20}`}
                      alt="host"
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-tight text-slate-400 leading-none mb-1">
                  Local Growth
                </p>
                <p className="text-xl font-black italic text-slate-950 tracking-tighter uppercase leading-none">
                  842 Hosts
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase italic">
                <span>Community Activity</span>
                <span className="text-[#0052FF]">94%</span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-950/5">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "94%" }}
                  transition={{ duration: 1.5, delay: 0.8 }}
                  className="h-full bg-[#0052FF]"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function MapPinPulse({ top, left, label, color, delay, users }: any) {
  return (
    <motion.div
      style={{ top, left }}
      initial={{ scale: 0, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true }}
      className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
    >
      {/* Dynamic Popover */}
      <motion.div className="mb-2 bg-white border-2 border-slate-950 px-3 py-1 rounded-xl shadow-[4px_4px_0_0_#0f172a] opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-y-2 group-hover:translate-y-0">
        <span className="text-[10px] font-black text-slate-950 uppercase tracking-tighter whitespace-nowrap">
          <Users size={10} className="inline mr-1 mb-0.5" /> {users} Joined
        </span>
      </motion.div>

      <div className="relative">
        {/* Pulsing Aura */}
        <motion.div
          animate={{ scale: [1, 2.5, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, delay }}
          style={{ backgroundColor: color }}
          className="absolute inset-0 rounded-full"
        />

        {/* Core Marker */}
        <div
          style={{ backgroundColor: color }}
          className="w-6 h-6 rounded-full border-[3px] border-slate-950 relative z-10 shadow-xl group-hover:scale-125 transition-transform"
        />
      </div>

      {/* Neighborhood Tag */}
      <div className="mt-3 bg-slate-950 px-4 py-1.5 rounded-full transform -skew-x-12 border border-white/20 shadow-xl group-hover:bg-[#0052FF] transition-colors">
        <span className="text-[10px] font-black uppercase text-white whitespace-nowrap tracking-widest italic">
          {label}
        </span>
      </div>
    </motion.div>
  );
}
