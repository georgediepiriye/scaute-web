"use client";

import { useEffect, useState, Suspense, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  CheckCircle,
  XCircle,
  Loader2,
  ArrowRight,
  Download,
  Share2,
  Info,
  MapPin,
  Calendar,
  Clock,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import confetti from "canvas-confetti";
import html2canvas from "html2canvas";

// BRAND CONSTANTS
const SKAUTE_BLUE = "#0052FF";
const SKAUTE_YELLOW = "#FFD700";

function VerifyPaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get("reference");
  const ticketRef = useRef<HTMLDivElement>(null);

  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    reference ? "verifying" : "error",
  );
  // Using the exact same flat 'ticket' schema structure as your TicketDetailsPage
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [ticket, setTicket] = useState<any>(null);
  const [attempts, setAttempts] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isVerifying = useRef(false);

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== "undefined") {
        const hasToken = !!localStorage.getItem("skaute_token");
        setIsLoggedIn(hasToken);
      }
    };
    checkAuth();
  }, []);

  const handleMoveNavigation = (authPath: string, guestPath: string) => {
    if (isLoggedIn) {
      router.push(authPath);
    } else {
      router.push(guestPath);
    }
  };

  const triggerCelebration = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: [SKAUTE_BLUE, SKAUTE_YELLOW, "#000000"],
    });
  };

  const handleShare = async () => {
    if (!ticket) return;
    const shareData = {
      title: `My Ticket: ${ticket.event?.title}`,
      text: `I'm attending ${ticket.event?.title}! Check it out on skaute.`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handleSavePass = async () => {
    if (!ticketRef.current) return;

    setIsSaving(true);
    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 3,
        backgroundColor: "#FFFFFF",
        useCORS: true,
        logging: false,
      });

      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `skaute-Ticket-${ticket.event?.title || "Pass"}.png`;
      link.click();
    } catch (err) {
      console.error("Failed to save ticket:", err);
      window.print();
    } finally {
      setIsSaving(false);
    }
  };

  const verifyOrder = useCallback(
    async (ref: string) => {
      if (isVerifying.current) return;
      isVerifying.current = true;

      try {
        const token = localStorage.getItem("skaute_token");
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        // Step 1: Verify the payment reference
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/tickets/verify/${ref}`,
          {
            method: "GET",
            headers: headers,
            cache: "no-store",
            credentials: "include",
          },
        );
        const result = await res.json();

        if (result.status === "success") {
          const targetTicket = result.data.tickets?.[0];
          const ticketId = targetTicket?._id || targetTicket?.id;

          if (!ticketId) {
            console.error("No ticket reference ID found in verification data.");
            setStatus("error");
            isVerifying.current = false;
            return;
          }

          // Step 2: Make the secondary call to fetch the fully populated single ticket details
          const ticketRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/v1/tickets/${ticketId}`,
            {
              method: "GET",
              headers: headers,
              credentials: "include",
            },
          );
          const ticketResult = await ticketRes.json();

          if (ticketResult.status === "success") {
            setTicket(ticketResult.data); // Hydrates with the clean data payload
            setStatus("success");
            triggerCelebration();
          } else {
            setStatus("error");
          }
          isVerifying.current = false;
        } else if (result.status === "pending" && attempts < 15) {
          isVerifying.current = false;
          setTimeout(() => setAttempts((prev) => prev + 1), 3000);
        } else {
          setStatus("error");
          isVerifying.current = false;
        }
      } catch (error) {
        console.error("skaute verification chain error:", error);
        isVerifying.current = false;
        if (attempts >= 15) {
          setStatus("error");
        } else {
          setTimeout(() => setAttempts((prev) => prev + 1), 3000);
        }
      }
    },
    [attempts],
  );

  useEffect(() => {
    const performVerification = async () => {
      if (reference && status === "verifying") {
        await verifyOrder(reference);
      }
    };
    performVerification();
  }, [reference, attempts, verifyOrder, status]);

  if (status === "verifying") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
        <div className="relative">
          <Loader2
            className="animate-spin"
            style={{ color: SKAUTE_BLUE }}
            size={64}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-black rounded-full animate-ping" />
          </div>
        </div>
        <h2 className="mt-8 text-2xl font-black uppercase italic tracking-tighter text-center">
          Securing your spot...
        </h2>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[30px] flex items-center justify-center mb-6 mx-auto">
          <XCircle size={40} />
        </div>
        <h2 className="text-2xl font-black uppercase italic tracking-tighter">
          Verification Failed
        </h2>
        <button
          onClick={() => handleMoveNavigation("/profile", "/discover")}
          className="mt-8 px-10 py-5 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest"
        >
          Back to Events
        </button>
      </div>
    );
  }

  // --- EXACT DATA FORMATTING FROM YOUR TICKET DETAILS PAGE ---
  const eventDate = ticket?.event?.startDate
    ? new Date(ticket.event.startDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "TBD";

  const eventTime = ticket?.event?.startDate
    ? new Date(ticket.event.startDate).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "TBD";

  return (
    <div className="min-h-screen bg-[#F4F6FA] pb-24 overflow-hidden text-slate-800 flex flex-col items-center justify-center p-6 py-12 relative">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-ticket,
          .printable-ticket * {
            visibility: visible;
          }
          .printable-ticket {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      {/* BACKGROUND BRAND GLOWS */}
      <div
        className="fixed top-[-200px] right-[-120px] w-[400px] h-[400px] rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ backgroundColor: SKAUTE_BLUE }}
      />
      <div
        className="fixed bottom-[-200px] left-[-120px] w-[400px] h-[400px] rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ backgroundColor: SKAUTE_YELLOW }}
      />

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-[30px] flex items-center justify-center shadow-xl">
            <CheckCircle size={40} />
          </div>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none text-center text-slate-900">
            Ticket Secured.
          </h1>
          <p className="text-gray-500 font-medium">
            Ready for{" "}
            <span className="text-black font-black uppercase italic text-[#0052FF]">
              {ticket?.event?.title || "Your Move"}
            </span>
          </p>
        </div>

        {/* EMAIL CONFIRMATION NOTICE */}
        <div
          className="border p-4 rounded-2xl flex gap-3 items-start text-left bg-white"
          style={{
            backgroundColor: `${SKAUTE_BLUE}10`,
            borderColor: `${SKAUTE_BLUE}20`,
          }}
        >
          <Info
            style={{ color: SKAUTE_BLUE }}
            className="shrink-0 mt-0.5"
            size={18}
          />
          <p
            className="text-[11px] font-bold leading-relaxed uppercase"
            style={{ color: SKAUTE_BLUE }}
          >
            A confirmation has been sent to your email.{" "}
            {isLoggedIn && "This ticket is also saved to your profile."}
          </p>
        </div>

        {/* PREMIUM TICKET CONTAINER WRAPPER */}
        <div className="relative">
          <div
            className="absolute -inset-[2px] rounded-[2.8rem] opacity-30 blur-xl"
            style={{
              background: `linear-gradient(135deg, ${SKAUTE_BLUE}, ${SKAUTE_YELLOW})`,
            }}
          />

          {/* MAIN TICKET ELEMENT */}
          <div
            ref={ticketRef}
            className="printable-ticket relative rounded-[2.8rem] overflow-hidden bg-white border border-slate-200/60 shadow-[0_30px_70px_rgba(0,0,0,0.06)]"
          >
            {/* TICKET HEADER BAR */}
            <div className="relative overflow-hidden bg-slate-950 border-b border-slate-900">
              <div
                className="absolute top-0 left-0 w-full h-[3px]"
                style={{
                  background: `linear-gradient(90deg, ${SKAUTE_BLUE}, ${SKAUTE_YELLOW})`,
                }}
              />
              <div className="relative px-6 py-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
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
                <div className="px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 border-[rgba(255,215,0,0.3)] bg-[rgba(255,255,255,0.05)] text-[#FFD700]">
                  <div
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: SKAUTE_YELLOW }}
                  />
                  Valid
                </div>
              </div>
            </div>

            {/* EVENT SECTION DESCRIPTION */}
            <div className="px-7 pt-8 pb-5 bg-white text-left">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                    Event
                  </p>
                  <h2 className="mt-3 text-[1.85rem] leading-none font-black uppercase tracking-tight text-slate-900 line-clamp-2">
                    {ticket?.event?.title}
                  </h2>
                </div>
                <div
                  className="px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${SKAUTE_BLUE}, #2563eb)`,
                    color: "#fff",
                  }}
                >
                  {ticket?.tierName}
                </div>
              </div>
            </div>

            {/* PERFORATION SEPARATOR */}
            <div className="relative py-3 bg-white">
              <div className="absolute left-0 top-1/2 w-8 h-8 bg-[#F4F6FA] rounded-full -translate-x-1/2 -translate-y-1/2 z-10 border-r border-slate-200/60" />
              <div className="absolute right-0 top-1/2 w-8 h-8 bg-[#F4F6FA] rounded-full translate-x-1/2 -translate-y-1/2 z-10 border-l border-slate-200/60" />
              <div className="mx-7 border-t border-dashed border-slate-200" />
            </div>

            {/* SECURE SYSTEM BODY CREDENTIALS */}
            <div className="px-7 pb-8 bg-white text-left">
              <div className="grid grid-cols-1 sm:grid-cols-[165px_1fr] gap-6 items-center">
                {/* QR CODE */}
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
                        value={ticket?.checkInCode || "skaute-PASS"}
                        size={140}
                        level="H"
                        fgColor="#0e172c"
                      />
                    </div>
                  </div>
                </div>

                {/* PARAMETERS */}
                <div className="space-y-5">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">
                      Entry Code
                    </p>
                    <p className="mt-1 text-sm font-black font-mono tracking-wider break-all text-[#0052FF]">
                      {ticket?.checkInCode}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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

                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <MapPin size={12} color={SKAUTE_BLUE} />
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                        Venue
                      </p>
                    </div>
                    <p className="text-sm font-black uppercase leading-relaxed text-slate-800 line-clamp-2">
                      {ticket?.event?.location?.address ||
                        "Port Harcourt, Nigeria"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* SUMMARY FOOTER */}
            <div className="relative border-t border-slate-100 bg-slate-50/80 overflow-hidden text-left">
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
                    {ticket?.buyerInfo
                      ? `${ticket.buyerInfo.firstName} ${ticket.buyerInfo.lastName}`
                      : "Guest Attendee"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">
                    Ticket ID
                  </p>
                  <p className="mt-1 text-[11px] font-mono font-bold text-slate-500">
                    #{ticket?.ticketCode || "00000"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* UTILITY DISPATCH ACTIONS */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleSavePass}
            disabled={isSaving}
            className="flex items-center justify-center gap-2 py-5 bg-white border border-slate-200 text-slate-700 rounded-3xl font-black text-[10px] uppercase hover:bg-gray-50 hover:text-black transition-colors disabled:opacity-50 shadow-sm"
          >
            {isSaving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}
            {isSaving ? "Saving..." : "Save Pass"}
          </button>
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 py-5 bg-white border border-slate-200 text-slate-700 rounded-3xl font-black text-[10px] uppercase hover:bg-gray-50 hover:text-black transition-colors shadow-sm"
          >
            <Share2 size={16} /> Share Move
          </button>
        </div>

        <button
          onClick={() => handleMoveNavigation("/profile", "/discover")}
          className="w-full flex items-center justify-center gap-2 py-6 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-[1.01] active:scale-[1.0] transition-all"
          style={{
            backgroundColor: SKAUTE_BLUE,
            boxShadow: `0 20px 25px -5px ${SKAUTE_BLUE}33`,
          }}
        >
          Return to City <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

export default function VerifyPaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F4F6FA]">
          <Loader2 className="animate-spin text-gray-300" size={32} />
        </div>
      }
    >
      <VerifyPaymentContent />
    </Suspense>
  );
}
