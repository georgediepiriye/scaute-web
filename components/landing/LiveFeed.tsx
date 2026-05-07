"use client";

import { motion } from "framer-motion";
import { MapPin, ArrowRight, Zap, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

/**
 * KIVO LIVE FEED COMPONENT
 * Aesthetic: Chowdeck / Neo-Brutalist
 * Color Palette: Kivo Blue (#0052FF), Kivo Yellow (#FBBF24)
 */

const KIVO_BLUE = "#0052FF";
const KIVO_YELLOW = "#FBBF24";

const events = [
  {
    title: "Paint & Sip",
    loc: "Forces Avenue",
    status: "Happening Now",
    color: "bg-[#0052FF]",
    textColor: "text-white",
    illustration:
      "https://res.cloudinary.com/dzhfiblg7/image/upload/f_auto,q_auto,w_800/v1778051902/kivo_events/inhouse/paint_sip_vqmvl7.png",
    href: "/events/paint-and-sip",
  },
  {
    title: "Chess & Chill",
    loc: "Evo Road",
    status: "22 Joined",
    color: "bg-white",
    textColor: "text-slate-950",
    illustration:
      "https://res.cloudinary.com/dzhfiblg7/image/upload/f_auto,q_auto,w_800/v1778053215/kivo_events/inhouse/chess_chill.png",
    href: "/events/chess-and-chill",
  },
  {
    title: "Open Mic",
    loc: "Old GRA",
    status: "50 Joined",
    color: "bg-white",
    textColor: "text-slate-950",
    illustration:
      "https://res.cloudinary.com/dzhfiblg7/image/upload/f_auto,q_auto,w_800/v1778053540/kivo_events/inhouse/open_mic.png",
    href: "/events/open-mic",
  },
  {
    title: "Outdoor Cinema",
    loc: "Pleasure Park",
    status: "Starting Soon",
    color: "bg-[#FBBF24]",
    textColor: "text-slate-950",
    illustration:
      "https://res.cloudinary.com/dzhfiblg7/image/upload/f_auto,q_auto,w_800/v1778053820/kivo_events/inhouse/outdoor_cinema.png",
    href: "/events/outdoor-cinema",
  },
];

export default function LiveFeed() {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto bg-[#fafafa]">
      {/* 1. VIDEO PORTAL SECTION */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="relative aspect-video md:aspect-[21/9] rounded-[40px] md:rounded-[60px] overflow-hidden border-[8px] border-white shadow-2xl mb-32 group"
      >
        <video
          autoPlay
          muted
          loop
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        >
          <source src="/ph-vibe.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-slate-950/40 flex flex-col items-center justify-center text-center px-6">
          <div className="flex items-center gap-2 bg-white px-4 py-1.5 rounded-full mb-6 border-2 border-slate-950 shadow-[4px_4px_0_0_#0f172a]">
            <Zap size={14} className="text-amber-500 fill-amber-500" />
            <span className="text-[10px] font-black text-slate-950 uppercase tracking-widest">
              PH Pulse
            </span>
          </div>
          <h2 className="text-white text-5xl md:text-8xl font-black italic tracking-tighter leading-none drop-shadow-lg">
            DON&apos;T HEAR <br /> ABOUT IT LATER.
          </h2>
        </div>
      </motion.div>

      {/* 2. HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
        <div className="max-w-2xl">
          <motion.h2
            initial={{ x: -20, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-6xl md:text-[100px] font-black tracking-[-0.06em] mb-6 uppercase leading-[0.8] text-slate-950"
          >
            THE LIVE <br />
            <span className="text-[#0052FF] italic">FEED.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl font-bold text-slate-500 leading-relaxed"
          >
            Real-time access to local events, trending spots, and curated moves
            across the city.
          </motion.p>
        </div>
      </div>

      {/* 3. EVENT GRID (NEO-BRUTALIST CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {events.map((event, i) => (
          <Link key={i} href={event.href}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{
                y: -8,
                x: -4,
                boxShadow: "12px 12px 0px 0px #0f172a",
              }}
              className={`
                ${event.color} ${event.textColor}
                relative p-5 rounded-[40px] 
                border-[3px] border-slate-950 
                shadow-[8px_8px_0_0_#0f172a] 
                flex flex-col min-h-[520px] 
                transition-all duration-200 ease-out
                cursor-pointer group
              `}
            >
              {/* Image Container with Status Tag */}
              <div className="bg-slate-950/10 rounded-[32px] h-52 flex items-center justify-center mb-8 relative overflow-hidden border-b-2 border-slate-950/10">
                <Image
                  src={event.illustration}
                  alt={event.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
                <div className="absolute top-4 left-4 bg-slate-950 text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-full tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  {event.status}
                </div>
              </div>

              {/* Content Section */}
              <div className="px-2 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-4xl font-black leading-[0.9] uppercase tracking-tighter mb-4">
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-1 font-bold text-sm opacity-80 uppercase tracking-tight italic">
                    <MapPin size={16} strokeWidth={3} />
                    {event.loc}
                  </div>
                </div>

                {/* Action Button */}
                <div
                  className="
                  w-full mt-10 py-5 
                  bg-slate-950 text-white 
                  rounded-2xl font-black text-xs 
                  uppercase tracking-widest 
                  flex items-center justify-center gap-2
                  group-hover:bg-white group-hover:text-slate-950
                  transition-colors duration-200
                  border-2 border-transparent group-hover:border-slate-950
                "
                >
                  Secure Move <ArrowRight size={16} strokeWidth={3} />
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* 4. FOOTER CALL TO ACTION */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="mt-24 flex justify-center"
      >
        <Link href="/discover">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group flex items-center gap-4 bg-white border-[3px] border-slate-950 px-10 py-6 rounded-full shadow-[8px_8px_0_0_#0f172a] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
          >
            <span className="text-sm font-black uppercase tracking-[0.2em] text-slate-950">
              View all activities
            </span>
            <ArrowUpRight
              size={20}
              className="text-[#0052FF]"
              strokeWidth={3}
            />
          </motion.button>
        </Link>
      </motion.div>
    </section>
  );
}
