/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import Navbar from "@/components/layout/NavBar";
import MobileNav from "@/components/layout/MobileNav";

// BRAND CONSTANTS
const KIVO_BLUE = "#0052FF";
const KIVO_YELLOW = "#FFD700";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/users/profile`,
          { method: "GET", credentials: "include" },
        );
        const result = await response.json();

        if (response.ok && result.status === "success") {
          setProfile(result.data);
          setLoading(false);
        } else {
          router.replace("/auth/signin");
        }
      } catch (error) {
        console.error("Profile Load Error:", error);
        router.replace("/auth/signin");
      }
    };
    fetchProfile();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      localStorage.clear();
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed");
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[200] bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-gray-100 rounded-3xl" />
            <div
              className="absolute inset-0 border-4 border-t-transparent rounded-3xl animate-spin"
              style={{ borderTopColor: KIVO_BLUE }}
            />
          </div>
          <p
            className="font-black text-[10px] uppercase tracking-[0.3em] animate-pulse"
            style={{ color: KIVO_BLUE }}
          >
            Authenticating Kivo ID
          </p>
        </div>
      </div>
    );
  }

  const userDisplay = {
    name: profile?.name || "Kivo User",
    handle: `@${profile?.name?.toLowerCase().replace(/\s/g, "") || "kivo_member"}`,
    location: profile?.location?.city || "Port Harcourt",
    image: profile?.image || "/images/profile.jpg",
    joined: profile?.createdAt
      ? new Date(profile.createdAt).toLocaleDateString("en-GB", {
          month: "short",
          year: "numeric",
        })
      : "Joined recently",
    interests:
      profile?.interests?.length > 0
        ? profile.interests.slice(0, 5)
        : ["Live Music", "Networking"],
    ticketsCount: profile?.tickets?.length || 0,
    organizedCount: profile?.organizedEvents?.length || 0,
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans selection:bg-blue-100">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 md:px-8 pt-32 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* --- LEFT SIDEBAR: IDENTITY --- */}
          <aside className="lg:col-span-4">
            <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-8 shadow-sm sticky top-32 text-center">
              <div className="relative group w-32 h-32 mx-auto">
                <div
                  className="absolute -inset-1 rounded-[2.2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"
                  style={{ backgroundColor: KIVO_BLUE }}
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
                  style={{ color: KIVO_BLUE }}
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
                    style={{ color: KIVO_BLUE }}
                    fill="currentColor"
                    fillOpacity={0.1}
                  />
                </div>
                <p
                  className="font-bold text-sm mt-1"
                  style={{ color: KIVO_BLUE }}
                >
                  {userDisplay.handle}
                </p>
                <div className="inline-flex items-center gap-1.5 mt-4 px-3 py-1 bg-slate-50 rounded-full text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                  <MapPin size={10} style={{ color: KIVO_BLUE }} />{" "}
                  {userDisplay.location}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-8">
                <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-xl font-black">
                    {userDisplay.ticketsCount}
                  </p>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">
                    Passes
                  </p>
                </div>
                <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-xl font-black">
                    {userDisplay.organizedCount}
                  </p>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">
                    Hosted
                  </p>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <button
                  className="w-full py-4 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg"
                  style={{
                    backgroundColor: KIVO_BLUE,
                    boxShadow: `0 10px 15px -3px ${KIVO_BLUE}30`,
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
                    Kivo Pioneer
                  </h3>
                </div>
                <div className="relative z-10">
                  <p className="text-slate-400 text-[11px] font-medium">
                    Joined {userDisplay.joined}
                  </p>
                  <div className="mt-3 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full w-2/3"
                      style={{ backgroundColor: KIVO_YELLOW }}
                    />
                  </div>
                </div>
                <Trophy className="absolute -bottom-4 -right-4 text-white/5 w-32 h-32" />
              </div>

              <div className="bg-white rounded-[2rem] p-8 border border-slate-200/60 shadow-sm">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                  <TrendingUp size={14} style={{ color: KIVO_BLUE }} /> My Vibe
                </h3>
                <div className="flex flex-wrap gap-2">
                  {userDisplay.interests.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 bg-slate-50 text-slate-800 border border-slate-100 rounded-xl text-[10px] font-black uppercase"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ACTIVE PASSES */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                  <TicketIcon size={16} style={{ color: KIVO_BLUE }} /> Active
                  Passes
                </h3>
                {userDisplay.ticketsCount > 0 && (
                  <button
                    className="text-[10px] font-black uppercase hover:underline flex items-center gap-1"
                    style={{ color: KIVO_BLUE }}
                  >
                    See All <ArrowUpRight size={12} />
                  </button>
                )}
              </div>
              <div className="px-4 pb-4">
                {profile?.tickets?.length > 0 ? (
                  <div className="divide-y divide-slate-50">
                    {profile.tickets.slice(0, 3).map((ticket: any) => (
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
                              style={{ color: KIVO_BLUE }}
                            >
                              {ticket.ticketCode}
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

            {/* HOSTED MOVES */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                  <LayoutGrid size={16} style={{ color: KIVO_BLUE }} /> Hosted
                  Moves
                </h3>
                <button
                  onClick={() => router.push("/create")}
                  className="p-2 bg-slate-50 rounded-xl transition-all hover:bg-blue-600 hover:text-white"
                  style={{ color: KIVO_BLUE }}
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="px-2 pb-4">
                {profile?.organizedEvents?.length > 0 ? (
                  <div className="space-y-1">
                    {profile.organizedEvents.map((event: any) => (
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
                              {/* APPROVAL STATUS BADGE */}
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

                              <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                                {event.status || "Live"}
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
                          {/* ✅ SCAN BUTTON LOGIC */}
                          {event.ticketTiers &&
                            event.ticketTiers.length > 0 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/manage/scanner/${event._id}`);
                                }}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-gray-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] hover:bg-blue-600 active:scale-95 transition-all shadow-md"
                              >
                                <Camera
                                  size={14}
                                  style={{ color: KIVO_YELLOW }}
                                />
                                <span>Scan</span>
                              </button>
                            )}

                          <div className="flex items-center gap-1">
                            <ChevronRight
                              size={18}
                              className="text-slate-200 group-hover:translate-x-1 transition-transform hidden sm:block"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400 uppercase tracking-widest font-black text-[10px]">
                    No moves hosted yet
                  </div>
                )}
              </div>
            </div>

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
      <MobileNav />
    </div>
  );
}
