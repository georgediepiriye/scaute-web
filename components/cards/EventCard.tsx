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
  Sparkles,
  Zap,
  Radio,
  Lock,
  Video,
  CheckCircle2,
  Award,
} from "lucide-react";

const SKAUTE_BLUE = "#0052FF";
const SKAUTE_YELLOW = "#FFD700";

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
  statusArray?: ("verified" | "featured")[];
  isTrending?: boolean;
  isBoosted?: boolean;
  isSkauteHosted?: boolean;
  priorityLevel?: number;
  isSoldOut?: boolean;
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
  statusArray = [],
  isTrending,
  isBoosted,
  isSkauteHosted = false,
  isSoldOut = false,
}: Props) {
  const [timeLeft, setTimeLeft] = useState<any>(null);
  const [status, setStatus] = useState<"upcoming" | "ongoing" | "past">(
    "upcoming",
  );

  const categoryData = EVENT_CATEGORIES[category] ?? EVENT_CATEGORIES.social;

  const isNew = useMemo(() => {
    if (!createdAt) return false;
    const createdDate = new Date(createdAt).getTime();
    const now = new Date().getTime();
    return now - createdDate < 48 * 60 * 60 * 1000;
  }, [createdAt]);

  const urgencyStatus = useMemo(() => {
    if (isSoldOut) return "sold-out";
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
      if (((totalCapacity - totalSold) / totalCapacity) * 100 <= 15)
        return "almost-sold-out";
    }
    return null;
  }, [ticketTiers, ticketingType, isSoldOut]);

  const getDisplayPrice = useMemo(() => {
    if (urgencyStatus === "sold-out") return "Sold Out";
    if (ticketingType === "external") return "Paid";
    if (!ticketTiers || ticketTiers.length === 0) return "Free";
    const prices = ticketTiers.map((tier) => tier.price);
    const minPrice = Math.min(...prices);
    return minPrice === 0
      ? Math.max(...prices) > 0
        ? "Free +"
        : "Free"
      : `₦${minPrice.toLocaleString()}${ticketTiers.length > 1 ? "+" : ""}`;
  }, [ticketingType, ticketTiers, urgencyStatus]);

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
  const displayImages = Array.from({ length: Math.min(attendees, 3) }).map(
    (_, i) =>
      participantImages?.[i] ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${title}-${i}`,
  );

  return (
    <div
      className={`group flex flex-col rounded-[32px] overflow-hidden bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_20px_50px_rgba(0,82,255,0.1)] transition-all duration-500 ${className}`}
    >
      {/* IMAGE SECTION */}
      <div className="relative h-56 overflow-hidden shrink-0">
        {" "}
        {/* 💡 Slightly increased height to accommodate stacking metadata tags smoothly */}
        <Image
          src={image || "/placeholder-event.jpg"}
          alt={altText || title}
          fill
          className={`object-cover group-hover:scale-110 transition-transform duration-700 ${urgencyStatus === "sold-out" ? "grayscale opacity-80" : ""}`}
        />
        {urgencyStatus === "sold-out" && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <div className="bg-white px-6 py-2.5 rounded-2xl flex items-center gap-2 shadow-2xl scale-110 border border-white/50">
              <Lock size={16} className="text-red-500 fill-red-500" />
              <span className="font-black text-[12px] uppercase tracking-[0.2em] text-gray-900">
                Sold Out
              </span>
            </div>
          </div>
        )}
        {/* 💡 LEFT METADATA OVERLAY STACK (Curation Badges) */}
        <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start z-20 max-w-[55%]">
          {isSkauteHosted && (
            <div
              className="px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 text-black shadow-lg border border-black/10 transition-all"
              style={{ backgroundColor: SKAUTE_YELLOW }}
            >
              <Award
                size={11}
                className="fill-black animate-spin [animation-duration:6s]"
              />{" "}
              Skaute Choice
            </div>
          )}

          {statusArray.includes("featured") && (
            <div className="px-2.5 py-1.5 bg-amber-500 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 text-white shadow-lg transition-all">
              <Sparkles size={11} className="fill-white" /> Featured
            </div>
          )}

          {statusArray.includes("verified") && (
            <div className="px-2.5 py-1.5 bg-emerald-600/95 backdrop-blur-sm rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 text-white shadow-md border border-emerald-500/20 transition-all">
              <CheckCircle2 size={11} className="fill-white text-emerald-600" />{" "}
              Verified
            </div>
          )}
        </div>
        {/* 💡 RIGHT METADATA OVERLAY STACK (System Toggles & Live Indicators) */}
        <div className="absolute top-4 right-4 flex flex-col gap-1.5 items-end z-20 max-w-[45%]">
          {isBoosted && (
            <div
              className="px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 text-white shadow-lg transition-all"
              style={{ backgroundColor: SKAUTE_BLUE }}
            >
              <Zap size={11} className="fill-white animate-bounce" /> Promoted
            </div>
          )}

          {urgencyStatus === "almost-sold-out" && (
            <div className="px-2.5 py-1.5 bg-red-500 rounded-xl text-[9px] font-black uppercase tracking-widest text-white shadow-lg animate-pulse transition-all">
              Selling Fast
            </div>
          )}

          {isOnline && (
            <div className="px-2.5 py-1.5 bg-white/95 backdrop-blur-sm rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 text-gray-900 shadow-md border border-gray-100 transition-all">
              <Video size={11} className="text-[#0052FF]" /> Online
            </div>
          )}
        </div>
        <div
          className={`absolute bottom-4 right-4 px-3 py-1 rounded-full border bg-white/90 backdrop-blur-sm shadow-sm z-20 ${categoryData.color}`}
        >
          <span className="text-[8px] font-black uppercase tracking-tighter">
            {categoryData.label}
          </span>
        </div>
      </div>

      {/* CONTENT SECTION */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        <div className="flex flex-col gap-2">
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

        <h2 className="font-black text-xl text-gray-900 leading-tight tracking-tight line-clamp-1">
          {title}
        </h2>

        <div className="flex items-center gap-2 text-gray-500">
          <MapPin size={13} className="text-gray-400 shrink-0" />
          <span className="font-bold text-[11px] line-clamp-1 uppercase tracking-tight">
            {isOnline
              ? "Virtual / Web Access"
              : `${location} ${distance ? `• ${distance}km` : ""}`}
          </span>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto min-h-[52px]">
          <div className="flex items-center gap-2">
            {canShowParticipants && attendees > 0 ? (
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {displayImages.map((img, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 relative rounded-full border-2 border-white overflow-hidden bg-gray-100 shadow-sm"
                    >
                      <Image
                        src={img}
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
                {attendees > 0 ? `${attendees} Joined` : "Public Event"}
              </span>
            )}
          </div>

          <button
            className={`px-4 py-2.5 rounded-2xl transition-all duration-300 active:scale-95 group/btn flex items-center gap-2 shadow-sm 
              ${
                urgencyStatus === "sold-out"
                  ? "bg-slate-100 text-slate-400"
                  : isSkauteHosted
                    ? "bg-black text-white hover:bg-black/90 border border-black"
                    : "text-black hover:opacity-90"
              }`}
            style={
              urgencyStatus !== "sold-out" && !isSkauteHosted
                ? { backgroundColor: SKAUTE_YELLOW }
                : {}
            }
            disabled={urgencyStatus === "sold-out"}
          >
            <span className="font-black text-[10px] uppercase tracking-wider">
              {getDisplayPrice}
            </span>
            {urgencyStatus !== "sold-out" && (
              <ChevronRight
                size={14}
                className="group-hover/btn:translate-x-0.5 transition-transform"
                strokeWidth={3}
              />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
