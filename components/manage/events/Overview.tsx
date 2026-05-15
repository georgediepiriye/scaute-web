/* eslint-disable @typescript-eslint/no-explicit-any */
import { Wallet, Users, BarChart3 } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const OverviewTab = ({ metrics }: any) => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Wallet size={16} className="text-yellow-500" />
          <h3 className="text-xs font-black uppercase tracking-[0.2em]">
            Financial Status
          </h3>
        </div>
        <p className="text-4xl font-black tracking-tighter">
          ₦{metrics?.totalRevenue?.toLocaleString()}
        </p>
        <p className="text-[10px] font-black text-slate-400 uppercase mt-1">
          Gross Sales Revenue
        </p>
        <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-slate-50">
          <div>
            <p className="text-sm font-black italic text-yellow-600">
              ₦{metrics?.totalRevenue?.toLocaleString()}
            </p>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
              In Escrow
            </p>
          </div>
          <div>
            <p className="text-sm font-black italic">₦0.00</p>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
              Processed
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Users size={16} className="text-yellow-500" />
          <h3 className="text-xs font-black uppercase tracking-[0.2em]">
            Attendance
          </h3>
        </div>
        <p className="text-4xl font-black tracking-tighter">
          {metrics?.totalTicketsSold}
        </p>
        <p className="text-[10px] font-black text-slate-400 uppercase mt-1">
          Total Passes Issued
        </p>
        <div className="mt-8 space-y-3">
          <div className="flex justify-between text-[10px] font-black uppercase">
            <span>Check-in Rate</span>
            <span>{metrics?.checkInCount} Scanned</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="bg-green-500 h-full transition-all duration-1000"
              style={{
                width: `${(metrics?.checkInCount / (metrics?.totalTicketsSold || 1)) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>

    {/* New Section: Ticket Tier Sales */}
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
                    {tier.sold}{" "}
                    <span className="text-sm text-slate-300">
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

              <div className="w-full h-1.5 bg-white rounded-full overflow-hidden border border-slate-100">
                <div
                  className={`h-full transition-all duration-1000 ${
                    percentage > 80 ? "bg-orange-500" : "bg-yellow-400"
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="flex justify-between mt-3">
                <p className="text-[8px] font-bold text-slate-400 uppercase">
                  Remaining: {tier.capacity - tier.sold}
                </p>
                <p className="text-[8px] font-bold text-slate-400 uppercase">
                  ₦{tier.revenue?.toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);
