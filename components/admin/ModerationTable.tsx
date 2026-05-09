/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { MapPin, Clock, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";

export const ModerationTable = ({ events }: any) => {
  const router = useRouter();

  const handleNavigation = (event: any) => {
    // Determine the destination based on the move's current status
    // Approved events go to the operational management page
    // Pending/Rejected events go to the moderation/review page
    const destination =
      event.approvalStatus === "approved"
        ? `/admin/manage/events/${event._id}`
        : `/admin/preview/${event._id}`;
    router.push(destination);
  };

  return (
    <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="p-6 text-[9px] font-black uppercase text-gray-400">
                Event Info
              </th>
              <th className="p-6 text-[9px] font-black uppercase text-gray-400">
                Organizer
              </th>
              <th className="p-6 text-[9px] font-black uppercase text-gray-400">
                Neighborhood
              </th>
              <th className="p-6 text-[9px] font-black uppercase text-gray-400 text-right">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            <AnimatePresence mode="popLayout">
              {events.map((event: any) => (
                <motion.tr
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                  key={event._id}
                  onClick={() => handleNavigation(event)}
                  className="hover:bg-blue-50/20 cursor-pointer transition-colors group"
                >
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-gray-100 border border-gray-50 group-hover:border-blue-100 transition-colors">
                        <Image
                          src={event.image}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900 uppercase italic tracking-tighter">
                          {event.title}
                        </p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase flex items-center gap-1">
                          <Clock size={10} />{" "}
                          {new Date(event.startDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      <div className="relative w-6 h-6 rounded-full overflow-hidden bg-blue-50">
                        <Image
                          src={event.organizer?.image || "/default.png"}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      </div>
                      <p className="text-[10px] font-black text-gray-700 uppercase">
                        {event.organizer?.name || "Unknown Host"}
                      </p>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-1 text-gray-500">
                      <MapPin size={12} className="text-blue-500" />
                      <p className="text-[10px] font-bold uppercase">
                        {event.location?.neighborhood || "PH City"}
                      </p>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <span
                      className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                        event.approvalStatus === "approved"
                          ? "bg-green-50 text-green-600"
                          : event.approvalStatus === "rejected"
                            ? "bg-red-50 text-red-600"
                            : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      {event.approvalStatus}
                    </span>
                  </td>
                </motion.tr>
              ))}
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
