/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronRight, ChevronLeft } from "lucide-react";
import { EVENT_CATEGORIES } from "@/lib/categories";
import EventCard from "@/components/cards/EventCard";
import Navbar from "@/components/layout/NavBar";
import MobileNav from "@/components/layout/MobileNav";
import Footer from "@/components/layout/Footer";
import HotListSection from "@/components/discover/HotListSection";
import ProfessionalSection from "@/components/discover/ProfessionalSection";
import VibeCheckSection from "@/components/discover/VibeCheckSection";
import NightMovesSection from "@/components/discover/NightMovesSection";
import CreateEventCTA from "@/components/discover/CreateEventCTA";

// BRAND COLOR CONSTANTS
const KIVO_BLUE = "#0052FF";
const KIVO_YELLOW = "#FFD700";
const DEEP_BLACK = "#000000";

const USER_LOCATION = { lat: 4.819, lng: 7.038 };

// --- SKELETON COMPONENT ---
const DiscoverSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 mb-20 items-stretch">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="flex flex-col space-y-5">
        <div className="relative aspect-[4/5] w-full bg-gray-100 rounded-[40px] overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        </div>
        <div className="space-y-3 px-2">
          <div className="h-6 bg-gray-100 rounded-xl w-3/4 animate-pulse" />
          <div className="flex justify-between items-center">
            <div className="h-4 bg-gray-50 rounded-lg w-1/3 animate-pulse" />
            <div className="h-10 bg-gray-100 rounded-2xl w-24 animate-pulse" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// HELPER: Calculate Distance
const getKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  if (!lat1 || !lng1 || !lat2 || !lng2) return "0.0";
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
};

