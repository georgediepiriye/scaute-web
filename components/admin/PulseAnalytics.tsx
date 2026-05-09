"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Area,
} from "recharts";
import { MapPin, ShoppingBag, Zap, Activity } from "lucide-react";

interface PulseProps {
  data: {
    neighborhoods?: { name: string; signups: number }[];
    velocity?: {
      _id: string;
      tickets: number;
      revenue: number;
      orders: number;
    }[];
    finances?: {
      totalRevenue: number;
      pendingAmount: number;
    };
    engagement?: {
      totalTickets: number;
      checkedIn: number;
    };
    // Fallback for initial load
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    eventStats?: any;
  };
}

export function PulseAnalytics({ data }: PulseProps) {
  // 1. Format Velocity Data for the Chart (Handling the 7-day trend)
  const velocityData =
    data.velocity?.map((item) => ({
      name: new Date(item._id).toLocaleDateString("en-US", {
        weekday: "short",
      }),
      revenue: item.revenue,
      tickets: item.tickets,
    })) || [];

  // 2. Map Neighborhood Heat
  const neighborhoodData = data.neighborhoods || [];

  // 3. Calculate Check-in Percentage
  const checkInRate = data.engagement?.totalTickets
    ? Math.round(
        (data.engagement.checkedIn / data.engagement.totalTickets) * 100,
      )
    : 0;

  return (
    <div className="space-y-6 w-full">
      {/* SECTION 1: THE MONEY PULSE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-black uppercase italic tracking-tighter">
                Ticket Velocity
              </h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase">
                7-Day Sales Trend
              </p>
            </div>
            <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-tighter flex items-center gap-2">
              <Activity size={12} /> Live Pulse
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={velocityData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip
                  contentStyle={{
                    borderRadius: "20px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue (₦)"
                  fill="url(#colorRev)"
                  stroke="#3b82f6"
                  strokeWidth={3}
                />
                <Bar
                  dataKey="tickets"
                  name="Tickets Sold"
                  barSize={20}
                  fill="#1e293b"
                  radius={[6, 6, 0, 0]}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-blue-600 p-8 rounded-[40px] text-white flex flex-col justify-between relative overflow-hidden min-h-[300px]">
          <div className="z-10">
            <ShoppingBag className="mb-4 opacity-50" size={32} />
            <h3 className="text-sm font-black uppercase tracking-widest opacity-80">
              Pending Payouts
            </h3>
            <p className="text-4xl font-black italic mt-2">
              ₦{data.finances?.pendingAmount?.toLocaleString() || "0"}
            </p>
          </div>
          <div className="z-10 bg-white/10 p-4 rounded-3xl backdrop-blur-md">
            <p className="text-[9px] font-black uppercase tracking-widest">
              Total Revenue (Verified)
            </p>
            <p className="text-lg font-bold italic uppercase tracking-tighter">
              ₦{data.finances?.totalRevenue?.toLocaleString() || "0"}
            </p>
          </div>
          <Zap
            className="absolute -right-10 -bottom-10 text-white/10"
            size={200}
          />
        </div>
      </div>

      {/* SECTION 2: NEIGHBORHOODS & ENGAGEMENT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <h3 className="text-sm font-black uppercase italic tracking-tighter mb-6 flex items-center gap-2">
            <MapPin size={16} className="text-blue-600" /> Neighborhood Heat
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={neighborhoodData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: "900" }}
                  width={100}
                />
                <Tooltip cursor={{ fill: "transparent" }} />
                <Bar
                  dataKey="signups"
                  name="User Signups"
                  fill="#2563eb"
                  radius={[0, 10, 10, 0]}
                  barSize={18}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4">
            <LegendItem color="bg-blue-600" label="Active Users in PH" />
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col">
          <h3 className="text-sm font-black uppercase italic tracking-tighter mb-6">
            Real-Time Engagement
          </h3>
          <div className="space-y-8 flex-1 flex flex-col justify-center">
            <div className="text-center">
              <p className="text-6xl font-black italic text-gray-900 leading-none">
                {checkInRate}%
              </p>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-2">
                Check-in Rate
              </p>
            </div>

            <div className="space-y-4">
              <EngagementRow
                label="Total Tickets Issued"
                value={data.engagement?.totalTickets || 0}
                color="bg-slate-100"
              />
              <EngagementRow
                label="Scanned at Entrance"
                value={data.engagement?.checkedIn || 0}
                color="bg-green-500"
              />
            </div>
          </div>
          <div className="mt-8 p-6 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed text-center">
              System Note: Data updates every time a{" "}
              <span className="text-slate-900">KIVO-Code</span> is scanned.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 ${color} rounded-full`} />
      <span className="text-[9px] font-black uppercase">{label}</span>
    </div>
  );
}

function EngagementRow({
  label,
  value,
  color,
}: {
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${color}`} />
        <span className="text-[10px] font-black uppercase tracking-tighter text-gray-500">
          {label}
        </span>
      </div>
      <span className="text-sm font-black italic">{value}</span>
    </div>
  );
}
