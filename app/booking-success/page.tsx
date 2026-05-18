"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Ticket,
  ArrowLeft,
  Loader2,
  Download,
  Share2,
} from "lucide-react";
import Navbar from "@/components/layout/NavBar";
import { Suspense, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import confetti from "canvas-confetti";

// SKAUTE BRAND CONSTANTS
const SKAUTE_BLUE = "#0052FF";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // GET URL PARAMETERS
  const rawCheckInCode = searchParams.get("checkInCode");
  const refCode = searchParams.get("ref");
  const eventName = searchParams.get("event") || "Your Move";

  // FAIL-SAFE IMPLEMENTATION:
  // If checkInCode parameter is explicitly empty or null, instantly fallback to the Order Reference string.
  const checkInCode =
    rawCheckInCode && rawCheckInCode.trim() !== ""
      ? rawCheckInCode
      : refCode || "KIVO-PASS";

  // Fire celebration animation context on mount
  useEffect(() => {
    // Left side burst
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { x: 0.1, y: 0.6 },
      colors: [SKAUTE_BLUE, "#22C55E", "#FACC15", "#000000"],
    });

    // Right side burst
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { x: 0.9, y: 0.6 },
      colors: [SKAUTE_BLUE, "#22C55E", "#FACC15", "#000000"],
    });
  }, []);

  const handleSavePass = () => {
    window.print();
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="space-y-8"
    >
      <div className="text-center space-y-4">
        <div
          className="w-20 h-20 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-xl shadow-green-100/50"
          style={{ backgroundColor: "#ECFDF5" }}
        >
          <CheckCircle size={40} className="text-emerald-500" />
        </div>

        <h1 className="text-5xl font-black uppercase tracking-tighter italic leading-none">
          Move Secured.
        </h1>
        <p className="text-gray-500 font-medium max-w-xs mx-auto">
          You&apos;re all set for{" "}
          <span className="text-black font-bold uppercase">{eventName}</span>.
          Check your email for full details.
        </p>
      </div>

      {/* TICKET UI SECTION */}
      <div className="relative max-w-sm mx-auto">
        <div className="bg-white border-2 border-black rounded-[40px] overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-8 space-y-6 flex flex-col items-center">
            {/* Ticket Header */}
            <div className="w-full flex justify-between items-center pb-4 border-b border-dashed border-gray-200">
              <div className="text-left">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Kivo Entry Pass
                </p>
                <p className="font-black uppercase italic text-sm">
                  Valid Entry
                </p>
              </div>
              <Ticket style={{ color: SKAUTE_BLUE }} size={24} />
            </div>

            {/* QR Code */}
            <div className="bg-white p-4 border-2 border-black rounded-3xl">
              <QRCodeSVG
                value={checkInCode}
                size={160}
                level="H"
                includeMargin={false}
              />
            </div>

            {/* Ticket ID */}
            <div className="space-y-1 text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Check-In Code
              </p>
              <p className="text-xl font-mono font-black tracking-widest text-black uppercase">
                {checkInCode}
              </p>
            </div>
          </div>

          {/* Ticket Footer */}
          <div className="bg-black p-4 text-center">
            <p className="text-[9px] font-black text-white uppercase tracking-[0.4em]">
              Scan at the gate
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
        <button
          onClick={handleSavePass}
          className="flex items-center justify-center gap-2 py-4 bg-gray-100 rounded-2xl font-black text-[10px] uppercase hover:bg-gray-200 transition-colors"
        >
          <Download size={16} /> Save
        </button>
        <button className="flex items-center justify-center gap-2 py-4 bg-gray-100 rounded-2xl font-black text-[10px] uppercase hover:bg-gray-200 transition-colors">
          <Share2 size={16} /> Share
        </button>
      </div>

      <button
        onClick={() => router.push("/discover")}
        className="w-full max-w-sm mx-auto py-6 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        style={{
          backgroundColor: SKAUTE_BLUE,
          boxShadow: `0 20px 25px -5px ${SKAUTE_BLUE}33`,
        }}
      >
        <ArrowLeft size={16} /> Back to Discover
      </button>
    </motion.div>
  );
}

export default function BookingSuccessPage() {
  return (
    <div className="min-h-screen bg-[#FDFDFD]">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 pt-32 pb-20">
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center p-20">
              <Loader2
                className="animate-spin"
                style={{ color: SKAUTE_BLUE }}
                size={32}
              />
              <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
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
