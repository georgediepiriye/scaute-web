/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import CheckoutPanel from "@/components/events/CheckoutPanel";
import { motion, AnimatePresence } from "framer-motion";

import {
  ArrowLeft,
  MapPin,
  Calendar,
  Share2,
  Info,
  Loader2,
  Ticket,
  ExternalLink,
  Globe,
  ChevronDown,
  ChevronUp,
  Users,
  UserPlus,
  Check,
  MessageSquare,
  Navigation,
} from "lucide-react";

import Navbar from "@/components/layout/NavBar";
import MobileNav from "@/components/layout/MobileNav";
import Footer from "@/components/layout/Footer";
import EventMap from "@/components/map/EventMap";
import { Toaster } from "react-hot-toast";

// BRAND COLORS
const KIVO_YELLOW = "#FFD700";

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [showExternalModal, setShowExternalModal] = useState(false);
  const [hasReserved, setHasReserved] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [similarEvents, setSimilarEvents] = useState<any[]>([]);

  // 1. FETCH MAIN EVENT
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/events/${params.id}`,
        );
        const result = await res.json();

        if (result.status === "success") {
          const data = result.data.event;
          data.isOnline = data.medium === "online" || data.isOnline === true;
          setEvent(data);
        }
      } catch (error) {
        console.error("Kivo Detail Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchEventDetails();
  }, [params.id]);

  // 2. FETCH SIMILAR EVENTS
  useEffect(() => {
    const fetchSimilarEvents = async () => {
      if (!event?.category) return;
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/events?category=${event.category}&limit=5`,
        );
        const result = await res.json();
        if (result.status === "success") {
          const filtered = result.data.events.filter(
            (e: any) => e._id !== event._id,
          );
          setSimilarEvents(filtered);
        }
      } catch (error) {
        console.error("Kivo Similar Events Error:", error);
      }
    };

    fetchSimilarEvents();
  }, [event]);

  const timeStatus = useMemo(() => {
    if (!event) return null;
    const now = new Date().getTime();
    const start = new Date(event.startDate).getTime();
    const end = new Date(event.endDate).getTime();

    if (now < start) return "upcoming";
    if (now <= end) return "ongoing";
    return "past";
  }, [event]);

  const displayPrice = useMemo(() => {
    if (!event) return "";
    if (event.ticketingType === "none" || event.isFree) return "Free";

    if (event.ticketTiers && event.ticketTiers.length > 0) {
      const prices = event.ticketTiers.map((t: any) => t.price);
      const min = Math.min(...prices);
      const max = Math.max(...prices);

      if (min === 0 && max > 0) return "Free +";
      if (min === 0 && max === 0) return "Free";
      if (min === max) return `₦${min.toLocaleString()}`;
      return `From ₦${min.toLocaleString()}`;
    }

    return event.externalTicketLink || event.joinLink ? "Paid" : "Invite Only";
  }, [event]);

  const getButtonContent = () => {
    if (event.isCancelled) return "Event Cancelled";
    if (hasReserved) return "Spot Reserved";
    if (event.externalTicketLink) return "Get External Tickets";
    if (event.isOnline) return "Join Event Online";

    const hasPaidTiers = event.ticketTiers?.some((tier: any) => tier.price > 0);
    if (event.isFree || (event.ticketingType === "none" && !hasPaidTiers)) {
      return "Register for Free";
    }
    if (hasPaidTiers) return "Get Tickets";

    return "Register for Free";
  };

  const handleCTA = () => {
    if (event.isCancelled) return;
    if (event.externalTicketLink) {
      setShowExternalModal(true);
      return;
    }
    if (event.joinLink && event.isOnline) {
      window.open(event.joinLink, "_blank");
      return;
    }
    setIsCheckoutOpen(true);
  };

  const confirmExternalRedirect = () => {
    window.open(event.externalTicketLink, "_blank");
    setShowExternalModal(false);
  };

  const handleOpenMap = () => {
    if (event?.location?.coordinates) {
      const [lng, lat] = event.location.coordinates;
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
        "_blank",
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-blue-600" size={40} />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
            Syncing Details...
          </p>
        </div>
      </div>
    );
  }

  if (!event)
    return (
      <div className="p-20 text-center font-bold text-gray-400">
        Event not found.
      </div>
    );

  const start = new Date(event.startDate);
  const end = new Date(event.endDate);
  const isSameDay = start.toDateString() === end.toDateString();

  const formattedDate = isSameDay
    ? `${start.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })} • ${start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} - ${end.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`
    : `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} @ ${start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} — ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })} @ ${end.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col relative">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Navbar Z-Index Management */}
      <div className="relative z-[150]">
        <Navbar />
      </div>

      <CheckoutPanel
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        event={event}
      />

      <AnimatePresence>
        {showExternalModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExternalModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-[40px] p-10 text-center shadow-2xl"
            >
              <div
                className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6"
                style={{
                  backgroundColor: `${KIVO_YELLOW}20`,
                  color: "#856404",
                }}
              >
                <ExternalLink size={32} />
              </div>
              <h3 className="text-2xl font-black tracking-tight mb-2 uppercase italic">
                Leaving Kivo
              </h3>
              <p className="text-gray-500 text-sm font-medium mb-8 leading-relaxed">
                You are being redirected to an external site to complete your
                booking. Kivo does not manage tickets for this specific event.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={confirmExternalRedirect}
                  className="w-full py-5 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl"
                >
                  Continue to Booking
                </button>
                <button
                  onClick={() => setShowExternalModal(false)}
                  className="w-full py-5 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                >
                  Stay on Kivo
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="flex-1 relative pt-24 pb-32 md:pt-36 md:pb-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => router.back()}
              className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black"
            >
              <ArrowLeft
                size={16}
                className="group-hover:-translate-x-1 transition-transform"
              />{" "}
              Back to City
            </button>
            <div className="flex gap-2">
              <button className="p-3 rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-black transition-all">
                <Share2 size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-12">
              {/* IMAGE HEADER */}
              <div className="relative aspect-[16/9] w-full rounded-[40px] overflow-hidden shadow-2xl border border-gray-100">
                <Image
                  src={
                    event.image || "https://picsum.photos/seed/kivo/1200/800"
                  }
                  alt={event.title}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute top-6 left-6 flex gap-2">
                  <span
                    className="px-5 py-2.5 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase text-black shadow-sm"
                    style={{ backgroundColor: `${KIVO_YELLOW}EE` }}
                  >
                    {event.category}
                  </span>
                  <span
                    className={`px-5 py-2.5 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 text-white shadow-xl ${
                      timeStatus === "ongoing"
                        ? "bg-green-500/90"
                        : "bg-gray-900/80"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full bg-white ${timeStatus === "ongoing" ? "animate-pulse" : ""}`}
                    />
                    {timeStatus}
                  </span>
                </div>
              </div>

              {/* TITLE & ORGANIZER */}
              <div className="space-y-8">
                <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-gray-900 leading-[0.85] uppercase italic">
                  {event.title}
                </h1>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-8 bg-gray-50 rounded-[32px] gap-6 border border-gray-100/50">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white shadow-sm overflow-hidden relative border border-gray-100">
                      <Image
                        src={
                          event.organizer?.image ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${event.organizer?.name || "host"}`
                        }
                        alt="Organizer"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                        Organizer
                      </p>
                      <p className="text-lg font-black text-gray-900 leading-none">
                        {event.organizer?.name || "Kivo Host"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsFollowing(!isFollowing)}
                      className={`flex-1 sm:flex-none px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${isFollowing ? "bg-white border-2 border-gray-100 text-green-600" : "bg-black text-white hover:scale-[1.02] shadow-xl"}`}
                    >
                      {isFollowing ? (
                        <>
                          <Check size={14} /> Following
                        </>
                      ) : (
                        <>
                          <UserPlus size={14} /> Follow
                        </>
                      )}
                    </button>
                    <button className="w-14 h-14 bg-white border-2 border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 hover:text-black transition-all">
                      <MessageSquare size={20} />
                    </button>
                  </div>
                </div>

                {/* DATE & LOCATION GRID */}
                <div className="flex flex-wrap gap-6 py-8 border-y border-gray-100">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center border border-gray-100"
                      style={{
                        backgroundColor: `${KIVO_YELLOW}15`,
                        color: "#856404",
                      }}
                    >
                      <Calendar size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                        When
                      </p>
                      <p className="font-black text-gray-900">
                        {formattedDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 group">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center border border-gray-100"
                      style={{
                        backgroundColor: `${KIVO_YELLOW}15`,
                        color: "#856404",
                      }}
                    >
                      {event.isOnline ? (
                        <Globe size={24} />
                      ) : (
                        <MapPin size={24} />
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                        Where
                        {!event.isOnline && (
                          <button
                            onClick={handleOpenMap}
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Navigation size={10} /> Directions
                          </button>
                        )}
                      </p>
                      <p className="font-black text-gray-900 leading-tight">
                        {event.isOnline
                          ? "Virtual / Online"
                          : `${event.location?.address || ""}, ${event.location?.neighborhood || "Port Harcourt"}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* OVERVIEW SECTION */}
              <div className="space-y-4">
                <h3 className="text-xl font-black tracking-tight text-gray-900 flex items-center gap-2">
                  <Info size={20} className="text-gray-400" /> Overview
                </h3>
                <div className="relative">
                  <p
                    className={`text-gray-600 leading-relaxed font-medium whitespace-pre-wrap transition-all duration-500 ${!showFullDescription ? "max-h-[200px] overflow-hidden" : "max-h-full"}`}
                  >
                    {event.description}
                  </p>
                  {!showFullDescription && event.description?.length > 350 && (
                    <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#FDFDFD] via-[#FDFDFD]/80 to-transparent pointer-events-none" />
                  )}
                </div>
                {event.description?.length > 350 && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 hover:scale-105 transition-transform"
                  >
                    {showFullDescription ? (
                      <>
                        <ChevronUp size={14} /> Collapse
                      </>
                    ) : (
                      <>
                        <ChevronDown size={14} /> Expand Description
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* TICKET TIERS */}
              {event.ticketingType === "internal" &&
                event.ticketTiers?.length > 0 && (
                  <div className="space-y-6 pt-6">
                    <h3 className="text-xl font-black tracking-tight text-gray-900 flex items-center gap-2">
                      <Ticket size={20} className="text-gray-400" /> Ticket
                      Tiers
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {event.ticketTiers.map((tier: any) => (
                        <div
                          key={tier._id}
                          className="p-6 bg-white border border-gray-100 rounded-[32px] shadow-sm hover:border-black/10 transition-all"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-black text-gray-900 uppercase text-sm tracking-tight">
                              {tier.name}
                            </h4>
                            <span
                              className="text-lg font-black"
                              style={{ color: "#000" }}
                            >
                              {tier.price === 0
                                ? "FREE"
                                : `₦${tier.price.toLocaleString()}`}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] font-black uppercase text-gray-400 mb-2">
                            <span>Availability</span>
                            <span>
                              {Math.max(0, tier.capacity - (tier.sold || 0))}{" "}
                              Left
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-black transition-all"
                              style={{
                                width: `${Math.min(100, ((tier.sold || 0) / tier.capacity) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            {/* SIDEBAR CTA */}
            <div className="lg:col-span-4 space-y-6">
              <div className="hidden lg:block sticky top-28 p-8 bg-white rounded-[40px] border border-gray-100 shadow-2xl shadow-black/5 space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                      Pricing
                    </p>
                    <p className="text-3xl font-black text-gray-900 uppercase italic">
                      {displayPrice}
                    </p>
                  </div>
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{
                      backgroundColor: `${KIVO_YELLOW}20`,
                      color: "#856404",
                    }}
                  >
                    <Users size={20} />
                  </div>
                </div>

                <button
                  onClick={handleCTA}
                  disabled={event.isCancelled || hasReserved}
                  className={`w-full py-6 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-xl ${event.isCancelled ? "bg-red-50 text-red-400 cursor-not-allowed" : "bg-black text-white hover:scale-[1.02] active:scale-95"}`}
                >
                  {getButtonContent()}
                </button>

                <div className="pt-8 border-t border-gray-100">
                  <div
                    className="h-56 rounded-[32px] overflow-hidden bg-gray-100 border border-gray-100 group cursor-pointer"
                    onClick={handleOpenMap}
                  >
                    <EventMap
                      latitude={event.location?.coordinates?.[1]}
                      longitude={event.location?.coordinates?.[0]}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* MOBILE CTA BAR */}
      <div className="lg:hidden fixed bottom-6 left-6 right-6 z-[100]">
        <button
          onClick={handleCTA}
          className="w-full py-5 bg-black text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl active:scale-95 transition-all"
        >
          {getButtonContent()} — {displayPrice}
        </button>
      </div>

      {/* SIMILAR EVENTS SECTION */}
      {similarEvents.length > 0 && (
        <section className="bg-gray-50 py-24 border-t border-gray-100 relative z-10">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-2">
                  More to Explore
                </p>
                <h2 className="text-4xl font-black tracking-tighter text-gray-900 uppercase italic">
                  Similar <span style={{ color: KIVO_YELLOW }}>Vibes</span>
                </h2>
              </div>
              <button
                onClick={() => router.push("/discover")}
                className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors w-fit"
              >
                View All Discoveries
              </button>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-8 snap-x no-scrollbar">
              {similarEvents.map((item: any) => (
                <motion.div
                  key={item._id}
                  whileHover={{ y: -5 }}
                  onClick={() => router.push(`/discover/${item._id}`)}
                  className="min-w-[300px] md:min-w-[350px] group cursor-pointer snap-start"
                >
                  <div className="relative aspect-[4/5] rounded-[32px] overflow-hidden mb-4 shadow-xl">
                    <Image
                      src={
                        item.image || "https://picsum.photos/seed/kivo/600/800"
                      }
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <p className="text-[10px] font-black uppercase text-yellow-400 mb-1">
                        {item.location?.neighborhood || "Port Harcourt"}
                      </p>
                      <h3 className="text-white font-black text-xl leading-tight line-clamp-2">
                        {item.title}
                      </h3>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <MobileNav />
      <Footer />
    </div>
  );
}
