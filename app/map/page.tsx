/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useRef, useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Heart,
  X,
  Loader2,
  Search,
  LocateFixed,
  Calendar,
  Clock,
  Flame,
  Navigation,
  Music,
  Utensils,
  Coffee,
  Sparkles,
  ShoppingBag,
  Palette,
  Info,
  Ticket,
  Globe,
  MapPin,
  User as UserIcon,
  Settings,
  LogOut,
  PlusCircle,
  MessageSquare,
  Compass,
  Phone,
  ChevronRight,
  Timer,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import Navbar from "@/components/layout/NavBar";
import MobileNav from "@/components/layout/MobileNav";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import { Event } from "@/lib/events";
import MapGuide from "@/components/onboarding/MapGuide";

const RealMap = dynamic(() => import("@/components/map/RealMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
      <Loader2 className="animate-spin text-gray-400" size={32} />
    </div>
  ),
});

type FilterType = "upcoming" | "ongoing";

const HOTSPOT_CATEGORIES = [
  { id: "all", label: "All Spots", icon: <Sparkles size={14} /> },
  { id: "dining", label: "Food", icon: <Utensils size={14} /> },
  { id: "nightlife", label: "Social", icon: <Music size={14} /> },
  { id: "cafe", label: "Chill", icon: <Coffee size={14} /> },
  { id: "arts", label: "Creative", icon: <Palette size={14} /> },
  { id: "retail", label: "Shopping", icon: <ShoppingBag size={14} /> },
];

