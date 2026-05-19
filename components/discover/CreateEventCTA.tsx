/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Plus, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

// Brand Constants
const SKAUTE_BLUE = "#0052FF";
const SKAUTE_YELLOW = "#FFD700";

export default function CreateEventCTA() {
  const router = useRouter();

  return (
    <section className="max-w-6xl mx-auto px-6 mb-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden bg-white border border-gray-100 rounded-[40px] md:rounded-[60px] p-8 md:p-12 lg:p-16 shadow-sm"
      >
        {/* Decorative Brand Glow - Using skaute Blue */}
        <div
          className="absolute -top-24 -right-24 w-80 h-80 blur-[100px] rounded-full pointer-events-none opacity-10"
          style={{ backgroundColor: SKAUTE_BLUE }}
        />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
          <div className="max-w-xl">
            {/* Tag using Brand Blue */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-8"
              style={{
                backgroundColor: `${SKAUTE_BLUE}10`,
                color: SKAUTE_BLUE,
              }}
            >
              <Plus size={12} />
              <span>Host an Experience</span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-[0.9] tracking-tighter mb-6">
              Can’t find the <br />
              <span style={{ color: SKAUTE_BLUE }}>perfect vibe?</span>
            </h2>

            <p className="text-gray-500 font-bold text-lg md:text-xl leading-tight">
              Be the heartbeat of the city. Whether it’s a private hangout, a
              tech mixer, or a nightlife takeover, create your own event and let
              Port Harcourt discover you.
            </p>
          </div>

          {/* Button using Brand Blue and Yellow Hover */}
          <button
            onClick={() => router.push("/create")}
            className="group relative flex items-center gap-6 text-white px-10 py-7 rounded-[32px] transition-all duration-500 shadow-2xl hover:scale-[1.02] active:scale-95 overflow-hidden"
            style={{ backgroundColor: "#000" }} // Deep Black base
          >
            {/* Hover Background Slide Effect */}
            <div
              className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500"
              style={{ backgroundColor: SKAUTE_BLUE }}
            />

            <span className="relative z-10 text-xl font-black tracking-tight">
              Create Yours
            </span>

            <div
              className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 group-hover:rotate-[-45deg]"
              style={{ backgroundColor: SKAUTE_YELLOW, color: "#000" }}
            >
              <ArrowRight size={22} />
            </div>
          </button>
        </div>
      </motion.div>
    </section>
  );
}
