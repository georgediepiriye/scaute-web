/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  TrendingUp,
  Ticket,
  Users,
  Zap,
  ArrowUpRight,
  Target,
  PlusCircle,
} from "lucide-react";
import { motion } from "framer-motion";

interface ManagementStatsProps {
  analytics: {
    totalRevenue: number;
    totalTicketsSold: number;
    checkInCount: number;
    checkInRate: number;
    capacityUtilization: number;
  };
  event: {
    totalCapacity?: number;
    attendees: number;
  };
  onExpandCapacity?: () => void;
}

export function ManagementStats({
  analytics,
  event,
  onExpandCapacity,
}: ManagementStatsProps) {
  return (
    <div className="space-y-6">
      {/* PRIMARY STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* SALES PERFORMANCE */}
        <StatCard
          label="Sales Volume"
          value={analytics.totalTicketsSold.toLocaleString()}
          subtext="Tickets Issued"
          icon={<Ticket size={20} className="text-blue-600" />}
          trend="Live"
          color="blue"
        />

        {/* REVENUE VELOCITY */}
        <StatCard
          label="Gross Revenue"
          value={`₦${analytics.totalRevenue.toLocaleString()}`}
          subtext="Total Paid Orders"
          icon={<TrendingUp size={20} className="text-emerald-600" />}
          trend="Live"
          color="emerald"
        />

        {/* CAPACITY FILL RATE */}
        <StatCard
          label="Venue Fill"
          value={`${analytics.capacityUtilization}%`}
          subtext="Capacity Used"
          icon={<Target size={20} className="text-purple-600" />}
          trend={analytics.capacityUtilization > 90 ? "Sold Out" : "Filling"}
          color="purple"
        />
      </div>

      {/* CAPACITY OVERRIDE BAR */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-100 p-8 rounded-[40px] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="flex-1 w-full space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">
                Live Occupancy
              </p>
              <h4 className="text-2xl font-black italic tracking-tighter text-gray-900">
                {event.attendees}{" "}
                <span className="text-gray-300 text-lg">/</span>{" "}
                {event.totalCapacity || "∞"}
              </h4>
            </div>
            <p className="text-[10px] font-bold text-blue-600 uppercase italic">
              {analytics.capacityUtilization}% Filled
            </p>
          </div>

          <div className="w-full h-3 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(analytics.capacityUtilization, 100)}%`,
              }}
              className={`h-full transition-all duration-1000 ${
                analytics.capacityUtilization > 90
                  ? "bg-red-500"
                  : "bg-blue-600"
              }`}
            />
          </div>
        </div>

        <button
          onClick={onExpandCapacity}
          className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-[24px] hover:bg-blue-600 transition-all group flex-shrink-0"
        >
          <div className="text-right">
            <p className="text-[9px] font-black uppercase tracking-widest opacity-60">
              Management
            </p>
            <p className="text-[11px] font-black uppercase tracking-tight">
              Expand Capacity
            </p>
          </div>
          <PlusCircle
            size={20}
            className="group-hover:rotate-90 transition-transform"
          />
        </button>
      </motion.div>
    </div>
  );
}

function StatCard({ label, value, subtext, icon, trend, color }: any) {
  const colorMap: any = {
    blue: "bg-blue-50 border-blue-100 text-blue-600",
    emerald: "bg-emerald-50 border-emerald-100 text-emerald-600",
    purple: "bg-purple-50 border-purple-100 text-purple-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-100 p-6 rounded-[32px] shadow-sm hover:shadow-md transition-all group"
    >
      <div className="flex justify-between items-start mb-4">
        <div
          className={`p-3 rounded-2xl ${colorMap[color]} transition-transform group-hover:scale-110`}
        >
          {icon}
        </div>
        <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-lg">
          <span className="text-[8px] font-black uppercase tracking-tighter text-gray-400">
            {trend}
          </span>
          <ArrowUpRight size={10} className="text-gray-300" />
        </div>
      </div>

      <div>
        <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">
          {label}
        </h3>
        <p className="text-3xl font-black text-gray-900 italic tracking-tighter mb-1">
          {value}
        </p>
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">
          {subtext}
        </p>
      </div>
    </motion.div>
  );
}
