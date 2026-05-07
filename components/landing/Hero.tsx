"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  Variants,
} from "framer-motion";
import { Compass } from "lucide-react";
import Link from "next/link";

/**
 * KIVO HERO - ULTRA SMOOTH VERSION
 * Optimized with Spring physics and custom Bezier curves.
 */

const KIVO_BLUE = "#0052FF";

export default function Hero() {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Create smooth spring-based scroll values to eliminate jitter
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Parallax transformations tied to the smoothed spring
  const xLeft = useTransform(smoothProgress, [0, 1], ["-2%", "-15%"]);
  const xRight = useTransform(smoothProgress, [0, 1], ["2%", "15%"]);
  const opacityFade = useTransform(smoothProgress, [0, 0.6], [0.03, 0]);
  const scaleEffect = useTransform(smoothProgress, [0, 1], [1, 1.1]);

  // Entrance variants using a "Soft Pop" custom cubic-bezier
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 40, opacity: 0, filter: "blur(10px)" },
    visible: {
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        duration: 1.2,
        ease: [0.22, 1, 0.36, 1], // Quartic Out - very smooth deceleration
      },
    },
  };

  return (
    <section
      ref={containerRef}
      className="relative min-h-[98vh] flex flex-col items-center justify-center pt-32 pb-20 px-4 overflow-hidden bg-[#fafafa]"
    >
      {/* 1. ULTRA-SMOOTH PARALLAX BACKGROUND */}
      <motion.div
        style={{ opacity: opacityFade, scale: scaleEffect }}
        className="absolute inset-0 pointer-events-none select-none flex flex-col justify-center items-center gap-2"
      >
        <motion.h2
          style={{ x: xLeft }}
          className="text-[26vw] font-black leading-none uppercase whitespace-nowrap text-slate-900"
        >
          PORT HARCOURT
        </motion.h2>
        <motion.h2
          style={{
            x: xRight,
            WebkitTextStroke: "1px rgba(0,0,0,0.2)",
            color: "transparent",
          }}
          className="text-[26vw] font-black leading-none uppercase whitespace-nowrap italic"
        >
          RIVERS STATE
        </motion.h2>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center"
      >
        {/* 2. STATUS BADGE */}
        <motion.div
          variants={itemVariants}
          className="group flex items-center gap-2 bg-white/80 backdrop-blur-md p-1.5 pr-6 rounded-full shadow-sm border border-slate-100 mb-12 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-500 ease-out"
        >
          <div
            style={{ backgroundColor: KIVO_BLUE }}
            className="px-5 py-2.5 rounded-full flex items-center gap-2.5"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
              Live Now
            </span>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
            23 moves active in{" "}
            <span className="text-slate-950 font-black">PH City</span>
          </span>
        </motion.div>

        {/* 3. HEADLINE WITH KIVO YELLOW ACCENT */}
        <div className="text-center mb-16">
          <motion.h1
            variants={itemVariants}
            className="text-7xl md:text-[140px] font-black tracking-[-0.06em] leading-[0.8] uppercase text-slate-950"
          >
            What’s <br />
            <span className="relative inline-block px-4">
              happening
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{
                  delay: 1,
                  duration: 1.5,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="absolute bottom-2 md:bottom-5 left-0 w-full h-[0.25em] bg-amber-400/40 -z-10 origin-left"
              />
            </span>{" "}
            <br />
            <span style={{ color: KIVO_BLUE }} className="italic font-serif">
              right now?
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-8 text-slate-500 text-base md:text-xl font-medium max-w-xl mx-auto leading-relaxed"
          >
            Real-time access to local events, trending spots, and curated moves
            across the city.
          </motion.p>
        </div>

        {/* 4. PRIMARY CTA - SPRING SCALE ON HOVER */}
        <motion.div variants={itemVariants} className="w-full max-w-lg">
          <Link href="/map" className="group block">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ backgroundColor: KIVO_BLUE }}
              className="relative overflow-hidden rounded-[40px] p-1 shadow-2xl shadow-blue-500/20"
            >
              <div className="absolute inset-0 bg-slate-950 translate-y-full group-hover:translate-y-0 transition-transform duration-700 cubic-bezier(0.22, 1, 0.36, 1)" />

              <div className="relative flex items-center justify-between px-10 py-9 text-white">
                <div className="flex flex-col text-left">
                  <span className="text-3xl font-black uppercase tracking-tighter">
                    Open the Map
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.2em] opacity-60 font-black">
                    Explore active zones
                  </span>
                </div>
                <div className="bg-white/10 p-4 rounded-3xl group-hover:rotate-[360deg] transition-transform duration-1000 ease-in-out">
                  <Compass size={36} strokeWidth={2.5} />
                </div>
              </div>
            </motion.div>
          </Link>
        </motion.div>

        {/* 5. FLOW INDICATOR */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="mt-20 flex flex-col items-center gap-4"
        >
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-400">
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            className="w-px h-16 bg-gradient-to-b from-slate-300 to-transparent"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
