/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast"; // 1. Standardized imports here
import {
  MapPin,
  ShieldCheck,
  Plus,
  LogOut,
  Share2,
  Trophy,
  TrendingUp,
  Ticket as TicketIcon,
  LayoutGrid,
  ChevronRight,
  ArrowUpRight,
  Calendar,
  Camera,
  SearchCheck,
  Crown,
  Users2,
  Lock,
} from "lucide-react";
import Navbar from "@/components/layout/NavBar";
import { useAuth } from "@/components/auth/AuthGuard";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";

const SKAUTE_BLUE = "#0052FF";
const SKAUTE_YELLOW = "#FFD700";

export default function ProfilePage() {
  const router = useRouter();

  // Hook directly into the master Auth Provider to utilize its global credentials
  const {
    user: authUser,
    loading: authLoading,
    logout,
    updateUser,
  } = useAuth();

  // Unified dynamic dataset state (combining user data + relational data)
  const [extendedProfile, setExtendedProfile] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Intercept state for missing user attributes
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync profile collections only after the Auth Guard certifies the session is ready
  useEffect(() => {
    if (authLoading) return;

    if (!authUser) {
      // If the global provider confirms no user exists, route to gateway
      if (!isSigningOut) {
        window.location.href = "/auth/signin";
      }
      return;
    }

    const syncCompletePortfolio = async () => {
      try {
        const token = localStorage.getItem("skaute_token");

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/users/profile`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          },
        );

        let activeProfileData = authUser;

        if (response.ok) {
          const result = await response.json();
          if (result.status === "success" && result.data) {
            activeProfileData = result.data;
          }
        }

        setExtendedProfile(activeProfileData);

        // 💡 Trigger Onboarding layout check if user role is standard and interests are unpopulated
        if (
          activeProfileData.role === "user" &&
          (!activeProfileData.interests ||
            activeProfileData.interests.length === 0)
        ) {
          setShowOnboarding(true);
        } else {
          setShowOnboarding(false);
        }
      } catch (error) {
        console.error("Failed to compile extended profile portfolios:", error);
        setExtendedProfile(authUser);

        // Fallback checks even during service connection issues
        if (
          authUser.role === "user" &&
          (!authUser.interests || authUser.interests.length === 0)
        ) {
          setShowOnboarding(true);
        }
      } finally {
        setDataLoading(false);
      }
    };

    syncCompletePortfolio();
  }, [authUser, authLoading, isSigningOut]);
  const handleOnboardingComplete = async (updatedData?: any) => {
    // 1. Guard safely against missing payload contexts
    const actualPayload =
      updatedData?.data || updatedData?.user || updatedData || {};

    const combinedProfile = {
      ...extendedProfile,
      ...actualPayload,
      // If onboarding didn't pass anything, it will smoothly retain the existing interests
      interests: actualPayload?.interests || extendedProfile?.interests || [],
    };

    setExtendedProfile(combinedProfile);

    // 2. Commit updates up to the global localStorage session caches
    if (typeof updateUser === "function") {
      updateUser(combinedProfile, false);
    }

    // 3. Dismount the wizard layout blocking element
    setShowOnboarding(false);

    // 4. Extract target parameters for notification display
    const firstName = combinedProfile?.name?.split(" ")[0] || "skaute";

    setTimeout(() => {
      toast.success(
        `Welcome to Skaute, ${firstName}! Your vibe is officially locked in.`,
        {
          icon: "⚡",
        },
      );
    }, 80);
  };

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      const token = localStorage.getItem("skaute_token");

      if (token) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (err) {
      console.error("Logout backend notification skipped:", err);
    } finally {
      // Clean up storage tokens
      localStorage.removeItem("skaute_token");
      localStorage.removeItem("user");

      // Wipe routing layout proxy cookies immediately
      document.cookie =
        "skaute_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax;";

      logout();
      window.location.href = "/auth/signin";
    }
  };

  // Comprehensive Guard: Prevents UI flickering or endless spinner deadlocks
  const currentLoadingState =
    !isMounted || authLoading || (dataLoading && !isSigningOut);

  if (currentLoadingState) {
    return (
      <div className="fixed inset-0 z-[200] bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-gray-100 rounded-3xl" />
            <div
              className="absolute inset-0 border-4 border-t-transparent rounded-3xl animate-spin"
              style={{ borderTopColor: SKAUTE_BLUE }}
            />
          </div>
          <p
            className="font-black text-[10px] uppercase tracking-[0.3em] animate-pulse"
            style={{ color: SKAUTE_BLUE }}
          >
            Synchronizing Portfolios
          </p>
        </div>
      </div>
    );
  }

  if (!extendedProfile) return null;

  // Calculate distinct event metrics using populated dataset arrays
  const mainHostedCount =
    extendedProfile.organizedEvents?.filter((event: any) => {
      const organizerId = event.organizer?._id || event.organizer;
      return organizerId === extendedProfile._id;
    }).length || 0;

  const partnerManagedCount =
    (extendedProfile.organizedEvents?.length || 0) - mainHostedCount;

  const userDisplay = {
    name: extendedProfile?.name || "skaute User",
    handle: `@${extendedProfile?.name?.toLowerCase().replace(/\s/g, "") || "skaute_member"}`,
    location: extendedProfile?.location?.city || "Port Harcourt",
    image: extendedProfile?.image || "/images/profile.jpg",
    joined: extendedProfile?.createdAt
      ? new Date(extendedProfile.createdAt).toLocaleDateString("en-GB", {
          month: "short",
          year: "numeric",
        })
      : "Joined recently",
    interests:
      extendedProfile?.interests?.length > 0
        ? extendedProfile.interests.slice(0, 5)
        : [],
    ticketsCount: extendedProfile?.tickets?.length || 0,
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans selection:bg-blue-100 relative">
      {/* 2. Embedded Toaster context wrapper layer to capture triggers local to this window context */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={12}
        containerStyle={{
          top: 96,
          right: 20,
        }}
        toastOptions={{
          duration: 5000,

          style: {
            background: "rgba(15, 23, 42, 0.92)",
            color: "#ffffff",
            borderRadius: "22px",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
            padding: "16px 18px",
            fontSize: "12px",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            maxWidth: "420px",
          },

          success: {
            iconTheme: {
              primary: "#0052FF",
              secondary: "#ffffff",
            },

            style: {
              background: "rgba(2, 6, 23, 0.92)",
              color: "#ffffff",
              border: "1px solid rgba(0, 82, 255, 0.18)",
            },
          },

          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#ffffff",
            },

            style: {
              background: "rgba(28, 10, 10, 0.95)",
              color: "#ffffff",
              border: "1px solid rgba(239,68,68,0.18)",
            },
          },
        }}
      />

      <Navbar />

      {/* FULL-SCREEN ONBOARDING WIZARD INTERCEPT OVERLAY */}
      <AnimatePresence>
        {showOnboarding && (
          <OnboardingWizard
            user={extendedProfile}
            onComplete={() => handleOnboardingComplete()} // Call it anonymously with no arguments
          />
        )}
      </AnimatePresence>

      {/* Apply accessibility blocking states if onboarding is dynamically active */}
      <main
        className={`max-w-6xl mx-auto px-4 md:px-8 pt-32 pb-24 transition-all duration-300 ${
          showOnboarding
            ? "pointer-events-none select-none blur-md scale-[0.99]"
            : ""
        }`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* --- LEFT SIDEBAR: IDENTITY --- */}
          <aside className="lg:col-span-4">
            <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-8 shadow-sm sticky top-32 text-center">
              <div className="relative group w-32 h-32 mx-auto">
                <div
                  className="absolute -inset-1 rounded-[2.2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"
                  style={{ backgroundColor: SKAUTE_BLUE }}
                />
                <div className="relative w-32 h-32 rounded-[2rem] overflow-hidden border-4 border-white shadow-xl bg-slate-50">
                  <Image
                    src={userDisplay.image}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  className="absolute bottom-1 right-1 p-2 bg-white rounded-full shadow-lg border border-slate-100 transition hover:scale-110"
                  style={{ color: SKAUTE_BLUE }}
                >
                  <Plus size={14} />
                </button>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-center gap-1.5">
                  <h2 className="text-xl font-black uppercase tracking-tight italic">
                    {userDisplay.name}
                  </h2>
                  <ShieldCheck
                    size={16}
                    style={{ color: SKAUTE_BLUE }}
                    fill="currentColor"
                    fillOpacity={0.1}
                  />
                </div>
                <p
                  className="font-bold text-sm mt-1"
                  style={{ color: SKAUTE_BLUE }}
                >
                  {userDisplay.handle}
                </p>
                <div className="inline-flex items-center gap-1.5 mt-4 px-3 py-1 bg-slate-50 rounded-full text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                  <MapPin size={10} style={{ color: SKAUTE_BLUE }} />{" "}
                  {userDisplay.location}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1.5 mt-8">
                <div className="bg-slate-50/50 rounded-2xl p-3 border border-slate-100">
                  <p className="text-lg font-black">
                    {userDisplay.ticketsCount}
                  </p>
                  <p className="text-[8px] text-slate-400 font-black uppercase tracking-wider">
                    Passes
                  </p>
                </div>
                <div className="bg-slate-50/50 rounded-2xl p-3 border border-slate-100">
                  <p className="text-lg font-black text-blue-600">
                    {mainHostedCount}
                  </p>
                  <p className="text-[8px] text-slate-400 font-black uppercase tracking-wider">
                    Hosted
                  </p>
                </div>
                <div className="bg-slate-50/50 rounded-2xl p-3 border border-slate-100">
                  <p className="text-lg font-black text-slate-800">
                    {partnerManagedCount}
                  </p>
                  <p className="text-[8px] text-slate-400 font-black uppercase tracking-wider">
                    Partner
                  </p>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <button
                  className="w-full py-4 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg"
                  style={{
                    backgroundColor: SKAUTE_BLUE,
                    boxShadow: `0 10px 15px -3px ${SKAUTE_BLUE}30`,
                  }}
                >
                  Edit Profile
                </button>
                <button className="w-full py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition">
                  <Share2 size={14} className="inline mr-2" /> Share
                </button>
              </div>
            </div>
          </aside>

          {/* --- RIGHT CONTENT: ACTIVITY --- */}
          <section className="lg:col-span-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-950 rounded-[2rem] p-8 text-white relative overflow-hidden flex flex-col justify-between min-h-[160px]">
                <div className="relative z-10">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    Member Status
                  </span>
                  <h3 className="text-2xl font-black mt-1 uppercase italic">
                    skaute Pioneer
                  </h3>
                </div>
                <div className="relative z-10">
                  <p className="text-slate-400 text-[11px] font-medium">
                    Joined {userDisplay.joined}
                  </p>
                  <div className="mt-3 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full w-2/3"
                      style={{ backgroundColor: SKAUTE_YELLOW }}
                    />
                  </div>
                </div>
                <Trophy className="absolute -bottom-4 -right-4 text-white/5 w-32 h-32" />
              </div>

              <div className="bg-white rounded-[2rem] p-8 border border-slate-200/60 shadow-sm">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                  <TrendingUp size={14} style={{ color: SKAUTE_BLUE }} /> My
                  Vibe
                </h3>
                <div className="flex flex-wrap gap-2">
                  {userDisplay.interests.length > 0 ? (
                    userDisplay.interests.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 bg-slate-50 text-slate-800 border border-slate-100 rounded-xl text-[10px] font-black uppercase"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 font-medium italic">
                      Setting up preferences...
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* --- ACTIVE PASSES TICKETS --- */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                  <TicketIcon size={16} style={{ color: SKAUTE_BLUE }} /> Active
                  Passes
                </h3>
                {userDisplay.ticketsCount > 0 && (
                  <button
                    onClick={() => router.push("/tickets")}
                    className="text-[10px] font-black uppercase hover:underline flex items-center gap-1"
                    style={{ color: SKAUTE_BLUE }}
                  >
                    See All <ArrowUpRight size={12} />
                  </button>
                )}
              </div>
              <div className="px-4 pb-4">
                {extendedProfile?.tickets?.length > 0 ? (
                  <div className="divide-y divide-slate-50">
                    {extendedProfile.tickets.slice(0, 3).map((ticket: any) => (
                      <div
                        key={ticket._id}
                        onClick={() => router.push(`/tickets/${ticket._id}`)}
                        className="p-4 flex items-center justify-between group cursor-pointer hover:bg-slate-50/50 rounded-2xl transition-colors"
                      >
                        <div className="min-w-0">
                          <h4 className="font-black text-sm truncate uppercase tracking-tight group-hover:text-blue-600">
                            {ticket.event?.title || "Exclusive Move"}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                              {ticket.tierName}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span
                              className="text-[10px] font-mono font-bold uppercase"
                              style={{ color: SKAUTE_BLUE }}
                            >
                              {ticket.checkInCode || "skaute-PASS"}
                            </span>
                          </div>
                        </div>
                        <ChevronRight
                          size={18}
                          className="text-slate-200 group-hover:text-blue-600 group-hover:translate-x-1 transition-all"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400 uppercase tracking-widest font-black text-[10px]">
                    No active passes
                  </div>
                )}
              </div>
            </div>

            {/* --- MOVES WORKSPACE --- */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                  <LayoutGrid size={16} style={{ color: SKAUTE_BLUE }} /> Hosted
                  & Managed Moves
                </h3>
                <button
                  onClick={() => router.push("/create")}
                  className="p-2 bg-slate-50 rounded-xl transition-all hover:bg-blue-600 hover:text-white"
                  style={{ color: SKAUTE_BLUE }}
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="px-2 pb-4">
                {extendedProfile?.organizedEvents?.length > 0 ? (
                  <div className="space-y-1">
                    {extendedProfile.organizedEvents.map((event: any) => {
                      const isMainOrganizer =
                        event.organizer === extendedProfile._id ||
                        event.organizer?._id === extendedProfile._id;

                      const partnerRecord = event.coOrganizers?.find(
                        (coOrg: any) => {
                          const coOrgId =
                            coOrg.user?._id || coOrg.user?.id || coOrg.user;
                          return coOrgId === extendedProfile._id;
                        },
                      );

                      const partnerPermissions =
                        partnerRecord?.permissions || [];
                      const finalPermissions =
                        partnerRecord && partnerPermissions.length === 0
                          ? ["scan_tickets"]
                          : partnerPermissions;

                      const canScanTickets =
                        isMainOrganizer ||
                        finalPermissions.includes("scan_tickets");

                      const getTimelineStatus = () => {
                        const now = new Date();
                        const start = new Date(event.startDate);
                        const end = new Date(event.endDate || event.startDate);

                        if (now < start) {
                          return {
                            label: "Upcoming",
                            styles: "bg-blue-50 text-blue-600 border-blue-100",
                          };
                        } else if (now >= start && now <= end) {
                          return {
                            label: "Live",
                            styles:
                              "bg-red-50 text-red-600 border-red-200 animate-pulse font-black",
                          };
                        } else {
                          return {
                            label: "Past",
                            styles:
                              "bg-slate-100 text-slate-400 border-slate-200 line-through decoration-transparent",
                          };
                        }
                      };

                      const timeline = getTimelineStatus();

                      return (
                        <div
                          key={event._id}
                          onClick={() =>
                            router.push(`/manage/events/${event._id}`)
                          }
                          className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between group hover:bg-slate-50/50 rounded-[1.8rem] transition-all border border-transparent hover:border-slate-100 cursor-pointer"
                        >
                          <div className="flex items-center gap-4 min-w-0 w-full sm:w-auto">
                            <div className="relative w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-100 shadow-sm">
                              {event.image ? (
                                <Image
                                  src={event.image}
                                  alt={event.title}
                                  fill
                                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                  <Calendar size={20} />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-black text-sm truncate uppercase tracking-tight text-slate-800">
                                {event.title}
                              </h4>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                {isMainOrganizer ? (
                                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-600 text-white font-black text-[8px] uppercase tracking-wider">
                                    <Crown
                                      size={8}
                                      className="text-yellow-300 fill-yellow-300"
                                    />
                                    <span>Host</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 text-white font-black text-[8px] uppercase tracking-wider">
                                    <Users2
                                      size={8}
                                      className="text-yellow-400"
                                    />
                                    <span>Partner</span>
                                  </div>
                                )}

                                <span className="text-slate-300">•</span>

                                <div
                                  className={`flex items-center gap-1 px-2 py-0.5 rounded-md border ${
                                    event.approvalStatus === "approved"
                                      ? "bg-green-50 text-green-600 border-green-100"
                                      : "bg-amber-50 text-amber-600 border-amber-100"
                                  }`}
                                >
                                  <SearchCheck size={10} />
                                  <span className="text-[9px] font-black uppercase">
                                    {event.approvalStatus || "Pending"}
                                  </span>
                                </div>

                                <span className="text-slate-300">•</span>

                                <span
                                  className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${timeline.styles}`}
                                >
                                  {timeline.label}
                                </span>

                                <span className="text-slate-300 hidden sm:inline">
                                  •
                                </span>

                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  {event.attendees || 0} Sold
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 mt-4 sm:mt-0 w-full sm:w-auto justify-end border-t sm:border-t-0 border-slate-50 pt-3 sm:pt-0">
                            {event.ticketTiers &&
                              event.ticketTiers.length > 0 && (
                                <>
                                  {canScanTickets ? (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(
                                          `/manage/scanner/${event._id}`,
                                        );
                                      }}
                                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-gray-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] hover:bg-blue-600 active:scale-95 transition-all shadow-md"
                                    >
                                      <Camera
                                        size={14}
                                        style={{ color: SKAUTE_YELLOW }}
                                      />
                                      <span>Scan</span>
                                    </button>
                                  ) : (
                                    <div
                                      className="flex items-center gap-1 text-[9px] font-black text-slate-300 uppercase tracking-widest px-3 py-2 border border-slate-100 bg-slate-50 rounded-xl cursor-not-allowed"
                                      title="Scan privileges required for this partner workspace"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Lock size={10} /> Limited
                                    </div>
                                  )}
                                </>
                              )}

                            <div className="flex items-center gap-1">
                              <ChevronRight
                                size={18}
                                className="text-slate-200 group-hover:translate-x-1 transition-transform hidden sm:block"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400 uppercase tracking-widest font-black text-[10px]">
                    No moves hosted yet
                  </div>
                )}
              </div>
            </div>

            {/* --- LOGOUT TRIGGER --- */}
            <div className="flex justify-center pt-8">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 text-slate-300 font-black text-[9px] uppercase tracking-[0.4em] hover:text-red-500 transition-colors group"
              >
                <LogOut
                  size={12}
                  className="group-hover:-translate-x-1 transition-transform"
                />
                Terminate Session
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
