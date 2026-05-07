"use client";
import { motion } from "framer-motion";
import { ArrowUpRight, Map as MapIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link"; // Import Link for navigation

const AREAS = [
  {
    name: "Old GRA",
    vibe: "Fine Dining & Lounges",
    color: "bg-blue-600",
    count: 24,
    image:
      "https://res.cloudinary.com/dzhfiblg7/image/upload/f_auto,q_auto,w_800/v1778056000/kivo_events/inhouse/old_gra_lounge.png",
  },
  {
    name: "Choba / Uniport",
    vibe: "Student Life & Quick Chops",
    color: "bg-amber-400",
    count: 42,
    image:
      "https://res.cloudinary.com/dzhfiblg7/image/upload/f_auto,q_auto,w_800/v1778056300/kivo_events/inhouse/choba_vibes.png",
  },
  {
    name: "Peter Odili",
    vibe: "Nightlife & Chill Spots",
    color: "bg-blue-600",
    count: 18,
    image:
      "https://res.cloudinary.com/dzhfiblg7/image/upload/f_auto,q_auto,w_800/v1778056600/kivo_events/inhouse/peter_odili_night.png",
  },
  {
    name: "Woji",
    vibe: "Local Hangouts & Grills",
    color: "bg-amber-400",
    count: 12,
    image:
      "https://res.cloudinary.com/dzhfiblg7/image/upload/f_auto,q_auto,w_800/v1778056900/kivo_events/inhouse/woji_grills.png",
  },
];

export default function Neighborhoods() {
  return (
    <section className="py-24 bg-slate-950 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] mb-6 uppercase">
              THE GARDEN CITY <br />
              <span className="text-blue-600 italic">MAPPED OUT.</span>
            </h2>
            <p className="text-slate-400 text-xl font-bold max-w-lg">
              We’ve grouped the best spots by neighborhood. Whether you&apos;re
              looking for a high-end date or a Choba-style rave, we got you.
            </p>
          </div>

          <button className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-amber-400 hover:text-black transition-all border-b-4 border-blue-800 active:border-b-0 active:translate-y-1">
            <MapIcon size={20} /> View Full Map
          </button>
        </div>

        {/* Neighborhood Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {AREAS.map((area) => (
            <motion.div
              key={area.name}
              whileHover={{ y: -10 }}
              className="group relative h-[500px] rounded-[48px] overflow-hidden border-[3px] border-white/10 cursor-pointer bg-slate-900"
            >
              <div className="absolute inset-0 transition-all duration-700 group-hover:scale-110">
                <Image
                  src={area.image}
                  alt={`${area.name} vibe`}
                  fill
                  className="object-cover opacity-100"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent z-10" />
              <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent transition-colors duration-500 z-10" />

              <div className="absolute inset-0 p-8 flex flex-col justify-between z-20">
                <div className="flex justify-between items-start">
                  <span
                    className={`px-5 py-2 rounded-xl text-black font-black text-[10px] uppercase tracking-widest ${area.color} shadow-lg`}
                  >
                    {area.count} Events
                  </span>
                  <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 group-hover:bg-amber-400 group-hover:text-black group-hover:rotate-12 transition-all duration-300">
                    <ArrowUpRight size={28} />
                  </div>
                </div>

                <div>
                  <h3 className="text-4xl font-black tracking-tight mb-2 uppercase leading-none">
                    {area.name}
                  </h3>
                  <p className="text-slate-200 font-bold text-sm uppercase tracking-wider">
                    {area.vibe}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action Bar */}
        <div className="mt-16 bg-blue-600/10 border-[3px] border-blue-600/20 p-10 rounded-[50px] flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full -mr-32 -mt-32" />

          <div className="flex items-center gap-6 relative z-10">
            <div className="w-20 h-20 bg-amber-400 rounded-3xl flex items-center justify-center text-black rotate-6 shadow-xl">
              <MapIcon size={36} />
            </div>
            <div>
              <h4 className="text-3xl font-black uppercase tracking-tighter">
                Is your area missing?
              </h4>
              <p className="text-blue-200/70 font-bold text-lg">
                Host an event and put your street on the map.
              </p>
            </div>
          </div>

          <Link href="/create" className="w-full md:w-auto relative z-10">
            <button className="w-full md:w-auto bg-amber-400 text-black px-12 py-5 rounded-2xl font-black text-xl hover:scale-105 transition-all shadow-[0_8px_0_0_#b45309] active:shadow-none active:translate-y-1">
              Start Hosting
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
