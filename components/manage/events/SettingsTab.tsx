/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import {
  Loader2,
  AlertTriangle,
  Zap,
  Lock,
  Unlock,
  Users2,
  ShieldAlert,
} from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

export type CoOrganizerPermission =
  | "view_revenue"
  | "issue_refunds"
  | "send_broadcasts"
  | "scan_tickets";

// AVAILABLE PERMISSIONS ON KIVO PLATFORM
const AVAILABLE_PERMISSIONS: { id: CoOrganizerPermission; label: string }[] = [
  { id: "view_revenue", label: "View Revenue" },
  { id: "issue_refunds", label: "Issue Refunds" },
  { id: "send_broadcasts", label: "Send Broadcasts" },
  { id: "scan_tickets", label: "Scan Tickets" },
];

export const SettingsTab = ({ event, isOrganizer, onRefresh }: any) => {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const handleToggleSoldOut = async (tierId?: string) => {
    const isGlobal = !tierId;
    const currentStatus = isGlobal
      ? event.isSoldOut
      : event.ticketTiers?.find((t: any) => t._id === tierId)?.isSoldOut;

    const message = currentStatus
      ? `Resume sales for ${isGlobal ? "this entire move" : "this ticket tier"}?`
      : `Mark ${isGlobal ? "this entire move" : "this ticket tier"} as sold out?`;

    if (!confirm(message)) return;

    const loadingKey = tierId || "global";
    setIsUpdating(loadingKey);

    try {
      const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/v1/events/${event._id}/toggle-sold-out`;

      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ tierId: isGlobal ? undefined : tierId }),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success(
          currentStatus ? "Sales resumed!" : "Status updated to Sold Out",
        );
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

  // DYNAMIC PERMISSION UPDATER HANDLER FOR PARTNERS
  const handleTogglePermission = async (
    coOrganizerUserId: string,
    currentPermissions: string[],
    permissionId: string,
  ) => {
    const loadingKey = `${coOrganizerUserId}-${permissionId}`;
    setIsUpdating(loadingKey);

    // Safeguard configuration to ensure default fallback arrays work correctly on target manipulation
    const basePermissions =
      currentPermissions.length === 0 ? ["scan_tickets"] : currentPermissions;

    let updatedPermissions: string[];
    if (basePermissions.includes(permissionId)) {
      updatedPermissions = basePermissions.filter((p) => p !== permissionId);
    } else {
      updatedPermissions = [...basePermissions, permissionId];
    }

    try {
      const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/v1/events/${event._id}/update-coorganizer-permissions`;

      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          coOrganizerId: coOrganizerUserId,
          permissions: updatedPermissions,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("Permissions updated successfully");
        if (onRefresh) onRefresh();
      } else {
        toast.error(result.message || "Failed to update permissions");
      }
    } catch (err) {
      toast.error("Network error updating permissions.");
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
            <h3 className="text-xs font-black uppercase tracking-widest mb-1 text-[#0052FF] flex items-center gap-2">
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
                    <p className="text-[11px] font-black uppercase italic leading-none text-slate-800">
                      {tier.name}
                    </p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">
                      {tier.sold || 0} / {tier.capacity || "∞"} Sold
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleSoldOut(tier._id)}
                  disabled={isUpdating !== null}
                  className={`px-4 py-2 rounded-xl font-black text-[9px] uppercase transition-all flex items-center gap-2 ${
                    tier.isSoldOut
                      ? "text-[#0052FF] hover:bg-blue-100"
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
            <p className="text-sm font-black uppercase italic text-slate-900">
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

      {/* PARTNER PERMISSIONS MANAGEMENT */}
      {isOrganizer && (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm space-y-8">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest mb-1 text-slate-800 flex items-center gap-2">
              <Users2 size={14} className="text-[#0052FF]" /> Partner Operations
            </h3>
            <p className="text-[9px] text-slate-400 font-bold uppercase">
              Configure independent feature access permissions per partner
            </p>
          </div>

          {event.coOrganizers && event.coOrganizers.length > 0 ? (
            <div className="divide-y divide-slate-100 space-y-6">
              {event.coOrganizers.map((coOrg: any) => {
                const partnerUser = coOrg.user || {};
                const partnerUserId = partnerUser._id || partnerUser;
                const permissionsList = coOrg.permissions || [];

                return (
                  <div
                    key={partnerUserId}
                    className="pt-6 first:pt-0 space-y-4"
                  >
                    {/* Partner ID Banner */}
                    <div className="flex items-center gap-3 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                      <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-slate-200 border border-slate-200">
                        <Image
                          src={partnerUser.image || "/images/profile.jpg"}
                          alt={partnerUser.name || "Partner"}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-[11px] font-black uppercase text-slate-800 tracking-tight leading-none">
                          {partnerUser.name || "Partner Access"}
                        </p>
                        <p className="text-[9px] font-bold text-slate-400 tracking-wide mt-1 lowercase">
                          {partnerUser.email || "Active Collaborator"}
                        </p>
                      </div>
                    </div>

                    {/* Permissions Grid Matrix */}
                    <div className="grid sm:grid-cols-2 gap-2 pl-1">
                      {AVAILABLE_PERMISSIONS.map((perm) => {
                        // FIX: Matches backend roles cleanly, and sets active toggle state for 'scan_tickets' if database permission initialization array is empty
                        const isGranted =
                          permissionsList.includes(perm.id) ||
                          (perm.id === "scan_tickets" &&
                            permissionsList.length === 0);

                        const loadingKey = `${partnerUserId}-${perm.id}`;
                        const isLoading = isUpdating === loadingKey;

                        return (
                          <div
                            key={perm.id}
                            className="flex items-center justify-between p-3.5 bg-white border border-slate-100 rounded-xl hover:bg-slate-50/30 transition-colors"
                          >
                            <span className="text-[10px] font-black uppercase tracking-wide text-slate-600">
                              {perm.label}
                            </span>

                            <button
                              type="button"
                              disabled={isUpdating !== null}
                              onClick={() =>
                                handleTogglePermission(
                                  partnerUserId,
                                  permissionsList,
                                  perm.id,
                                )
                              }
                              className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-40 ${
                                isGranted ? "bg-[#0052FF]" : "bg-slate-200"
                              }`}
                            >
                              <span
                                className={`pointer-events-none flex items-center justify-center h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  isGranted ? "translate-x-4" : "translate-x-0"
                                }`}
                              >
                                {isLoading && (
                                  <Loader2
                                    size={8}
                                    className="animate-spin text-[#0052FF]"
                                  />
                                )}
                              </span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 px-4 border border-dashed border-slate-200 rounded-2xl text-center">
              <ShieldAlert size={24} className="text-slate-300 mb-2" />
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                No active partners found for this move
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
