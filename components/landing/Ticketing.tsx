"use client";
import { Ticket, ScanLine, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Ticketing() {
  return (
    <section className="py-24 px-6 bg-slate-950 text-white overflow-hidden rounded-[60px] mx-4">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        <div className="flex-1 space-y-8">
          <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
            SMART PASS.
            <br />
            <span className="text-blue-500">FAST ENTRY.</span>
          </h2>

          <p className="text-xl text-slate-400 font-bold max-w-md">
            Your Kivo Pass is a dynamic digital key. No more digging through
            emails or lost paper—just a smooth scan at the door.
          </p>

          <div className="flex gap-4">
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10 flex-1 text-center">
              <ScanLine className="mx-auto mb-2 text-amber-400" />
              <p className="font-black text-xs uppercase tracking-widest">
                Instant Scan
              </p>
            </div>
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10 flex-1 text-center">
              <Ticket className="mx-auto mb-2 text-blue-400" />
              <p className="font-black text-xs uppercase tracking-widest">
                Live Status
              </p>
            </div>
          </div>
        </div>

        {/* The "Scanner" Visual with Success State */}
        <div className="relative w-full max-w-sm aspect-[9/16] bg-slate-900 rounded-[50px] border-[10px] border-slate-800 shadow-2xl overflow-hidden">
          {/* Animated Ticket Interior */}
          <motion.div
            animate={{
              backgroundColor: ["#2563eb", "#2563eb", "#00FF66", "#2563eb"],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              times: [0, 0.45, 0.6, 1],
            }}
            className="relative flex flex-col items-center justify-center h-full text-center p-8"
          >
            {/* Scanning Line */}
            <motion.div
              animate={{ top: ["10%", "90%", "10%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-0 w-full h-1 bg-white shadow-[0_0_20px_2px_rgba(255,255,255,1)] z-20"
            />

            {/* QR Code Container */}
            <div className="relative w-48 h-48 bg-white rounded-3xl mb-8 flex items-center justify-center p-4 shadow-2xl">
              {/* Checkmark Overlay on Success */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0, 0, 1.2, 1, 0],
                  opacity: [0, 0, 1, 1, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  times: [0, 0.45, 0.55, 0.8, 1],
                }}
                className="absolute z-10 text-[#00FF66]"
              >
                <CheckCircle2 size={80} strokeWidth={3} />
              </motion.div>

              {/* Decorative QR Pattern */}
              <div className="w-full h-full border-4 border-slate-900 border-dashed opacity-10" />
            </div>

            <div className="space-y-1 relative z-10">
              <motion.p
                animate={{
                  color: ["#bfdbfe", "#bfdbfe", "#064e3b", "#bfdbfe"],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  times: [0, 0.45, 0.6, 1],
                }}
                className="font-black text-[10px] uppercase tracking-[0.3em]"
              >
                Verified Entry Pass
              </motion.p>

              <h3 className="font-black text-3xl uppercase tracking-tighter">
                Kivo Carnival
              </h3>

              <motion.div
                animate={{
                  opacity: [1, 1, 0, 1],
                  y: [0, 0, 10, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  times: [0, 0.45, 0.5, 1],
                }}
              >
                <p className="text-white/80 font-bold text-sm italic">
                  Port Harcourt, NG
                </p>
              </motion.div>

              {/* Success Text */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0, 1, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  times: [0, 0.5, 0.8, 1],
                }}
                className="text-slate-950 font-black text-xl uppercase tracking-widest pt-2"
              >
                ACCESS GRANTED
              </motion.p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
