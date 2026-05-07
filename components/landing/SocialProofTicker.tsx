"use client";
import Marquee from "react-fast-marquee";
import { Zap } from "lucide-react";

export default function SocialProofTicker() {
  const activities = [
    "Someone just booked VIP at Bole King",
    "Piazza is currently trending in GRA",
    "Tickets for PH Comedy Night selling fast",
    "30+ People just joined Sunday Brunch at Evo Road",
    "New Secret Vibe created at Pleasure Park",
    "140+ people found something to do on Kivo this weekend",
    "Ada just shared a new link-up in Borokiri",
  ];

  return (
    <section className="relative z-20 -mt-8 mb-12">
      {/* The Ticker Wrapper */}
      <div className="bg-blue-600 py-6 border-y-[6px] border-slate-950 -rotate-1 shadow-2xl">
        <Marquee gradient={false} speed={60} pauseOnHover={true}>
          {activities.map((text, i) => (
            <div key={i} className="flex items-center gap-6 mx-12">
              {/* High Contrast Icon */}
              <div className="bg-amber-400 p-2 rounded-lg rotate-12">
                <Zap size={16} fill="black" className="text-black" />
              </div>

              {/* The Text Content */}
              <span className="text-white font-black uppercase text-xl md:text-2xl tracking-[ -0.04em]">
                {text}
              </span>

              {/* Decorative Separator */}
              <div className="w-3 h-3 bg-white/30 rounded-full" />
            </div>
          ))}
        </Marquee>
      </div>

      {/* Decorative Shadow/Layer for depth */}
      <div className="absolute inset-0 bg-slate-950 translate-y-3 -z-10 -rotate-1 rounded-xl opacity-20" />
    </section>
  );
}
