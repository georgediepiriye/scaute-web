"use client";
import { MapPin, ArrowRight, Radio } from "lucide-react";
import Link from "next/link";

export default function ProximityCTA() {
  return (
    <section className="max-w-7xl mx-auto px-6 mb-32">
      <div className="bg-blue-600 rounded-[4rem] p-12 md:py-28 text-center relative overflow-hidden border-[4px] border-slate-950 shadow-[0_20px_0_0_#0f172a]">
        {/* Animated Radar Rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="absolute w-[300px] h-[300px] border-2 border-white rounded-full animate-[ping_3s_linear_infinite]" />
          <div className="absolute w-[600px] h-[600px] border-2 border-white rounded-full animate-[ping_4s_linear_infinite]" />
          <div className="absolute w-[900px] h-[900px] border-2 border-white rounded-full animate-[ping_5s_linear_infinite]" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Proximity Badge */}
          <div className="inline-flex items-center gap-2 bg-slate-950 text-white px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] mb-10 shadow-2xl">
            <Radio size={14} className="text-blue-400 animate-pulse" />
            Scanning Port Harcourt...
          </div>

          {/* Headline: Focus on "Where You Are" */}
          <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.85] mb-8 uppercase">
            Right where <br />
            <span className="text-amber-400 italic">you stand.</span>
          </h2>

          {/* Subtitle: Highlighting the Auto-Location Map */}
          <p className="text-xl md:text-2xl font-bold text-blue-50 max-w-2xl mx-auto mb-14 leading-tight">
            Kivo centers on your coordinates to show you the best vibes within
            walking distance. Don’t miss what&apos;s happening behind you.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            <Link href="/map" className="w-full sm:w-auto">
              <button className="group w-full bg-amber-400 text-slate-950 px-12 py-6 rounded-3xl font-black text-2xl flex items-center justify-center gap-3 shadow-[0_8px_0_0_#b45309] hover:shadow-none hover:translate-y-1 transition-all">
                OPEN YOUR MAP
                <MapPin
                  className="group-hover:scale-125 transition-transform"
                  fill="currentColor"
                  size={24}
                />
              </button>
            </Link>

            <Link href="/discover" className="w-full sm:w-auto">
              <button className="group w-full bg-white/10 backdrop-blur-md border-2 border-white/30 text-white px-10 py-6 rounded-3xl font-black text-xl hover:bg-white hover:text-blue-600 transition-all flex items-center justify-center gap-2">
                See what&apos;s happening
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-2 transition-transform"
                />
              </button>
            </Link>
          </div>
        </div>

        {/* Localized Floating Tags */}
        <div className="hidden lg:block absolute top-20 right-20 bg-white p-3 rounded-xl rotate-12 shadow-2xl">
          <p className="text-slate-950 font-black text-[10px] uppercase">
            🔥 4 New Events nearby
          </p>
        </div>
        <div className="hidden lg:block absolute bottom-20 left-20 bg-amber-400 p-3 rounded-xl -rotate-12 shadow-2xl">
          <p className="text-slate-950 font-black text-[10px] uppercase">
            📍 You are here
          </p>
        </div>
      </div>
    </section>
  );
}
