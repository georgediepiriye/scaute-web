"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  ArrowLeft,
  Loader2,
  Download,
  Share2,
  Calendar,
  Clock,
  MapPin,
} from "lucide-react";
import Navbar from "@/components/layout/NavBar";
import {
  Suspense,
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { QRCodeSVG } from "qrcode.react";
import confetti from "canvas-confetti";
import html2canvas from "html2canvas";
import Image from "next/image";

const SKAUTE_BLUE = "#0052FF";
const SKAUTE_YELLOW = "#FFD700";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ticketRef = useRef<HTMLDivElement>(null);

  // Extract tracking parameters from payment gateways
  const reference = searchParams.get("reference") || searchParams.get("ref");

  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    reference ? "verifying" : "success", // Fallback to raw params if no api tracking reference is present
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [ticket, setTicket] = useState<any>(null);
  const [attempts, setAttempts] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const isVerifying = useRef(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("skaute_token"));
  }, []);

  const triggerCelebration = () => {
    confetti({
      particleCount: 160,
      spread: 90,
      origin: { y: 0.6 },
      colors: [SKAUTE_BLUE, SKAUTE_YELLOW, "#ffffff"],
    });
  };

  // VERIFICATION & POPULATION CHAIN LOGIC
  const verifyAndLoadTicket = useCallback(
    async (ref: string) => {
      if (isVerifying.current) return;
      isVerifying.current = true;

      try {
        const token = localStorage.getItem("skaute_token");
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        // Step 1: Hit the payment verification endpoint
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/tickets/verify/${ref}`,
          {
            method: "GET",
            headers: headers,
            cache: "no-store",
          },
        );
        const result = await res.json();

        if (result.status === "success") {
          const targetTicket = result.data.tickets?.[0];
          const ticketId = targetTicket?._id || targetTicket?.id;

          if (!ticketId) {
            console.error("Missing ticket schema ID from verified payload.");
            setStatus("error");
            isVerifying.current = false;
            return;
          }

          // Step 2: Fetch the clean single ticket schema format matching TicketDetailsPage
          const ticketRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/v1/tickets/${ticketId}`,
            {
              method: "GET",
              headers: headers,
            },
          );
          const ticketResult = await ticketRes.json();

          if (ticketResult.status === "success") {
            setTicket(ticketResult.data);
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
      } catch (err) {
        console.error("Skaute checkout verification chain error:", err);
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
    if (reference && status === "verifying") {
      verifyAndLoadTicket(reference);
    } else if (!reference && status === "success") {
      // Trigger instant confetti fallback if routed with primitive URL configurations
      triggerCelebration();
    }
  }, [reference, attempts, verifyAndLoadTicket, status]);

  // RAW URL SEARCH PARAMETERS FALLBACK CONFIGURATIONS
  const fallbackEventName = searchParams.get("event") || "Premium Event";
  const fallbackTierName = searchParams.get("tier") || "General Access";
  const fallbackQty = searchParams.get("qty") || "1";
  const fallbackVenue = searchParams.get("venue") || "Port Harcourt, Nigeria";
  const fallbackBuyer = searchParams.get("buyer") || "Skaute Guest";
  const fallbackCheckInCode =
    searchParams.get("checkInCode") || reference || "SKAUTE-PASS";
  const fallbackRawDate = searchParams.get("date");

  // DYNAMIC STATE BINDINGS (Prefers verified API data, drops back to fallback params gracefully)
  const eventName = ticket?.event?.title || fallbackEventName;
  const tierName = ticket?.tierName || fallbackTierName;
  const quantity = ticket?.quantity || fallbackQty;
  const venueAddress = ticket?.event?.location?.address || fallbackVenue;
  const buyerName = ticket?.buyerInfo
    ? `${ticket.buyerInfo.firstName} ${ticket.buyerInfo.lastName}`
    : fallbackBuyer;
  const checkInCode = ticket?.checkInCode || fallbackCheckInCode;
  const ticketRefCode = ticket?.ticketCode || reference || "00000";

  // NATIVE DATE & TIME DECOUPLING CONVERSION
  const targetDateObject = ticket?.event?.startDate || fallbackRawDate;

  const formattedEventDate = useMemo(() => {
    if (
      !targetDateObject ||
      targetDateObject === "undefined" ||
      targetDateObject === "null"
    )
      return "DATE TBD";
    return new Date(targetDateObject).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, [targetDateObject]);

  const formattedEventTime = useMemo(() => {
    if (
      !targetDateObject ||
      targetDateObject === "undefined" ||
      targetDateObject === "null"
    )
      return "TIME TBD";
    return new Date(targetDateObject).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [targetDateObject]);

  const handleShare = async () => {
    const shareData = {
      title: `Skaute Ticket - ${eventName}`,
      text: `I'm attending ${eventName} on Skaute!`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log(err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSavePass = async () => {
    if (!ticketRef.current) return;
    setIsSaving(true);
    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 3,
        backgroundColor: "#F4F6FA",
        useCORS: true,
        logging: false,
      });
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `skaute-pass-${ticketRefCode}.png`;
      link.click();
    } catch (err) {
      console.error("Failed to generate ticket image:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (status === "verifying") {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center">
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
        <h2 className="mt-8 text-2xl font-black uppercase italic tracking-tighter">
          Securing your spot...
        </h2>
        <p className="text-gray-400 text-xs uppercase font-black tracking-widest mt-2">
          Finishing transaction verification
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center max-w-sm mx-auto">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[30px] flex items-center justify-center mb-6">
          <XCircle size={40} />
        </div>
        <h2 className="text-2xl font-black uppercase italic tracking-tighter">
          Verification Failed
        </h2>
        <p className="text-gray-500 text-sm mt-2">
          We could not verify your purchase reference. Please check your
          dashboard or profile profile passes.
        </p>
        <button
          onClick={() => router.push("/discover")}
          className="mt-8 w-full py-5 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest"
        >
          Back to Discover
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="space-y-8 relative z-10 max-w-lg mx-auto"
    >
      {/* HEADER SECTION */}
      <div className="text-center space-y-3">
        <div
          className="w-16 h-16 rounded-[2rem] flex items-center justify-center mx-auto shadow-lg shadow-emerald-100"
          style={{ backgroundColor: "#ECFDF5" }}
        >
          <CheckCircle size={32} className="text-emerald-500" />
        </div>
        <h1 className="text-4xl font-black uppercase italic tracking-tight text-slate-900 leading-none">
          Move Secured.
        </h1>
        <p className="text-slate-500 text-sm max-w-xs mx-auto font-medium">
          You are ready to access{" "}
          <span className="font-black text-slate-900 uppercase text-[#0052FF]">
            {eventName}
          </span>
        </p>
      </div>

      {/* PREMIUM TICKET CONTAINER */}
      <div className="relative">
        <div
          className="absolute -inset-[2px] rounded-[2.8rem] opacity-30 blur-xl"
          style={{
            background: `linear-gradient(135deg, ${SKAUTE_BLUE}, ${SKAUTE_YELLOW})`,
          }}
        />

        <div
          ref={ticketRef}
          className="relative rounded-[2.8rem] overflow-hidden bg-white border border-slate-200/60 shadow-[0_30px_70px_rgba(0,0,0,0.06)] text-left"
        >
          {/* TICKET HEADER BAR - BLACK THEME */}
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
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">
                    Premium Access
                  </p>
                  <h1 className="mt-0.5 text-2xl leading-none font-black uppercase italic tracking-tight text-white">
                    Event Pass
                  </h1>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <div
                      className="w-1.5 h-1.5 rounded-full animate-pulse"
                      style={{ backgroundColor: SKAUTE_YELLOW }}
                    />
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                      Skaute Verified
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-[0.15em]"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  borderColor: "rgba(255, 215, 0, 0.3)",
                  color: SKAUTE_YELLOW,
                }}
              >
                Valid
              </div>
            </div>
          </div>

          {/* DYNAMIC PASS EVENT SEGMENT */}
          <div className="px-7 pt-7 pb-4 bg-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">
                  Event
                </p>
                <h2 className="mt-2 text-2xl leading-tight font-black uppercase tracking-tight text-slate-900 line-clamp-2">
                  {eventName}
                </h2>
              </div>
              <div
                className="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-sm flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${SKAUTE_BLUE}, #2563eb)`,
                  color: "#fff",
                }}
              >
                {tierName}
              </div>
            </div>
          </div>

          {/* PERFORATION SEPARATOR */}
          <div className="relative py-2.5 bg-white">
            <div className="absolute left-0 top-1/2 w-7 h-7 bg-[#FDFDFD] rounded-full -translate-x-1/2 -translate-y-1/2 z-10 border-r border-slate-200/60" />
            <div className="absolute right-0 top-1/2 w-7 h-7 bg-[#FDFDFD] rounded-full translate-x-1/2 -translate-y-1/2 z-10 border-l border-slate-200/60" />
            <div className="mx-7 border-t border-dashed border-slate-200" />
          </div>

          {/* PASS CREDENTIAL DETAILS */}
          <div className="px-7 pb-7 bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-5 items-center">
              <div className="flex justify-center">
                <div className="relative">
                  <div
                    className="absolute inset-0 rounded-[1.8rem] blur-lg opacity-15"
                    style={{
                      background: `linear-gradient(135deg, ${SKAUTE_BLUE}, ${SKAUTE_YELLOW})`,
                    }}
                  />
                  <div className="relative bg-white p-3.5 rounded-[1.8rem] border border-slate-100 shadow-[0_12px_28px_rgba(0,0,0,0.04)]">
                    <QRCodeSVG
                      value={checkInCode}
                      size={115}
                      level="H"
                      fgColor="#0e172c"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">
                    Entry Code
                  </p>
                  <p
                    className="mt-0.5 text-xs font-black font-mono tracking-wider break-all uppercase"
                    style={{ color: SKAUTE_BLUE }}
                  >
                    {checkInCode}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="flex items-center gap-1 mb-0.5">
                      <Calendar size={11} color={SKAUTE_BLUE} />
                      <p className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-400">
                        Date
                      </p>
                    </div>
                    <p className="text-xs font-black uppercase text-slate-800">
                      {formattedEventDate}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 mb-0.5">
                      <Clock size={11} color={SKAUTE_BLUE} />
                      <p className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-400">
                        Time
                      </p>
                    </div>
                    <p className="text-xs font-black uppercase text-slate-800">
                      {formattedEventTime}
                    </p>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-0.5">
                    <MapPin size={11} color={SKAUTE_BLUE} />
                    <p className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-400">
                      Venue
                    </p>
                  </div>
                  <p className="text-xs font-black uppercase leading-tight text-slate-800 line-clamp-2">
                    {venueAddress}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* LOWER DECK BACKDROP WRAPPER */}
          <div className="relative border-t border-slate-100 bg-slate-50/80 overflow-hidden">
            <div
              className="absolute top-0 left-0 w-full h-[2px]"
              style={{
                background: `linear-gradient(90deg, ${SKAUTE_BLUE}, ${SKAUTE_YELLOW})`,
              }}
            />
            <div className="px-7 py-4 flex items-center justify-between">
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-400">
                  Admit One
                </p>
                <p className="mt-0.5 text-xs font-black uppercase text-slate-900">
                  {buyerName}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-400">
                  Ticket ID
                </p>
                <p className="mt-0.5 text-[10px] font-mono font-bold text-slate-500">
                  #{ticketRefCode}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CORE UTILITY CONTROLS */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handleSavePass}
          disabled={isSaving}
          className="flex items-center justify-center gap-2 py-4 rounded-2xl border border-slate-200 bg-white text-slate-700 font-black text-[10px] uppercase tracking-[0.15em] transition hover:bg-slate-50 hover:text-black shadow-sm disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Download size={14} />
          )}
          Save Pass
        </button>
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-black text-[10px] uppercase tracking-[0.15em] shadow-lg shadow-blue-600/10 transition hover:opacity-95"
          style={{
            background: `linear-gradient(135deg, ${SKAUTE_BLUE}, #003cff)`,
          }}
        >
          <Share2 size={14} />
          Share Pass
        </button>
      </div>

      <button
        onClick={() => router.push("/discover")}
        className="w-full py-5 rounded-2xl text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-2 transition hover:opacity-95"
        style={{
          backgroundColor: SKAUTE_BLUE,
          boxShadow: `0 15px 30px -5px ${SKAUTE_BLUE}33`,
        }}
      >
        <ArrowLeft size={14} /> Back to Discover
      </button>
    </motion.div>
  );
}

export default function BookingSuccessPage() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] relative overflow-hidden">
      <div
        className="fixed top-[-150px] right-[-100px] w-[350px] h-[350px] rounded-full blur-3xl opacity-5 pointer-events-none"
        style={{ backgroundColor: SKAUTE_BLUE }}
      />
      <div
        className="fixed bottom-[-150px] left-[-100px] w-[350px] h-[350px] rounded-full blur-3xl opacity-5 pointer-events-none"
        style={{ backgroundColor: SKAUTE_YELLOW }}
      />

      <Navbar />
      <main className="max-w-2xl mx-auto px-4 pt-32 pb-20 relative z-10">
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center p-20">
              <Loader2
                className="animate-spin"
                style={{ color: SKAUTE_BLUE }}
                size={32}
              />
              <p className="mt-4 text-[9px] font-black uppercase tracking-widest text-gray-400">
                Generating your pass...
              </p>
            </div>
          }
        >
          <SuccessContent />
        </Suspense>
      </main>
    </div>
  );
}
