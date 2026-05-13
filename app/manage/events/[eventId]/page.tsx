"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { BarChart3, Users, Share2, ExternalLink } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

// Component Imports
import Navbar from "@/components/layout/NavBar";
import AuthGuard from "@/components/auth/AuthGuard";
import { DashboardHeader } from "@/components/manage/events/Header";
import { OverviewTab } from "@/components/manage/events/Overview";
import { SidebarAccess } from "@/components/manage/events/SidebarAccess";
import { AttendeesTab } from "@/components/manage/events/AttendeesTab";
import { MarketingTab } from "@/components/manage/events/MarketingTab";

export default function ManageEventDashboard() {
  const params = useParams();
  const router = useRouter();
  const id = params.eventId as string;

  // UI State
  const [activeTab, setActiveTab] = useState("overview");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // FIX: Added state for logged in user ID
  const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);

  // Guest List State
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Access Control State
  const [coOrgEmail, setCoOrgEmail] = useState("");
  const [addingCoOrg, setAddingCoOrg] = useState(false);

  // FIX: Restore local storage check to identify the organizer
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setLoggedInUserId(user._id || user.id);
      } catch (e) {
        console.error("Error parsing user from localStorage");
      }
    }
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/events/${id}/manage`,
        { credentials: "include" },
      );
      const result = await response.json();
      if (response.ok) {
        setData(result.data);
      } else {
        router.replace("/auth/signin");
      }
    } catch (err) {
      toast.error("Unable to connect to Kivo servers.");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (id) fetchDashboardData();
  }, [id, fetchDashboardData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // FIX: Updated to use your original /co-organizers endpoint and PATCH method
  const handleAddCoOrg = async () => {
    if (!coOrgEmail) return toast.error("Please enter an email");
    setAddingCoOrg(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/events/${id}/co-organizers`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: coOrgEmail }),
          credentials: "include",
        },
      );
      const result = await res.json();
      if (res.ok) {
        toast.success("Partner added to the move!");
        setCoOrgEmail("");
        fetchDashboardData();
      } else {
        toast.error(result.message || "Could not add partner");
      }
    } catch (err) {
      toast.error("Network error. Try again.");
    } finally {
      setAddingCoOrg(false);
    }
  };

  const filteredTickets = useMemo(() => {
    const sourceList = data?.attendees || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return sourceList.filter((ticket: any) => {
      const fullName =
        `${ticket.buyerInfo.firstName} ${ticket.buyerInfo.lastName}`.toLowerCase();
      const email = ticket.buyerInfo.email.toLowerCase();
      const search = searchTerm.toLowerCase();
      return fullName.includes(search) || email.includes(search);
    });
  }, [data?.attendees, searchTerm]);

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const currentItems = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredTickets.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredTickets, currentPage]);

  if (loading || !data) return null;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#FDFDFD] text-slate-900 selection:bg-yellow-200">
        <Toaster position="top-right" />
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 md:px-8 pt-32 pb-24">
          <DashboardHeader event={data.event} id={id} router={router} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-2 space-y-2">
              {[
                { id: "overview", label: "Insights", icon: BarChart3 },
                { id: "attendees", label: "Guest List", icon: Users },
                { id: "marketing", label: "Growth", icon: Share2 },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeTab === item.id
                      ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                      : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <item.icon size={16} /> {item.label}
                </button>
              ))}
            </div>

            <div className="lg:col-span-7">
              {activeTab === "overview" && (
                <OverviewTab metrics={data.metrics} />
              )}
              {activeTab === "attendees" && (
                <AttendeesTab
                  currentItems={currentItems}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  setCurrentPage={setCurrentPage}
                />
              )}
              {activeTab === "marketing" && (
                <MarketingTab id={id} event={data.event} />
              )}
            </div>

            <div className="lg:col-span-3 space-y-6">
              {/* FIX: isOrganizer now correctly compares data from localStorage */}
              <SidebarAccess
                event={data.event}
                isOrganizer={data.event.organizer === loggedInUserId}
                coOrgEmail={coOrgEmail}
                setCoOrgEmail={setCoOrgEmail}
                adding={addingCoOrg}
                onAdd={handleAddCoOrg}
              />

              <div
                className="bg-yellow-400 p-8 rounded-[2.5rem] shadow-xl shadow-yellow-100 group cursor-pointer relative overflow-hidden active:scale-95 transition-all"
                onClick={() =>
                  window.open(`/e/${data.event.slug || id}`, "_blank")
                }
              >
                <div className="relative z-10">
                  <h4 className="text-sm font-black uppercase tracking-tight text-black italic flex items-center gap-2">
                    Live Preview <ExternalLink size={14} />
                  </h4>
                  <p className="text-[10px] font-bold text-black/60 mt-2 uppercase">
                    View move as attendee
                  </p>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                  <BarChart3 size={120} />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
