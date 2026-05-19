/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

export const dynamic = "force-dynamic";

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
  const [activeTab, setActiveTab] = useState<AdminTab>("analytics");
  const [events, setEvents] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pulseData, setPulseData] = useState<any>(null);

  // Detailed Metrics Hub
  const [eventStats, setEventStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    all: 0,
    totalUsers: 0,
  });

  // User tab specific metric counters
  const [userStatusCounts, setUserStatusCounts] = useState({
    all: 0,
    active: 0,
    suspended: 0,
    pending: 0,
  });

  // Filtering & Search
  const [userSearch, setUserSearch] = useState("");
  const [eventSearch, setEventSearch] = useState("");
  const [eventFilter, setEventFilter] = useState<EventStatus>("pending");

  // Pagination Parameters
  const [eventPage, setEventPage] = useState(1);
  const [eventTotalPages, setEventTotalPages] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const limit = 10;

  // BASE AUTHENTICATED HEADERS GENERATOR
  const getAuthHeaders = () => {
    const token = localStorage.getItem("skaute_token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  // FETCH EVENTS (TRIGGERED ONLY FOR EVENTS TAB)
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: eventPage.toString(),
        limit: limit.toString(),
        ...(eventFilter !== "all" && { approvalStatus: eventFilter }),
        ...(eventSearch && { title: eventSearch }),
      });

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/admin/events?${query}`,
        { method: "GET", headers: getAuthHeaders() },
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
      toast.error("Failed to sync structural events loop");
    } finally {
      setLoading(false);
    }
  };

  // FETCH USERS (TRIGGERED VIA USERS TAB WITH SEARCH & PIPELINES)
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: userPage.toString(),
        limit: limit.toString(),
        ...(userSearch && { search: userSearch }), // Maps directly to your aggregate search filter
      });

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/admin/users?${query}`,
        { method: "GET", headers: getAuthHeaders() },
      );
      if (!res.ok) throw new Error("User sync failed");
      const result = await res.json();

      setUsers(result.data?.users || []);
      setUserTotalPages(result.pagination?.totalPages || 1);

      if (result.pagination) {
        setEventStats((prev) => ({
          ...prev,
          totalUsers: result.pagination.totalUsers || 0,
        }));
        if (result.pagination.counts) {
          setUserStatusCounts(result.pagination.counts);
        }
      }
    } catch (error) {
      toast.error("Could not load platform directory users");
    } finally {
      setLoading(false);
    }
  };

  // FETCH PULSE METRICS
  const fetchPulse = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/admin/pulse`,
        { method: "GET", headers: getAuthHeaders() },
      );
      const result = await res.json();
      if (result.status === "success") {
        setPulseData(result.data);
      }
    } catch (error) {
      toast.error("Failed to sync metric analytics");
    } finally {
      setLoading(false);
    }
  };

  // ACTION CONTROLLER: APPROVE VERIFICATION PROMPT
  const handleVerifyUser = async (userId: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/admin/users/${userId}/verify`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify({ isVerified: true }),
        },
      );
      if (!res.ok) throw new Error("Verification execution failed");
      const result = await res.json();

      toast.success(
        result.message || "Host account verification successfully approved!",
      );
      fetchUsers(); // Live reload data view components
    } catch (err) {
      toast.error("Could not execute account approval verification");
    }
  };

  // ACTION CONTROLLER: TOGGLE ACTIVE STATUS VIA NEW STRING STATUS ENUM
  const handleToggleUserStatus = async (
    userId: string,
    targetStatus: "active" | "suspended",
  ) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/admin/users/${userId}/status`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify({ status: targetStatus }), // Directly passes target state structure
        },
      );
      if (!res.ok) throw new Error("Status modulation failed");
      const result = await res.json();

      toast.success(result.message || `Account status set to ${targetStatus}`);
      fetchUsers(); // Live reload data view components
    } catch (err) {
      toast.error("Could not complete profile status operational flag");
    }
  };

  // DECOUPLED TAB SWITCHING EFFECT
  useEffect(() => {
    if (activeTab === "analytics") {
      fetchPulse();
    } else if (activeTab === "events") {
      fetchEvents();
    } else if (activeTab === "users") {
      fetchUsers();
    }
  }, [activeTab]);

  // ISOLATED DEBOUNCED SEARCH WATCHERS FOR SEPARATE CONSOLES
  useEffect(() => {
    if (activeTab !== "events") return;
    const delayDebounceFn = setTimeout(() => {
      fetchEvents();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [eventSearch, eventFilter, eventPage]);

  useEffect(() => {
    if (activeTab !== "users") return;
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [userSearch, userPage]);

  return (
    <div className="min-h-screen bg-[#FDFDFD]">
      <Navbar />

      <div className="max-w-[1600px] mx-auto pt-24 flex flex-col md:flex-row min-h-[calc(100vh-96px)]">
        {/* VERTICAL NAVIGATION SIDEBAR */}
        <aside className="w-full md:w-64 flex-shrink-0 border-b md:border-b-0 md:border-r border-gray-100 p-6 space-y-8 sticky top-24 h-fit md:h-[calc(100vh-96px)] bg-[#FDFDFD] z-10">
          <div>
            <p className="text-[9px] font-black tracking-widest text-gray-400 uppercase mb-4 px-3">
              Operations Menu
            </p>
            <nav className="flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
              <SidebarButton
                active={activeTab === "analytics"}
                onClick={() => setActiveTab("analytics")}
                icon={<BarChart3 size={16} />}
                label="Pulse Analytics"
              />
              <SidebarButton
                active={activeTab === "users"}
                onClick={() => setActiveTab("users")}
                icon={<Users size={16} />}
                label="User Management"
              />
              <SidebarButton
                active={activeTab === "events"}
                onClick={() => setActiveTab("events")}
                icon={<CalendarDays size={16} />}
                label="Events Console"
              />
            </nav>
          </div>

          <div className="hidden md:block pt-4 border-t border-gray-100 px-3">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
              Scope Arena
            </span>
            <span className="text-[11px] font-black text-blue-600 uppercase tracking-wider mt-1 block">
              PH City Node
            </span>
          </div>
        </aside>

        {/* COMPONENT CONTROL VIEWPORTS FRAMEPORT */}
        <main className="flex-1 p-6 md:p-10 overflow-x-hidden">
          {/* TOP PANEL SECTION HEADLINES */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10 pb-6 border-b border-gray-100">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 uppercase tracking-tighter italic">
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
              <p className="text-[10px] font-bold text-gray-400 uppercase mt-1 tracking-widest">
                Realtime Administration Pipeline
              </p>
            </div>

            {/* INTEGRATED CONDITIONAL ACTIVE FILTER ENGINE SEARCH */}
            {activeTab !== "analytics" && (
              <div className="relative group w-full lg:w-auto">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder={
                    activeTab === "events"
                      ? "Find an event..."
                      : "Search users..."
                  }
                  value={activeTab === "events" ? eventSearch : userSearch}
                  onChange={(e) => {
                    if (activeTab === "events") {
                      setEventSearch(e.target.value);
                      setEventPage(1);
                    } else {
                      setUserSearch(e.target.value);
                      setUserPage(1);
                    }
                  }}
                  className="bg-white border border-gray-200 rounded-xl py-3 pl-12 pr-6 text-[10px] font-black uppercase tracking-widest outline-none focus:border-blue-600 transition-all w-full lg:w-[320px] shadow-sm"
                />
              </div>
            )}
          </div>

          {/* DYNAMIC REAL-TIME CARD METRIC HUD */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <StatCard
              label="Pending Actions"
              value={
                pulseData?.escalations?.pendingModerationCount ??
                eventStats.pending
              }
              color="blue"
              icon={<ShieldAlert size={14} />}
            />
            <StatCard
              label="Live Moves"
              value={eventStats.approved}
              color="white"
              icon={<Activity size={14} />}
            />
            <StatCard
              label="Total Directory Users"
              value={eventStats.totalUsers}
              color="white"
              icon={<Users size={14} />}
            />
            <StatCard
              label="Gross Revenue Pool"
              value={
                pulseData?.finances?.totalRevenue
                  ? `₦${pulseData.finances.totalRevenue.toLocaleString()}`
                  : "₦0.00"
              }
              color="white"
              icon={<Wallet size={14} />}
            />
          </section>

          {/* RENDERING WRAPPER FOR TRANSITIONS */}
          <AnimatePresence mode="wait">
            {activeTab === "events" && (
              <motion.section
                key="events"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex bg-gray-100 p-1 rounded-xl overflow-x-auto max-w-full">
                    {(
                      [
                        "pending",
                        "approved",
                        "rejected",
                        "all",
                      ] as EventStatus[]
                    ).map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setEventFilter(status);
                          setEventPage(1);
                        }}
                        className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-tight transition-all whitespace-nowrap ${eventFilter === status ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
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
                  <div className="h-64 flex items-center justify-center bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <Loader2 className="animate-spin text-blue-600" />
                  </div>
                ) : (
                  <ModerationTable
                    events={events}
                    onStatusUpdate={fetchEvents}
                  />
                )}
              </motion.section>
            )}

            {activeTab === "users" && (
              <motion.section
                key="users"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic flex items-center gap-2">
                    <Filter size={12} /> Active Directory:{" "}
                    {userStatusCounts.active} Active /{" "}
                    {userStatusCounts.suspended} Suspended
                  </h3>
                  {userTotalPages > 1 && (
                    <Pagination
                      current={userPage}
                      total={userTotalPages}
                      onPageChange={setUserPage}
                    />
                  )}
                </div>

                {loading ? (
                  <div className="h-64 flex items-center justify-center bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <Loader2 className="animate-spin text-blue-600" />
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                    <UserManagementTable
                      users={users}
                      onVerify={handleVerifyUser}
                      onToggleStatus={handleToggleUserStatus}
                    />
                  </div>
                )}
              </motion.section>
            )}

            {activeTab === "analytics" && (
              <motion.section
                key="analytics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full"
              >
                {loading && !pulseData ? (
                  <div className="h-64 flex items-center justify-center bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <Loader2 className="animate-spin text-blue-600" />
                  </div>
                ) : (
                  <PulseAnalytics data={pulseData || { eventStats }} />
                )}
              </motion.section>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

/* SIDEBAR LINK BUTTON COMPONENT */
function SidebarButton({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap text-left ${
        active
          ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
          : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
      }`}
    >
      <span className={active ? "text-white" : "text-gray-400"}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function StatCard({ label, value, color, icon }: any) {
  return (
    <div
      className={`p-5 rounded-2xl border ${color === "blue" ? "bg-blue-50/40 border-blue-100" : "bg-white border-gray-100"} shadow-sm`}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-[9px] font-black uppercase text-gray-400 tracking-wider">
          {label}
        </p>
        <div className="text-gray-300">{icon}</div>
      </div>
      <p className="text-xl md:text-2xl font-black text-gray-900 uppercase italic leading-none">
        {value}
      </p>
    </div>
  );
}

function Pagination({ current, total, onPageChange }: any) {
  return (
    <div className="flex items-center gap-4 bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
      <button
        onClick={() => onPageChange(current - 1)}
        disabled={current === 1}
        className="p-2 disabled:opacity-20 hover:text-blue-600 transition-colors"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="text-[10px] font-black uppercase px-2 whitespace-nowrap">
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

export default function AdminDashboard() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex flex-col items-center justify-center bg-[#FDFDFD]">
          <div className="font-black text-3xl text-gray-900 mb-4 tracking-tighter italic uppercase">
            skaute <span className="text-blue-600">Ops</span>
          </div>
          <Loader2 className="animate-spin text-blue-600" size={24} />
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}
