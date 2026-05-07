"use client";

import { Mail, Heart } from "lucide-react";
import { LuInstagram, LuTwitter } from "react-icons/lu";

export default function Footer() {
  return (
    <footer className="w-full py-16 px-6 bg-blue-600 text-white border-t-[6px] border-slate-950">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
          {/* Logo & Manifesto */}
          <div className="flex flex-col gap-4 max-w-sm">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center rotate-3 group-hover:rotate-12 transition-transform shadow-lg">
                <span className="text-black font-black text-2xl">K</span>
              </div>
              <div className="text-3xl font-black tracking-tighter uppercase italic">
                Kivo
              </div>
            </div>
            <p className="text-blue-100 font-bold text-sm leading-relaxed">
              Mapping the heartbeat of the Garden City. From the best grills in
              Woji to the exclusive lounges in GRA, we’ve got you covered.
            </p>
          </div>

          {/* Quick Links Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 md:gap-24">
            <div className="flex flex-col gap-4">
              <h4 className="text-amber-400 font-black text-xs uppercase tracking-[0.2em]">
                Platform
              </h4>
              <a
                href="#"
                className="font-bold hover:text-amber-400 transition-colors"
              >
                Find Vibes
              </a>
              <a
                href="#"
                className="font-bold hover:text-amber-400 transition-colors"
              >
                Host Event
              </a>
              <a
                href="#"
                className="font-bold hover:text-amber-400 transition-colors"
              >
                Pricing
              </a>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-amber-400 font-black text-xs uppercase tracking-[0.2em]">
                Support
              </h4>
              <a
                href="#"
                className="font-bold hover:text-amber-400 transition-colors"
              >
                Privacy
              </a>
              <a
                href="#"
                className="font-bold hover:text-amber-400 transition-colors"
              >
                Terms
              </a>
              <a
                href="#"
                className="font-bold hover:text-amber-400 transition-colors"
              >
                Safety
              </a>
            </div>
          </div>

          {/* Socials & Contact */}
          <div className="flex flex-col items-start md:items-end gap-6">
            <div className="flex gap-4">
              <a
                href="#"
                className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-amber-400 hover:text-black transition-all"
                aria-label="Instagram"
              >
                <LuInstagram size={22} />
              </a>
              <a
                href="#"
                className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-amber-400 hover:text-black transition-all"
                aria-label="Twitter"
              >
                <LuTwitter size={22} />
              </a>
              <a
                href="#"
                className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-amber-400 hover:text-black transition-all"
                aria-label="Email"
              >
                <Mail size={22} />
              </a>
            </div>
            <button className="bg-slate-950 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform border-b-4 border-slate-800">
              Contact Support
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs font-bold text-blue-200/60 uppercase tracking-widest">
            © 2026 Kivo Technologies. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-tighter">
            Built with{" "}
            <Heart size={14} className="text-amber-400 fill-amber-400" /> in
            Port Harcourt
          </div>
        </div>
      </div>
    </footer>
  );
}
