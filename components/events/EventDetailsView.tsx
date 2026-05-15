"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from "react";
import {
  MapPin,
  Share2,
  Users,
  Ticket,
  ShieldCheck,
  Copy,
  Check,
  MessageSquare,
  Lock,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import CheckoutPanel from "./CheckoutPanel";
import toast, { Toaster } from "react-hot-toast";

const KIVO_BLUE = "#0052FF";

interface EventViewProps {
  event: any;
}

export default function EventDetailsView({ event }: EventViewProps) {
  const [copied, setCopied] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const startDate = new Date(event.startDate);
  const eventLink = typeof window !== "undefined" ? window.location.href : "";

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/me`,
          { credentials: "include" },
        );
        const data = await res.json();

        if (res.ok) {
          setUser(data.data?.user);
        } else {
          console.warn("User not authenticated:", data.message);
        }
      } catch (e) {
        toast.error("Could not connect to Kivo servers");
        console.error("Auth fetch failed:", e);
      }
    };
    fetchUser();
  }, []);

  /**
   * GLOBAL REFINED SOLD OUT DETECTOR ENGINE
   */
  const isSoldOut = useMemo(() => {
    if (!event) return false;
    if (event.isSoldOut) return true;

    if (event.ticketingType === "internal" && event.ticketTiers?.length > 0) {
      return event.ticketTiers.every((tier: any) => {
        const manualSoldOut = tier.isSoldOut === true;
        const capacityReached = tier.capacity > 0 && tier.sold >= tier.capacity;
        return manualSoldOut || capacityReached;
      });
    }
    return false;
  }, [event]);

  /**
   * AVAILABLE MINIMUM PRICE RANGE MATRIX CALCULATOR
   */
  const displayPrice = useMemo(() => {
    if (!event) return "";
    if (isSoldOut) return "Sold Out";
    if (event.ticketingType === "none" || event.isFree) return "Free";

    if (event.ticketTiers && event.ticketTiers.length > 0) {
      const availableTiers = event.ticketTiers.filter((t: any) => {
        const tierFull = t.capacity > 0 && t.sold >= t.capacity;
        return !t.isSoldOut && !tierFull;
      });

      const TiersToEvaluate =
        availableTiers.length > 0 ? availableTiers : event.ticketTiers;
      const prices = TiersToEvaluate.map((t: any) => t.price);
      const min = Math.min(...prices);
      const max = Math.max(...prices);

      if (min === 0 && max > 0) return "Free +";
      if (min === 0 && max === 0) return "Free";
      if (min === max) return `₦${min.toLocaleString()}`;
      return `From ₦${min.toLocaleString()}`;
    }

    return event.externalTicketLink ? "Paid" : "Invite Only";
  }, [event, isSoldOut]);

  const handleCopy = () => {
    navigator.clipboard.writeText(eventLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareMove = async () => {
    const shareData = {
      title: `Move: ${event.title}`,
      text: `Securing my spot for ${event.title} on Kivo. Join the move!`,
      url: eventLink,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        handleCopy();
      }
    } catch (err) {
      console.error("Kivo Share Error:", err);
    }
  };

  const formattedDate = startDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-32">
      <Toaster position="top-center" reverseOrder={false} />
      <CheckoutPanel
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        event={event}
      />

      {/* --- NAVIGATION --- */}
      <nav className="sticky top-0 z-[100] bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div
              style={{ backgroundColor: KIVO_BLUE }}
              className="w-9 h-9 rounded-xl flex items-center justify-center rotate-3 shadow-lg shadow-blue-200"
            >
              <span className="text-white font-black text-sm italic">K</span>
            </div>
            <span className="font-black uppercase tracking-tighter text-gray-900 text-lg">
              Kivo
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/discover"
              className="text-[10px] font-black uppercase text-gray-400 hover:text-[#0052FF] transition-colors"
            >
              Explore
            </Link>
          </div>
        </div>
      </nav>

      {/* 1. HERO */}
      <div className="relative h-[45vh] md:h-[60vh] w-full overflow-hidden bg-black">
        {event.bannerImage || event.image ? (
          <Image
            src={event.bannerImage || event.image}
            alt={event.title}
            className="w-full h-full object-cover opacity-80"
            fill
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-blue-900 to-indigo-950">
            <span className="text-white/5 font-black text-[12vw] uppercase tracking-tighter italic">
              Kivo
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#F8F9FB] via-transparent to-[#FFD700]/5" />

        <div className="absolute top-6 right-6 flex gap-3">
          <button
            onClick={handleShareMove}
            className="p-3 bg-white/10 backdrop-blur-xl rounded-full text-white border border-white/20 hover:bg-white/20 transition-all active:scale-90"
          >
            <Share2 size={18} />
          </button>
        </div>
      </div>

      {/* 2. CONTENT CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 -mt-32 relative z-20">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6">
            <div className="bg-white p-6 md:p-10 rounded-[44px] shadow-sm border border-gray-100">
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <span className="px-4 py-1.5 bg-blue-50 text-[10px] font-black text-[#0052FF] uppercase rounded-full border border-blue-100 tracking-widest">
                    {event.category || "General"}
                  </span>
                  {event.status === "verified" && (
                    <span className="flex items-center gap-1 text-[10px] font-black text-gray-900 uppercase tracking-widest bg-[#FFD700] px-3 py-1.5 rounded-full shadow-sm">
                      <ShieldCheck size={12} /> Verified Move
                    </span>
                  )}
                </div>
                <p className="text-blue-600 font-black text-sm uppercase tracking-tighter">
                  {formattedDate}
                </p>
                <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-[1.1] tracking-tighter italic uppercase">
                  {event.title}
                </h1>
              </div>

              {/* Action Bar */}
              <div className="flex flex-wrap gap-3 mb-10">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl hover:border-[#FFD700] transition-all group"
                >
                  {copied ? (
                    <Check size={16} className="text-green-600" />
                  ) : (
                    <Copy
                      size={16}
                      className="text-gray-400 group-hover:text-black"
                    />
                  )}
                  <span className="text-[10px] font-black uppercase text-gray-600 tracking-widest group-hover:text-black">
                    {copied ? "Link Copied" : "Copy Link"}
                  </span>
                </button>

                {event.communityLink && (
                  <a
                    href={event.communityLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-3 bg-gray-900 text-white rounded-2xl hover:bg-[#FFD700] hover:text-black transition-all group"
                  >
                    <MessageSquare
                      size={16}
                      className="text-[#FFD700] group-hover:text-black"
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Join Community
                    </span>
                  </a>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-gray-50 rounded-[32px] border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-blue-600 border-b-4 border-[#FFD700]">
                    <MapPin size={22} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">
                      Location
                    </p>
                    <p className="font-bold text-gray-900 text-sm">
                      {event.location?.address || "Port Harcourt"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-blue-600 border-b-4 border-[#FFD700]">
                    <Users size={22} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">
                      Vibe
                    </p>
                    <p className="font-bold text-gray-900 text-sm uppercase">
                      {event.ageRestriction || "Open"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-10 space-y-6">
                <h3 className="text-xl font-black text-gray-900">Overview</h3>
                <div className="prose prose-blue max-w-none text-gray-600 font-medium leading-relaxed whitespace-pre-line border-l-4 border-gray-100 pl-6">
                  {event.description}
                </div>
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="w-full lg:w-[400px]">
            <div className="lg:sticky lg:top-24 space-y-4">
              <div className="bg-white p-8 rounded-[44px] shadow-xl border-2 border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFD700] -mr-12 -mt-12 rotate-45" />
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 relative z-10 flex items-center gap-2">
                  <Ticket size={14} className="text-[#0052FF]" /> Available
                  Passes
                </h3>

                <div className="space-y-3 relative z-10">
                  {event.ticketTiers?.map((tier: any) => {
                    // Compute specific individual operational status parameters inside mapping context
                    const isTierManualSoldOut = tier.isSoldOut === true;
                    const isTierCapacityReached =
                      tier.capacity > 0 && tier.sold >= tier.capacity;
                    const isTierSoldOut =
                      isTierManualSoldOut || isTierCapacityReached;

                    return (
                      <div
                        key={tier.name}
                        className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${
                          isTierSoldOut
                            ? "bg-slate-50 border-slate-200/60 opacity-60 select-none"
                            : "bg-gray-50/50 border-gray-100"
                        }`}
                      >
                        <div>
                          <p
                            className={`font-black uppercase text-[10px] ${isTierSoldOut ? "text-slate-400 line-through" : "text-gray-900"}`}
                          >
                            {tier.name}
                          </p>
                          <p
                            className={`text-xs font-bold ${isTierSoldOut ? "text-slate-400" : "text-blue-600"}`}
                          >
                            {isTierSoldOut
                              ? "SOLD OUT"
                              : tier.price === 0
                                ? "FREE"
                                : `₦${tier.price.toLocaleString()}`}
                          </p>
                        </div>
                        <div
                          className={`h-2 w-2 rounded-full ${isTierSoldOut ? "bg-slate-300" : "bg-[#FFD700]"}`}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* PRIMARY DESKTOP BOOKING CTA BUTTON */}
                {isSoldOut ? (
                  <button
                    disabled
                    className="hidden lg:flex w-full mt-8 py-5 rounded-[24px] bg-slate-100 border border-slate-200 text-slate-400 font-black text-[11px] uppercase tracking-[0.3em] items-center justify-center gap-2 cursor-not-allowed"
                  >
                    <Lock size={12} /> Sold Out
                  </button>
                ) : (
                  <button
                    onClick={() => setIsCheckoutOpen(true)}
                    style={{ backgroundColor: KIVO_BLUE }}
                    className="hidden lg:block w-full mt-8 py-5 rounded-[24px] text-white font-black text-[11px] uppercase tracking-[0.3em] shadow-xl shadow-blue-200 hover:brightness-110 active:scale-[0.98] transition-all"
                  >
                    Confirm Spot
                  </button>
                )}

                <p className="lg:hidden text-[8px] font-bold text-gray-400 uppercase text-center mt-6 tracking-widest">
                  {isSoldOut
                    ? "This move is filled up"
                    : "Select pass below to continue"}
                </p>
              </div>

              <div className="bg-white p-6 rounded-[32px] border border-gray-100 flex items-center gap-4 shadow-sm">
                <div
                  style={{ backgroundColor: KIVO_BLUE }}
                  className="h-10 w-10 rounded-xl flex items-center justify-center font-black text-white italic"
                >
                  {event.organizerName?.charAt(0) || "K"}
                </div>
                <div>
                  <p className="text-[8px] font-black uppercase text-gray-400">
                    Curated by
                  </p>
                  <p className="font-bold text-gray-900 text-sm">
                    {event.organizerName || "Kivo Host"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE BOTTOM BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-50 p-5 z-[100] flex items-center justify-between shadow-[0_-15px_40px_rgba(0,0,0,0.08)]">
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
            Entry status
          </p>
          <p className="text-xl font-black text-gray-900">{displayPrice}</p>
        </div>

        {isSoldOut ? (
          <button
            disabled
            className="px-10 py-4 rounded-2xl bg-slate-100 border border-slate-200 text-slate-400 font-black text-[11px] uppercase tracking-[0.2em] cursor-not-allowed flex items-center gap-1.5"
          >
            <Lock size={12} /> Full
          </button>
        ) : (
          <button
            onClick={() => setIsCheckoutOpen(true)}
            style={{ backgroundColor: KIVO_BLUE }}
            className="px-10 py-4 rounded-2xl text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-lg shadow-blue-100 active:scale-95 transition-all"
          >
            Secure Pass
          </button>
        )}
      </div>
    </div>
  );
}
