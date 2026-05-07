"use client";

import { useEffect, useState, Suspense, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Ticket,
  ArrowRight,
  Download,
  Share2,
  Info,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import confetti from "canvas-confetti";

// BRAND CONSTANTS
const KIVO_BLUE = "#0052FF";

function VerifyPaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get("reference");
  const ticketRef = useRef<HTMLDivElement>(null);

  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    reference ? "verifying" : "error",
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [ticketData, setTicketData] = useState<any>(null);
  const [attempts, setAttempts] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const isVerifying = useRef(false);

  // Check for the cookie on mount to update the UI text
  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== "undefined") {
        const hasToken = document.cookie
          .split(";")
          .some((item) => item.trim().startsWith("token"));
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
      colors: [KIVO_BLUE, "#000000", "#FFFFFF"],
    });
  };

  const handleShare = async () => {
    const shareData = {
      title: `My Ticket: ${ticketData?.eventTitle}`,
      text: `I'm attending ${ticketData?.eventTitle}! Check it out on Kivo.`,
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

  const handleSavePass = () => {
    window.print();
  };

  const verifyOrder = useCallback(
    async (ref: string) => {
      if (isVerifying.current) return;
      isVerifying.current = true;

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/tickets/verify/${ref}`,
          {
            method: "GET",
            cache: "no-store",
            credentials: "include", // Necessary for cookie-based auth
          },
        );
        const result = await res.json();

        if (result.status === "success") {
          const { order, tickets } = result.data;
          setTicketData({
            eventTitle: order.event.title,
            tierName: order.tierName,
            quantity: order.quantity,
            ticketCode: tickets?.[0]?.checkInCode || "KIVO-PASS",
          });
          setStatus("success");
          triggerCelebration();
        } else if (result.status === "pending" && attempts < 15) {
          isVerifying.current = false;
          setTimeout(() => setAttempts((prev) => prev + 1), 3000);
        } else {
          setStatus("error");
          isVerifying.current = false;
        }
      } catch (error) {
        console.error("Kivo verification error:", error);
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
  }, [reference, attempts, verifyOrder]);

  if (status === "verifying") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
        <div className="relative">
          <Loader2
            className="animate-spin"
            style={{ color: KIVO_BLUE }}
            size={64}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-black rounded-full animate-ping" />
          </div>
        </div>
        <h2 className="mt-8 text-2xl font-black uppercase italic tracking-tighter text-center">
          Securing your spot...
        </h2>
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2 text-center">
          {attempts > 5
            ? "Waiting for bank confirmation..."
            : "Verifying session with Kivo servers"}
        </p>
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
        <p className="text-gray-500 text-sm font-medium mt-2 max-w-xs mx-auto">
          We couldn&apos;t confirm your payment. Check your email for a receipt
          or try refreshing.
        </p>
        <button
          onClick={() => handleMoveNavigation("/profile", "/discover")}
          className="mt-8 px-10 py-5 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-black/20"
        >
          Back to Events
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col items-center justify-center p-6 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-[30px] flex items-center justify-center shadow-xl shadow-green-100/30">
            <CheckCircle size={40} />
          </div>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none text-center">
            Ticket Secured.
          </h1>
          <p className="text-gray-500 font-medium">
            Ready for{" "}
            <span className="text-black font-black uppercase italic">
              {ticketData?.eventTitle}
            </span>
          </p>
        </div>

        {/* Messaging Box - Updated with KIVO_BLUE */}
        <div
          className="border p-4 rounded-2xl flex gap-3 items-start text-left"
          style={{
            backgroundColor: `${KIVO_BLUE}10`,
            borderColor: `${KIVO_BLUE}20`,
          }}
        >
          <Info
            style={{ color: KIVO_BLUE }}
            className="shrink-0 mt-0.5"
            size={18}
          />
          <p
            className="text-[11px] font-bold leading-relaxed uppercase"
            style={{ color: KIVO_BLUE }}
          >
            A confirmation has been sent to your email.{" "}
            {isLoggedIn && "This ticket is also saved to your Kivo profile."}
          </p>
        </div>

        {/* Ticket UI */}
        <div
          ref={ticketRef}
          className="bg-white border-2 border-black rounded-[40px] overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
        >
          <div className="p-8 space-y-6 flex flex-col items-center">
            <div className="w-full flex justify-between items-start text-left">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Access Type
                </p>
                <p className="text-lg font-black uppercase leading-tight italic">
                  {ticketData?.tierName}
                </p>
              </div>
              <div
                className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center"
                style={{ color: KIVO_BLUE }}
              >
                <Ticket size={24} />
              </div>
            </div>

            <div className="bg-white p-4 border-2 border-black rounded-3xl">
              <QRCodeSVG
                value={ticketData?.ticketCode || "KIVO-PASS"}
                size={160}
                level="H"
                includeMargin={false}
              />
            </div>

            <div className="space-y-1 text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Entry Code
              </p>
              <p className="text-2xl font-mono font-black tracking-widest text-black uppercase">
                {ticketData?.ticketCode || "PROCESSING"}
              </p>
            </div>

            <div className="w-full pt-6 border-t border-dashed border-gray-200 flex justify-between items-center">
              <div className="text-left">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Guests
                </p>
                <p className="font-black text-sm uppercase">
                  {ticketData?.quantity} Person(s)
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Status
                </p>
                <p className="font-black text-green-500 uppercase italic text-sm">
                  Active
                </p>
              </div>
            </div>
          </div>
          <div className="bg-black p-4 text-center">
            <p className="text-[9px] font-black text-white uppercase tracking-[0.4em]">
              Scan QR code at the gate
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleSavePass}
            className="flex items-center justify-center gap-2 py-5 bg-gray-100 rounded-3xl font-black text-[10px] uppercase hover:bg-gray-200 transition-colors"
          >
            <Download size={16} /> Save Pass
          </button>
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 py-5 bg-gray-100 rounded-3xl font-black text-[10px] uppercase hover:bg-gray-200 transition-colors"
          >
            <Share2 size={16} /> Share Move
          </button>
        </div>

        {/* Primary Action Button - Kivo Blue */}
        <button
          onClick={() => handleMoveNavigation("/profile", "/discover")}
          className="w-full flex items-center justify-center gap-2 py-6 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-transform active:scale-[0.98]"
          style={{
            backgroundColor: KIVO_BLUE,
            boxShadow: `0 20px 25px -5px ${KIVO_BLUE}33`,
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
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin text-gray-200" />
        </div>
      }
    >
      <VerifyPaymentContent />
    </Suspense>
  );
}
