"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import {
  ChevronLeft,
  MapPin,
  Calendar,
  Clock,
  Download,
  Share2,
  ShieldCheck,
  XCircle,
  RefreshCcw,
} from "lucide-react";
import Navbar from "@/components/layout/NavBar";
import toast from "react-hot-toast";
import { TICKET_STATUS } from "@/lib/constants";

const SKAUTE_BLUE = "#0052FF";
const SKAUTE_YELLOW = "#FFD700";

export default function TicketDetailsPage() {
  const params = useParams();
  const router = useRouter();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const token = localStorage.getItem("skaute_token");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/tickets/${params.id}`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            credentials: "include",
          },
        );

        const data = await res.json();

        if (data.status === "success") {
          setTicket(data.data);
        } else {
          toast.error("Unable to load ticket");
          router.push("/");
        }
      } catch (e) {
        toast.error("Network error");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchTicket();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F6FA]">
        <p
          className="text-[10px] font-black uppercase tracking-[0.4em] animate-pulse"
          style={{ color: SKAUTE_BLUE }}
        >
          Loading Pass...
        </p>
      </div>
    );
  }

  if (!ticket) return null;

  const statusKey = (ticket.status as keyof typeof TICKET_STATUS) || "valid";

  const status = TICKET_STATUS[statusKey] || {
    label: "Valid",
    color: SKAUTE_BLUE,
  };

  const eventDate = ticket.event?.startDate
    ? new Date(ticket.event.startDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "TBD";

  const eventTime = ticket.event?.startDate
    ? new Date(ticket.event.startDate).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "TBD";

  return (
    <div className="min-h-screen bg-[#F4F6FA] pb-24 overflow-hidden text-slate-800">
      <Navbar />

      {/* BACKGROUND BRAND GLOWS */}
      <div
        className="fixed top-[-200px] right-[-120px] w-[400px] h-[400px] rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ backgroundColor: SKAUTE_BLUE }}
      />

      <div
        className="fixed bottom-[-200px] left-[-120px] w-[400px] h-[400px] rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ backgroundColor: SKAUTE_YELLOW }}
      />

      <main className="relative max-w-lg mx-auto px-5 pt-28">
        {/* BACK NAV */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-slate-900 mb-8 transition"
        >
          <ChevronLeft size={15} />
          Back
        </button>

        {/* TICKET CONTAINER WRAPPER */}
        <div className="relative">
          {/* OUTER ACCENT SHADOW */}
          <div
            className="absolute -inset-[2px] rounded-[2.8rem] opacity-30 blur-xl"
            style={{
              background: `linear-gradient(135deg, ${SKAUTE_BLUE}, ${SKAUTE_YELLOW})`,
            }}
          />

          {/* MAIN TICKET ELEMENT */}
          <div className="relative rounded-[2.8rem] overflow-hidden bg-white border border-slate-200/60 shadow-[0_30px_70px_rgba(0,0,0,0.06)]">
            {/* TICKET HEADER BAR - SWITCHED TO BLACK THEME */}
            <div className="relative overflow-hidden bg-slate-950 border-b border-slate-900">
              {/* TOP ACCENT STRIP */}
              <div
                className="absolute top-0 left-0 w-full h-[3px]"
                style={{
                  background: `linear-gradient(90deg, ${SKAUTE_BLUE}, ${SKAUTE_YELLOW})`,
                }}
              />

              <div className="relative px-6 py-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* SQUARE REMOVED - NATIVE LOGO EMBEDDED & ENLARGED */}
                  <div className="relative flex items-center justify-center overflow-hidden">
                    <Image
                      src="/images/skaute_logo.webp"
                      alt="Skaute"
                      width={88}
                      height={88}
                      className="object-contain"
                      priority
                    />
                  </div>

                  {/* HEADER META LABELS - ALIGNED TEXT COLORS FOR DARK THEME */}
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">
                      Premium Access
                    </p>

                    <h1 className="mt-0.5 text-3xl leading-none font-black uppercase italic tracking-tight text-white">
                      Event Pass
                    </h1>

                    <div className="flex items-center gap-2 mt-2">
                      <div
                        className="w-1.5 h-1.5 rounded-full animate-pulse"
                        style={{ backgroundColor: SKAUTE_YELLOW }}
                      />

                      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                        Skaute Verified
                      </p>
                    </div>
                  </div>
                </div>

                {/* ACTIVE STATUS BADGE */}
                <div
                  className="px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-[0.2em]"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    borderColor:
                      statusKey === "valid"
                        ? "rgba(255, 215, 0, 0.3)"
                        : "rgba(255, 255, 255, 0.1)",
                    color: statusKey === "valid" ? SKAUTE_YELLOW : "#fff",
                  }}
                >
                  {statusKey === "valid" && (
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full animate-pulse"
                        style={{ backgroundColor: SKAUTE_YELLOW }}
                      />
                      {status.label}
                    </div>
                  )}

                  {statusKey === "used" && (
                    <div className="flex items-center gap-2 text-emerald-400">
                      <ShieldCheck size={12} />
                      {status.label}
                    </div>
                  )}

                  {statusKey === "cancelled" && (
                    <div className="flex items-center gap-2 text-rose-400">
                      <XCircle size={12} />
                      {status.label}
                    </div>
                  )}

                  {statusKey === "refunded" && (
                    <div className="flex items-center gap-2 text-amber-400">
                      <RefreshCcw size={12} />
                      {status.label}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* EVENT SECTION DESCRIPTION */}
            <div className="px-7 pt-8 pb-5 bg-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                    Event
                  </p>

                  <h2 className="mt-3 text-[1.85rem] leading-none font-black uppercase tracking-tight text-slate-900">
                    {ticket.event?.title}
                  </h2>
                </div>

                <div
                  className="px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${SKAUTE_BLUE}, #2563eb)`,
                    color: "#fff",
                  }}
                >
                  {ticket.tierName}
                </div>
              </div>
            </div>

            {/* STRUCTURAL GEOMETRIC CUT LINE */}
            <div className="relative py-3 bg-white">
              {/* SIDE SEMI-CIRCLE HOLES */}
              <div className="absolute left-0 top-1/2 w-8 h-8 bg-[#F4F6FA] rounded-full -translate-x-1/2 -translate-y-1/2 z-10 border-r border-slate-200/60" />

              <div className="absolute right-0 top-1/2 w-8 h-8 bg-[#F4F6FA] rounded-full translate-x-1/2 -translate-y-1/2 z-10 border-l border-slate-200/60" />

              {/* PERFORATION DASH */}
              <div className="mx-7 border-t border-dashed border-slate-200" />
            </div>

            {/* SECURE SYSTEM BODY CREDENTIALS */}
            <div className="px-7 pb-8 bg-white">
              <div className="grid grid-cols-[165px_1fr] gap-6 items-center">
                {/* QR ACCESS GRID PORTAL */}
                <div className="flex justify-center">
                  <div className="relative">
                    <div
                      className="absolute inset-0 rounded-[2rem] blur-xl opacity-20"
                      style={{
                        background: `linear-gradient(135deg, ${SKAUTE_BLUE}, ${SKAUTE_YELLOW})`,
                      }}
                    />

                    <div className="relative bg-white p-4 rounded-[2rem] border border-slate-100 shadow-[0_15px_35px_rgba(0,0,0,0.05)]">
                      <QRCodeSVG
                        value={ticket.checkInCode}
                        size={140}
                        level="H"
                        fgColor="#0e172c"
                      />
                    </div>
                  </div>
                </div>

                {/* ADMITTANCE PARAMETER DETAILED ENTRIES */}
                <div className="space-y-5">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">
                      Entry Code
                    </p>

                    <p
                      className="mt-1 text-sm font-black font-mono tracking-wider break-all"
                      style={{ color: SKAUTE_BLUE }}
                    >
                      {ticket.checkInCode}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* DATE COLUMN */}
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Calendar size={12} color={SKAUTE_BLUE} />

                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                          Date
                        </p>
                      </div>

                      <p className="text-sm font-black uppercase text-slate-800">
                        {eventDate}
                      </p>
                    </div>

                    {/* TIME COLUMN */}
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Clock size={12} color={SKAUTE_BLUE} />

                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                          Time
                        </p>
                      </div>

                      <p className="text-sm font-black uppercase text-slate-800">
                        {eventTime}
                      </p>
                    </div>
                  </div>

                  {/* VENUE COLUMN */}
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <MapPin size={12} color={SKAUTE_BLUE} />

                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                        Venue
                      </p>
                    </div>

                    <p className="text-sm font-black uppercase leading-relaxed text-slate-800">
                      {ticket.event?.location?.address ||
                        "Port Harcourt, Nigeria"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* EXCLUSIVE REAR SUMMARY FOOTER */}
            <div className="relative border-t border-slate-100 bg-slate-50/80 overflow-hidden">
              {/* LOWER ACCENT STRIP */}
              <div
                className="absolute top-0 left-0 w-full h-[2px]"
                style={{
                  background: `linear-gradient(90deg, ${SKAUTE_BLUE}, ${SKAUTE_YELLOW})`,
                }}
              />

              <div className="px-7 py-5 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">
                    Admit One
                  </p>

                  <p className="mt-1 text-sm font-black uppercase text-slate-900">
                    {ticket.buyerInfo?.firstName} {ticket.buyerInfo?.lastName}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">
                    Ticket ID
                  </p>

                  <p className="mt-1 text-[11px] font-mono font-bold text-slate-500">
                    #{ticket.ticketCode}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* NOTIFICATION FEEDBACK REGISTRY BANNER */}
        <div className="mt-7 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] leading-relaxed text-slate-600">
            Your ticket has been sent to your email and is ready for entry
            verification at the venue.
          </p>
        </div>

        {/* PRIMARY UTILITY DISPATCH ACTIONS */}
        <div className="grid grid-cols-2 gap-4 mt-7">
          <button className="flex items-center justify-center gap-2 py-5 rounded-[1.5rem] border border-slate-200 bg-white text-slate-700 font-black text-[10px] uppercase tracking-[0.2em] transition hover:bg-slate-50 hover:text-black shadow-sm">
            <Download size={15} />
            Save Ticket
          </button>

          <button
            className="flex items-center justify-center gap-2 py-5 rounded-[1.5rem] text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-blue-600/10 transition hover:scale-[1.02]"
            style={{
              background: `linear-gradient(135deg, ${SKAUTE_BLUE}, #003cff)`,
            }}
          >
            <Share2 size={15} />
            Share Pass
          </button>
        </div>
      </main>
    </div>
  );
}
