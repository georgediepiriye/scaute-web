/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  MapPin,
  Calendar,
  Clock,
  ArrowLeft,
  ShieldCheck,
  Info,
  Users,
  Repeat,
  Ticket,
  ExternalLink,
  Lock,
  Globe,
  Zap,
  CheckCircle2,
  Mail,
  Loader2,
  AlertTriangle,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

// YOUR MAP COMPONENT
function EventMap({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  return (
    <div className="w-full h-full rounded-[40px] overflow-hidden border border-white/10 shadow-2xl">
      <iframe
        width="100%"
        height="100%"
        className="border-0 w-full h-full"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src={`https://www.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`}
      />
    </div>
  );
}

export default function ProfessionalReviewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<
    "approved" | "rejected" | null
  >(null);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/admin/events/${id}`,
          { credentials: "include" },
        );
        if (!res.ok) throw new Error("Fetch failed");
        const result = await res.json();
        setEvent(result.data.event);
      } catch (error) {
        toast.error("Failed to sync move data");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchEventData();
  }, [id]);

  const initiateStatusUpdate = (status: "approved" | "rejected") => {
    setPendingStatus(status);
    setShowConfirm(true);
  };

  /**
   * HANDLE STATUS UPDATE (Approve/Reject)
   */
  const handleStatusUpdate = async () => {
    if (!pendingStatus) return;

    setShowConfirm(false);
    setSubmitting(true);
    const loadingToast = toast.loading(`Processing decision...`);

    // Add a synthetic delay for better UX feel
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/admin/events/${id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: pendingStatus }),
          credentials: "include",
        },
      );

      if (!res.ok) throw new Error("Failed to update status");

      toast.success(`Move successfully ${pendingStatus}`, { id: loadingToast });
      router.push("/admin/dashboard");
    } catch (error) {
      toast.error(`Error: Could not ${pendingStatus} this move`, {
        id: loadingToast,
      });
    } finally {
      setSubmitting(false);
      setPendingStatus(null);
    }
  };

  if (loading) return <ReviewLoader />;
  if (!event) return <ReviewError />;

  const isRecurring = event.recurrence?.frequency !== "none";

  const formatMoveDate = (dateString: string) => {
    const date = new Date(dateString);
    const datePart = date.toLocaleDateString("en-NG", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const timePart = date.toLocaleTimeString("en-NG", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return `${datePart} • ${timePart}`;
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans selection:bg-blue-100">
      {/* CONFIRMATION MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] p-10 max-w-md w-full shadow-2xl border border-slate-100 space-y-8 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start">
              <div
                className={`p-4 rounded-2xl ${pendingStatus === "approved" ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600"}`}
              >
                <AlertTriangle size={32} />
              </div>
              <button
                onClick={() => setShowConfirm(false)}
                className="p-2 hover:bg-slate-50 rounded-full text-slate-300 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900">
                Confirm Decision?
              </h3>
              <p className="text-sm font-medium text-slate-500 leading-relaxed">
                You are about to{" "}
                <span className="font-black text-slate-900 underline decoration-blue-500 underline-offset-4">
                  {pendingStatus}
                </span>{" "}
                this move. This will notify the organizer and update the public
                feed in Port Harcourt.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-4 bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 rounded-2xl hover:bg-slate-100 transition-colors"
              >
                Back Down
              </button>
              <button
                onClick={handleStatusUpdate}
                className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-white rounded-2xl shadow-lg transition-transform active:scale-95 ${pendingStatus === "approved" ? "bg-blue-600 shadow-blue-100" : "bg-red-600 shadow-red-100"}`}
              >
                Proceed Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. TOP UTILITY NAV */}
      <nav className="fixed top-0 w-full z-[100] bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-5 flex justify-between items-center">
        <button
          onClick={() => router.push("/admin/dashboard")}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 transition-all group"
        >
          <ArrowLeft
            size={14}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to Moderation
        </button>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">
              Event Status
            </span>
            <span
              className={`text-[10px] font-black uppercase italic ${event.approvalStatus === "approved" ? "text-green-500" : "text-orange-500"}`}
            >
              {event.approvalStatus}
            </span>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 rounded-full border border-blue-100">
            <ShieldCheck size={14} className="text-blue-600" />
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
              Admin Mode
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto pt-32 pb-24 px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8 space-y-12">
            <header className="space-y-8">
              <div className="relative w-full aspect-[21/9] rounded-[40px] overflow-hidden shadow-2xl group">
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                <div className="absolute bottom-10 left-10 flex flex-wrap gap-3">
                  <span className="px-5 py-2 bg-blue-600 rounded-full text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <Zap size={12} fill="white" /> {event.type}
                  </span>
                  <span className="px-5 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-[10px] font-black text-white uppercase tracking-widest">
                    {event.category}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <h1 className="text-7xl md:text-9xl font-black text-slate-900 uppercase italic tracking-tighter leading-[0.8] drop-shadow-sm">
                  {event.title}
                </h1>
                <div className="flex items-center gap-6 pt-4">
                  <div className="flex -space-x-3">
                    {event.participantImages
                      ?.slice(0, 4)
                      .map((img: string, i: number) => (
                        <div
                          key={i}
                          className="w-12 h-12 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-100"
                        >
                          <Image src={img} alt="" width={48} height={48} />
                        </div>
                      ))}
                    <div className="w-12 h-12 rounded-full border-4 border-white bg-slate-950 flex items-center justify-center text-[10px] font-black text-white">
                      +{event.attendees - 4}
                    </div>
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Vibe Meter:{" "}
                    <span className="text-blue-600">
                      {event.attendees} confirmed
                    </span>
                  </p>
                </div>
              </div>
            </header>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 rounded-[32px] bg-white border border-slate-100 flex items-center gap-6">
                <div className="p-4 bg-green-50 rounded-2xl text-green-600">
                  <Calendar size={24} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-1">
                    Start Schedule
                  </p>
                  <p className="text-lg font-black text-slate-900 uppercase italic leading-none">
                    {formatMoveDate(event.startDate)}
                  </p>
                </div>
              </div>
              <div className="p-8 rounded-[32px] bg-white border border-slate-100 flex items-center gap-6">
                <div className="p-4 bg-red-50 rounded-2xl text-red-600">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-1">
                    End Schedule
                  </p>
                  <p className="text-lg font-black text-slate-900 uppercase italic leading-none">
                    {formatMoveDate(event.endDate)}
                  </p>
                </div>
              </div>
            </section>

            {/* ORGANIZER PROFILE */}
            <section className="p-8 rounded-[40px] bg-slate-50 border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-white shadow-md">
                  <Image
                    src={event.organizer.image || "/placeholder-avatar.png"}
                    alt={event.organizer.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.3em]">
                    Verified Host
                  </p>
                  <h3 className="text-2xl font-black uppercase italic text-slate-900 tracking-tighter leading-none">
                    {event.organizer.name}
                  </h3>
                  <div className="flex items-center gap-2 pt-1">
                    <Mail size={12} className="text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-500 lowercase">
                      {event.organizer.email}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 w-full md:w-auto">
                <div className="flex-1 md:flex-none px-6 py-4 bg-white rounded-2xl border border-slate-100 text-center">
                  <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">
                    Status
                  </p>
                  <p className="text-[10px] font-black text-slate-900 uppercase">
                    {event.organizerType}
                  </p>
                </div>
                <div className="flex-1 md:flex-none px-6 py-4 bg-white rounded-2xl border border-slate-100 text-center">
                  <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">
                    Joined
                  </p>
                  <p className="text-[10px] font-black text-slate-900 uppercase">
                    {new Date(event.organizer.createdAt).getFullYear()}
                  </p>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <section className="p-10 rounded-[48px] bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                <h2 className="text-[11px] font-black uppercase text-blue-600 tracking-[0.4em] mb-8 flex items-center gap-2">
                  <span className="p-2 bg-blue-50 rounded-lg">
                    <Info size={14} />
                  </span>{" "}
                  Description
                </h2>
                <p className="text-xl text-slate-600 leading-[1.6] font-medium selection:bg-blue-100">
                  {event.description}
                </p>
                <div className="mt-10 flex flex-wrap gap-2">
                  {event.tags?.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-4 py-2 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase rounded-xl transition-colors hover:bg-blue-50 hover:text-blue-600"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </section>

              <section
                className={`p-10 rounded-[48px] border-2 shadow-sm transition-all duration-500 ${isRecurring ? "border-blue-100 bg-blue-50/20" : "border-slate-100 bg-white"}`}
              >
                <div className="flex justify-between items-start mb-10">
                  <h2 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.4em]">
                    Recurrence
                  </h2>
                  <div
                    className={`p-3 rounded-2xl ${isRecurring ? "bg-blue-600 text-white shadow-xl shadow-blue-200" : "bg-slate-50 text-slate-300"}`}
                  >
                    <Repeat size={24} />
                  </div>
                </div>
                {isRecurring ? (
                  <div className="space-y-2">
                    <p className="text-4xl font-black text-blue-900 uppercase italic leading-none">
                      {event.recurrence.frequency}
                    </p>
                    <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">
                      Every {event.recurrence.interval} Interval
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-4xl font-black text-slate-200 uppercase italic leading-none">
                      Static Move
                    </p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Non-repeating event
                    </p>
                  </div>
                )}
              </section>
            </div>

            <section className="p-12 rounded-[48px] bg-slate-950 text-white flex flex-col md:flex-row gap-12 items-center">
              <div className="flex-1 space-y-8 w-full">
                <h2 className="text-[11px] font-black uppercase text-blue-400 tracking-[0.5em] mb-4">
                  Location Engine
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  <CoordRow label="Lat" value={event.location.coordinates[1]} />
                  <CoordRow label="Lng" value={event.location.coordinates[0]} />
                  <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                    <div className="p-3 bg-white/5 rounded-2xl">
                      <MapPin size={20} className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                        Neighborhood
                      </p>
                      <p className="text-sm font-black uppercase text-white">
                        {event.location.neighborhood}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-[400px] h-[400px]">
                <EventMap
                  latitude={event.location.coordinates[1]}
                  longitude={event.location.coordinates[0]}
                />
              </div>
            </section>
          </div>

          {/* 3. RIGHT SIDEBAR */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white border border-slate-100 rounded-[56px] p-10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.05)] space-y-10 sticky top-32">
              <div className="flex justify-between items-center">
                <div className="px-5 py-2 bg-slate-900 rounded-full flex items-center gap-2">
                  <Ticket size={14} className="text-blue-400" />
                  <span className="text-[10px] font-black text-white uppercase tracking-tighter">
                    Tier: {event.ticketingType}
                  </span>
                </div>
                <CheckCircle2 size={24} className="text-green-500" />
              </div>

              <div className="space-y-10">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
                    Price Label
                  </p>
                  <p className="text-5xl font-black italic uppercase text-slate-900 tracking-tighter">
                    {event.priceLabel === "Free"
                      ? "No Charge"
                      : `₦${event.startingPrice.toLocaleString()}`}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-8 border-y border-slate-50 py-10">
                  <div>
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">
                      Total Capacity
                    </p>
                    <p className="text-lg font-black">
                      {event.totalCapacity || "Unlimited"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">
                      Sold Count
                    </p>
                    <p className="text-lg font-black text-blue-600">
                      {event.ticketsSold}
                    </p>
                  </div>
                </div>
                <div className="space-y-6">
                  <SidebarItem
                    label="Refund Policy"
                    value={event.refundPolicy}
                  />
                  <SidebarItem label="Age Limit" value={event.ageRestriction} />
                  <SidebarItem
                    label="Public Move"
                    value={event.isPublic ? "Visible" : "Private"}
                  />
                </div>
              </div>

              <div className="pt-6 space-y-4">
                <button
                  disabled={submitting}
                  onClick={() => initiateStatusUpdate("approved")}
                  className="w-full py-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-3xl text-[11px] font-black uppercase tracking-[0.4em] transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3"
                >
                  {submitting && pendingStatus === "approved" ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={16} />
                  )}
                  Approve Move
                </button>
                <button
                  disabled={submitting}
                  onClick={() => initiateStatusUpdate("rejected")}
                  className="w-full py-6 bg-slate-50 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 text-slate-400 rounded-3xl text-[11px] font-black uppercase tracking-[0.4em] transition-all"
                >
                  Reject Move
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function CoordRow({ label, value }: any) {
  return (
    <div className="flex justify-between items-center p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-blue-400/30 transition-colors">
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
        {label}
      </span>
      <span className="text-xs font-mono font-black text-blue-400">
        {value}
      </span>
    </div>
  );
}

function SidebarItem({ label, value }: any) {
  return (
    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
      <span className="text-slate-300">{label}</span>
      <span className="text-slate-900">{value}</span>
    </div>
  );
}

function ReviewLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-10">
        <div className="relative">
          <div className="w-24 h-24 border-[12px] border-slate-50 rounded-full" />
          <div className="w-24 h-24 border-[12px] border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0" />
        </div>
        <p className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-400 animate-pulse">
          Syncing Move Core...
        </p>
      </div>
    </div>
  );
}

function ReviewError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-12">
      <div className="max-w-md text-center space-y-8">
        <h3 className="text-6xl font-black uppercase italic text-slate-900 tracking-tighter leading-none">
          Security Fault
        </h3>
        <p className="text-[11px] font-black uppercase text-red-500 tracking-[0.3em] leading-relaxed">
          The requested Move ID is currently locked or does not exist.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-10 py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full"
        >
          Re-initialize Session
        </button>
      </div>
    </div>
  );
}
