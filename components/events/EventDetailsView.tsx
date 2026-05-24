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

const SKAUTE_BLUE = "#0052FF";

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
        toast.error("Could not connect to skaute servers");
        console.error("Auth fetch failed:", e);
      }
    };

    fetchUser();
  }, []);

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

  const displayPrice = useMemo(() => {
    if (!event) return "";
    if (isSoldOut) return "Sold Out";
    if (event.ticketingType === "none" || event.isFree) return "Free";

    if (event.ticketTiers && event.ticketTiers.length > 0) {
      const availableTiers = event.ticketTiers.filter((t: any) => {
        const tierFull = t.capacity > 0 && t.sold >= t.capacity;

        return !t.isSoldOut && !tierFull;
      });

      const tiersToEvaluate =
        availableTiers.length > 0 ? availableTiers : event.ticketTiers;

      const prices = tiersToEvaluate.map((t: any) => t.price);

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
      text: `Securing my spot for ${event.title} on skaute. Join the move!`,
      url: eventLink,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        handleCopy();
      }
    } catch (err) {
      console.error("Skaute Share Error:", err);
    }
  };

  const formattedDate = startDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-40 lg:pb-20">
      <Toaster position="top-center" reverseOrder={false} />

      <CheckoutPanel
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        event={event}
      />

      {/* NAVIGATION */}
      <nav className="sticky top-0 z-[100] bg-black border-b border-zinc-900 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center cursor-pointer group">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 -my-10 sm:-my-12 md:-my-14 -ml-4 sm:-ml-5 md:-ml-6 group-hover:scale-[1.02] transition-transform duration-300 ease-out">
              <Image
                src="/images/skaute_logo.webp"
                alt="Skaute Brand Logo"
                fill
                className="object-contain"
                sizes="176px"
                priority
              />
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/discover"
              className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 hover:text-blue-500 transition-colors"
            >
              Explore
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div className="relative h-[36vh] sm:h-[42vh] md:h-[50vh] lg:h-[60vh] w-full overflow-hidden bg-black">
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
            <span className="text-white/5 font-black text-[16vw] md:text-[12vw] uppercase tracking-tighter italic">
              skaute
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#F8F9FB] via-transparent to-[#FFD700]/5" />

        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex gap-3">
          <button
            onClick={handleShareMove}
            className="p-3 bg-white/10 backdrop-blur-xl rounded-full text-white border border-white/20 hover:bg-white/20 transition-all active:scale-90"
          >
            <Share2 size={18} />
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 sm:-mt-24 md:-mt-28 lg:-mt-32 relative z-20">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* MAIN */}
          <div className="flex-1 space-y-6">
            <div className="bg-white p-5 sm:p-7 md:p-10 rounded-[28px] sm:rounded-[36px] md:rounded-[44px] shadow-sm border border-gray-100">
              <div className="space-y-4 mb-8">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="px-4 py-1.5 bg-blue-50 text-[9px] sm:text-[10px] font-black text-[#0052FF] uppercase rounded-full border border-blue-100 tracking-widest">
                    {event.category || "General"}
                  </span>

                  {event.status === "verified" && (
                    <span className="flex items-center gap-1 text-[9px] sm:text-[10px] font-black text-gray-900 uppercase tracking-widest bg-[#FFD700] px-3 py-1.5 rounded-full shadow-sm">
                      <ShieldCheck size={12} />
                      Verified Move
                    </span>
                  )}
                </div>

                <p className="text-blue-600 font-black text-xs sm:text-sm uppercase tracking-tighter">
                  {formattedDate}
                </p>

                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-[1.05] tracking-tighter italic uppercase break-words">
                  {event.title}
                </h1>
              </div>

              {/* ACTIONS */}
              <div className="flex flex-wrap gap-3 mb-10">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 sm:px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl hover:border-[#FFD700] transition-all group"
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
                    className="flex items-center gap-2 px-4 sm:px-5 py-3 bg-gray-900 text-white rounded-2xl hover:bg-[#FFD700] hover:text-black transition-all group"
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

              {/* INFO GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 sm:p-6 bg-gray-50 rounded-[24px] sm:rounded-[32px] border border-gray-100">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-12 w-12 sm:h-14 sm:w-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-blue-600 border-b-4 border-[#FFD700] flex-shrink-0">
                    <MapPin size={20} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">
                      Location
                    </p>

                    <p className="font-bold text-gray-900 text-sm truncate">
                      {event.location?.address || "Port Harcourt"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-12 w-12 sm:h-14 sm:w-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-blue-600 border-b-4 border-[#FFD700] flex-shrink-0">
                    <Users size={20} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">
                      Vibe
                    </p>

                    <p className="font-bold text-gray-900 text-sm uppercase truncate">
                      {event.ageRestriction || "Open"}
                    </p>
                  </div>
                </div>
              </div>

              {/* DESCRIPTION */}
              <div className="mt-10 space-y-5">
                <h3 className="text-lg sm:text-xl font-black text-gray-900">
                  Overview
                </h3>

                <div className="prose prose-sm sm:prose-base prose-blue max-w-none text-gray-600 font-medium leading-relaxed whitespace-pre-line border-l-4 border-gray-100 pl-4 sm:pl-6 break-words">
                  {event.description}
                </div>
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="w-full lg:w-[380px] xl:w-[400px]">
            <div className="lg:sticky lg:top-24 space-y-4">
              <div className="bg-white p-5 sm:p-6 md:p-8 rounded-[28px] sm:rounded-[36px] md:rounded-[44px] shadow-xl border-2 border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 bg-[#FFD700] -mr-10 -mt-10 sm:-mr-12 sm:-mt-12 rotate-45" />

                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 relative z-10 flex items-center gap-2">
                  <Ticket size={14} className="text-[#0052FF]" />
                  Available Passes
                </h3>

                <div className="space-y-3 relative z-10">
                  {event.ticketTiers?.map((tier: any) => {
                    const isTierManualSoldOut = tier.isSoldOut === true;

                    const isTierCapacityReached =
                      tier.capacity > 0 && tier.sold >= tier.capacity;

                    const isTierSoldOut =
                      isTierManualSoldOut || isTierCapacityReached;

                    return (
                      <div
                        key={tier.name}
                        className={`flex items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border transition-all ${
                          isTierSoldOut
                            ? "bg-slate-50 border-slate-200/60 opacity-60 select-none"
                            : "bg-gray-50/50 border-gray-100"
                        }`}
                      >
                        <div className="min-w-0">
                          <p
                            className={`font-black uppercase text-[10px] break-words ${
                              isTierSoldOut
                                ? "text-slate-400 line-through"
                                : "text-gray-900"
                            }`}
                          >
                            {tier.name}
                          </p>

                          <p
                            className={`text-xs font-bold ${
                              isTierSoldOut ? "text-slate-400" : "text-blue-600"
                            }`}
                          >
                            {isTierSoldOut
                              ? "SOLD OUT"
                              : tier.price === 0
                                ? "FREE"
                                : `₦${tier.price.toLocaleString()}`}
                          </p>
                        </div>

                        <div
                          className={`h-2 w-2 rounded-full flex-shrink-0 ${
                            isTierSoldOut ? "bg-slate-300" : "bg-[#FFD700]"
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* DESKTOP CTA */}
                {isSoldOut ? (
                  <button
                    disabled
                    className="hidden lg:flex w-full mt-8 py-5 rounded-[24px] bg-slate-100 border border-slate-200 text-slate-400 font-black text-[11px] uppercase tracking-[0.3em] items-center justify-center gap-2 cursor-not-allowed"
                  >
                    <Lock size={12} />
                    Sold Out
                  </button>
                ) : (
                  <button
                    onClick={() => setIsCheckoutOpen(true)}
                    style={{ backgroundColor: SKAUTE_BLUE }}
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

              {/* ORGANIZER */}
              <div className="bg-white p-5 sm:p-6 rounded-[24px] sm:rounded-[32px] border border-gray-100 flex items-center gap-4 shadow-sm">
                <div
                  style={{ backgroundColor: SKAUTE_BLUE }}
                  className="h-10 w-10 rounded-xl flex items-center justify-center font-black text-white italic flex-shrink-0"
                >
                  {event.organizerName?.charAt(0) || "K"}
                </div>

                <div className="min-w-0">
                  <p className="text-[8px] font-black uppercase text-gray-400">
                    Curated by
                  </p>

                  <p className="font-bold text-gray-900 text-sm truncate">
                    {event.organizer?.name || "Skaute Host"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] z-[100] flex items-center justify-between gap-4 shadow-[0_-15px_40px_rgba(0,0,0,0.08)]">
        <div className="min-w-0">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
            Entry status
          </p>

          <p className="text-lg sm:text-xl font-black text-gray-900 truncate">
            {displayPrice}
          </p>
        </div>

        {isSoldOut ? (
          <button
            disabled
            className="px-6 sm:px-8 py-4 rounded-2xl bg-slate-100 border border-slate-200 text-slate-400 font-black text-[10px] sm:text-[11px] uppercase tracking-[0.2em] cursor-not-allowed flex items-center gap-1.5 flex-shrink-0"
          >
            <Lock size={12} />
            Full
          </button>
        ) : (
          <button
            onClick={() => setIsCheckoutOpen(true)}
            style={{ backgroundColor: SKAUTE_BLUE }}
            className="px-6 sm:px-8 py-4 rounded-2xl text-white font-black text-[10px] sm:text-[11px] uppercase tracking-[0.2em] shadow-lg shadow-blue-100 active:scale-95 transition-all flex-shrink-0"
          >
            Secure Pass
          </button>
        )}
      </div>
    </div>
  );
}
