/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useMemo } from "react";
import { EVENT_CATEGORIES } from "@/lib/categories";
import Image from "next/image";
import {
  MapPin,
  ChevronRight,
  Globe,
  ExternalLink,
  Info,
  Clock,
  Calendar,
  Flame,
} from "lucide-react";

export type Props = {
  title: string;
  image: string;
  category: keyof typeof EVENT_CATEGORIES;
  startDate: string;
  endDate: string;
  location: string;
  distance?: string;
  attendees?: number;
  participantImages?: string[];
  isOnline?: boolean;
  className?: string;
  ticketingType?: "none" | "internal" | "external";
  ticketTiers?: Array<{ name: string; price: number }>;
  isTrending?: boolean;
};

export default function EventCard({
  title,
  image,
  category,
  startDate,
  endDate,
  location,
  distance,
  attendees = 0,
  participantImages = [],
  isOnline,
  className = "",
  ticketingType = "internal",
  ticketTiers = [],
  isTrending,
}: Props) {
  const [timeLeft, setTimeLeft] = useState<any>(null);
  const [status, setStatus] = useState<"upcoming" | "ongoing" | "past">(
    "upcoming",
  );
  const categoryData = EVENT_CATEGORIES[category] ?? EVENT_CATEGORIES.social;

  // Refined Pricing Logic with "From" for multiple tiers
  const getDisplayPrice = useMemo(() => {
    if (ticketingType === "external") return "Paid";
    if (!ticketTiers || ticketTiers.length === 0) return "Free";

    const prices = ticketTiers.map((tier) => tier.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const hasMultipleTiers = ticketTiers.length > 1;

    if (minPrice === 0) {
      return maxPrice > 0 ? "Free +" : "Free";
    }

    const formattedPrice = `₦${minPrice.toLocaleString()}`;

    // Logic: If there's more than one tier, show "From ₦..."
    return hasMultipleTiers ? `From ${formattedPrice}` : formattedPrice;
  }, [ticketingType, ticketTiers]);

  const startDateTime = new Date(startDate).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();

      let target: number;
      if (now < start) {
        target = start;
        setStatus("upcoming");
      } else if (now >= start && now < end) {
        target = end;
        setStatus("ongoing");
      } else {
        setStatus("past");
        return;
      }

      const diff = target - now;
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
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

  const canShowParticipants = ticketingType === "internal";
  const displayImages = canShowParticipants
    ? participantImages.length > 0
      ? participantImages
      : attendees > 0
        ? [1, 2, 3]
        : []
    : [];

  return (
    <div
      className={`group flex flex-col rounded-[32px] overflow-hidden bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_20px_50px_rgba(0,82,255,0.1)] transition-all duration-500 ${className}`}
    >
      {/* IMAGE SECTION */}
      <div className="relative h-48 overflow-hidden shrink-0">
        <Image
          src={image || "/placeholder-event.jpg"}
          alt={title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700"
        />

        <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-20">
          {isTrending && (
            <div className="px-3 py-1 bg-[#FFD700] rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 text-black shadow-lg border border-black/5">
              <Flame size={10} className="fill-black" /> Trending
            </div>
          )}
          {status === "ongoing" && (
            <div className="px-3 py-1 bg-green-500 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 text-white animate-pulse shadow-lg">
              Live Now
            </div>
          )}
          {isOnline && (
            <div className="px-3 py-1 bg-blue-600 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 text-white shadow-lg">
              <Globe size={10} /> Online
            </div>
          )}
        </div>

        <div
          className={`absolute bottom-4 right-4 px-3 py-1 rounded-full border bg-white/90 backdrop-blur-sm shadow-sm ${categoryData.color}`}
        >
          <span className="text-[8px] font-black uppercase tracking-tighter">
            {categoryData.label}
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1 gap-3">
        {/* TIME & COUNTDOWN */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-gray-600">
              <Calendar
                size={12}
                className={
                  status === "ongoing" ? "text-green-500" : "text-blue-500"
                }
              />
              <span className="text-[10px] font-black uppercase tracking-tight">
                {status === "ongoing"
                  ? `Started at ${startDateTime}`
                  : `Starts at ${startDateTime}`}
              </span>
            </div>

            {status === "past" && (
              <span className="text-[10px] font-black text-red-500 uppercase tracking-tight bg-red-50 px-2 py-0.5 rounded">
                Event Ended
              </span>
            )}
          </div>

          {status !== "past" && timeLeft && (
            <div
              className={`text-[10px] font-black uppercase px-2.5 py-1.5 rounded-xl border flex items-center gap-2 w-fit ${status === "ongoing" ? "bg-green-50 border-green-100 text-green-700" : "bg-blue-50 border-blue-100 text-blue-600"}`}
            >
              <span className="opacity-70 flex items-center gap-1">
                <Clock size={10} />
                {status === "ongoing" ? "Ends in" : "Countdown"}
              </span>
              <div className="flex items-center gap-1 tabular-nums">
                {timeLeft.days > 0 && (
                  <span>
                    {timeLeft.days} {timeLeft.days === 1 ? "Day" : "Days"}
                  </span>
                )}
                {timeLeft.days > 0 && <span className="opacity-30">•</span>}
                <span>
                  {timeLeft.h}:{timeLeft.m}:{timeLeft.s}
                </span>
              </div>
            </div>
          )}
        </div>

        <h2 className="font-black text-xl text-gray-900 leading-tight tracking-tight line-clamp-1">
          {title}
        </h2>

        <div className="flex items-center gap-2 text-gray-500">
          <MapPin size={13} className="text-gray-400 shrink-0" />
          <span className="font-bold text-[11px] line-clamp-1">
            {location} {!isOnline && distance && `• ${distance}km`}
          </span>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto min-h-[52px]">
          <div className="flex items-center gap-2">
            {canShowParticipants ? (
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {displayImages.slice(0, 3).map((img, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 relative rounded-full border-2 border-white overflow-hidden bg-gray-100"
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
                <span className="text-[9px] font-black text-gray-900 uppercase">
                  {attendees} Joined
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-gray-400">
                {ticketingType === "external" ? (
                  <ExternalLink size={12} />
                ) : (
                  <Info size={12} />
                )}
                <span className="text-[9px] font-black uppercase tracking-tight">
                  {ticketingType === "external" ? "External" : "Open Entry"}
                </span>
              </div>
            )}
          </div>

          <button className="bg-[#FFD700] hover:bg-[#F2CC00] text-black px-4 py-2.5 rounded-2xl transition-all duration-300 active:scale-95 group/btn flex items-center gap-2 shadow-sm">
            <span className="font-black text-[10px] uppercase tracking-wider">
              • {getDisplayPrice}
            </span>
            <ChevronRight
              size={14}
              className="group-hover/btn:translate-x-0.5 transition-transform"
              strokeWidth={3}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
