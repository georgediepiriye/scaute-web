/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Loader2, AlertTriangle, Zap, Lock, Unlock } from "lucide-react";
import toast from "react-hot-toast";

export const SettingsTab = ({ event, isOrganizer, onRefresh }: any) => {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const handleToggleSoldOut = async (tierId?: string) => {
    // Determine if this is a global toggle or a specific tier toggle
    const isGlobal = !tierId;

    // Find current status to show the correct confirmation message
    const currentStatus = isGlobal
      ? event.isSoldOut
      : event.ticketTiers?.find((t: any) => t._id === tierId)?.isSoldOut;

    const message = currentStatus
      ? `Resume sales for ${isGlobal ? "this entire move" : "this ticket tier"}?`
      : `Mark ${isGlobal ? "this entire move" : "this ticket tier"} as sold out?`;

    if (!confirm(message)) return;

    // Set loading state for the specific button clicked
    const loadingKey = tierId || "global";
    setIsUpdating(loadingKey);

    try {
      // Use the unified endpoint you defined: /:id/toggle-sold-out
      const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/v1/events/${event._id}/toggle-sold-out`;

      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        // Pass tierId in the body; if undefined, the backend treats it as a global toggle
        body: JSON.stringify({ tierId: isGlobal ? undefined : tierId }),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success(
          currentStatus ? "Sales resumed!" : "Status updated to Sold Out",
        );
        // Trigger refresh to update the dashboard UI with fresh data
        if (onRefresh) onRefresh();
      } else {
        toast.error(result.message || "Failed to update status");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* TICKET TIERS MANAGEMENT */}
      {event.ticketingType === "internal" && event.ticketTiers?.length > 0 && (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm">
          <div className="mb-6">
            <h3 className="text-xs font-black uppercase tracking-widest mb-1 text-blue-600 flex items-center gap-2">
              <Zap size={14} fill="#0052FF" /> Tier Control
            </h3>
            <p className="text-[9px] text-slate-400 font-bold uppercase">
              Mark specific categories as sold out
            </p>
          </div>

          <div className="space-y-3">
            {event.ticketTiers.map((tier: any) => (
              <div
                key={tier._id}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  tier.isSoldOut
                    ? "bg-slate-50 border-slate-100 opacity-80"
                    : "bg-white border-slate-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      tier.isSoldOut
                        ? "bg-red-50 text-red-500"
                        : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    {tier.isSoldOut ? <Lock size={16} /> : <Unlock size={16} />}
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase italic leading-none">
                      {tier.name}
                    </p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">
                      {tier.sold} / {tier.capacity || "∞"} Sold
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleSoldOut(tier._id)}
                  disabled={isUpdating !== null}
                  className={`px-4 py-2 rounded-xl font-black text-[9px] uppercase transition-all flex items-center gap-2 ${
                    tier.isSoldOut
                      ? "text-blue-600 hover:bg-blue-100"
                      : "text-red-500 hover:bg-red-50"
                  }`}
                >
                  {isUpdating === tier._id ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : tier.isSoldOut ? (
                    "Resume Sales"
                  ) : (
                    "Mark Sold Out"
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GLOBAL EVENT TOGGLE (DANGER ZONE) */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-red-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 text-red-500 pointer-events-none">
          <AlertTriangle size={80} />
        </div>

        <h3 className="text-xs font-black uppercase tracking-widest text-red-500 mb-4 flex items-center gap-2">
          Danger Zone
        </h3>

        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-sm font-black uppercase italic">
              Global Sold Out Toggle
            </p>
            <p className="text-[10px] text-slate-400 font-bold uppercase">
              {event.isSoldOut
                ? "All ticket categories are currently paused"
                : "Stop all ticket sales for this move immediately"}
            </p>
          </div>

          <button
            onClick={() => handleToggleSoldOut()}
            disabled={isUpdating !== null}
            className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 ${
              event.isSoldOut
                ? "bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-100"
                : "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-100"
            }`}
          >
            {isUpdating === "global" ? (
              <Loader2 size={14} className="animate-spin" />
            ) : event.isSoldOut ? (
              "Resume All Sales"
            ) : (
              "Mark Move as Sold Out"
            )}
          </button>
        </div>
      </div>

      {/* Permissions UI */}
      {isOrganizer && (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm">
          <div className="mb-6">
            <h3 className="text-xs font-black uppercase tracking-widest mb-1">
              Partner Permissions
            </h3>
            <p className="text-[9px] text-slate-400 font-bold uppercase">
              Control what your co-organizers can access
            </p>
          </div>
          <div className="space-y-2">
            {[
              "View Revenue",
              "Issue Refunds",
              "Send Broadcasts",
              "Scan Tickets",
            ].map((perm) => (
              <label
                key={perm}
                className="flex items-center justify-between py-4 px-2 border-b border-slate-50 opacity-40 cursor-not-allowed"
              >
                <span className="text-[10px] font-black uppercase">{perm}</span>
                <div className="w-9 h-5 bg-slate-200 rounded-full"></div>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
