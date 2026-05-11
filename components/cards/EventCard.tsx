/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useMemo } from "react";
import { EVENT_CATEGORIES } from "@/lib/categories";
import Image from "next/image";
import {
  MapPin,
  ChevronRight,
  Clock,
  Calendar,
  Flame,
  Sparkles,
  AlertCircle,
  Zap,
  CheckCircle2,
  Video,
  Radio,
} from "lucide-react";

// Kivo Brand Constants
const KIVO_BLUE = "#0052FF";
const KIVO_YELLOW = "#FFD700";

export type Props = {
  id?: string;
  title: string;
  image: string;
  altText?: string;
  category: keyof typeof EVENT_CATEGORIES;
  startDate: string;
  endDate: string;
  createdAt?: string;
  location: string;
  distance?: string;
  attendees?: number;
  participantImages?: string[];
  isOnline?: boolean;
  className?: string;
  ticketingType?: "none" | "internal" | "external";
  ticketTiers?: Array<{
    name: string;
    price: number;
    capacity?: number;
    sold?: number;
    salesEnd?: string;
  }>;
  isTrending?: boolean;
  isBoosted?: boolean;
  priorityLevel?: number;
};

export default function EventCard({
  title,
  image,
  altText,
  category,
  startDate,
  endDate,
  createdAt,
  location,
  distance,
  attendees = 0,
  participantImages = [],
  isOnline,
  className = "",
  ticketingType = "internal",
  ticketTiers = [],
  isTrending,
  isBoosted,
  priorityLevel = 0,
}: Props) {
  const [timeLeft, setTimeLeft] = useState<any>(null);
  const [status, setStatus] = useState<"upcoming" | "ongoing" | "past">(
    "upcoming",
  );

  const categoryData = EVENT_CATEGORIES[category] ?? EVENT_CATEGORIES.social;

  // Logic to determine if a "New" tag should be shown
  const isNew = useMemo(() => {
    if (!createdAt) return false;
    const createdDate = new Date(createdAt).getTime();
    const now = new Date().getTime();
    const fortyEightHoursInMs = 48 * 60 * 60 * 1000;
    return now - createdDate < fortyEightHoursInMs;
  }, [createdAt]);

  // Ticket Urgency Logic
  const urgencyStatus = useMemo(() => {
    if (
      !ticketTiers ||
      ticketTiers.length === 0 ||
      ticketingType !== "internal"
    )
      return null;

    const totalCapacity = ticketTiers.reduce(
      (acc, tier) => acc + (tier.capacity || 0),
      0,
    );
    const totalSold = ticketTiers.reduce(
      (acc, tier) => acc + (tier.sold || 0),
      0,
    );

    if (totalCapacity > 0) {
      if (totalSold >= totalCapacity) return "sold-out";
      const percentRemaining =
        ((totalCapacity - totalSold) / totalCapacity) * 100;
      if (percentRemaining <= 15) return "almost-sold-out";
    }
    return null;
  }, [ticketTiers, ticketingType]);

  // Price Formatting
  const getDisplayPrice = useMemo(() => {
    if (ticketingType === "external") return "Paid";
    if (!ticketTiers || ticketTiers.length === 0) return "Free";
    const prices = ticketTiers.map((tier) => tier.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    if (minPrice === 0) return maxPrice > 0 ? "Free +" : "Free";
    return `₦${minPrice.toLocaleString()}${ticketTiers.length > 1 ? "+" : ""}`;
  }, [ticketingType, ticketTiers]);

  const startDateTime = new Date(startDate).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // Countdown & Status Timer
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
  const displayImages =
    participantImages.length > 0 ? participantImages : [1, 2, 3];
  const baseStatusScore = isBoosted
    ? (priorityLevel || 0) - 4
    : priorityLevel || 0;

  return (
    <div
      className={`group flex flex-col rounded-[32px] overflow-hidden bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_20px_50px_rgba(0,82,255,0.1)] transition-all duration-500 ${className}`}
    >
      {/* IMAGE SECTION */}
      <div className="relative h-48 overflow-hidden shrink-0">
        <Image
          src={image || "/placeholder-event.jpg"}
          alt={altText || title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700"
          sizes="(max-width: 768px) 100vw, 33vw"
        />

        {/* FLOATING STATUS BADGES (TOP LEFT) */}
        <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-20">
          {isBoosted && (
            <div
              className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 text-white shadow-lg"
              style={{ backgroundColor: KIVO_BLUE }}
            >
              <Zap size={11} className="fill-white" /> Promoted
            </div>
          )}

          {isNew && !isBoosted && (
            <div className="px-3 py-1.5 bg-gradient-to-r from-blue-400 to-indigo-600 rounded-xl text-[9px] font-black uppercase tracking-widest text-white shadow-lg flex items-center gap-1.5">
              <Sparkles size={11} /> New
            </div>
          )}

          {baseStatusScore === 1 && (
            <div
              className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 text-white shadow-lg"
              style={{ backgroundColor: KIVO_BLUE }}
            >
              <CheckCircle2 size={11} className="fill-white/20" /> Verified
            </div>
          )}

          {baseStatusScore === 3 && (
            <div className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 text-white shadow-xl border border-white/20">
              <Sparkles size={11} /> Premier
            </div>
          )}
        </div>

        {/* ONLINE TAG (TOP RIGHT) */}
        {isOnline && (
          <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 text-gray-900 shadow-md border border-gray-100 z-20">
            <Video size={11} className="text-[#0052FF]" /> Online
          </div>
        )}

        {/* CATEGORY TAG (BOTTOM RIGHT) */}
        <div
          className={`absolute bottom-4 right-4 px-3 py-1 rounded-full border bg-white/90 backdrop-blur-sm shadow-sm ${categoryData.color}`}
        >
          <span className="text-[8px] font-black uppercase tracking-tighter">
            {categoryData.label}
          </span>
        </div>
      </div>

      {/* CONTENT SECTION */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        <div className="flex flex-col gap-2">
          {/* DATE & STATUS HEADER */}
          <div className="flex items-center gap-1.5 text-gray-600">
            <Calendar
              size={12}
              className={
                status === "ongoing" ? "text-emerald-500" : "text-blue-500"
              }
            />
            <span className="text-[10px] font-black uppercase tracking-tight">
              {status === "ongoing"
                ? `Happening Now`
                : `Starts ${startDateTime}`}
            </span>
          </div>

          {/* TIMER / LIVE BAR */}
          {status !== "past" && timeLeft && (
            <div
              className={`text-[10px] font-black uppercase px-2.5 py-1.5 rounded-xl border flex items-center gap-2 w-fit ${status === "ongoing" ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-blue-50 border-blue-100 text-blue-600"}`}
            >
              <span className="opacity-70 flex items-center gap-1">
                {status === "ongoing" ? (
                  <Radio size={10} className="animate-pulse" />
                ) : (
                  <Clock size={10} />
                )}
                {status === "ongoing" ? "LIVE" : "Countdown"}
              </span>
              <div className="flex items-center gap-1 tabular-nums">
                {timeLeft.days > 0 && <span>{timeLeft.days}D</span>}
                <span>
                  {timeLeft.h}:{timeLeft.m}:{timeLeft.s}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* TITLE */}
        <h2 className="font-black text-xl text-gray-900 leading-tight tracking-tight line-clamp-1">
          {title}
        </h2>

        {/* LOCATION */}
        <div className="flex items-center gap-2 text-gray-500">
          <MapPin size={13} className="text-gray-400 shrink-0" />
          <span className="font-bold text-[11px] line-clamp-1">
            {isOnline
              ? "Virtual / Web Access"
              : `${location} ${distance ? `• ${distance}km` : ""}`}
          </span>
        </div>

        {/* FOOTER SECTION */}
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
                        alt="participant"
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
              <span className="text-[9px] font-black uppercase tracking-tight text-gray-400">
                Public Event
              </span>
            )}
          </div>

          {/* PRICE / CTA BUTTON */}
          <button
            className="text-black px-4 py-2.5 rounded-2xl transition-all duration-300 active:scale-95 group/btn flex items-center gap-2 shadow-sm"
            style={{ backgroundColor: KIVO_YELLOW }}
          >
            <span className="font-black text-[10px] uppercase tracking-wider">
              {getDisplayPrice}
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
