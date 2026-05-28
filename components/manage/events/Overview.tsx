/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
  Wallet,
  Users,
  BarChart3,
  EyeOff,
  CreditCard,
  Landmark,
  Coins,
} from "lucide-react";

interface OverviewTabProps {
  metrics: any;
  canViewRevenue: boolean;
}

export const OverviewTab = ({ metrics, canViewRevenue }: OverviewTabProps) => {
  /**
   * SAFE NUMBERS FROM OPTION A BACKEND
   */
  const grossRevenue = Number(metrics?.grossRevenue || 0); // Online only
  const grossGateRevenue = Number(metrics?.grossGateRevenue || 0); // Physical cash/POS at gate
  const platformFee = Number(metrics?.platformFeeAmount || 0); // Combined Skaute earnings
  const organizerRevenue = Number(metrics?.organizerNetRevenue || 0); // Total Net across both tracks
  const withdrawableBalance = Number(metrics?.withdrawableBalance || 0);
  const totalPayouts = Number(metrics?.totalPayoutCompleted || 0);

  // Directly read the percent value cleanly
  const feePercent = Number(metrics?.platformFeePercent || 5.5);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ========================================= */}
      {/* PRIMARY METRIC GRID */}
      {/* ========================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* REVENUE BREAKDOWN */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Wallet size={16} className="text-yellow-500" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em]">
                Revenue Breakdown
              </h3>
            </div>

            {!canViewRevenue && (
              <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-full text-[8px] font-black text-slate-400 uppercase tracking-wider">
                <EyeOff size={10} /> Hidden
              </span>
            )}
          </div>

          {/* ORGANIZER NET TOTAL */}
          <div>
            <p className="text-4xl font-black tracking-tighter text-slate-900">
              {canViewRevenue
                ? `₦${organizerRevenue.toLocaleString()}`
                : "••••••"}
            </p>
            <p className="text-[10px] font-black text-slate-400 uppercase mt-1 tracking-widest">
              Your Total Earnings (Net)
            </p>
          </div>

          {/* BREAKDOWN INTERNAL SEGMENTS */}
          <div className="mt-8 pt-8 border-t border-slate-100 space-y-5">
            {/* ONLINE SALES BUCKET */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                  Online Ticket Sales
                </p>
                <p className="text-sm font-black text-slate-900 mt-1">
                  {canViewRevenue
                    ? `₦${grossRevenue.toLocaleString()}`
                    : "••••••"}
                </p>
              </div>
              <div className="bg-slate-100 h-10 w-10 rounded-2xl flex items-center justify-center">
                <CreditCard size={16} className="text-slate-600" />
              </div>
            </div>

            {/* NEW: PHYSICAL GATE SALES BUCKET */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                  Physical Gate Sales (Cash/POS)
                </p>
                <p className="text-sm font-black text-slate-600 mt-1">
                  {canViewRevenue
                    ? `₦${grossGateRevenue.toLocaleString()}`
                    : "••••••"}
                </p>
              </div>
              <div className="bg-amber-50 h-10 w-10 rounded-2xl flex items-center justify-center">
                <Coins size={16} className="text-amber-600" />
              </div>
            </div>

            {/* TOTAL COMBINED SKAUTE COMMISSIONS */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                  Total Skaute Fee ({feePercent}%)
                </p>
                <p className="text-sm font-black text-rose-500 mt-1">
                  {canViewRevenue
                    ? `- ₦${platformFee.toLocaleString()}`
                    : "••••••"}
                </p>
              </div>
              <div className="bg-rose-50 h-10 w-10 rounded-2xl flex items-center justify-center">
                <Landmark size={16} className="text-rose-500" />
              </div>
            </div>

            {/* ESCROW CLEARANCE WITHDRAWABLE POOL */}
            <div className="bg-yellow-50 border border-yellow-100 rounded-3xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-yellow-700">
                    Available For Withdrawal
                  </p>
                  <p className="text-2xl font-black text-yellow-900 mt-1 tracking-tight">
                    {canViewRevenue
                      ? `₦${withdrawableBalance.toLocaleString()}`
                      : "••••••"}
                  </p>
                </div>
                <div className="bg-yellow-200 h-12 w-12 rounded-2xl flex items-center justify-center">
                  <Wallet size={18} className="text-yellow-900" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ATTENDANCE CARD */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Users size={16} className="text-yellow-500" />
            <h3 className="text-xs font-black uppercase tracking-[0.2em]">
              Attendance
            </h3>
          </div>

          <p className="text-4xl font-black tracking-tighter">
            {metrics?.totalTicketsSold || 0}
          </p>
          <p className="text-[10px] font-black text-slate-400 uppercase mt-1">
            Total Passes Issued (Online + Gate)
          </p>

          <div className="mt-8 space-y-3">
            <div className="flex justify-between text-[10px] font-black uppercase">
              <span>Check-in Rate</span>
              <span>{metrics?.checkInCount || 0} Scanned</span>
            </div>

            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="bg-green-500 h-full transition-all duration-1000"
                style={{
                  width: `${
                    ((metrics?.checkInCount || 0) /
                      (metrics?.totalTicketsSold || 1)) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-slate-100">
            <div className="bg-slate-50 rounded-3xl p-5">
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                Checked In
              </p>
              <p className="text-2xl font-black mt-2 text-slate-900">
                {metrics?.checkInCount || 0}
              </p>
            </div>

            <div className="bg-slate-50 rounded-3xl p-5">
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                Remaining
              </p>
              <p className="text-2xl font-black mt-2 text-slate-900">
                {Math.max(
                  (metrics?.totalTicketsSold || 0) -
                    (metrics?.checkInCount || 0),
                  0,
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================= */}
      {/* PAYOUT LOGISTICS SUMMARY BAR */}
      {/* ========================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
            Total Paid Out to Bank
          </p>
          <h4 className="text-3xl font-black tracking-tight mt-3 text-slate-900">
            {canViewRevenue ? `₦${totalPayouts.toLocaleString()}` : "••••••"}
          </h4>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
            Net Revenue (All Streams)
          </p>
          <h4 className="text-3xl font-black tracking-tight mt-3 text-emerald-600">
            {canViewRevenue
              ? `₦${organizerRevenue.toLocaleString()}`
              : "••••••"}
          </h4>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
            Total Skaute Earnings
          </p>
          <h4 className="text-3xl font-black tracking-tight mt-3 text-rose-500">
            {canViewRevenue ? `₦${platformFee.toLocaleString()}` : "••••••"}
          </h4>
        </div>
      </div>

      {/* ========================================= */}
      {/* TIER BREAKDOWN */}
      {/* ========================================= */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm">
        <div className="flex items-center gap-2 mb-8">
          <BarChart3 size={16} className="text-yellow-500" />
          <h3 className="text-xs font-black uppercase tracking-[0.2em]">
            Tier Sales Breakdown
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {metrics?.salesByTier?.map((tier: any, index: number) => {
            const percentage = Math.round(
              (tier.sold / (tier.capacity || 1)) * 100,
            );

            return (
              <div
                key={index}
                className="bg-slate-50 p-6 rounded-3xl border border-slate-100"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      {tier.name}
                    </p>
                    <p className="text-2xl font-black tracking-tighter mt-1">
                      {tier.sold}
                      <span className="text-sm text-slate-300">
                        {" "}
                        / {tier.capacity}
                      </span>
                    </p>
                  </div>

                  <div className="bg-white px-3 py-1 rounded-full border border-slate-200">
                    <p className="text-[9px] font-black text-yellow-600 italic">
                      {percentage}%
                    </p>
                  </div>
                </div>

                <div className="w-full h-1.5 bg-white rounded-full overflow-hidden 1 border border-slate-100">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      percentage > 80 ? "bg-orange-500" : "bg-yellow-400"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="mt-5 space-y-2">
                  <div className="flex justify-between">
                    <p className="text-[8px] font-bold text-slate-400 uppercase">
                      Total Tier Value
                    </p>
                    <p className="text-[9px] font-black text-slate-700">
                      {canViewRevenue
                        ? `₦${Number(tier.grossRevenue || 0).toLocaleString()}`
                        : "••••••"}
                    </p>
                  </div>

                  <div className="flex justify-between">
                    <p className="text-[8px] font-bold text-slate-400 uppercase">
                      Est. Organizer Share
                    </p>
                    <p className="text-[9px] font-black text-emerald-600">
                      {canViewRevenue
                        ? `₦${Number(tier.organizerRevenue || 0).toLocaleString()}`
                        : "••••••"}
                    </p>
                  </div>

                  <div className="flex justify-between">
                    <p className="text-[8px] font-bold text-slate-400 uppercase">
                      Est. Skaute Fee
                    </p>
                    <p className="text-[9px] font-black text-rose-500">
                      {canViewRevenue
                        ? `₦${Number(tier.platformFee || 0).toLocaleString()}`
                        : "••••••"}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex justify-between">
                    <p className="text-[8px] font-bold text-slate-400 uppercase">
                      Tickets Remaining
                    </p>
                    <p className="text-[9px] font-black text-slate-700">
                      {Math.max(tier.capacity - tier.sold, 0)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
