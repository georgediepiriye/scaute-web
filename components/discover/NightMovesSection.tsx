/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import SectionContainer from "./SectionContainer";
import { Beer, Eye, Heart, MapPin, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function NightMovesSection({ data }: any) {
  const router = useRouter();

  if (!data?.length) return null;

  return (
    <div className="bg-[#050505] py-24 my-24 relative overflow-hidden border-y border-white/5 md:rounded-[80px]">
      {/* Refined Ambient Glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-yellow-500/5 blur-[160px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-10 w-[400px] h-[400px] bg-blue-600/5 blur-[140px] pointer-events-none rounded-full" />

      <SectionContainer
        title="Night Moves"
        subtitle="PH City After Dark"
        icon={Beer}
        iconColor="#FFD700"
      >
        {data.map((e: any, index: number) => (
          <motion.div
            key={e._id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            onClick={() => router.push(`/discover/${e._id}`)}
            className="min-w-[320px] sm:min-w-[400px] group cursor-pointer snap-start relative"
          >
            {/* The Cinematic Card */}
            <div className="relative aspect-[10/13] rounded-[60px] overflow-hidden bg-neutral-900 border border-white/[0.08] shadow-2xl transition-all duration-500 group-hover:border-yellow-400/30">
              <Image
                src={e.image}
                fill
                className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                alt={e.title}
              />

              {/* Multi-layered Gradient for Depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />

              {/* Top Floating Badge */}
              <div className="absolute top-8 right-8 flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 text-white shadow-2xl transition-colors group-hover:bg-yellow-400 group-hover:text-black">
                  <Heart size={14} className="group-hover:fill-black" />
                  <span className="text-xs font-black">{e.likes || 0}</span>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="absolute bottom-0 left-0 right-0 p-10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 rounded-lg bg-yellow-400 text-black text-[10px] font-black uppercase tracking-[0.1em]">
                    {e.category}
                  </span>
                  {e.status === "featured" && (
                    <span className="text-yellow-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                      Trending
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-end gap-4">
                  <div className="flex-1">
                    <h3 className="text-4xl font-black text-white leading-[0.9] tracking-tighter mb-4 transition-all group-hover:tracking-normal">
                      {e.title}
                    </h3>

                    <div className="flex items-center gap-2 text-white/40">
                      <MapPin size={14} className="text-yellow-400/60" />
                      <p className="font-bold text-[11px] uppercase tracking-wider">
                        {e.location?.neighborhood || "Port Harcourt"}
                      </p>
                    </div>
                  </div>

                  {/* Circular CTA Button */}
                  <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-all duration-300">
                    <ArrowUpRight size={24} />
                  </div>
                </div>
              </div>
            </div>

            {/* Subtle Footer Stats */}
            <div className="mt-4 px-6 flex items-center gap-4 opacity-40 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-1.5 text-white">
                <Eye size={12} />
                <span className="text-[10px] font-black uppercase tracking-tighter">
                  {e.views || 0} Views
                </span>
              </div>
              <div className="h-px flex-1 bg-white/10" />
            </div>
          </motion.div>
        ))}
      </SectionContainer>
    </div>
  );
}
