/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useTransition } from "react";
import {
  MapPin,
  Clock,
  Zap,
  Check,
  X,
  Loader2,
  ArrowUpRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface ModerationTableProps {
  events: any[];
  onStatusUpdate: () => void;
}

export const ModerationTable = ({
  events,
  onStatusUpdate,
}: ModerationTableProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  // Deep operational routing engine
  const handleNavigation = (event: any) => {
    const destination =
      event.approvalStatus === "approved"
        ? `/admin/manage/events/${event._id}`
        : `/admin/preview/${event._id}`;
    router.push(destination);
  };

  // Encapsulates inline moderation actions with safe loading flags
  const handleUpdateStatus = (
    e: React.MouseEvent,
    eventId: string,
    status: "approved" | "rejected",
  ) => {
    e.stopPropagation(); // Stops table row navigation from firing concurrently

    const token = localStorage.getItem("skaute_token");
    setActiveActionId(eventId);

    startTransition(async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/admin/events/${eventId}/approve`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ approvalStatus: status }),
          },
        );

        if (!res.ok) throw new Error("Status migration failed");

        toast.success(
          `Move explicitly ${status === "approved" ? "Whitelisted" : "Rejected"}`,
        );
        onStatusUpdate(); // Triggers the live dashboard reload loop
      } catch (err) {
        toast.error("Could not complete event state modulation");
      } finally {
        setActiveActionId(null);
      }
    });
  };

  return (
    <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-8 py-5 text-[9px] font-black uppercase text-gray-400 tracking-widest">
                Event Info
              </th>
              <th className="px-8 py-5 text-[9px] font-black uppercase text-gray-400 tracking-widest">
                Organizer
              </th>
              <th className="px-8 py-5 text-[9px] font-black uppercase text-gray-400 tracking-widest">
                Neighborhood
              </th>
              <th className="px-8 py-5 text-[9px] font-black uppercase text-gray-400 tracking-widest">
                Status
              </th>
              <th className="px-8 py-5 text-[9px] font-black uppercase text-gray-400 tracking-widest text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            <AnimatePresence mode="popLayout">
              {events.map((event: any) => {
                const isRowProcessing =
                  isPending && activeActionId === event._id;

                return (
                  <motion.tr
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -20 }}
                    key={event._id}
                    onClick={() => handleNavigation(event)}
                    className="hover:bg-blue-50/10 cursor-pointer transition-colors group relative"
                  >
                    {/* 1. EVENT MAIN METRIC DATA */}
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 group-hover:border-blue-200 transition-colors flex-shrink-0">
                          <Image
                            src={
                              event.image ||
                              "https://res.cloudinary.com/dzhfiblg7/image/upload/f_auto,q_auto,w_800/v1778054500/kivo_events/inhouse/park.png"
                            }
                            alt=""
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900 uppercase italic tracking-tighter flex items-center gap-1.5">
                            {event.title}
                          </p>
                          <p className="text-[9px] font-bold text-gray-400 uppercase flex items-center gap-1 mt-0.5">
                            <Clock size={10} className="text-gray-400" />{" "}
                            {new Date(event.startDate).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* 2. CREATOR HOST RELAY */}
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2.5">
                        <div className="relative w-6 h-6 rounded-full overflow-hidden bg-slate-100 border border-gray-100 flex-shrink-0">
                          <Image
                            src={
                              event.organizer?.image ||
                              "https://res.cloudinary.com/dzhfiblg7/image/upload/v1778054500/kivo_events/inhouse/park.png"
                            }
                            alt=""
                            fill
                            className="object-cover"
                          />
                        </div>
                        <p className="text-[10px] font-black text-slate-700 uppercase tracking-tight">
                          {event.organizer?.name || "Unknown Host"}
                        </p>
                      </div>
                    </td>

                    {/* 3. PHYSICAL LOCATIONAL NODE */}
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-1 text-slate-500">
                        <MapPin size={12} className="text-blue-500" />
                        <p className="text-[10px] font-bold uppercase tracking-tight">
                          {event.location?.neighborhood || "PH City"}
                        </p>
                      </div>
                    </td>

                    {/* 4. APPROVAL CURRENT PARAMETER STATE */}
                    <td className="px-8 py-5">
                      <span
                        className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                          event.approvalStatus === "approved"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : event.approvalStatus === "rejected"
                              ? "bg-red-50 text-red-600 border-red-100"
                              : "bg-blue-50 text-blue-600 border-blue-100"
                        }`}
                      >
                        {event.approvalStatus || "pending"}
                      </span>
                    </td>

                    {/* 5. INLINE OPERATIONAL ACTION TRIGGERS */}
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-150">
                        {isRowProcessing ? (
                          <div className="p-2 text-blue-600 animate-spin">
                            <Loader2 size={14} />
                          </div>
                        ) : (
                          <>
                            {/* INSTANT APPROVE FLAG */}
                            {event.approvalStatus !== "approved" && (
                              <button
                                onClick={(e) =>
                                  handleUpdateStatus(e, event._id, "approved")
                                }
                                disabled={isPending}
                                title="Approve & Whitelist Move"
                                className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-40"
                              >
                                <Check size={14} />
                              </button>
                            )}

                            {/* INSTANT REJECT FLAG */}
                            {event.approvalStatus !== "rejected" && (
                              <button
                                onClick={(e) =>
                                  handleUpdateStatus(e, event._id, "rejected")
                                }
                                disabled={isPending}
                                title="Reject & Drop Move"
                                className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                              >
                                <X size={14} />
                              </button>
                            )}

                            <div className="h-4 w-[1px] bg-gray-100 mx-1" />

                            {/* EXPAND CONSOLE VIEW REVENUE TARGET */}
                            <button
                              title="Open Full Operational View"
                              className="p-2 rounded-xl text-gray-400 hover:text-slate-900 hover:bg-gray-100 transition-colors"
                            >
                              <ArrowUpRight size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>

        {events.length === 0 && (
          <div className="p-20 text-center text-gray-300">
            <Zap size={32} className="mx-auto mb-2 opacity-20" />
            <p className="text-[10px] font-black uppercase tracking-widest">
              Queue Clear
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
