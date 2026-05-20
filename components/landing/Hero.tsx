"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
  Variants,
} from "framer-motion";
import { Navigation } from "lucide-react";
import Link from "next/link";

const SKAUTE_BLUE = "#0052FF";
const SKAUTE_YELLOW = "#FFD700";

export default function Hero() {
  const containerRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 22,
    restDelta: 0.001,
  });

  const xLeft = useTransform(smoothProgress, [0, 1], ["0%", "-12%"]);
  const xRight = useTransform(smoothProgress, [0, 1], ["0%", "12%"]);
  const opacityFade = useTransform(smoothProgress, [0, 0.4], [0.04, 0]);
  const scaleEffect = useTransform(smoothProgress, [0, 1], [1, 1.05]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.15,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 24, opacity: 0, filter: "blur(4px)" },
    visible: {
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <section
      ref={containerRef}
      className="relative min-h-[92vh] md:min-h-[98vh] flex flex-col items-center justify-center pt-28 md:pt-36 pb-12 md:pb-20 px-4 overflow-hidden bg-[#0B0E14]"
    >
      {/* 1. TYPOGRAPHIC PARALLAX BACKGROUND */}
      <motion.div
        style={{
          opacity: opacityFade,
          scale: shouldReduceMotion ? 1 : scaleEffect,
        }}
        className="absolute inset-0 pointer-events-none select-none flex flex-col justify-center items-center gap-2 overflow-hidden"
      >
        <motion.h2
          style={{ x: shouldReduceMotion ? 0 : xLeft }}
          className="text-[18vw] md:text-[24vw] font-black leading-none uppercase whitespace-nowrap text-white will-change-transform font-sans tracking-tighter"
        >
          PORT HARCOURT
        </motion.h2>
        <motion.h2
          style={{
            x: shouldReduceMotion ? 0 : xRight,
            WebkitTextStroke: "1px rgba(255,255,255,0.12)",
            color: "transparent",
          }}
          className="text-[18vw] md:text-[24vw] font-black leading-none uppercase whitespace-nowrap italic will-change-transform font-sans tracking-tighter"
        >
          RIVERS STATE
        </motion.h2>
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-transparent to-transparent pointer-events-none z-0" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center"
      >
        {/* 2. STATIC LIVE STATUS BADGE */}
        <motion.div
          variants={itemVariants}
          className="group flex items-center gap-2 bg-[#161B26]/80 backdrop-blur-xl p-1 pr-4 md:pr-6 rounded-full shadow-2xl border border-white/5 mb-8 md:mb-10"
        >
          <div
            style={{ backgroundColor: SKAUTE_BLUE }}
            className="px-3 md:px-5 py-1.5 md:py-2.5 rounded-full flex items-center gap-2"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-white">
              Live Now
            </span>
          </div>
          <span className="text-[9px] md:text-[11px] font-bold uppercase tracking-widest text-[#94A3B8]">
            Over 100 moves <span className="hidden xs:inline">active</span> in{" "}
            <span style={{ color: SKAUTE_YELLOW }} className="font-black">
              PH City
            </span>
          </span>
        </motion.div>

        {/* 3. CORE HEADLINE ARCHITECTURE */}
        <div className="text-center mb-10 md:mb-14">
          <motion.h1
            variants={itemVariants}
            className="text-5xl sm:text-7xl md:text-[120px] font-black tracking-[-0.04em] md:tracking-[-0.06em] leading-[0.95] md:leading-[0.85] uppercase text-white"
          >
            What’s <br />
            <span className="relative inline-block text-white">
              happening
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{
                  delay: 0.9,
                  duration: 0.8,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{ backgroundColor: SKAUTE_YELLOW }}
                className="absolute bottom-1 md:bottom-2 left-0 w-full h-[0.08em] -z-10 origin-left opacity-90 rounded-full"
              />
            </span>{" "}
            <br />
            <span
              style={{ color: SKAUTE_BLUE }}
              className="italic font-serif font-light normal-case"
            >
              right now?
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-6 md:mt-8 text-[#94A3B8] text-sm md:text-xl font-medium max-w-[280px] sm:max-w-xl mx-auto leading-relaxed"
          >
            Real-time access to local events, trending spots, and curated moves
            across the city.
          </motion.p>
        </div>

        {/* 4. PREMIUM CTA HUB */}
        <motion.div
          variants={itemVariants}
          className="w-full max-w-[320px] md:max-w-md"
        >
          <Link href="/map" className="group block">
            <motion.div
              whileHover={{ scale: 1.015, y: -2 }}
              whileTap={{ scale: 0.985 }}
              style={{ backgroundColor: SKAUTE_BLUE }}
              className="relative overflow-hidden rounded-[24px] md:rounded-[32px] p-0.5 shadow-2xl shadow-blue-500/10"
            >
              <div className="absolute inset-0 bg-[#0B0E14] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.16,1,0.3,1]" />

              <div className="relative flex items-center justify-between px-6 md:px-8 py-5 md:py-7 text-white z-10">
                <div className="flex flex-col text-left">
                  <span className="text-xl md:text-2xl font-black uppercase tracking-tight transition-colors duration-300 group-hover:text-white">
                    Open the Map
                  </span>
                  <span
                    style={{ color: SKAUTE_YELLOW }}
                    className="text-[8px] md:text-[9px] uppercase tracking-[0.2em] font-black mt-0.5"
                  >
                    Explore active zones
                  </span>
                </div>
                <div className="bg-white/10 p-3 md:p-3.5 rounded-xl md:rounded-2xl group-hover:rotate-[360deg] group-hover:bg-white/5 transition-all duration-700 ease-out">
                  <Navigation
                    className="w-5 h-5 md:w-6 md:h-6 fill-current rotate-[15deg] text-white"
                    strokeWidth={2.5}
                  />
                </div>
              </div>
            </motion.div>
          </Link>
        </motion.div>

        {/* 5. MINIMALIST SCROLL SYSTEM */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 1.4 }}
          className="mt-12 md:mt-16 flex flex-col items-center gap-3"
        >
          <span className="text-[8px] md:text-[9px] uppercase tracking-[0.4em] font-black text-[#56647A]">
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="w-px h-10 md:h-14 bg-gradient-to-b from-[#56647A] to-transparent"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
