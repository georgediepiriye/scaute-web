/* eslint-disable react/no-unescaped-entities */
"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Loader2,
  MapPin,
  Mail,
  ShieldCheck,
  X,
  ArrowRight,
  Sparkles,
  Globe,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getIPLocation } from "@/lib/locationUtils";

// BRAND COLOR CONSTANTS
const KIVO_BLUE = "#0052FF";

export default function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "requesting" | "error" | "success"
  >("idle");

  useEffect(() => {
    const hasSeen = localStorage.getItem("kivo_onboarded");
    if (!hasSeen) {
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleLocationRequest = useCallback(async () => {
    setStatus("requesting");

    const saveAndMove = (lat: number, lng: number) => {
      const coords =
        isNaN(lat) || isNaN(lng) ? { lat: 4.8156, lng: 7.0498 } : { lat, lng };
      localStorage.setItem("user_coords", JSON.stringify(coords));
      setStatus("success");
      // Smooth transition to next step after success
      setTimeout(() => setStep(2), 1200);
    };

    if (!navigator.geolocation) {
      const fallback = await getIPLocation();
      saveAndMove(fallback.lat, fallback.lng);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => saveAndMove(pos.coords.latitude, pos.coords.longitude),
      async () => {
        const fallback = await getIPLocation();
        saveAndMove(fallback.lat, fallback.lng);
      },
      { enableHighAccuracy: false, timeout: 6000 },
    );
  }, []);

  const completeOnboarding = (targetPath?: string) => {
    localStorage.setItem("kivo_onboarded", "true");
    setIsVisible(false);
    if (targetPath) {
      if (targetPath.includes("google")) {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/google`;
      } else {
        router.push(targetPath);
      }
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[1000] bg-zinc-950/60 backdrop-blur-xl flex items-center justify-center p-4 md:p-6"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white w-full max-w-5xl md:h-[600px] rounded-[40px] shadow-[0_40px_100px_-15px_rgba(0,82,255,0.2)] border border-white/20 flex flex-col md:flex-row overflow-hidden relative"
        >
          {/* Close Button */}
          <button
            onClick={() => completeOnboarding()}
            className="absolute top-6 right-6 z-50 p-2.5 bg-zinc-50 border border-zinc-100 rounded-full text-zinc-400 hover:text-zinc-900 transition-all"
          >
            <X size={20} />
          </button>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full h-full flex flex-col md:flex-row"
              >
                {/* LEFT: Visual & Value Prop */}
                <div className="w-full md:w-1/2 bg-zinc-50 p-12 flex flex-col justify-between relative overflow-hidden border-r border-zinc-100">
                  <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#0052FF]/5 rounded-full blur-3xl" />

                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-8 border border-zinc-100">
                      <Globe size={24} style={{ color: KIVO_BLUE }} />
                    </div>
                    <h2 className="text-4xl font-black mb-4 text-zinc-900 tracking-tighter leading-none">
                      The city, <br />
                      <span style={{ color: KIVO_BLUE }} className="italic">
                        personalized.
                      </span>
                    </h2>
                    <p className="text-zinc-500 text-sm font-medium leading-relaxed max-w-xs">
                      Enable location to unlock real-time trending spots,
                      exclusive guestlists, and live map navigation in Port
                      Harcourt.
                    </p>
                  </div>

                  <div className="relative z-10 pt-12">
                    <div className="flex -space-x-3 mb-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded-full border-2 border-white bg-zinc-200 overflow-hidden"
                        >
                          <Image
                            src={`https://i.pravatar.cc/100?img=${i + 10}`}
                            alt="User"
                            width={32}
                            height={32}
                          />
                        </div>
                      ))}
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
                        +2k
                      </div>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      Join 2,000+ active explorers
                    </p>
                  </div>
                </div>

                {/* RIGHT: Action Section */}
                <div className="w-full md:w-1/2 p-8 md:p-14 flex flex-col justify-center bg-white">
                  <div className="space-y-6">
                    <div className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100">
                      <div className="flex items-start gap-4">
                        <div className="mt-1">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-zinc-900">
                            Privacy First
                          </p>
                          <p className="text-[11px] text-zinc-500 leading-normal">
                            Your location is encrypted and used only to curate
                            your local feed.
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleLocationRequest}
                      disabled={status === "requesting" || status === "success"}
                      className="group w-full py-5 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                      style={{
                        backgroundColor:
                          status === "success" ? "#10B981" : "#000",
                      }}
                    >
                      {status === "requesting" ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : status === "success" ? (
                        <ShieldCheck size={18} />
                      ) : (
                        <MapPin
                          size={18}
                          className="group-hover:animate-bounce"
                        />
                      )}
                      {status === "requesting"
                        ? "Syncing GPS..."
                        : status === "success"
                          ? "Access Granted"
                          : "Find Moves Near Me"}
                    </button>

                    <button
                      onClick={() => setStep(2)}
                      className="w-full text-zinc-400 text-[10px] font-black uppercase tracking-widest hover:text-zinc-900 transition-colors py-2 flex items-center justify-center gap-2"
                    >
                      Enter Manually <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full h-full flex flex-col md:flex-row"
              >
                {/* LEFT: Branding/Atmosphere */}
                <div className="w-full md:w-1/2 bg-zinc-900 p-12 flex flex-col justify-between text-white relative">
                  <div className="absolute inset-0 opacity-50">
                    <Image
                      src="https://res.cloudinary.com/dzhfiblg7/image/upload/v1778054500/kivo_events/inhouse/tower.png"
                      alt="PH City Vibe"
                      fill
                      className="object-cover grayscale"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

                  <div className="relative z-10">
                    <p
                      className="font-black text-2xl tracking-tighter"
                      style={{ color: KIVO_BLUE }}
                    >
                      KIVO.
                    </p>
                  </div>

                  <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full mb-4 border border-white/10 backdrop-blur-md">
                      <Sparkles size={12} style={{ color: KIVO_BLUE }} />
                      <span className="text-[9px] font-black uppercase tracking-widest">
                        Premium Access
                      </span>
                    </div>
                    <h3 className="text-3xl font-black italic leading-tight tracking-tighter mb-2">
                      Ready for the <br /> next move?
                    </h3>
                  </div>
                </div>

                {/* RIGHT: Authentication Options */}
                <div className="w-full md:w-1/2 p-8 md:p-14 flex flex-col justify-center bg-white">
                  <div className="mb-10">
                    <h2 className="text-2xl font-black text-zinc-900 mb-2">
                      Identity
                    </h2>
                    <p className="text-zinc-400 text-xs font-medium">
                      How should we remember you?
                    </p>
                  </div>

                  <div className="space-y-4">
                    <button
                      onClick={() => completeOnboarding("/auth/google")}
                      className="w-full py-4 border-2 border-zinc-100 rounded-2xl flex items-center justify-center gap-4 font-bold text-zinc-800 hover:bg-zinc-50 transition-all active:scale-[0.98]"
                    >
                      <Image
                        src="/images/google_icon.png"
                        width={18}
                        height={18}
                        alt="Google"
                      />
                      <span className="text-[11px] uppercase tracking-widest font-black">
                        Google Identity
                      </span>
                    </button>

                    <button
                      onClick={() => completeOnboarding("/auth/signin")}
                      className="w-full py-4 bg-zinc-50 border-2 border-transparent rounded-2xl flex items-center justify-center gap-4 font-bold text-zinc-800 hover:border-zinc-200 transition-all active:scale-[0.98]"
                    >
                      <Mail size={18} className="text-zinc-400" />
                      <span className="text-[11px] uppercase tracking-widest font-black">
                        Email Access
                      </span>
                    </button>

                    <div className="flex items-center gap-4 py-2">
                      <div className="h-px bg-zinc-100 flex-1" />
                      <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">
                        Guest Entry
                      </span>
                      <div className="h-px bg-zinc-100 flex-1" />
                    </div>

                    <button
                      onClick={() => completeOnboarding("/map")}
                      className="group w-full py-5 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2"
                      style={{ backgroundColor: KIVO_BLUE }}
                    >
                      Explore Locally
                      <ArrowRight
                        size={14}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </button>
                  </div>

                  <p className="mt-12 text-[9px] text-zinc-400 font-bold text-center uppercase tracking-widest">
                    Secured by Kivo Identity Protection
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
