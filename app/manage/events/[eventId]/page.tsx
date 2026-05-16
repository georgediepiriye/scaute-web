"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  BarChart3,
  Users,
  Share2,
  ExternalLink,
  Mail,
  Shield,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

// Component Imports
import Navbar from "@/components/layout/NavBar";
import AuthGuard from "@/components/auth/AuthGuard";
import { DashboardHeader } from "@/components/manage/events/Header";
import { OverviewTab } from "@/components/manage/events/Overview";
import { SidebarAccess } from "@/components/manage/events/SidebarAccess";
import { AttendeesTab } from "@/components/manage/events/AttendeesTab";
import { MarketingTab } from "@/components/manage/events/MarketingTab";
import { BroadcastTab } from "@/components/manage/events/BroadcastTab";
import { SettingsTab } from "@/components/manage/events/SettingsTab";

export default function ManageEventDashboard() {
  const params = useParams();
  const router = useRouter();
  const id = params.eventId as string;

  const [activeTab, setActiveTab] = useState("overview");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);

  // Guest List State
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Access Control State
  const [coOrgEmail, setCoOrgEmail] = useState("");
  const [addingCoOrg, setAddingCoOrg] = useState(false);

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

  /**
   * FETCH DATA & REFRESH UI
   */
  const fetchDashboardData = useCallback(async () => {
    try {
      const token = localStorage.getItem("kivo_token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/events/${id}/manage`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        },
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

  /**
   * HANDLER: ADD CO-ORGANIZER
   */
  const handleAddCoOrg = async () => {
    if (!coOrgEmail) return toast.error("Please enter an email");
    setAddingCoOrg(true);
    try {
      const token = localStorage.getItem("kivo_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/events/${id}/co-organizers`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({
            email: coOrgEmail,
            permissions: ["scan_tickets"],
          }),
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

  /**
   * HANDLER: REMOVE CO-ORGANIZER
   */
  const handleRemoveCoOrg = async (partnerId: string) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to revoke this partner's dashboard access?",
    );
    if (!isConfirmed) return;

    try {
      const token = localStorage.getItem("kivo_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/events/${id}/co-organizers/${partnerId}`,
        {
          method: "DELETE",
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        },
      );
      const result = await res.json();
      if (res.ok) {
        toast.success("Access privileges revoked.");
        fetchDashboardData();
      } else {
        toast.error(result.message || "Failed to remove partner");
      }
    } catch (err) {
      toast.error("Network error. Could not save changes.");
    }
  };

  /**
   * HANDLER: REFUND TICKETS
   */
  const handleRefund = async (ticketCode: string) => {
    const isConfirmed = window.confirm(
      "Are you sure? This will refund the guest's money via Paystack and invalidate this ticket.",
    );

    if (!isConfirmed) return;

    const toastId = toast.loading("Processing refund...");

    try {
      const token = localStorage.getItem("kivo_token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/tickets/refund/${ticketCode}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        },
      );

      const result = await response.json();

      if (response.ok) {
        toast.success("Refund successful. Spot reopened.", { id: toastId });
        fetchDashboardData();
      } else {
        toast.error(result.message || "Refund failed", { id: toastId });
      }
    } catch (error) {
      toast.error("Network error. Please try again.", { id: toastId });
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

  // Handles checking string matches against populated objects safely
  const isOrganizer =
    data.event.organizer === loggedInUserId ||
    data.event.organizer?._id === loggedInUserId;

  /**
   * COMPREHENSIVE PRIVILEGE RESOLVER ENGINE
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const partnerRecord = data.event.coOrganizers?.find((coOrg: any) => {
    const coOrgId = coOrg.user?._id || coOrg.user?.id || coOrg.user;
    return coOrgId === loggedInUserId;
  });

  // Extract explicit permissions from database, or apply defaults if partner is present but unconfigured
  const partnerPermissions: string[] = partnerRecord
    ? partnerRecord.permissions || []
    : [];

  // Fallback Rule: If they are a co-organizer but their array is completely empty, default to active scanner access
  const derivedPermissions =
    partnerRecord && partnerPermissions.length === 0
      ? ["scan_tickets"]
      : partnerPermissions;

  // Define operational accessibility parameters
  const canViewRevenue =
    isOrganizer || derivedPermissions.includes("view_revenue");
  const canIssueRefunds =
    isOrganizer || derivedPermissions.includes("issue_refunds");
  const canSendBroadcasts =
    isOrganizer || derivedPermissions.includes("send_broadcasts");
  const canScanTickets =
    isOrganizer || derivedPermissions.includes("scan_tickets");

  // Determine navigation item structure conditionally
  const sidebarTabs = [
    { id: "overview", label: "Insights", icon: BarChart3, visible: true },
    { id: "attendees", label: "Guest List", icon: Users, visible: true },
    {
      id: "broadcast",
      label: "Broadcast",
      icon: Mail,
      visible: canSendBroadcasts,
    },
    { id: "marketing", label: "Growth", icon: Share2, visible: isOrganizer },
    { id: "settings", label: "Settings", icon: Shield, visible: isOrganizer }, // LOCKED to main host only
  ].filter((tab) => tab.visible);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#FDFDFD] text-slate-900 selection:bg-yellow-200">
        <Toaster position="top-right" />
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 md:px-8 pt-32 pb-24">
          <DashboardHeader
            event={data.event}
            id={id}
            router={router}
            isOrganizer={isOrganizer}
            canScanTickets={canScanTickets}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* SIDEBAR TABS WRAPPER */}
            <div className="lg:col-span-2 space-y-2">
              {sidebarTabs.map((item) => (
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

            {/* MAIN WORKSPACE REGION */}
            <div className="lg:col-span-7">
              {activeTab === "overview" && (
                <OverviewTab
                  metrics={data.metrics}
                  canViewRevenue={canViewRevenue}
                />
              )}

              {activeTab === "attendees" && (
                <AttendeesTab
                  currentItems={currentItems}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  setCurrentPage={setCurrentPage}
                  onRefund={handleRefund}
                  canIssueRefunds={canIssueRefunds}
                />
              )}

              {activeTab === "broadcast" && canSendBroadcasts && (
                <BroadcastTab
                  attendeesCount={data.metrics.totalTicketsSold}
                  eventId={id}
                />
              )}

              {activeTab === "marketing" && isOrganizer && (
                <MarketingTab id={id} event={data.event} />
              )}

              {/* CRITICAL: Strict fallback block preventing non-host markup execution */}
              {activeTab === "settings" && isOrganizer && (
                <SettingsTab
                  event={data.event}
                  isOrganizer={isOrganizer}
                  onRefresh={fetchDashboardData}
                />
              )}
            </div>

            {/* SIDEBAR ACCESS PANEL CONTROL */}
            <div className="lg:col-span-3 space-y-6">
              <SidebarAccess
                event={data.event}
                isOrganizer={isOrganizer}
                coOrgEmail={coOrgEmail}
                setCoOrgEmail={setCoOrgEmail}
                adding={addingCoOrg}
                onAdd={handleAddCoOrg}
                onRemove={handleRemoveCoOrg}
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
