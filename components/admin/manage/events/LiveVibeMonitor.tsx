/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Users, CheckCircle2, Zap, Hourglass, BarChart } from "lucide-react";
import { motion } from "framer-motion";

interface LiveVibeProps {
  event: any;
  tickets: any[];
  analytics: {
    checkInCount: number;
    totalTicketsSold: number;
    checkInRate: number;
  };
}

export function LiveVibeMonitor({ event, tickets, analytics }: LiveVibeProps) {
  // Calculate pending check-ins
  const pendingCheckIns = analytics.totalTicketsSold - analytics.checkInCount;

  return (
    <div className="space-y-6">
      {/* VIBE STATUS CARD */}
      <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl shadow-blue-200/50 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Live Pulse
              </span>
            </div>
            <Zap size={18} className="text-blue-400" />
          </div>

          <div className="space-y-1">
            <h2 className="text-6xl font-black italic tracking-tighter">
              {analytics.checkInRate}%
            </h2>
            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">
              Check-in Completion
            </p>
          </div>

          {/* PROGRESS BAR */}
          <div className="mt-8 h-3 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${analytics.checkInRate}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
            />
          </div>
        </div>

        {/* ABSOLUTE BACKGROUND DECOR */}
        <div className="absolute -bottom-10 -right-10 opacity-10">
          <BarChart size={200} strokeWidth={1} />
        </div>
      </div>

      {/* DETAILED BREAKDOWN */}
      <div className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-sm space-y-6">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-400">
          Attendance Breakdown
        </h3>

        <div className="space-y-4">
          <BreakdownRow
            icon={<CheckCircle2 size={16} className="text-green-500" />}
            label="Arrived"
            value={analytics.checkInCount}
            sublabel="Guests inside"
          />
          <BreakdownRow
            icon={<Hourglass size={16} className="text-orange-500" />}
            label="Expected"
            value={pendingCheckIns}
            sublabel="Still to arrive"
          />
          <BreakdownRow
            icon={<Users size={16} className="text-blue-500" />}
            label="Total Sold"
            value={analytics.totalTicketsSold}
            sublabel="Tickets issued"
          />
        </div>
      </div>

      {/* SCANNER QUICK LINK (Optional) */}
      <div className="p-6 bg-blue-50 rounded-[32px] border border-blue-100 flex items-center justify-between group cursor-pointer">
        <div>
          <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest">
            Launch Scanner
          </p>
          <p className="text-[9px] font-medium text-blue-400">
            Switch to mobile scanner mode
          </p>
        </div>
        <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
          <Zap size={16} />
        </div>
      </div>
    </div>
  );
}

function BreakdownRow({ icon, label, value, sublabel }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-3xl border border-transparent hover:border-gray-100 transition-all">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-white rounded-xl shadow-sm">{icon}</div>
        <div>
          <p className="text-[10px] font-black uppercase text-gray-900 tracking-tighter">
            {label}
          </p>
          <p className="text-[9px] font-medium text-gray-400">{sublabel}</p>
        </div>
      </div>
      <p className="text-xl font-black italic text-gray-900">{value}</p>
    </div>
  );
}
