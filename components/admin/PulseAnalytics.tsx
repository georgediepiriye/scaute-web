/* eslint-disable @typescript-eslint/no-explicit-any */
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
  CartesianGrid,
} from "recharts";
import {
  MapPin,
  ShoppingBag,
  Zap,
  Activity,
  AlertTriangle,
  ShieldCheck,
  Clock,
  TrendingUp,
  Percent,
} from "lucide-react";

interface VelocityItem {
  _id: string;
  tickets: number;
  revenue: number;
  orders: number;
}

interface NeighborhoodItem {
  name: string;
  signups: number;
}

interface PulseProps {
  data: {
    neighborhoods?: NeighborhoodItem[];
    velocity?: VelocityItem[];
    finances?: {
      totalRevenue: number;
      pendingAmount: number;
      platformCommission?: number;
    };
    engagement?: {
      totalTickets: number;
      checkedIn: number;
    };
    escalations?: {
      pendingModerationCount: number;
      activeDisputesCount: number;
      unverifiedOrganizersCount: number;
    };
    eventStats?: any;
  } | null; // Safe guard for uninitialized parent allocations
}

export function PulseAnalytics({ data }: PulseProps) {
  // Safe extraction wrapper fellbacks
  const pulsePayload = data || {};
  const { finances, engagement, escalations, neighborhoods, velocity } =
    pulsePayload;

  // Safe Transform Sequence for Ticket Velocity Analytics
  const velocityData =
    velocity?.map((item: VelocityItem) => {
      try {
        // Safe check for ISO Strings or timestamp sequences
        const labelDate = item._id ? new Date(item._id) : new Date();
        return {
          name: isNaN(labelDate.getTime())
            ? "Day"
            : labelDate.toLocaleDateString("en-US", { weekday: "short" }),
          revenue: item.revenue || 0,
          tickets: item.tickets || 0,
        };
      } catch {
        return { name: "Day", revenue: 0, tickets: 0 };
      }
    }) || [];

  const neighborhoodData = neighborhoods || [];

  // Safe Evaluation of Ticket Checkout Conversion Rate
  const totalTicketsVolume = engagement?.totalTickets || 0;
  const checkedInVolume = engagement?.checkedIn || 0;
  const checkInRate =
    totalTicketsVolume > 0
      ? Math.round((checkedInVolume / totalTicketsVolume) * 100)
      : 0;

  return (
    <div className="space-y-6 w-full">
      {/* ACTION STRIP: REAL-TIME ESCALATIONS QUEUE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-red-100 p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
              <AlertTriangle size={18} />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase text-gray-400 tracking-wider">
                Awaiting Moderation
              </p>
              <p className="text-xl font-black text-gray-900">
                {escalations?.pendingModerationCount || 0} Moves
              </p>
            </div>
          </div>
          <span className="text-[9px] font-bold bg-red-50 text-red-600 px-2 py-1 rounded-md uppercase">
            High Priority
          </span>
        </div>

        <div className="bg-white border border-amber-100 p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Clock size={18} />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase text-gray-400 tracking-wider">
                KYC Verification Queue
              </p>
              <p className="text-xl font-black text-gray-900">
                {escalations?.unverifiedOrganizersCount || 0} Hosts
              </p>
            </div>
          </div>
          <span className="text-[9px] font-bold bg-amber-50 text-amber-600 px-2 py-1 rounded-md uppercase">
            Pending
          </span>
        </div>

        <div className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-50 text-slate-800 rounded-xl">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase text-gray-400 tracking-wider">
                Active Disputes
              </p>
              <p className="text-xl font-black text-gray-900">
                {escalations?.activeDisputesCount || 0} Flags
              </p>
            </div>
          </div>
          <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-md uppercase">
            Secured
          </span>
        </div>
      </div>

      {/* SECTION 1: THE MONEY PULSE CHART HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900">
                Ticket Velocity
              </h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                7-Day Sales & Liquidity Curve
              </p>
            </div>
            <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter flex items-center gap-2">
              <Activity size={12} className="animate-pulse" /> Live Pulse
            </div>
          </div>

          <div className="h-[300px] w-full flex items-center justify-center">
            {velocityData.length === 0 ? (
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">
                Awaiting structural velocity metrics...
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={velocityData}
                  margin={{ left: -10, right: 10 }}
                >
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="#3b82f6"
                        stopOpacity={0.15}
                      />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f1f5f9"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 9, fontWeight: "700", fill: "#94a3b8" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 9, fontWeight: "700", fill: "#94a3b8" }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "16px",
                      border: "none",
                      boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.05)",
                      fontFamily: "inherit",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Gross Revenue (₦)"
                    fill="url(#colorRev)"
                    stroke="#3b82f6"
                    strokeWidth={3}
                  />
                  <Bar
                    dataKey="tickets"
                    name="Tickets Sold"
                    barSize={16}
                    fill="#1e293b"
                    radius={[4, 4, 0, 0]}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* FINANCIAL SPLIT LEDGER BALANCE BOX */}
        <div className="bg-slate-900 p-8 rounded-[40px] text-white flex flex-col justify-between relative overflow-hidden min-h-[350px] shadow-xl">
          <div className="z-10">
            <ShoppingBag className="mb-4 text-blue-500" size={28} />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Escrow Organizers Pool (Pending Payout)
            </h3>
            <p className="text-4xl font-black italic mt-1 tracking-tight text-white">
              ₦{(finances?.pendingAmount ?? 0).toLocaleString()}
            </p>
          </div>

          {/* Platform Core Profit Commissions */}
          <div className="z-10 my-4 bg-blue-600/30 border border-blue-500/20 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-blue-300 flex items-center gap-1">
                <Percent size={10} /> Platform Take-Rate Earnings
              </p>
              <p className="text-xl font-black italic mt-0.5 text-blue-400">
                ₦{(finances?.platformCommission ?? 0).toLocaleString()}
              </p>
            </div>
            <TrendingUp size={20} className="text-blue-400 opacity-60" />
          </div>

          <div className="z-10 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
              Total Gross Processing Volume
            </p>
            <p className="text-lg font-black italic uppercase tracking-tight text-white">
              ₦{(finances?.totalRevenue ?? 0).toLocaleString()}
            </p>
          </div>
          <Zap
            className="absolute -right-12 -bottom-12 text-slate-800/40"
            size={220}
          />
        </div>
      </div>

      {/* SECTION 2: REGIONAL DENSITY & TICKETS ADMITTANCE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <h3 className="text-sm font-black uppercase italic tracking-tighter mb-6 flex items-center gap-2 text-slate-900">
            <MapPin size={16} className="text-blue-600" /> Neighborhood Heat
            Mapping
          </h3>
          <div className="h-[280px] w-full flex items-center justify-center">
            {neighborhoodData.length === 0 ? (
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">
                No active neighborhood distributions recorded.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={neighborhoodData}
                  layout="vertical"
                  margin={{ left: -15 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: "900", fill: "#475569" }}
                    width={110}
                  />
                  <Tooltip cursor={{ fill: "rgba(241, 245, 249, 0.5)" }} />
                  <Bar
                    dataKey="signups"
                    name="User Signups"
                    fill="#2563eb"
                    radius={[0, 8, 8, 0]}
                    barSize={14}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50">
            <LegendItem
              color="bg-blue-600"
              label="Active Community Distribution"
            />
          </div>
        </div>

        {/* ADMITTANCE CONVERSION OVERVIEW */}
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col">
          <h3 className="text-sm font-black uppercase italic tracking-tighter mb-6 text-slate-900">
            Real-Time Ticket Gate Verification
          </h3>
          <div className="space-y-6 flex-1 flex flex-col justify-center">
            <div className="text-center">
              <p className="text-6xl font-black italic text-gray-900 tracking-tighter leading-none">
                {checkInRate}%
              </p>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-2.5">
                Conversion Gate Admittance Rate
              </p>
            </div>

            <div className="space-y-3">
              <EngagementRow
                label="Total Tickets Distributed"
                value={totalTicketsVolume}
                color="bg-slate-300"
              />
              <EngagementRow
                label="Scanned & Confirmed At Gate"
                value={checkedInVolume}
                color="bg-emerald-500"
              />
            </div>
          </div>
          <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed text-center">
              Secure Operations Node: Validating through decentralized{" "}
              <span className="text-slate-900 font-black">Secure-Pass</span>{" "}
              hashes.
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
      <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">
        {label}
      </span>
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
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
      <div className="flex items-center gap-3">
        <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
        <span className="text-[10px] font-black uppercase tracking-tight text-slate-500">
          {label}
        </span>
      </div>
      <span className="text-base font-black italic text-slate-900">
        {typeof value === "number" ? value.toLocaleString() : value}
      </span>
    </div>
  );
}
