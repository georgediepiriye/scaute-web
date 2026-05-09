/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { EVENT_CATEGORIES } from "@/lib/categories";
import Image from "next/image";
import {
  Clock,
  MapPin,
  ChevronRight,
  Globe,
  Timer,
  ExternalLink,
  TicketCheck,
  Info,
} from "lucide-react";

export type Props = {
  title: string;
  image: string;
  category: keyof typeof EVENT_CATEGORIES;
  startDate: string;
  endDate: string;
  location: string;
  distance?: string;
  buttonText: string;
  attendees?: number;
  participantImages?: string[];
  isOnline?: boolean;
  className?: string;
  ticketingType?: "none" | "internal" | "external"; // Updated to match your enum
};

export default function EventCard({
  title,
  image,
  category,
  startDate,
  endDate,
  location,
  distance,
  buttonText,
  attendees = 0,
  participantImages = [],
  isOnline,
  className = "",
  ticketingType = "internal",
}: Props) {
  const [timeLeft, setTimeLeft] = useState<any>(null);
  const [status, setStatus] = useState<"upcoming" | "ongoing" | "past">(
    "upcoming",
  );
  const categoryData = EVENT_CATEGORIES[category] ?? EVENT_CATEGORIES.social;

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();

      let target: number;
      let label = "";

      if (now < start) {
        target = start;
        label = "Starts in";
        setStatus("upcoming");
      } else if (now >= start && now < end) {
        target = end;
        label = "Ends in";
        setStatus("ongoing");
      } else {
        setStatus("past");
        return;
      }

      const diff = target - now;
      setTimeLeft({
        label,
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff / (1000 * 60 * 60)) % 24)
          .toString()
          .padStart(2, "0"),
        m: Math.floor((diff / 1000 / 60) % 60)
          .toString()
          .padStart(2, "0"),
        s: Math.floor((diff / 1000) % 60)
          .toString()
          .padStart(2, "0"),
      });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [startDate, endDate]);

  // Social proof logic for internal events
  const displayImages =
    ticketingType === "internal"
      ? participantImages.length > 0
        ? participantImages
        : attendees > 0
          ? [1, 2, 3]
          : []
      : [];

  return (
    <div
      className={`group flex flex-col h-full rounded-[40px] overflow-hidden bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_20px_50px_rgba(0,82,255,0.1)] transition-all duration-500 ${className}`}
    >
      {/* IMAGE SECTION */}
      <div className="relative h-64 overflow-hidden shrink-0">
        <Image
          src={image || "/placeholder-event.jpg"}
          alt={title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-5 left-5 flex flex-col gap-2 z-20">
          {status === "ongoing" && (
            <div className="px-3 py-1.5 bg-green-500 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 text-white shadow-xl animate-bounce">
              Live Now
            </div>
          )}
          {isOnline && (
            <div className="px-3 py-1.5 bg-blue-600 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 text-white shadow-xl">
              <Globe size={10} /> Online
            </div>
          )}
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        {/* HEADER */}
        <div className="flex justify-between items-start mb-6 gap-3">
          <h2 className="font-black text-2xl text-gray-900 leading-[1.1] tracking-tight line-clamp-2">
            {title}
          </h2>
          <div
            className={`shrink-0 p-2 rounded-xl border ${categoryData.color} bg-opacity-5`}
          >
            <span className="text-[9px] font-black uppercase">
              {categoryData.label}
            </span>
          </div>
        </div>

        {/* COUNTDOWN */}
        <div className="mb-8">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3 ml-1">
            {status === "past" ? "Status" : timeLeft?.label}
          </p>
          <div className="flex items-center gap-2">
            {status === "past" ? (
              <span className="text-xl font-black text-red-500 italic uppercase">
                Finished
              </span>
            ) : (
              <div className="flex items-end gap-1.5 tabular-nums">
                {timeLeft?.d > 0 && (
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-black text-slate-900 leading-none">
                      {timeLeft.d}
                    </span>
                    <span className="text-[10px] font-black text-slate-400 uppercase mb-1">
                      Days
                    </span>
                  </div>
                )}
                <div
                  className={`flex items-center px-3 py-2 rounded-2xl border-2 ${status === "ongoing" ? "bg-green-50 border-green-200 text-green-600" : "bg-blue-50 border-blue-100 text-blue-600"}`}
                >
                  <span className="text-xl font-black tracking-tighter">
                    {timeLeft?.h}
                  </span>
                  <span className="mx-1 opacity-30 animate-pulse font-bold">
                    :
                  </span>
                  <span className="text-xl font-black tracking-tighter">
                    {timeLeft?.m}
                  </span>
                  <span className="mx-1 opacity-30 animate-pulse font-bold">
                    :
                  </span>
                  <span className="text-xl font-black tracking-tighter">
                    {timeLeft?.s}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* INFO GRID */}
        <div className="flex flex-col gap-3 mb-8">
          <div className="flex items-center gap-2.5 text-gray-500">
            <MapPin size={14} className="text-blue-600" />
            <span className="font-bold text-xs line-clamp-1">
              {location} {!isOnline && distance && `(${distance}km)`}
            </span>
          </div>
        </div>

        {/* FOOTER SECTION: Dynamic based on ticketingType */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-auto min-h-[80px]">
          <div className="flex items-center gap-3">
            {ticketingType === "internal" ? (
              <>
                <div className="flex -space-x-2.5">
                  {displayImages.slice(0, 3).map((img, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 relative rounded-full border-2 border-white overflow-hidden bg-gray-100"
                    >
                      <Image
                        src={
                          typeof img === "string"
                            ? img
                            : `https://api.dicebear.com/7.x/avataaars/svg?seed=${title}${i}`
                        }
                        alt="p"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
                <span className="text-[10px] font-black text-gray-900 uppercase">
                  {attendees} Joined
                </span>
              </>
            ) : ticketingType === "external" ? (
              <div className="flex items-center gap-2 bg-blue-50/50 px-3 py-2 rounded-xl border border-blue-100/50">
                <ExternalLink size={12} className="text-blue-500" />
                <span className="text-[9px] font-black text-blue-600 uppercase tracking-tight">
                  External Site
                </span>
              </div>
            ) : (
              // Case: "none"
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                <Info size={12} className="text-gray-400" />
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-tight">
                  Open Entry
                </span>
              </div>
            )}
          </div>

          <button className="bg-black text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2">
            {buttonText} <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
