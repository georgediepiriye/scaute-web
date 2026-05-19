/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import SectionContainer from "./SectionContainer";
import { Sparkles, Heart } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Brand Constants
const SKAUTE_BLUE = "#0052FF";
const SKAUTE_YELLOW = "#FFD700";

export default function VibeCheckSection({ data }: any) {
  const router = useRouter();
  if (!data?.length) return null;

  return (
    <div className="py-12 bg-[#F9F9F9]">
      <SectionContainer
        title="Vibe Check"
        subtitle="The heartbeat of the city"
        icon={Sparkles}
        iconColor={SKAUTE_BLUE}
      >
        {data.map((e: any) => (
          <div
            key={e._id}
            className="min-w-[300px] sm:min-w-[360px] snap-start group cursor-pointer"
            onClick={() => router.push(`/discover/${e._id}`)}
          >
            {/* Image Container with Brand-Consistent Shadow */}
            <div className="relative h-[400px] rounded-t-[60px] rounded-bl-[60px] rounded-br-[20px] overflow-hidden mb-6 shadow-2xl shadow-blue-900/10 border border-white">
              <Image
                src={e.image}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                alt={e.title}
              />

              {/* Cinematic Overlays */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/80" />

              {/* Top Tag: Using skaute Blue */}
              <div className="absolute top-6 left-6">
                <span
                  className="px-5 py-2.5 rounded-full text-white text-[10px] font-black uppercase tracking-[0.15em] shadow-xl transition-colors duration-300 group-hover:bg-black"
                  style={{ backgroundColor: SKAUTE_BLUE }}
                >
                  {e.category}
                </span>
              </div>

              {/* Bottom Info: Refined Glassmorphism */}
              <div className="absolute bottom-4 left-4 right-4 p-6 bg-black/20 backdrop-blur-2xl border border-white/10 rounded-[35px]">
                <h3 className="text-white text-2xl font-black leading-[0.9] tracking-tighter mb-3 line-clamp-1">
                  {e.title}
                </h3>

                <div className="flex items-center justify-between">
                  <span
                    className="text-[10px] font-black uppercase tracking-[0.2em]"
                    style={{ color: SKAUTE_YELLOW }}
                  >
                    {e.location?.neighborhood || "Port Harcourt"}
                  </span>

                  {/* Floating Like Count with Brand Yellow */}
                  <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/10">
                    <Heart
                      size={14}
                      className="transition-all duration-300 group-hover:scale-125"
                      style={{
                        fill: SKAUTE_YELLOW,
                        stroke: SKAUTE_YELLOW,
                      }}
                    />
                    <span className="text-white text-[11px] font-black">
                      {e.likes || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </SectionContainer>
    </div>
  );
}
