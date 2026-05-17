/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, Suspense } from "react";
import {
  Users,
  Activity,
  ChevronLeft,
  ChevronRight,
  Loader2,
  BarChart3,
  CalendarDays,
  Wallet,
  ShieldAlert,
  Search,
  Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import Navbar from "@/components/layout/NavBar";
import { ModerationTable } from "@/components/admin/ModerationTable";
import { UserManagementTable } from "@/components/admin/UserManagementTable";
import { PulseAnalytics } from "@/components/admin/PulseAnalytics";

type AdminTab = "events" | "users" | "analytics";
type EventStatus = "pending" | "approved" | "rejected" | "all";

function AdminDashboardContent() {
  const [activeTab, setActiveTab] = useState<AdminTab>("events");
  const [events, setEvents] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pulseData, setPulseData] = useState<any>(null);

  // Detailed Event Stats
  const [eventStats, setEventStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    all: 0,
    totalUsers: 0,
  });

  // Filtering & Search
  const [userSearch, setUserSearch] = useState("");
  const [eventSearch, setEventSearch] = useState("");
  const [eventFilter, setEventFilter] = useState<EventStatus>("pending");

  // Pagination
  const [eventPage, setEventPage] = useState(1);
  const [eventTotalPages, setEventTotalPages] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const limit = 10;

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: eventPage.toString(),
        limit: limit.toString(),
        ...(eventFilter !== "all" && { approvalStatus: eventFilter }),
        ...(eventSearch && { title: eventSearch }),
      });

      const token = localStorage.getItem("kivo_token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/admin/events?${query}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      );
      if (!res.ok) throw new Error("Sync failed");
      const result = await res.json();

      setEvents(result.data?.events || []);
      setEventTotalPages(result.pagination?.totalPages || 1);

      if (result.pagination?.counts) {
        setEventStats((prev) => ({
          ...prev,
          pending: result.pagination.counts.pending,
          approved: result.pagination.counts.approved,
          rejected: result.pagination.counts.rejected,
          all: result.pagination.counts.all,
        }));
      }
    } catch (error) {
      toast.error("Failed to sync Port Harcourt events");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: userPage.toString(),
        limit: limit.toString(),
        ...(userSearch && { name: userSearch }),
      });

      const token = localStorage.getItem("kivo_token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/admin/users?${query}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      );
      if (!res.ok) throw new Error("User sync failed");
      const result = await res.json();

      setUsers(result.data || []);
      setUserTotalPages(Math.ceil((result.total || 0) / limit) || 1);
      setEventStats((prev) => ({ ...prev, totalUsers: result.total || 0 }));
    } catch (error) {
      toast.error("Could not load community leads");
    } finally {
      setLoading(false);
    }
  };

  const fetchPulse = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("kivo_token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/admin/pulse`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      );
      const result = await res.json();
      if (result.status === "success") {
        setPulseData(result.data);
      }
    } catch (error) {
      toast.error("Failed to sync the vibe pulse");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "analytics") {
      fetchPulse();
    }
  }, [activeTab]);

  useEffect(() => {
    fetchEvents();
    fetchUsers();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (activeTab === "events") {
        fetchEvents();
      } else if (activeTab === "users") {
        fetchUsers();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [eventSearch, userSearch, eventFilter, eventPage, userPage, activeTab]);

  return (
    <div className="min-h-screen bg-[#FDFDFD]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 pt-32 pb-20">
        {/* TAB NAVIGATION & SEARCH BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-[20px] w-fit">
            <TabButton
              active={activeTab === "events"}
              onClick={() => setActiveTab("events")}
              icon={<CalendarDays size={14} />}
              label="Events"
            />
            <TabButton
              active={activeTab === "users"}
              onClick={() => setActiveTab("users")}
              icon={<Users size={14} />}
              label="Users"
            />
            <TabButton
              active={activeTab === "analytics"}
              onClick={() => setActiveTab("analytics")}
              icon={<BarChart3 size={14} />}
              label="Pulse"
            />
          </div>

          <div className="relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder={
                activeTab === "events" ? "Find an event..." : "Search users..."
              }
              value={activeTab === "events" ? eventSearch : userSearch}
              onChange={(e) =>
                activeTab === "events"
                  ? setEventSearch(e.target.value)
                  : setUserSearch(e.target.value)
              }
              className="bg-white border border-gray-100 rounded-[20px] py-3 pl-12 pr-6 text-[10px] font-black uppercase tracking-widest outline-none focus:border-blue-600 transition-all w-full md:w-[300px]"
            />
          </div>
        </div>

        {/* PAGE HEADER & TOP LEVEL STATS */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 uppercase tracking-tighter italic">
              {activeTab === "events" && (
                <>
                  {eventFilter} <span className="text-blue-600">Moves</span>
                </>
              )}
              {activeTab === "users" && (
                <>
                  Community <span className="text-blue-600">Leads</span>
                </>
              )}
              {activeTab === "analytics" && (
                <>
                  Vibe <span className="text-blue-600">Pulse</span>
                </>
              )}
            </h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase mt-2 tracking-widest">
              PH City Operations
            </p>
          </div>

          <div className="grid grid-cols-2 lg:flex gap-3">
            <StatCard
              label="Pending"
              value={eventStats.pending}
              color="blue"
              icon={<ShieldAlert size={14} />}
            />
            <StatCard
              label="Approved"
              value={eventStats.approved}
              color="white"
              icon={<Activity size={14} />}
            />
            <StatCard
              label="Total Users"
              value={eventStats.totalUsers}
              color="white"
              icon={<Users size={14} />}
            />
            <StatCard
              label="Revenue"
              value="₦0.00"
              color="white"
              icon={<Wallet size={14} />}
            />
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === "events" && (
            <motion.section
              key="events"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex bg-white border border-gray-100 p-1 rounded-xl shadow-sm overflow-x-auto max-w-full">
                  {(
                    ["pending", "approved", "rejected", "all"] as EventStatus[]
                  ).map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setEventFilter(status);
                        setEventPage(1);
                      }}
                      className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all whitespace-nowrap ${eventFilter === status ? "bg-blue-600 text-white shadow-md" : "text-gray-400 hover:text-gray-600"}`}
                    >
                      {status} (
                      {status === "pending"
                        ? eventStats.pending
                        : status === "approved"
                          ? eventStats.approved
                          : status === "rejected"
                            ? eventStats.rejected
                            : eventStats.all}
                      )
                    </button>
                  ))}
                </div>

                {eventTotalPages > 1 && (
                  <Pagination
                    current={eventPage}
                    total={eventTotalPages}
                    onPageChange={setEventPage}
                  />
                )}
              </div>

              {loading ? (
                <div className="h-64 flex items-center justify-center bg-white rounded-[40px] border border-gray-100">
                  <Loader2 className="animate-spin text-blue-600" />
                </div>
              ) : (
                <ModerationTable events={events} onStatusUpdate={fetchEvents} />
              )}
            </motion.section>
          )}

          {activeTab === "users" && (
            <motion.section
              key="users"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic flex items-center gap-2">
                  <Filter size={12} /> Directory
                </h3>
                {userTotalPages > 1 && (
                  <Pagination
                    current={userPage}
                    total={userTotalPages}
                    onPageChange={setUserPage}
                  />
                )}
              </div>
              <div className="bg-white rounded-[40px] border border-gray-100 overflow-hidden shadow-sm">
                <UserManagementTable users={users} onVerify={fetchUsers} />
              </div>
            </motion.section>
          )}

          {activeTab === "analytics" && (
            <motion.section
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full"
            >
              <PulseAnalytics data={pulseData || { eventStats }} />
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 rounded-[16px] text-[10px] font-black uppercase tracking-widest transition-all ${active ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
    >
      {icon} {label}
    </button>
  );
}

function StatCard({ label, value, color, icon }: any) {
  return (
    <div
      className={`p-4 rounded-[24px] border ${color === "blue" ? "bg-blue-50/50 border-blue-100" : "bg-white border-gray-100"} min-w-[140px] shadow-sm`}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-[9px] font-black uppercase text-gray-400">{label}</p>
        <div className="text-slate-300">{icon}</div>
      </div>
      <p className="text-2xl font-black text-gray-900 uppercase italic leading-none">
        {value}
      </p>
    </div>
  );
}

function Pagination({ current, total, onPageChange }: any) {
  return (
    <div className="flex items-center gap-4 bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
      <button
        onClick={() => onPageChange(current - 1)}
        disabled={current === 1}
        className="p-2 disabled:opacity-20 hover:text-blue-600 transition-colors"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="text-[10px] font-black uppercase px-2">
        Page {current} / {total}
      </span>
      <button
        onClick={() => onPageChange(current + 1)}
        disabled={current === total}
        className="p-2 disabled:opacity-20 hover:text-blue-600 transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

// Global default export wrapped in a clean Suspense boundary
// to fully resolve Next.js dynamic pre-render bailouts.
export default function AdminDashboard() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex flex-col items-center justify-center bg-[#FDFDFD]">
          <div className="font-black text-3xl text-gray-900 mb-4 tracking-tighter italic uppercase">
            Kivo <span className="text-blue-600">Ops</span>
          </div>
          <Loader2 className="animate-spin text-blue-600" size={24} />
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}
