/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Html5Qrcode } from "html5-qrcode";
import {
  ChevronLeft,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  Keyboard,
  Camera,
  ArrowRight,
  Loader2,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { db } from "@/lib/db";
import AuthGuard from "@/components/auth/AuthGuard";

export default function TicketScannerPage() {
  const params = useParams();
  const router = useRouter();

  // Next.js Routing Shield: Resolves dynamic path parameters regardless of folder naming configuration
  const targetEventId = (params.id || params.eventId) as string;

  // --- STATE ---
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    guestName?: string;
    tier?: string;
    message?: string;
  } | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [syncStatus, setSyncStatus] = useState<"syncing" | "idle" | "error">(
    "idle",
  );

  // --- REFS ---
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const processingRef = useRef(false);
  const hasFetchedOnMount = useRef(false);

  const playSound = (type: "success" | "error") => {
    if (typeof window === "undefined") return;
    const ctx = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(
      type === "success" ? 880 : 220,
      ctx.currentTime,
    );

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  };

  // --- SYNC ENGINE (PULL GUESTLIST DOWN) ---
  const performSync = useCallback(
    async (manual = false) => {
      if (!targetEventId || syncStatus === "syncing") return;
      setSyncStatus("syncing");

      try {
        const lastTicket = await db.tickets.orderBy("updatedAt").last();
        const since = lastTicket?.updatedAt ? lastTicket.updatedAt : 0;

        const token = localStorage.getItem("kivo_token");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/tickets/event/${targetEventId}/sync?since=${since}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          },
        );

        const result = await res.json();

        if (result.status === "success" && result.data.length > 0) {
          await db.tickets.bulkPut(
            result.data.map((t: any) => ({
              id: t._id,
              eventId: targetEventId,
              checkInCode: t.checkInCode,
              guestName: t.buyerInfo
                ? `${t.buyerInfo.firstName} ${t.buyerInfo.lastName}`
                : "Guest",
              tier: t.tierName,
              status: t.status,
              updatedAt: t.updatedAt
                ? new Date(t.updatedAt).getTime()
                : Date.now(),
            })),
          );
          if (manual) toast.success(`Synced ${result.data.length} new guests`);
        } else if (manual) {
          toast.success("Guestlist up to date");
        }
        setSyncStatus("idle");
      } catch (err) {
        setSyncStatus("error");
        if (manual) toast.error("Sync failed. Check connection.");
      }
    },
    [targetEventId, syncStatus],
  );

  useEffect(() => {
    if (!hasFetchedOnMount.current && targetEventId) {
      hasFetchedOnMount.current = true;
      performSync(false);
    }
  }, [performSync, targetEventId]);

  // --- CORE VALIDATION LOGIC ---
  const processValidation = useCallback(
    async (code: string) => {
      if (processingRef.current) return;

      const cleanCode = code.trim().toUpperCase();
      if (cleanCode.length < 5) return;

      processingRef.current = true;
      setIsProcessing(true);

      const token = localStorage.getItem("kivo_token");

      try {
        // 1. Primary Path: Validate against Live Database
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/v1/tickets/check-in/${targetEventId}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify({ checkInCode: cleanCode }),
            },
          );

          const result = await response.json();

          if (response.ok && result.status === "success") {
            const remoteData = result.data;

            // Resolve existing ticket key to maintain structure integrity inside IndexedDB
            const ticketInDb = await db.tickets
              .where("checkInCode")
              .equals(cleanCode)
              .filter((t) => t.eventId === targetEventId)
              .first();

            await db.tickets.put({
              id: ticketInDb?.id || remoteData._id || Math.random().toString(),
              eventId: targetEventId,
              checkInCode: cleanCode,
              guestName: remoteData.guestName,
              tier: remoteData.tier,
              status: "used",
              updatedAt: Date.now(),
            });

            playSound("success");
            setLastResult({
              success: true,
              guestName: remoteData.guestName,
              tier: remoteData.alreadyProcessed
                ? "⚠️ ALREADY VERIFIED (WITHIN 2 MINS)"
                : remoteData.tier,
            });
            return;
          } else {
            // Catches AppError models (e.g., 400, 403, 404, 409 Conflict) from your service layer
            playSound("error");
            setLastResult({
              success: false,
              message: result.message || "INVALID TICKET",
            });
            return;
          }
        } catch (networkError) {
          // 2. Fallback Path: Offline Verification Mode (Runs only when remote API is unreachable)
          const localTicket = await db.tickets
            .where("checkInCode")
            .equals(cleanCode)
            .filter((t) => t.eventId === targetEventId)
            .first();

          if (!localTicket) {
            playSound("error");
            setLastResult({
              success: false,
              message: "NOT FOUND IN OFFLINE CACHE",
            });
            return;
          }

          // Evaluate offline cache rules
          if (
            localTicket.status === "used" ||
            localTicket.status === "checked-in"
          ) {
            playSound("error");
            setLastResult({
              success: false,
              guestName: localTicket.guestName,
              message: "ALREADY CHECKED IN (OFFLINE)",
            });
          } else if (localTicket.status === "refunded") {
            playSound("error");
            setLastResult({
              success: false,
              guestName: localTicket.guestName,
              message: "REFUNDED PASS - ACCESS DENIED",
            });
          } else if (
            localTicket.status === "cancelled" ||
            localTicket.status === "void"
          ) {
            playSound("error");
            setLastResult({
              success: false,
              guestName: localTicket.guestName,
              message: "CANCELLED PASS - ACCESS DENIED",
            });
          } else if (localTicket.status === "transferred") {
            playSound("error");
            setLastResult({
              success: false,
              guestName: localTicket.guestName,
              message: "TRANSFERRED PASS - ACCESS DENIED",
            });
          } else if (localTicket.status !== "valid") {
            playSound("error");
            setLastResult({
              success: false,
              message: "INACTIVE TICKET STATE",
            });
          } else {
            // Locally execute offline pass activation and drop into persistent storage sync queue
            playSound("success");
            setLastResult({
              success: true,
              guestName: localTicket.guestName,
              tier: localTicket.tier,
            });

            await db.tickets.update(localTicket.id, { status: "used" });

            await db.outbox.add({
              checkInCode: cleanCode,
              eventId: targetEventId,
              timestamp: Date.now(),
            });
          }
        }
      } catch (err) {
        console.error("Internal Scanner Error:", err);
        toast.error("Scanning Error");
      } finally {
        setIsProcessing(false);
        setManualCode("");
        setTimeout(() => {
          processingRef.current = false;
        }, 1500); // 1.5-second scan throttle window
      }
    },
    [targetEventId],
  );

  // --- CAMERA CONTROL ---
  const startScanner = useCallback(async () => {
    if (showManualInput) return;

    try {
      if (!scannerRef.current) scannerRef.current = new Html5Qrcode("reader");
      if (scannerRef.current.isScanning) await scannerRef.current.stop();

      const config = {
        fps: 20,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await scannerRef.current.start(
        { facingMode: "environment" },
        config,
        (decodedText) => processValidation(decodedText),
        () => {},
      );
      setCameraReady(true);
      setCameraError(false);
    } catch (err) {
      setCameraError(true);
      setCameraReady(false);
    }
  }, [processValidation, showManualInput]);

  useEffect(() => {
    startScanner();
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [startScanner]);

  const toggleInputMode = async () => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop();
      setCameraReady(false);
    }
    setShowManualInput(!showManualInput);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#060606] text-white flex flex-col font-sans overflow-hidden">
        <Toaster position="top-center" />

        <header className="p-5 flex items-center justify-between bg-black/80 border-b border-white/5 z-50 backdrop-blur-xl">
          <button
            onClick={() => router.back()}
            className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl border border-white/10 active:scale-95 transition-all"
          >
            <ChevronLeft />
          </button>

          <div className="text-center">
            <h1 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
              Kivo Staff Portal
            </h1>
            <button
              onClick={() => performSync(true)}
              disabled={syncStatus === "syncing"}
              className="flex items-center gap-1.5 mx-auto mt-1 text-[10px] font-bold text-yellow-500 uppercase active:scale-95 transition-all disabled:opacity-30"
            >
              <RefreshCw
                size={10}
                className={syncStatus === "syncing" ? "animate-spin" : ""}
              />
              {syncStatus === "syncing" ? "Updating..." : "Sync Guestlist"}
            </button>
          </div>

          <button
            onClick={toggleInputMode}
            className={`w-12 h-12 flex items-center justify-center rounded-2xl border transition-all ${showManualInput ? "bg-yellow-500 border-yellow-600 text-black" : "bg-white/5 border-white/10 text-white"}`}
          >
            {showManualInput ? <Camera size={20} /> : <Keyboard size={20} />}
          </button>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-8 relative">
          {showManualInput ? (
            <div className="w-full max-w-[340px] animate-in slide-in-from-bottom-6 duration-500">
              <div className="bg-white/5 border border-white/10 p-8 rounded-[3rem] backdrop-blur-2xl shadow-2xl">
                <h3 className="text-xs font-black uppercase tracking-widest mb-6 text-center text-yellow-500">
                  Manual Check-In
                </h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    processValidation(manualCode);
                  }}
                  className="space-y-4"
                >
                  <input
                    autoFocus
                    type="text"
                    placeholder="KIVO-XXXX"
                    value={manualCode}
                    onChange={(e) =>
                      setManualCode(e.target.value.toUpperCase())
                    }
                    className="w-full bg-black/60 border-2 border-white/10 p-5 rounded-2xl text-center font-mono text-xl tracking-widest outline-none focus:border-yellow-500 transition-all placeholder:opacity-20"
                  />
                  <button
                    disabled={isProcessing || manualCode.length < 5}
                    className="w-full bg-yellow-500 disabled:bg-white/5 disabled:text-white/20 text-black py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-yellow-500/10"
                  >
                    {isProcessing ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>
                        Verify <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="relative w-full max-w-[320px] aspect-square">
              <div
                className={`relative w-full h-full rounded-[3.5rem] overflow-hidden border-2 transition-all duration-500 ${isProcessing ? "border-yellow-500" : lastResult?.success ? "border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.15)]" : lastResult?.success === false ? "border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.15)]" : "border-white/10"}`}
              >
                <div id="reader" className="w-full h-full object-cover" />
                {cameraError && (
                  <div className="absolute inset-0 bg-neutral-900 flex flex-col items-center justify-center p-8 text-center">
                    <AlertCircle className="text-red-500 mb-4" size={40} />
                    <p className="text-[10px] font-black uppercase tracking-widest mb-6 opacity-60">
                      Camera Disabled
                    </p>
                    <button
                      onClick={startScanner}
                      className="bg-white text-black px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest"
                    >
                      Retry
                    </button>
                  </div>
                )}
                {cameraReady && !isProcessing && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="w-full h-[2px] bg-yellow-500/40 shadow-[0_0_15px_rgba(234,179,8,1)] animate-scanner-line" />
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-12 w-full max-w-[320px] min-h-[140px] flex flex-col items-center justify-center">
            {lastResult ? (
              <div
                className={`w-full p-8 rounded-[2.5rem] border-2 animate-in zoom-in duration-300 ${lastResult.success ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  {lastResult.success ? (
                    <ShieldCheck className="text-green-500" size={20} />
                  ) : (
                    <AlertCircle className="text-red-500" size={20} />
                  )}
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest ${lastResult.success ? "text-green-400" : "text-red-400"}`}
                  >
                    {lastResult.success ? "Access Granted" : "Access Denied"}
                  </span>
                </div>
                <h2 className="text-xl font-black uppercase truncate mb-1">
                  {lastResult.guestName || "Guest"}
                </h2>
                <p className="text-[10px] opacity-60 font-bold uppercase tracking-widest">
                  {lastResult.success ? lastResult.tier : lastResult.message}
                </p>
              </div>
            ) : (
              <div className="text-center opacity-10">
                <p className="text-[10px] font-black uppercase tracking-[0.5em]">
                  Awaiting Scan
                </p>
              </div>
            )}
          </div>
        </main>

        <footer className="p-8 flex justify-center">
          <div className="px-6 py-3 bg-white/5 rounded-full border border-white/10 flex items-center gap-3">
            <div
              className={`w-2 h-2 rounded-full ${cameraReady || showManualInput ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-red-500"} animate-pulse`}
            />
            <span className="text-[10px] font-black uppercase text-white/30 tracking-[0.2em]">
              Hardware: {showManualInput ? "Keyboard" : "Camera Active"}
            </span>
          </div>
        </footer>

        <style jsx global>{`
          @keyframes scanner-line {
            0% {
              top: 15%;
              opacity: 0;
            }
            50% {
              opacity: 1;
            }
            100% {
              top: 85%;
              opacity: 0;
            }
          }
          .animate-scanner-line {
            position: absolute;
            animation: scanner-line 3s linear infinite;
          }
          #reader video {
            object-fit: cover !important;
            border-radius: 3rem !important;
          }
          #reader__dashboard,
          #reader__status_span {
            display: none !important;
          }
          #reader {
            border: none !important;
            background: transparent !important;
          }
        `}</style>
      </div>
    </AuthGuard>
  );
}
