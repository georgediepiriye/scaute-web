/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRef, useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2,
  Search,
  User as UserIcon,
  LogOut,
  Compass,
  PlusCircle,
  MessageSquare,
  Info,
  Phone,
  ChevronRight,
  Sparkles,
  Utensils,
  Music,
  Coffee,
  Palette,
  ShoppingBag,
  X,
  LogIn,
} from "lucide-react";

import { useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import Link from "next/link";

import Navbar from "@/components/layout/NavBar";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import MapGuide from "@/components/onboarding/MapGuide";
import { useAuth } from "@/components/auth/AuthGuard";

import MapFilters from "@/components/map/MapFilters";
import MapControls from "@/components/map/MapControls";
import HotspotModal from "@/components/map/HotspotModal";
import EventDetailsModal from "@/components/map/EventDetailsModal";
import MobileNav from "@/components/layout/MobileNav";

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

  const { user: profile, loading: authLoading, logout } = useAuth();

  const [selected, setSelected] = useState<any>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<any>(null);

  const [activeFilter, setActiveFilter] = useState<FilterType>("ongoing");

  const [activeHotspotCat, setActiveHotspotCat] = useState("all");

  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showHotspots, setShowHotspots] = useState(true);

  const [likedEvents, setLikedEvents] = useState<Set<string>>(new Set());

  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());

  const [timeLeft, setTimeLeft] = useState<any>(null);

  const [isSigningOut, setIsSigningOut] = useState(false);

  const [showGuide, setShowGuide] = useState(() => {
    if (typeof window !== "undefined") {
      return !localStorage.getItem("skaute_map_guided");
    }

    return false;
  });

  useEffect(() => {
    if (!selected) {
      setTimeLeft(null);
      return;
    }

    const calculateTime = () => {
      const now = new Date().getTime();

      const start = new Date(selected.startDate).getTime();

      const end = new Date(selected.endDate).getTime();

      let target;
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

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);

      const token = localStorage.getItem("skaute_token");

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && {
            Authorization: `Bearer ${token}`,
          }),
        },
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      localStorage.removeItem("skaute_token");
      localStorage.removeItem("user");

      document.cookie =
        "skaute_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax;";

      setMenuOpen(false);

      logout();

      window.location.href = "/auth/signin";
    }
  };

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events"],

    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/events?limit=100`,
      );

      if (!response.ok) {
        throw new Error("Network error");
      }

      const result = await response.json();

      if (result.status !== "success") {
        throw new Error("Fetch failed");
      }

      return result.data.events.map((e: any) => ({
        ...e,
        id: e._id,
        lat: e.location?.coordinates[1],
        lng: e.location?.coordinates[0],

        isOnline: e.medium === "online" || e.isOnline === true,

        organizerName: e.organizer?.name || "skaute Host",

        organizerImage:
          e.organizer?.image ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${e._id}`,
      }));
    },

    staleTime: 1000 * 60 * 5,
  });

  const filteredEvents = useMemo(() => {
    const now = new Date().getTime();

    const query = search.toLowerCase();

    return events
      .map((event: any) => {
        const start = new Date(event.startDate).getTime();

        const end = new Date(event.endDate).getTime();

        return {
          ...event,

          timeStatus:
            now < start ? "upcoming" : now <= end ? "ongoing" : "past",
        };
      })

      .filter((event: any) => {
        if (event.timeStatus === "past" || event.isCancelled) {
          return false;
        }

        return (
          (!search || event.title.toLowerCase().includes(query)) &&
          event.timeStatus === activeFilter
        );
      });
  }, [events, search, activeFilter]);

  const displayPrice = useMemo(() => {
    if (!selected) return "";

    const isSoldOut = selected.isSoldOut === true;

    const ticketingType = selected.ticketingType || "internal";

    let ticketTiers = selected.ticketTiers;

    if (typeof ticketTiers === "string") {
      try {
        ticketTiers = JSON.parse(ticketTiers);
      } catch (e) {
        ticketTiers = [];
      }
    }

    if (!Array.isArray(ticketTiers)) {
      ticketTiers = [];
    }

    let urgencyStatus: "sold-out" | "almost-sold-out" | null = null;

    if (isSoldOut) {
      urgencyStatus = "sold-out";
    } else if (ticketTiers.length > 0 && ticketingType === "internal") {
      const totalCapacity = ticketTiers.reduce(
        (acc: number, tier: any) => acc + (tier.capacity || 0),
        0,
      );

      const totalSold = ticketTiers.reduce(
        (acc: number, tier: any) => acc + (tier.sold || 0),
        0,
      );

      if (totalCapacity > 0) {
        if (totalSold >= totalCapacity) {
          urgencyStatus = "sold-out";
        } else if (((totalCapacity - totalSold) / totalCapacity) * 100 <= 15) {
          urgencyStatus = "almost-sold-out";
        }
      }
    }

    if (urgencyStatus === "sold-out") {
      return "Sold Out";
    }

    if (ticketingType === "external") {
      return "Paid";
    }

    if (ticketTiers.length === 0) {
      return "Free";
    }

    const prices = ticketTiers.map((tier: any) => tier.price || 0);

    const minPrice = Math.min(...prices);

    return minPrice === 0
      ? Math.max(...prices) > 0
        ? "Free +"
        : "Free"
      : `₦${minPrice.toLocaleString()}${ticketTiers.length > 1 ? "+" : ""}`;
  }, [selected]);

  const toggleLike = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();

    setLikedEvents((prev) => {
      const newSet = new Set(prev);

      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }

      return newSet;
    });
  }, []);

  const toggleFollow = useCallback((userName: string) => {
    setFollowedUsers((prev) => {
      const newSet = new Set(prev);

      if (newSet.has(userName)) {
        newSet.delete(userName);
      } else {
        newSet.add(userName);
      }

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

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white font-sans text-gray-900 antialiased">
      {!authLoading && !profile && !isSigningOut && <OnboardingFlow />}

      <AnimatePresence>
        {showGuide && (
          <MapGuide
            onClose={() => {
              localStorage.setItem("skaute_map_guided", "true");

              setShowGuide(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* MOBILE SIDEBAR */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-[150] md:hidden"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                type: "spring",
                damping: 26,
                stiffness: 240,
              }}
              className="fixed right-0 top-0 h-full w-[320px] bg-[#050816] border-l border-white/10 z-[160] md:hidden shadow-2xl flex flex-col p-6"
            >
              {/* TOP */}
              <div className="flex items-center justify-between mb-8">
                <Link
                  href="/"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center"
                >
                  <div className="relative w-28 h-28">
                    <Image
                      src="/images/skaute_logo.webp"
                      alt="skaute"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                </Link>

                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {/* PROFILE */}
              {profile && (
                <div className="mb-8 p-4 rounded-[30px] bg-white/[0.03] border border-white/10 flex items-center gap-4">
                  <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-white/10">
                    {profile?.image ? (
                      <Image
                        src={profile.image}
                        alt="User"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white">
                        <UserIcon size={20} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm truncate text-white">
                      {profile?.name || "skaute User"}
                    </p>

                    <button
                      onClick={() => {
                        router.push("/profile");
                        setMenuOpen(false);
                      }}
                      className="text-[10px] font-black text-blue-400 uppercase tracking-widest"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              )}

              {/* NAV ITEMS */}
              <div className="flex-1 overflow-y-auto">
                <div className="space-y-2">
                  {[
                    {
                      href: "/discover",
                      label: "Discover",
                      icon: <Compass size={18} />,
                    },

                    {
                      href: "/create",
                      label: "Add Event",
                      icon: <PlusCircle size={18} />,
                    },

                    {
                      href: "/chat",
                      label: "Help",
                      icon: <MessageSquare size={18} />,
                    },

                    {
                      href: "/about",
                      label: "About",
                      icon: <Info size={18} />,
                    },

                    {
                      href: "/contact",
                      label: "Contact Us",
                      icon: <Phone size={18} />,
                    },
                  ].map((item) => (
                    <button
                      key={item.href}
                      onClick={() => {
                        router.push(item.href);
                        setMenuOpen(false);
                      }}
                      className="group flex items-center justify-between w-full p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-transparent hover:border-white/10 transition-all duration-200"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-blue-400">{item.icon}</span>

                        <span className="text-xs font-black uppercase tracking-[0.2em] text-white">
                          {item.label}
                        </span>
                      </div>

                      <ChevronRight
                        size={14}
                        className="text-white/40 group-hover:text-white"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* FOOTER BUTTON */}
              {profile ? (
                <button
                  onClick={handleSignOut}
                  className="mt-6 w-full py-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-red-500/20 transition-all"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              ) : (
                <button
                  onClick={() => {
                    router.push("/auth/signin");
                    setMenuOpen(false);
                  }}
                  className="mt-6 w-full py-5 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3"
                >
                  <LogIn size={18} />
                  Sign In
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* LOADER */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.4,
              ease: "easeInOut",
            }}
            className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center select-none"
          >
            <div className="flex flex-col items-center justify-center">
              <motion.div
                initial={{
                  scale: 0.92,
                  opacity: 0,
                }}
                animate={{
                  scale: [0.95, 1.04, 0.95],
                  opacity: 1,
                }}
                transition={{
                  scale: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                  opacity: { duration: 0.3 },
                }}
                className="relative w-44 h-44 md:w-56 md:h-56 mb-2"
              >
                <Image
                  src="/images/skaute_logo.webp"
                  alt="Skaute Loading Icon"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 176px, 224px"
                  priority
                />
              </motion.div>
            </div>

            <div className="absolute bottom-16 w-32 h-[2px] bg-white/10 overflow-hidden rounded-full">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                  repeat: Infinity,
                  duration: 1.4,
                  ease: "easeInOut",
                }}
                className="w-1/2 h-full bg-blue-500 rounded-full"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="hidden md:block">
        <Navbar />
      </div>

      {/* MAIN */}
      <div className="flex-1 relative">
        {/* MOBILE TOP BAR */}
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
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-gray-100 font-bold text-gray-900 placeholder:text-sm"
            />
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-11 h-11 rounded-2xl bg-black text-white shadow-sm font-black"
          >
            ☰
          </button>
        </div>

        <MapFilters
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          activeHotspotCat={activeHotspotCat}
          setActiveHotspotCat={setActiveHotspotCat}
          setShowHotspots={setShowHotspots}
          categories={HOTSPOT_CATEGORIES}
        />

        <RealMap
          ref={mapRef}
          onSelect={setSelected}
          onSelectHotspot={setSelectedHotspot}
          filteredEvents={filteredEvents}
          showHotspots={showHotspots}
          hotspotCategory={activeHotspotCat}
        />

        <MapControls
          showHotspots={showHotspots}
          setShowHotspots={setShowHotspots}
          setShowGuide={setShowGuide}
          handleLocateUser={handleLocateUser}
        />

        <AnimatePresence>
          {selectedHotspot && (
            <HotspotModal
              hotspot={selectedHotspot}
              onClose={() => setSelectedHotspot(null)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selected && (
            <EventDetailsModal
              selected={selected}
              onClose={() => setSelected(null)}
              timeLeft={timeLeft}
              followedUsers={followedUsers}
              toggleFollow={toggleFollow}
              likedEvents={likedEvents}
              toggleLike={toggleLike}
              displayPrice={displayPrice}
            />
          )}
        </AnimatePresence>
      </div>

      <MobileNav />
    </div>
  );
}