// HELPER: Human Readable Date
const formatEventTime = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const eventDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  const diffDays = Math.round(
    (eventDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  let dayLabel;
  if (diffDays === 0) dayLabel = "Today";
  else if (diffDays === 1) dayLabel = "Tomorrow";
  else
    dayLabel = date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });

  const timeLabel = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${dayLabel} • ${timeLabel}`;
};

export default function DiscoverPage() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  // --- FILTER STATES ---
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [priceFilter, setPriceFilter] = useState<"all" | "free" | "paid">(
    "all",
  );
  const [mediumFilter, setMediumFilter] = useState<
    "all" | "physical" | "online"
  >("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "live" | "upcoming">(
    "all",
  );
  const [sections, setSections] = useState({
    hotList: [],
    professional: [],
    vibeCheck: [],
    nightMoves: [],
  });

  // --- FETCH LOGIC ---
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        // UPDATED: Primary sort by status (Featured), then by engagement (Views), then by date
        sort: "-status,-views,-startDate",
      });

      if (activeCat !== "all") params.append("category", activeCat);
      if (search) params.append("title", search);
      if (dateFilter !== "all") params.append("dateFilter", dateFilter);

      if (priceFilter === "free") params.append("isFree", "true");
      else if (priceFilter === "paid") params.append("isFree", "false");

      if (mediumFilter === "online") params.append("eventFormat", "online");
      else if (mediumFilter === "physical")
        params.append("eventFormat", "physical");

      if (statusFilter !== "all") params.append("timeStatus", statusFilter);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/events?${params.toString()}`,
      );
      const result = await response.json();

      if (result.status === "success") {
        const formatted = result.data.events.map((e: any) => ({
          ...e,
          id: e._id,
          displayPrice: e.priceLabel || (e.isFree ? "Free" : "Paid"),
          isOnline: e.eventFormat === "online" || e.eventFormat === "hybrid",
          lat: e.location?.coordinates?.[1] || null,
          lng: e.location?.coordinates?.[0] || null,
          organizerName: e.organizer?.name || "Kivo Host",
          // ADDED: Engagement metrics for the UI cards
          views: e.views || 0,
          likes: e.likes || 0,
        }));
        setEvents(formatted);
        setTotalPages(result.pagination.pages);
      }
    } catch (error) {
      console.error("Kivo Discover Error:", error);
    } finally {
      setLoading(false);
    }
  }, [
    page,
    activeCat,
    dateFilter,
    priceFilter,
    mediumFilter,
    statusFilter,
    search,
  ]);

  const fetchAllContent = useCallback(async () => {
    setLoading(true);
    try {
      const [hot, pro, culture, night] = await Promise.all([
        // HOT LIST: Featured events, sorted by views first
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/events?status=featured&sort=-views&limit=4`,
        ),
        // PROFESSIONAL: Multi-category works now because of the backend split(',') fix
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/events?category=business,tech,education&limit=4`,
        ),
        // VIBE CHECK: Changed 'arts' to 'culture' to match common Kivo category slugs
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/events?category=culture,social,religious&limit=3`,
        ),
        // NIGHT MOVES: Multi-category sorted by 'likes' to show social popularity
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/events?category=party,music,entertainment&sort=-likes&limit=4`,
        ),
      ]);

      const results = await Promise.all([
        hot.json(),
        pro.json(),
        culture.json(),
        night.json(),
      ]);

      setSections({
        hotList: results[0].data.events,
        professional: results[1].data.events,
        vibeCheck: results[2].data.events,
        nightMoves: results[3].data.events,
      });
    } catch (error) {
      console.error("Section Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    fetchAllContent();
  }, [fetchEvents, fetchAllContent]);

  useEffect(() => {
    setPage(1);
  }, [search, activeCat, dateFilter, priceFilter, mediumFilter, statusFilter]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const clearFilters = () => {
    setSearch("");
    setActiveCat("all");
    setDateFilter("all");
    setPriceFilter("all");
    setMediumFilter("all");
    setStatusFilter("all");
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col overflow-x-hidden">
      <Navbar />

      <section className="pt-28 md:pt-36 pb-12 px-6 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-xl">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 mb-4"
              >
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                  Live in Port Harcourt
                </span>
              </motion.div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-gray-900 leading-[0.85]">
                Find your next <br />{" "}
                <span className="relative inline-block">
                  <span style={{ color: KIVO_BLUE }}>Move.</span>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    className="absolute -bottom-2 left-0 h-2 rounded-full"
                    style={{ backgroundColor: KIVO_YELLOW }}
                  />
                </span>
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* STICKY FILTER BAR */}
      <div
        className={`sticky top-[72px] md:top-[80px] z-[40] bg-white/90 backdrop-blur-md border-b border-gray-100 transition-all ${isScrolled ? "py-2 shadow-sm" : "py-4"}`}
      >
        <div className="max-w-6xl mx-auto px-6 flex flex-col gap-3">
          {/* ROW 1: CATEGORIES */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => setActiveCat("all")}
              className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${activeCat === "all" ? "bg-black text-white" : "bg-white text-gray-400 border-gray-100"}`}
            >
              All Vibes
            </button>
            {Object.entries(EVENT_CATEGORIES).map(([k, v]: any) => (
              <button
                key={k}
                onClick={() => setActiveCat(k)}
                className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${activeCat === k ? "text-white" : "text-gray-400 border-gray-100"}`}
                style={{
                  backgroundColor: activeCat === k ? KIVO_BLUE : "transparent",
                }}
              >
                {v.label}
              </button>
            ))}
          </div>

          {/* ROW 2: FILTERS & SEARCH */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <div className="flex items-center gap-1.5 pr-3 border-r border-gray-100 mr-1.5">
              {["live", "upcoming"].map((s) => (
                <button
                  key={s}
                  onClick={() =>
                    setStatusFilter(statusFilter === s ? "all" : (s as any))
                  }
                  className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all shrink-0 ${
                    statusFilter === s
                      ? "bg-red-50 text-red-600 border-red-200"
                      : "bg-gray-50 text-gray-500 border-transparent"
                  }`}
                >
                  {s === "live" ? "● Live Now" : "Upcoming"}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 pr-3 border-r border-gray-100 mr-1.5">
              {["today", "tomorrow", "weekend"].map((d) => (
                <button
                  key={d}
                  onClick={() => setDateFilter(dateFilter === d ? "all" : d)}
                  className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all shrink-0 ${
                    dateFilter === d
                      ? "bg-blue-50 text-blue-600 border-blue-200"
                      : "bg-gray-50 text-gray-500 border-transparent"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 pr-3 border-r border-gray-100 mr-1.5">
              {["free", "paid"].map((p) => (
                <button
                  key={p}
                  onClick={() =>
                    setPriceFilter(priceFilter === p ? "all" : (p as any))
                  }
                  className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider border ${priceFilter === p ? "bg-green-50 text-green-600 border-green-200" : "bg-gray-50 text-gray-500"}`}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 pr-3 border-r border-gray-100 mr-1.5">
              {["physical", "online"].map((m) => (
                <button
                  key={m}
                  onClick={() =>
                    setMediumFilter(mediumFilter === m ? "all" : (m as any))
                  }
                  className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider border ${mediumFilter === m ? "bg-purple-50 text-purple-600 border-purple-200" : "bg-gray-50 text-gray-500"}`}
                >
                  {m === "online" ? "Virtual" : "Physical"}
                </button>
              ))}
            </div>

            <div className="relative min-w-[150px]">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
                size={14}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search moves..."
                className="w-full pl-9 pr-4 py-1.5 bg-gray-50 rounded-xl font-bold border-none focus:ring-1 focus:ring-blue-100 
             text-[16px] md:text-[10px] origin-left scale-[0.625] md:scale-100"
                style={{ width: "160%" }}
              />
            </div>

            {(activeCat !== "all" ||
              dateFilter !== "all" ||
              search !== "" ||
              priceFilter !== "all" ||
              mediumFilter !== "all" ||
              statusFilter !== "all") && (
              <button
                onClick={clearFilters}
                className="ml-auto px-4 py-1.5 text-[9px] font-black uppercase rounded-full shrink-0"
                style={{ backgroundColor: KIVO_YELLOW, color: DEEP_BLACK }}
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      <main className="flex-1 w-full py-8 md:py-12">
        {loading ? (
          <div className="max-w-6xl mx-auto px-6">
            <DiscoverSkeleton />
          </div>
        ) : (
          <>
            {/* MAIN GRID SECTION */}
            <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 mb-32 items-stretch">
              <AnimatePresence mode="popLayout">
                {events.map((e, index) => (
                  <motion.div
                    key={e.id}
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex flex-col h-full cursor-pointer"
                    onClick={() => router.push(`/discover/${e.id}`)}
                  >
                    <EventCard
                      {...e}
                      location={
                        e.isOnline
                          ? "Online"
                          : `${getKm(USER_LOCATION.lat, USER_LOCATION.lng, e.lat, e.lng)}km • Port Harcourt`
                      }
                      time={formatEventTime(e.startDate)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-12 mb-24">
                <button
                  disabled={page === 1}
                  onClick={() => {
                    setPage((p) => p - 1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="w-12 h-12 rounded-2xl border border-gray-100 flex items-center justify-center disabled:opacity-20"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="font-black text-xs uppercase tracking-widest">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => {
                    setPage((p) => p + 1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="w-12 h-12 rounded-2xl border border-gray-100 flex items-center justify-center disabled:opacity-20"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
            {/* THE HOT LIST SECTION */}
            <HotListSection
              data={sections.hotList}
              getKm={getKm}
              location={USER_LOCATION}
              formatTime={formatEventTime}
            />
            {/* GROWTH & TECH SECTION */}
            <ProfessionalSection
              data={sections.professional}
              getKm={getKm}
              location={USER_LOCATION}
              formatTime={formatEventTime}
            />

            {/* VIBE CHECK SECTION */}
            <VibeCheckSection data={sections.vibeCheck} />

            {/* NIGHT MOVES SECTION */}
            <NightMovesSection data={sections.nightMoves} />
          </>
        )}
      </main>

      <CreateEventCTA />

      <MobileNav />
      <Footer />
    </div>
  );
}