export default function MapPage() {
  const router = useRouter();
  const mapRef = useRef<any>(null);

  const [selected, setSelected] = useState<Event | any>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>("ongoing");
  const [activeHotspotCat, setActiveHotspotCat] = useState("all");
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showHotspots, setShowHotspots] = useState(true);
  const [likedEvents, setLikedEvents] = useState<Set<string>>(new Set());
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState<any>(null);

  // AUTH STATE LOGIC
  const [authState, setAuthState] = useState({
    isLoggedIn: false,
    isMounted: false,
    user: null as any,
  });

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/me`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        },
      );

      if (response.ok) {
        const result = await response.json();
        setAuthState({
          isLoggedIn: result.authenticated,
          isMounted: true,
          user: result.user,
        });
      } else {
        throw new Error("Unauthorized");
      }
    } catch (error) {
      setAuthState({
        isLoggedIn: false,
        isMounted: true,
        user: null,
      });
    }
  }, []);

  useEffect(() => {
    if (!selected) {
      setTimeLeft(null);
      return;
    }

    const calculateTime = () => {
      const now = new Date().getTime();
      const start = new Date(selected.startDate).getTime();
      const end = new Date(selected.endDate).getTime();

      let target: number;
      let label = "";

      if (now < start) {
        target = start;
        label = "Starts in";
      } else if (now >= start && now < end) {
        target = end;
        label = "Ends in";
      } else {
        setTimeLeft({ label: "Ended" });
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
  }, [selected]);

  useEffect(() => {
    checkAuth();
    window.addEventListener("storage", checkAuth);
    window.addEventListener("auth-change", checkAuth);
    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("auth-change", checkAuth);
    };
  }, [checkAuth]);

  const handleSignOut = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setAuthState({ isLoggedIn: false, isMounted: true, user: null });
      setMenuOpen(false);
      router.push("/auth/signin");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navLinks = [
    { href: "/discover", label: "Discover", icon: <Compass size={18} /> },
    { href: "/create", label: "Add Event", icon: <PlusCircle size={18} /> },
    { href: "/chat", label: "AI Assistant", icon: <MessageSquare size={18} /> },
    { href: "/about", label: "About", icon: <Info size={18} /> },
    { href: "/contact", label: "Contact Us", icon: <Phone size={18} /> },
  ];

  const [showGuide, setShowGuide] = useState(() => {
    if (typeof window !== "undefined") {
      return !localStorage.getItem("kivo_map_guided");
    }
    return false;
  });

  const closeGuide = () => {
    localStorage.setItem("kivo_map_guided", "true");
    setShowGuide(false);
  };

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/events?limit=100`,
      );
      if (!response.ok) throw new Error("Network error");
      const result = await response.json();
      if (result.status !== "success") throw new Error("Fetch failed");

      return result.data.events.map((e: any) => ({
        ...e,
        id: e._id,
        lat: e.location?.coordinates[1],
        lng: e.location?.coordinates[0],
        isOnline: e.medium === "online" || e.isOnline === true,
        organizerName: e.organizer?.name || "Kivo Host",
        organizerImage:
          e.organizer?.image ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${e._id}`,
      }));
    },
    retry: 3,
    staleTime: 1000 * 60 * 5,
  });

  const filteredEvents = useMemo(() => {
    const now = new Date().getTime();
    const query = search.toLowerCase();

    return events
      .map((event: any) => {
        const start = new Date(event.startDate).getTime();
        const end = new Date(event.endDate).getTime();
        const timeStatus =
          now < start ? "upcoming" : now <= end ? "ongoing" : "past";
        return { ...event, timeStatus };
      })
      .filter((event: any) => {
        if (event.timeStatus === "past" || event.isCancelled) return false;
        const matchesSearch =
          !search || event.title.toLowerCase().includes(query);
        const matchesFilter = event.timeStatus === activeFilter;
        return matchesSearch && matchesFilter;
      });
  }, [events, search, activeFilter]);

  const displayPrice = useMemo(() => {
    if (!selected) return "";

    const tiers = selected.ticketTiers || [];
    const hasTiers = Array.isArray(tiers) && tiers.length > 0;

    if (hasTiers) {
      const prices = tiers
        .map((t: any) => Number(t.price))
        .filter((p: number) => !isNaN(p));
      const min = Math.min(...prices);
      const max = Math.max(...prices);

      if (min === 0 && max > 0) return "Free +";
      if (min === 0 && max === 0) return "Free";
      if (min === max) return `₦${min.toLocaleString()}`;
      return `From ₦${min.toLocaleString()}`;
    }

    if (selected.startingPrice > 0) {
      return `₦${selected.startingPrice.toLocaleString()}`;
    }

    if (selected.isFree || selected.ticketingType === "none") return "Free";
    if (selected.externalTicketLink || selected.joinLink) return "Paid";
    return selected.isPublic === false ? "Invite Only" : "Free";
  }, [selected]);

  const toggleLike = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setLikedEvents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  }, []);

  const toggleFollow = useCallback((userName: string) => {
    setFollowedUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userName)) newSet.delete(userName);
      else newSet.add(userName);
      return newSet;
    });
  }, []);

  const handleLocateUser = useCallback(() => {
    if (mapRef.current?.flyToUser) {
      mapRef.current.flyToUser();
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        mapRef.current?.flyTo({
          lng: pos.coords.longitude,
          lat: pos.coords.latitude,
        });
      });
    }
  }, []);

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white font-sans text-gray-900 antialiased">
      {authState.isMounted && !authState.isLoggedIn && <OnboardingFlow />}
      <AnimatePresence>
        {showGuide && <MapGuide onClose={closeGuide} />}
      </AnimatePresence>
      <style jsx global>{`
        .mapboxgl-ctrl-geolocate {
          visibility: hidden !important;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scroll-mask {
          mask-image: linear-gradient(to right, black 85%, transparent 100%);
        }
      `}</style>

      {/* MOBILE SIDE MENU OVERLAY */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[150] md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-[300px] bg-white z-[160] md:hidden shadow-2xl flex flex-col"
            >
              <div className="p-8 pb-4 flex justify-between items-center">
                <span className="font-black italic text-xl tracking-tighter text-blue-600 uppercase">
                  KIVO
                </span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-2 bg-gray-50 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-8 py-4">
                {/* PROFILE SECTION */}
                {authState.isLoggedIn && (
                  <div className="mb-10 p-4 bg-gray-50 rounded-[32px] flex items-center gap-4 border border-gray-100">
                    <div className="w-12 h-12 rounded-2xl relative overflow-hidden bg-white border border-gray-100">
                      {authState.user?.image ? (
                        <Image
                          src={authState.user.image}
                          alt="User"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <UserIcon size={20} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-sm truncate">
                        {authState.user?.name || "Kivo User"}
                      </p>
                      <button
                        onClick={() => {
                          router.push("/profile");
                          setMenuOpen(false);
                        }}
                        className="text-[10px] font-black text-[#715800] uppercase tracking-widest"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                )}

                {/* LINKS */}
                <div className="space-y-2">
                  {navLinks.map((item) => (
                    <button
                      key={item.href}
                      onClick={() => {
                        router.push(item.href);
                        setMenuOpen(false);
                      }}
                      className="flex items-center justify-between w-full p-4 rounded-2xl hover:bg-gray-50 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-gray-400 group-hover:text-[#715800]">
                          {item.icon}
                        </span>
                        <span className="font-black text-xs uppercase tracking-widest">
                          {item.label}
                        </span>
                      </div>
                      <ChevronRight size={14} className="text-gray-300" />
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      router.push("/settings");
                      setMenuOpen(false);
                    }}
                    className="flex items-center justify-between w-full p-4 rounded-2xl hover:bg-gray-50 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <Settings
                        size={18}
                        className="text-gray-400 group-hover:text-[#715800]"
                      />
                      <span className="font-black text-xs uppercase tracking-widest">
                        Settings
                      </span>
                    </div>
                    <ChevronRight size={14} className="text-gray-300" />
                  </button>
                </div>
              </div>

              {/* AUTH ACTION */}
              <div className="p-8 border-t border-gray-50">
                {authState.isLoggedIn ? (
                  <button
                    onClick={handleSignOut}
                    className="w-full py-5 bg-red-50 text-red-500 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all"
                  >
                    <LogOut size={18} /> Sign Out
                  </button>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        router.push("/auth/signup");
                        setMenuOpen(false);
                      }}
                      className="w-full py-5 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all"
                    >
                      Create Account
                    </button>
                    <button
                      onClick={() => {
                        router.push("/auth/signin");
                        setMenuOpen(false);
                      }}
                      className="w-full py-5 bg-gray-50 text-gray-900 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all"
                    >
                      Sign In
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isLoading && (
          <motion.div
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center"
          >
            <div className="font-black text-3xl text-gray-900 mb-4 tracking-tighter italic">
              Kivo
            </div>
            <Loader2 className="animate-spin text-gray-200" size={32} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="hidden md:block">
        <Navbar />
      </div>

      <div className="flex-1 relative">
        <div className="md:hidden fixed top-0 left-0 w-full z-[70] bg-white px-4 py-3 flex items-center gap-3 border-b border-gray-100">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="what do you want to do?"
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-gray-100 text-sm border-transparent outline-none font-bold text-gray-900"
            />
          </div>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-11 h-11 flex items-center rounded-2xl bg-white justify-center text-gray-900 border border-gray-100 shadow-sm font-black"
          >
            ☰
          </button>
        </div>

        <div className="fixed top-[68px] md:top-[100px] left-0 w-full z-[40] flex flex-col items-center">
          <div className="w-full max-w-6xl px-4 relative">
            <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar scroll-mask pb-4 pt-1">
              <div className="flex bg-white/90 backdrop-blur-xl shadow-xl rounded-full p-1 border border-gray-100 shrink-0">
                {(["ongoing", "upcoming"] as FilterType[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => setActiveFilter(status)}
                    className={`relative flex items-center gap-2 px-5 py-2 rounded-full transition-all duration-300 font-black text-[10px] uppercase tracking-widest border ${
                      activeFilter === status
                        ? "border-gray-900 text-gray-900 bg-white"
                        : "border-transparent text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {status === "ongoing" ? "🔥 Live" : "📅 Upcoming"}
                  </button>
                ))}
              </div>

              <div className="w-px h-6 bg-gray-200/60 mx-1 shrink-0" />

              <div className="flex gap-2">
                {HOTSPOT_CATEGORIES.map((cat) => {
                  const isActive = activeHotspotCat === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setActiveHotspotCat(cat.id);
                        setShowHotspots(true);
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border shrink-0 ${
                        isActive
                          ? "bg-white text-gray-900 border-gray-900 shadow-md"
                          : "bg-white/80 backdrop-blur-md text-gray-400 border-gray-100 hover:border-gray-300 shadow-sm"
                      }`}
                    >
                      <span
                        className={isActive ? "text-gray-900" : "text-gray-300"}
                      >
                        {cat.icon}
                      </span>
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <RealMap
          ref={mapRef}
          onSelect={setSelected}
          onSelectHotspot={setSelectedHotspot}
          filteredEvents={filteredEvents}
          showHotspots={showHotspots}
          hotspotCategory={activeHotspotCat}
        />

        <div className="absolute bottom-36 right-4 z-[40] md:bottom-10 md:right-10 flex flex-col gap-2.5">
          <button
            onClick={() => setShowGuide(true)}
            className="w-10 h-10 bg-white/95 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center text-gray-400 border border-gray-100 active:scale-90"
          >
            <Info size={18} />
          </button>
          <button
            onClick={() => setShowHotspots(!showHotspots)}
            className={`w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all border active:scale-90 ${showHotspots ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-400 border-gray-100"}`}
          >
            <Flame size={18} fill={showHotspots ? "currentColor" : "none"} />
          </button>
          <button
            onClick={handleLocateUser}
            className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-black border border-gray-100 active:scale-90"
          >
            <LocateFixed size={18} />
          </button>
        </div>

        <AnimatePresence>
          {selectedHotspot && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-0 left-0 md:bottom-auto md:top-[10vh] md:left-1/2 md:-translate-x-1/2 w-full md:max-w-2xl bg-white rounded-t-[40px] md:rounded-[40px] shadow-2xl z-[100] overflow-hidden flex flex-col max-h-[92vh] md:max-h-[85vh]"
            >
              <div className="bg-white rounded-[32px] shadow-2xl border border-gray-100 overflow-hidden relative">
                <div className="relative h-44 w-full">
                  <Image
                    src={selectedHotspot.image}
                    alt="Hotspot"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 right-4 z-[120]">
                    <button
                      onClick={() => setSelectedHotspot(null)}
                      className="w-8 h-8 bg-white shadow-lg rounded-full flex items-center justify-center"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-black text-gray-900 tracking-tighter mb-2">
                    {selectedHotspot.title || selectedHotspot.name}
                  </h3>
                  <p className="text-gray-500 text-xs mb-6 leading-relaxed">
                    {selectedHotspot.description ||
                      "An active hub in the city."}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="py-3 bg-gray-50 text-gray-900 font-black rounded-2xl text-[10px] uppercase border border-gray-100 flex items-center justify-center gap-2">
                      <Navigation size={12} /> Directions
                    </button>
                    <button className="py-3 bg-black text-white font-black rounded-2xl text-[10px] uppercase tracking-widest">
                      Explore
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {selected && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelected(null)}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90]"
              />

              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed bottom-0 left-0 md:inset-0 md:m-auto w-full md:max-w-2xl md:h-fit bg-white rounded-t-[40px] md:rounded-[40px] shadow-2xl z-[600] overflow-hidden flex flex-col max-h-[92vh] md:max-h-[85vh]"
              >
                {/* Handle Bar - Fixed at top of modal */}
                <div className="absolute top-0 left-0 w-full h-12 flex items-center justify-center z-[120] pointer-events-none">
                  <div className="w-12 h-1.5 bg-gray-200/80 backdrop-blur-md rounded-full" />
                </div>

                {/* 
          SCROLLABLE CONTENT AREA 
          - pb-32 ensures content isn't hidden behind the floating footer 
        */}
                <div className="overflow-y-auto pb-32 z-[100]">
                  {/* HERO IMAGE */}
                  <div className="relative w-full h-64 sm:h-80">
                    <Image
                      src={selected.image}
                      alt={selected.title}
                      fill
                      priority
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                    {/* CLOSE BUTTON */}
                    <button
                      onClick={() => setSelected(null)}
                      className="absolute top-6 right-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 active:scale-90 transition-all shadow-lg z-[130]"
                    >
                      <X size={20} />
                    </button>

                    {/* INTEGRATED COUNTDOWN UI */}
                    {timeLeft && timeLeft.label !== "Ended" && (
                      <div className="absolute top-6 left-6 flex justify-start z-[130]">
                        <div className="bg-black/40 backdrop-blur-xl border border-white/20 px-5 py-3 rounded-[24px] flex flex-col shadow-2xl">
                          {/* BRAND YELLOW TEXT */}
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-400 leading-none mb-2">
                            {timeLeft.label}
                          </p>
                          <div className="flex items-center gap-3 text-white tabular-nums">
                            {timeLeft.d > 0 && (
                              <div className="flex items-baseline gap-0.5">
                                <span className="text-lg font-black">
                                  {timeLeft.d}
                                </span>
                                <span className="text-[9px] font-black opacity-60 uppercase">
                                  Days
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <div className="flex items-baseline gap-0.5">
                                <span className="text-lg font-black">
                                  {timeLeft.h}
                                </span>
                                <span className="text-[9px] font-black opacity-60 uppercase">
                                  Hrs
                                </span>
                              </div>
                              <span className="text-xs font-black opacity-30">
                                :
                              </span>
                              <div className="flex items-baseline gap-0.5">
                                <span className="text-lg font-black">
                                  {timeLeft.m}
                                </span>
                                <span className="text-[9px] font-black opacity-60 uppercase">
                                  Min
                                </span>
                              </div>
                              <span className="text-xs font-black opacity-30">
                                :
                              </span>
                              <div className="flex items-baseline gap-0.5">
                                <span className="text-lg font-black">
                                  {timeLeft.s}
                                </span>
                                <span className="text-[9px] font-black opacity-60 uppercase">
                                  Sec
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-6 md:p-8 -mt-10 relative z-10">
                    {/* TITLE BLOCK */}
                    <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-black/5 border border-gray-50 mb-8">
                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className={`flex items-center gap-1.5 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${selected.timeStatus === "ongoing" ? "bg-green-100 text-green-600" : "bg-amber-50 text-amber-600"}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${selected.timeStatus === "ongoing" ? "bg-green-500 animate-pulse" : "bg-amber-400"}`}
                          />
                          {selected.timeStatus}
                        </span>
                        <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-3 py-1 rounded-full uppercase tracking-widest">
                          👥 {selected.attendees || 0} Joined
                        </span>
                      </div>
                      <h2 className="text-3xl font-black text-gray-900 tracking-tighter leading-tight">
                        {selected.title}
                      </h2>
                    </div>

                    {/* DATE & TIME GRID */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                      <div className="flex items-center gap-4 bg-gray-50/50 p-5 rounded-[28px] border border-gray-100">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-900 shadow-sm border border-gray-100">
                          <Calendar size={22} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">
                            Schedule Date
                          </p>
                          <p className="text-base font-bold text-gray-900">
                            {new Date(selected.startDate).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                              },
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 bg-gray-50/50 p-5 rounded-[28px] border border-gray-100">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-900 shadow-sm border border-gray-100">
                          <Clock size={22} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">
                            Start Time
                          </p>
                          <p className="text-base font-bold text-gray-900">
                            {new Date(selected.startDate).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              },
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* ORGANIZER & VIBE */}
                    <div className="flex flex-col md:flex-row gap-4 mb-8">
                      <div className="flex-1 flex items-center justify-between p-4 bg-gray-900 rounded-[32px] text-white">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 rounded-full overflow-hidden border border-white/20">
                            <Image
                              src={selected.organizerImage}
                              alt="Org"
                              fill
                              className="object-cover"
                            />
                          </div>
                          <span className="text-xs font-bold">
                            {selected.organizerName}
                          </span>
                        </div>
                        <button
                          onClick={() => toggleFollow(selected.organizerName)}
                          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                          {followedUsers.has(selected.organizerName)
                            ? "Following"
                            : "Follow"}
                        </button>
                      </div>

                      {/* BRAND YELLOW THEME FOR VIBE */}
                      <div className="flex items-center gap-4 p-4 px-6 bg-amber-50 rounded-[32px] border border-amber-100">
                        <Sparkles size={18} className="text-amber-600" />
                        <div>
                          <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest leading-none mb-1">
                            Vibe
                          </p>
                          <p className="text-sm font-black text-amber-900 capitalize">
                            {selected.category}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* LOCATION & PRICE */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-5 rounded-[28px] bg-gray-50 border border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin size={14} className="text-gray-400" />
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                            Venue
                          </span>
                        </div>
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {selected.isOnline
                            ? "Worldwide"
                            : selected.location?.neighborhood ||
                              "Port Harcourt"}
                        </p>
                      </div>
                      <div className="p-5 rounded-[28px] bg-gray-50 border border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Ticket size={14} className="text-gray-400" />
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                            Entry
                          </span>
                        </div>
                        <p
                          className={`text-sm font-black ${selected.isFree ? "text-green-600" : "text-gray-900"}`}
                        >
                          {displayPrice}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 
          FLOATING ACTION BAR 
        */}
                <div className="absolute bottom-0 left-0 w-full p-6 bg-white/90 backdrop-blur-xl border-t border-gray-100 flex gap-4 items-center shadow-[0_-10px_40px_rgba(0,0,0,0.08)] z-[110]">
                  <button
                    onClick={(e) => toggleLike(e, selected._id)}
                    className="w-16 h-16 rounded-3xl border border-gray-200 flex items-center justify-center active:scale-90 transition-all bg-white"
                  >
                    <Heart
                      size={24}
                      className={
                        likedEvents.has(selected._id)
                          ? "fill-red-500 text-red-500"
                          : "text-gray-300"
                      }
                    />
                  </button>
                  <button
                    onClick={() => router.push(`/discover/${selected.id}`)}
                    className="flex-1 h-16 bg-black text-white font-black rounded-3xl shadow-xl active:scale-95 transition-all uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3"
                  >
                    Go to Event Page <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
      <MobileNav />
    </div>
  );
}
