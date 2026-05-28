/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Calendar,
  Clock,
  ArrowLeft,
  ShieldCheck,
  Info,
  Repeat,
  Ticket,
  Zap,
  CheckCircle2,
  Mail,
  Loader2,
  AlertTriangle,
  X,
  TrendingUp,
  ExternalLink,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

type TicketTier = {
  name: string;
  capacity: number;
  price: number;
};

type Organizer = {
  name: string;
  email: string;
  image?: string;
  createdAt: string;
};

type Recurrence = {
  frequency: string;
  interval: number;
};

type LocationData = {
  neighborhood?: string;
  coordinates?: [number, number];
};

type EventData = {
  _id: string;
  title: string;
  description: string;
  image: string;
  type: string;
  category: string;
  attendees: number;
  participantImages?: string[];
  startDate: string;
  endDate: string;
  organizer: Organizer;
  organizerType: string;
  recurrence?: Recurrence;
  approvalStatus: "pending" | "approved" | "rejected";
  eventFormat: "online" | "physical" | "hybrid";
  meetingLink?: string;
  location?: LocationData;
  ticketingType: string;
  ticketTiers?: TicketTier[];
  totalCapacity?: number;
  ticketsSold?: number;
};

function EventMap({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  return (
    <div className="w-full h-full overflow-hidden rounded-[24px] sm:rounded-[32px] lg:rounded-[40px] border border-white/10 shadow-2xl">
      <iframe
        title="Event Location Map"
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
  const params = useParams();
  const router = useRouter();

  const id = useMemo(() => {
    if (!params?.id) return "";
    return Array.isArray(params.id) ? params.id[0] : params.id;
  }, [params]);

  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<
    "approved" | "rejected" | null
  >(null);
  const [reason, setRejectionReason] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchEventData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("skaute_token");

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/admin/events/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch event");
        }

        const result = await response.json();
        setEvent(result?.data?.event || null);
      } catch (error) {
        console.error(error);
        toast.error("Failed to sync move data");
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [id]);

  const initiateStatusUpdate = (status: "approved" | "rejected"): void => {
    setPendingStatus(status);
    setRejectionReason(""); // Ensure state is reset for each individual modal action trigger
    setShowConfirm(true);
  };

  const handleStatusUpdate = async () => {
    if (!pendingStatus || !id) return;

    // Front-end sanity check to prevent execution if rejection details are missing
    if (pendingStatus === "rejected" && reason.trim().length < 5) {
      toast.error("Please provide a descriptive reason (minimum 5 characters)");
      return;
    }

    setShowConfirm(false);
    setSubmitting(true);

    const loadingToast = toast.loading("Processing decision...");

    try {
      const token = localStorage.getItem("skaute_token");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/admin/events/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            status: pendingStatus,
            ...(pendingStatus === "rejected" ? { reason: reason.trim() } : {}),
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      toast.success(`Move successfully ${pendingStatus}`, {
        id: loadingToast,
      });

      router.push("/admin/dashboard");
    } catch (error) {
      console.error(error);
      toast.error(`Error: Could not ${pendingStatus} this move`, {
        id: loadingToast,
      });
    } finally {
      setSubmitting(false);
      setPendingStatus(null);
      setRejectionReason("");
    }
  };

  const formatMoveDate = (dateString?: string) => {
    if (!dateString) return "N/A";

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

  if (loading) {
    return <ReviewLoader />;
  }

  if (!event) {
    return <ReviewError />;
  }

  const isRecurring =
    event.recurrence?.frequency && event.recurrence.frequency !== "none";
  const latitude = event.location?.coordinates?.[1];
  const longitude = event.location?.coordinates?.[0];

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans overflow-x-hidden">
      <Toaster position="top-center" />

      {/* CONFIRMATION MODAL CONTAINER */}
      {showConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 sm:p-6">
          <div className="w-full max-w-md rounded-[24px] sm:rounded-[40px] bg-white p-5 sm:p-8 lg:p-10 shadow-2xl border border-slate-100 space-y-6 sm:space-y-8">
            <div className="flex items-start justify-between">
              <div
                className={`p-3 sm:p-4 rounded-2xl ${
                  pendingStatus === "approved"
                    ? "bg-blue-50 text-[#0052FF]"
                    : "bg-red-50 text-red-600"
                }`}
              >
                <AlertTriangle size={28} />
              </div>

              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <h3 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tighter">
                Confirm Decision?
              </h3>

              <p className="text-sm text-slate-500 leading-relaxed">
                You are about to{" "}
                <span className="font-black text-slate-900 underline underline-offset-4 decoration-yellow-500">
                  {pendingStatus === "approved" ? "approve" : "reject"}
                </span>{" "}
                this move.
              </p>
            </div>

            {pendingStatus === "rejected" && (
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400">
                  Rejection Reason
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this move is being rejected for the operational records..."
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 p-4 text-sm outline-none resize-none focus:border-[#0052FF] bg-slate-50 font-medium"
                />
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-[10px] font-black uppercase tracking-widest transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleStatusUpdate}
                className={`flex-1 py-4 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                  pendingStatus === "approved" ? "bg-[#0052FF]" : "bg-red-600"
                }`}
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.push("/admin/dashboard")}
            className="group flex items-center gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-400 hover:text-[#0052FF] transition-all"
          >
            <ArrowLeft
              size={14}
              className="transition-transform group-hover:-translate-x-1"
            />
            <span className="hidden xs:block">Back to Moderation</span>
            <span className="xs:hidden">Back</span>
          </button>

          <div className="flex items-center gap-2 sm:gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[9px] font-bold uppercase tracking-tight text-slate-300">
                Event Status
              </span>
              <span
                className={`text-[10px] font-black uppercase italic ${event.approvalStatus === "approved" ? "text-green-500" : event.approvalStatus === "rejected" ? "text-red-500" : "text-orange-500"}`}
              >
                {event.approvalStatus}
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 rounded-full border border-[#0052FF]/10 bg-[#0052FF]/5 px-3 sm:px-4 py-2">
              <ShieldCheck size={14} className="text-[#0052FF]" />
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#0052FF]">
                Admin
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN CONTAINER */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-16 sm:pb-24">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 xl:gap-16">
          {/* LEFT SIDE DATA STACK */}
          <div className="xl:col-span-8 space-y-8 sm:space-y-10 lg:space-y-12">
            <header className="space-y-6 sm:space-y-8">
              <div className="relative w-full aspect-[16/10] sm:aspect-[21/9] overflow-hidden rounded-[24px] sm:rounded-[32px] lg:rounded-[40px] shadow-2xl group">
                <Image
                  src={event.image || "/placeholder.jpg"}
                  alt={event.title}
                  fill
                  priority
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 sm:bottom-8 sm:left-8 lg:bottom-10 lg:left-10 flex flex-wrap gap-2 sm:gap-3">
                  <span className="flex items-center gap-2 rounded-full bg-[#0052FF] px-3 sm:px-5 py-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white">
                    <Zap size={12} fill="white" />
                    {event.type}
                  </span>
                  <span className="flex items-center gap-2 rounded-full bg-yellow-500 px-3 sm:px-5 py-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-black">
                    <TrendingUp size={12} />
                    {event.category}
                  </span>
                </div>
              </div>

              <div className="space-y-5">
                <h1 className="text-3xl sm:text-5xl md:text-6xl xl:text-8xl font-black uppercase italic tracking-tighter leading-[0.85] break-words">
                  {event.title}
                </h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 flex-wrap">
                  <div className="flex -space-x-3">
                    {event.participantImages?.slice(0, 4).map((img, index) => (
                      <div
                        key={index}
                        className="h-10 w-10 sm:h-12 sm:w-12 overflow-hidden rounded-full border-4 border-white shadow-lg bg-slate-100"
                      >
                        <Image
                          src={img}
                          alt="Participant"
                          width={48}
                          height={48}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full border-4 border-white bg-slate-950 flex items-center justify-center text-[9px] sm:text-[10px] font-black text-white">
                      +{event.attendees > 4 ? event.attendees - 4 : 0}
                    </div>
                  </div>
                  <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-400">
                    Vibe Meter:{" "}
                    <span className="text-[#0052FF]">
                      {event.attendees} confirmed
                    </span>
                  </p>
                </div>
              </div>
            </header>

            {/* DATE CARDS */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="flex items-start sm:items-center gap-4 sm:gap-6 rounded-[24px] sm:rounded-[32px] border border-slate-100 bg-white p-5 sm:p-8">
                <div className="rounded-2xl bg-yellow-50 p-3 sm:p-4 text-yellow-600 shrink-0">
                  <Calendar size={22} />
                </div>
                <div className="min-w-0">
                  <p className="mb-1 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-slate-300">
                    Start Schedule
                  </p>
                  <p className="text-sm sm:text-lg font-black uppercase italic leading-tight break-words">
                    {formatMoveDate(event.startDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-start sm:items-center gap-4 sm:gap-6 rounded-[24px] sm:rounded-[32px] border border-slate-100 bg-white p-5 sm:p-8">
                <div className="rounded-2xl bg-red-50 p-3 sm:p-4 text-red-600 shrink-0">
                  <Clock size={22} />
                </div>
                <div className="min-w-0">
                  <p className="mb-1 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-slate-300">
                    End Schedule
                  </p>
                  <p className="text-sm sm:text-lg font-black uppercase italic leading-tight break-words">
                    {formatMoveDate(event.endDate)}
                  </p>
                </div>
              </div>
            </section>

            {/* HOST LOGISTICS */}
            <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8 rounded-[24px] sm:rounded-[40px] border border-slate-100 bg-slate-50 p-5 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6">
                <div className="relative h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-2xl ring-4 ring-white shadow-md shrink-0">
                  <Image
                    src={event.organizer?.image || "/placeholder-avatar.png"}
                    alt={event.organizer?.name || "Organizer"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="space-y-1 min-w-0">
                  <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.25em] sm:tracking-[0.3em] text-[#0052FF]">
                    Verified Host
                  </p>
                  <h3 className="text-xl sm:text-2xl font-black uppercase italic tracking-tighter break-words">
                    {event.organizer?.name}
                  </h3>
                  <div className="flex items-center gap-2 pt-1 min-w-0">
                    <Mail size={12} className="text-slate-400 shrink-0" />
                    <span className="text-[10px] font-bold lowercase text-slate-500 truncate">
                      {event.organizer?.email}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:flex w-full lg:w-auto gap-4">
                <div className="rounded-2xl border border-slate-100 bg-white px-4 sm:px-6 py-4 text-center">
                  <p className="mb-1 text-[8px] font-black uppercase tracking-widest text-slate-300">
                    Status
                  </p>
                  <p className="text-[10px] font-black uppercase break-words">
                    {event.organizerType}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white px-4 sm:px-6 py-4 text-center">
                  <p className="mb-1 text-[8px] font-black uppercase tracking-widest text-slate-300">
                    Joined
                  </p>
                  <p className="text-[10px] font-black uppercase">
                    {event.organizer?.createdAt
                      ? new Date(event.organizer.createdAt).getFullYear()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </section>

            {/* DETAILS CONTAINER */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
              <section className="rounded-[24px] sm:rounded-[48px] border border-slate-100 bg-white p-6 sm:p-10 shadow-sm">
                <h2 className="mb-6 sm:mb-8 flex items-center gap-2 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.25em] sm:tracking-[0.4em] text-[#0052FF]">
                  <span className="rounded-lg bg-blue-50 p-2">
                    <Info size={14} />
                  </span>
                  Description
                </h2>
                <p className="text-base sm:text-lg lg:text-xl leading-[1.7] text-slate-600 font-medium break-words">
                  {event.description}
                </p>
              </section>

              <section
                className={`rounded-[24px] sm:rounded-[48px] border-2 p-6 sm:p-10 shadow-sm transition-all duration-500 ${isRecurring ? "border-[#0052FF]/10 bg-[#0052FF]/5" : "border-slate-100 bg-white"}`}
              >
                <div className="mb-8 sm:mb-10 flex items-start justify-between gap-4">
                  <h2 className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.25em] sm:tracking-[0.4em] text-slate-400">
                    Recurrence
                  </h2>
                  <div
                    className={`rounded-2xl p-3 shrink-0 ${isRecurring ? "bg-[#0052FF] text-white shadow-xl shadow-blue-200" : "bg-slate-50 text-slate-300"}`}
                  >
                    <Repeat size={22} />
                  </div>
                </div>
                {isRecurring ? (
                  <div className="space-y-2">
                    <p className="text-3xl sm:text-4xl font-black uppercase italic leading-none break-words">
                      {event.recurrence?.frequency}
                    </p>
                    <p className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#0052FF]">
                      Every {event.recurrence?.interval} Interval
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-3xl sm:text-4xl font-black uppercase italic leading-none text-slate-200">
                      Static Move
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Non-repeating event
                    </p>
                  </div>
                )}
              </section>
            </div>

            {/* ENGINE / METRICS LOCATION */}
            <section className="flex flex-col xl:flex-row items-stretch gap-8 lg:gap-12 rounded-[24px] sm:rounded-[48px] bg-slate-950 p-5 sm:p-8 lg:p-12 text-white overflow-hidden">
              <div className="w-full flex-1 space-y-6 sm:space-y-8 min-w-0">
                <h2 className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.3em] sm:tracking-[0.5em] text-yellow-500">
                  {event.eventFormat === "online"
                    ? "Digital Access"
                    : "Location Engine"}
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {event.eventFormat === "online" ? (
                    <div className="space-y-4">
                      <div className="space-y-2 rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                          Meeting Link
                        </p>
                        {event.meetingLink ? (
                          <a
                            href={event.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start gap-2 break-all text-xs sm:text-sm font-black text-blue-400 underline underline-offset-4"
                          >
                            <span className="break-all">
                              {event.meetingLink}
                            </span>
                            <ExternalLink
                              size={14}
                              className="shrink-0 mt-0.5"
                            />
                          </a>
                        ) : (
                          <p className="text-sm text-slate-400">
                            No link provided
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-2xl border border-white/5 bg-white/5 p-4 sm:p-5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                          Neighborhood
                        </span>
                        <span className="text-xs sm:text-sm font-black uppercase text-white break-words">
                          {event.location?.neighborhood || "Not Specified"}
                        </span>
                      </div>
                      <CoordRow label="Latitude" value={latitude ?? "0.00"} />
                      <CoordRow label="Longitude" value={longitude ?? "0.00"} />
                    </>
                  )}
                </div>
              </div>
              {event.eventFormat !== "online" && latitude && longitude && (
                <div className="h-[260px] sm:h-[320px] lg:h-[400px] w-full xl:w-[400px] shrink-0">
                  <EventMap latitude={latitude} longitude={longitude} />
                </div>
              )}
            </section>
          </div>

          {/* RIGHT CONTROL SIDEBAR */}
          <div className="xl:col-span-4">
            <div className="xl:sticky xl:top-32 space-y-8 sm:space-y-10 rounded-[24px] sm:rounded-[40px] lg:rounded-[56px] border border-slate-100 bg-white p-5 sm:p-8 lg:p-10 shadow-2xl">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 rounded-full bg-yellow-500 px-4 sm:px-5 py-2">
                  <Ticket size={14} className="text-black" />
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-tight text-black">
                    {event.ticketingType}
                  </span>
                </div>
                <CheckCircle2 size={24} className="text-green-500 shrink-0" />
              </div>

              {/* TIERS MAP */}
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] sm:tracking-[0.3em] text-slate-300">
                  Available Tiers
                </p>
                <div className="space-y-3">
                  {event.ticketTiers && event.ticketTiers.length > 0 ? (
                    event.ticketTiers.map((tier, idx) => (
                      <div
                        key={idx}
                        className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-[20px] sm:rounded-[24px] border border-slate-100 bg-slate-50 p-4 sm:p-5 transition-all hover:border-[#0052FF]/30"
                      >
                        <div className="min-w-0">
                          <p className="mb-1 text-[10px] font-black uppercase text-[#0052FF] break-words">
                            {tier.name}
                          </p>
                          <p className="text-xs font-bold text-slate-400">
                            {tier.capacity} Spots
                          </p>
                        </div>
                        <p className="text-lg sm:text-xl font-black italic text-slate-900 shrink-0">
                          {tier.price === 0
                            ? "FREE"
                            : `₦${tier.price.toLocaleString()}`}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center">
                      <p className="text-sm font-bold text-slate-400">
                        No ticket tiers available
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* METRICS STACK */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-6">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center">
                  <p className="mb-1 text-[8px] font-black uppercase tracking-widest text-slate-300">
                    Capacity
                  </p>
                  <p className="text-sm font-black text-slate-900 break-words">
                    {event.totalCapacity || "∞"}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center">
                  <p className="mb-1 text-[8px] font-black uppercase tracking-widest text-slate-300">
                    Sold
                  </p>
                  <p className="text-sm font-black text-[#0052FF]">
                    {event.ticketsSold || 0}
                  </p>
                </div>
              </div>

              {/* ACTIONS SUBMISSION ENGINE */}
              <div className="space-y-4 pt-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => initiateStatusUpdate("approved")}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl sm:rounded-3xl bg-[#0052FF] py-5 sm:py-6 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] sm:tracking-[0.4em] text-white shadow-xl shadow-blue-100 transition-all hover:bg-[#0041CC] disabled:bg-blue-300"
                >
                  {submitting && pendingStatus === "approved" ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={16} />
                  )}
                  Approve Move
                </button>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => initiateStatusUpdate("rejected")}
                  className="w-full rounded-2xl sm:rounded-3xl bg-slate-50 py-5 sm:py-6 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] sm:tracking-[0.4em] text-slate-400 transition-all hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
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

function CoordRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-2xl border border-white/5 bg-white/5 p-4 sm:p-5">
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
        {label}
      </span>
      <span className="font-mono text-xs font-black text-yellow-500 break-all">
        {value}
      </span>
    </div>
  );
}

function ReviewLoader() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="flex flex-col items-center gap-4">
        <Loader2 size={40} className="animate-spin text-[#0052FF]" />
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">
          Loading Metadata Ledger...
        </p>
      </div>
    </div>
  );
}

function ReviewError() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="flex flex-col items-center gap-4 text-center max-w-sm">
        <AlertTriangle size={40} className="text-red-500" />
        <h3 className="text-lg font-black uppercase tracking-tight">
          Record Unreadable
        </h3>
        <p className="text-xs text-slate-400 font-medium">
          The requested information is inaccessible or has been purged from
          active storage logs.
        </p>
      </div>
    </div>
  );
}
