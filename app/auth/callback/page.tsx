"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Zap } from "lucide-react";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    // Artificially timing the transition slightly if token exists
    // ensures the UI doesn't awkwardly flash for 50ms.
    const handleRedirect = setTimeout(() => {
      if (token) {
        localStorage.setItem("skaute_token", token);
        router.push("/profile");
      } else {
        router.push("/auth/signin");
      }
    }, 800);

    return () => clearTimeout(handleRedirect);
  }, [searchParams, router]);

  return (
    <div className="min-h-[100dvh] w-full bg-slate-50/50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Soft Ambient Background Light Bleeds */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="flex flex-col items-center max-w-sm w-full text-center relative z-10">
        {/* Animated Brand Core */}
        <div className="relative flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/10 mb-8 animate-bounce [animation-duration:2s]">
          <Zap size={26} className="text-amber-400 fill-amber-400" />
        </div>

        {/* Loading Spinner Indicator */}
        <div className="flex items-center gap-3 px-5 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm mb-4">
          <Loader2 size={18} className="text-blue-600 animate-spin" />
          <span className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-800">
            Secure Handshake
          </span>
        </div>

        {/* Messaging Hierarchy */}
        <h1 className="text-xl font-black text-slate-900 tracking-tight mb-2">
          Syncing your account
        </h1>
        <p className="text-xs font-semibold text-slate-400 leading-relaxed max-w-[280px] animate-pulse">
          Setting up your secure skaute session environment. Please hold on.
        </p>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    // Suspense boundary protects your Next.js production build from searchParams generation errors
    <Suspense
      fallback={
        <div className="min-h-[100dvh] w-full bg-slate-50/50 flex items-center justify-center">
          <Loader2 size={24} className="text-blue-600 animate-spin" />
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
