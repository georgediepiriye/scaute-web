/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
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
  Monitor,
  ChevronDown,
  ChevronUp,
  Users,
  UserPlus,
  Check,
  MessageSquare,
  Sparkles,
  Zap,
} from "lucide-react";

import Navbar from "@/components/layout/NavBar";
import MobileNav from "@/components/layout/MobileNav";
import Footer from "@/components/layout/Footer";
import EventMap from "@/components/map/EventMap";
import toast, { Toaster } from "react-hot-toast";

const KIVO_YELLOW = "#FFD700";
const KIVO_BLUE = "#0052FF";

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [event, setEvent] = useState<any>(null);
  const [similarEvents, setSimilarEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [showExternalModal, setShowExternalModal] = useState(false);
  const [hasReserved, setHasReserved] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

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
          fetchSimilarEvents(data.category, data._id);
        }
      } catch (error) {
        console.error("Kivo Detail Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchEventDetails();
  }, [params.id]);

  const fetchSimilarEvents = async (category: string, currentId: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/events?category=${category}&limit=3`,
      );
      const result = await res.json();
      if (result.status === "success") {
        const filtered = result.data.events.filter(
          (e: any) => e._id !== currentId,
        );
        setSimilarEvents(filtered);
      }
    } catch (error) {
      console.error("Error fetching similar events:", error);
    }
  };

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

  const formattedDate =
    new Date(event.startDate).toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    }) +
    " • " +
    new Date(event.startDate).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col">
      <Toaster position="top-center" reverseOrder={false} />
      <Navbar />
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
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
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
                  className="w-full py-5 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-blue-600/10"
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

      <main className="flex-1 pt-20 pb-12 md:pt-28">
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
            <button className="p-3 rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-blue-600 transition-all">
              <Share2 size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-12">
              <div className="relative aspect-[16/9] w-full rounded-[40px] overflow-hidden shadow-2xl border border-gray-100">
                <Image
                  src={
                    event.image || "https://picsum.photos/seed/kivo/1200/800"
                  }
                  alt={event.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                />
                <div className="absolute top-6 left-6 flex gap-2">
                  <span className="px-5 py-2.5 bg-white/90 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase text-gray-900 shadow-sm">
                    {event.category}
                  </span>
                  <span
                    className={`px-5 py-2.5 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 text-white shadow-xl ${timeStatus === "ongoing" ? "bg-green-500/90" : "bg-gray-900/80"}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full bg-white ${timeStatus === "ongoing" ? "animate-pulse" : ""}`}
                    />
                    {timeStatus}
                  </span>
                </div>
              </div>

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
                  <div className="flex flex-wrap items-center gap-3">
                    {event.communityLink && (
                      <a
                        href={event.communityLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-6 py-4 bg-gray-900 text-white rounded-2xl transition-all group"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = KIVO_YELLOW;
                          e.currentTarget.style.color = "#000";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "#111827";
                          e.currentTarget.style.color = "#fff";
                        }}
                      >
                        <MessageSquare
                          size={16}
                          style={{ color: KIVO_YELLOW }}
                        />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          Join Community
                        </span>
                      </a>
                    )}
                    <button
                      onClick={() => setIsFollowing(!isFollowing)}
                      className={`px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${isFollowing ? "bg-white border-2 border-gray-100 text-green-600" : "bg-black text-white hover:bg-blue-600 shadow-xl shadow-blue-600/10"}`}
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
                  </div>
                </div>

                <div className="flex flex-wrap gap-6 py-8 border-y border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-blue-600 border border-gray-100">
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
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-blue-600 border border-gray-100">
                      {event.isOnline ? (
                        <Globe size={24} />
                      ) : (
                        <MapPin size={24} />
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                        Where
                      </p>
                      <p className="font-black text-gray-900">
                        {event.isOnline
                          ? "Virtual / Online"
                          : `${event.location?.address || ""}, ${event.location?.neighborhood || "Port Harcourt"}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* OVERVIEW */}
              <div className="space-y-4">
                <h3 className="text-xl font-black tracking-tight text-gray-900 flex items-center gap-2">
                  <Info size={20} className="text-blue-600" /> Overview
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
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600"
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

              {/* TICKET OPTIONS */}
              {event.ticketTiers && event.ticketTiers.length > 0 && (
                <div className="space-y-6 pt-12 border-t border-gray-100">
                  <h3 className="text-xl font-black tracking-tight text-gray-900 flex items-center gap-2">
                    <Ticket size={20} className="text-blue-600" /> Ticket
                    Options
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {event.ticketTiers.map((tier: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-6 rounded-[32px] bg-white border border-gray-100 hover:border-blue-600 transition-all flex justify-between items-center group"
                      >
                        <div>
                          <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest flex items-center gap-2">
                            <Zap size={10} fill={KIVO_BLUE} /> {tier.name}
                          </p>
                          <p className="text-xs font-bold text-gray-400">
                            {tier.capacity
                              ? `${tier.capacity} Slots`
                              : "Unlimited"}
                          </p>
                        </div>
                        <p className="text-2xl font-black italic text-gray-900">
                          {tier.price === 0
                            ? "FREE"
                            : `₦${tier.price.toLocaleString()}`}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SIDEBAR */}
            <div className="lg:col-span-4 space-y-6">
              <div className="hidden lg:block sticky top-28 p-8 bg-white rounded-[40px] border border-gray-100 shadow-2xl shadow-black/5 space-y-8">
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                    Pricing
                  </p>
                  <p className="text-3xl font-black text-gray-900 uppercase italic">
                    {displayPrice}
                  </p>
                </div>
                <button
                  onClick={handleCTA}
                  disabled={event.isCancelled || hasReserved}
                  className={`w-full py-6 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-xl ${event.isCancelled ? "bg-red-50 text-red-400 cursor-not-allowed" : "bg-black text-white hover:bg-blue-600 shadow-blue-600/10"}`}
                >
                  {getButtonContent()}
                </button>
                <div className="pt-8 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                      Venue Map
                    </p>
                    {!event.isOnline && (
                      <button
                        onClick={handleOpenMap}
                        className="text-[10px] font-black uppercase text-blue-600 hover:underline"
                      >
                        Get Directions
                      </button>
                    )}
                  </div>
                  {!event.isOnline ? (
                    <div className="h-56 rounded-[32px] overflow-hidden border border-gray-100">
                      <EventMap
                        latitude={event.location?.coordinates?.[1]}
                        longitude={event.location?.coordinates?.[0]}
                      />
                    </div>
                  ) : (
                    <div className="h-56 rounded-[32px] bg-blue-50 flex flex-col items-center justify-center p-8 border border-blue-100 text-center">
                      <Monitor size={32} className="text-blue-600 mb-2" />
                      <p className="text-xs font-black uppercase text-blue-600 tracking-widest">
                        Virtual Move
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SIMILAR EVENTS */}
          {similarEvents.length > 0 && (
            <div className="mt-32 space-y-10 pb-20">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div
                    className="flex items-center gap-2"
                    style={{ color: KIVO_BLUE }}
                  >
                    <Sparkles size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Recommendations
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter">
                    More Like This
                  </h2>
                </div>
                <Link
                  href="/explore"
                  className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black border-b-2 border-transparent hover:border-black transition-all"
                >
                  See All
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {similarEvents.map((similar: any) => (
                  <Link
                    href={`/events/${similar._id}`}
                    key={similar._id}
                    className="group"
                  >
                    <div
                      className="bg-white rounded-[40px] overflow-hidden border border-gray-100 shadow-sm transition-all duration-500 hover:-translate-y-2"
                      style={{
                        boxShadow: "0 20px 40px -20px rgba(255, 215, 0, 0.3)",
                      }}
                    >
                      <div className="relative aspect-[4/3] w-full">
                        <Image
                          src={
                            similar.image ||
                            "https://picsum.photos/seed/similar/800/600"
                          }
                          alt={similar.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute top-4 left-4">
                          <span
                            className="px-4 py-2 rounded-xl text-[9px] font-black uppercase text-gray-900 shadow-sm"
                            style={{ backgroundColor: KIVO_YELLOW }}
                          >
                            {similar.category}
                          </span>
                        </div>
                      </div>
                      <div className="p-8 space-y-4">
                        <div
                          className="flex items-center gap-2"
                          style={{ color: KIVO_BLUE }}
                        >
                          <Calendar size={14} />
                          <span className="text-[10px] font-black uppercase">
                            {new Date(similar.startDate).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric" },
                            )}
                          </span>
                        </div>
                        <h4 className="text-xl font-black uppercase italic truncate group-hover:text-blue-600 transition-colors">
                          {similar.title}
                        </h4>
                        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                          <div className="flex items-center gap-2 text-gray-400">
                            <MapPin size={14} />
                            <span className="text-[10px] font-black uppercase truncate max-w-[100px]">
                              {similar.location?.neighborhood ||
                                "Port Harcourt"}
                            </span>
                          </div>
                          <span
                            className="text-[10px] font-black uppercase tracking-wider group-hover:underline"
                            style={{ color: KIVO_YELLOW }}
                          >
                            View Details
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <div className="lg:hidden fixed bottom-6 left-6 right-6 z-[100]">
        <button
          onClick={handleCTA}
          className="w-full py-5 bg-black text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl active:scale-95 transition-all shadow-blue-600/20"
        >
          {getButtonContent()} — {displayPrice}
        </button>
      </div>

      <MobileNav />
      <Footer />
    </div>
  );
}
