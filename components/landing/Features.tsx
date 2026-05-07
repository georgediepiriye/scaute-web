"use client";
import { Navigation, Plus, Ticket } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Features() {
  return (
    <section className="py-32 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Card 1: Discovery (Pink) */}
      <div className="bg-[#FFD1E8] p-10 rounded-[60px] min-h-[550px] flex flex-col border-4 border-transparent hover:border-pink-300 transition-all group">
        <div className="flex-1">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-pink-500 shadow-sm mb-6">
            <Navigation size={28} strokeWidth={2.5} />
          </div>
          <h3 className="text-4xl font-black tracking-tighter leading-[0.9] mb-4 uppercase">
            Find Your <br /> <span className="italic">Vibe.</span>
          </h3>
          <p className="text-base font-bold text-pink-900/60 leading-tight mb-8">
            The live map shows you exactly where the crowd is moving in
            real-time. No more dead vibes.
          </p>
        </div>

        {/* Illustration Space */}
        <div className="w-full h-48 bg-white/40 rounded-[32px] border-2 border-dashed border-pink-300 relative flex items-center justify-center overflow-hidden">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 2 }}
            className="relative w-full h-full"
          >
            <Image
              src="https://res.cloudinary.com/dzhfiblg7/image/upload/f_auto,q_auto,w_800/v1778054500/kivo_events/inhouse/discovery_vibe.png"
              alt="Find your vibe illustration"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              priority // Recommended since this is an "above the fold" onboarding element
              className="object-cover"
            />
          </motion.div>
        </div>
      </div>

      {/* Card 2: Creation (Amber) */}
      <div className="bg-[#FFF4D1] p-10 rounded-[60px] min-h-[550px] flex flex-col border-4 border-transparent hover:border-amber-300 transition-all group">
        <div className="flex-1">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-sm mb-6">
            <Plus size={28} strokeWidth={2.5} />
          </div>
          <h3 className="text-4xl font-black tracking-tighter leading-[0.9] mb-4 uppercase">
            Host the <br /> <span className="italic">Moment.</span>
          </h3>
          <p className="text-base font-bold text-amber-900/60 leading-tight mb-8">
            Planning any casual activity or an event? Create it here, set your
            price, and share your Kivo link. We handle the rest.
          </p>
        </div>

        {/* Illustration Space */}
        <div className="w-full h-48 bg-white/40 rounded-[32px] border-2 border-dashed border-amber-300 relative flex items-center justify-center overflow-hidden">
          <motion.div
            whileHover={{ scale: 1.1, rotate: -2 }}
            className="relative w-full h-full"
          >
            <Image
              src="https://res.cloudinary.com/dzhfiblg7/image/upload/f_auto,q_auto,w_800/v1778054800/kivo_events/inhouse/host_moment.png"
              alt="Host the moment illustration"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              className="object-cover"
            />
          </motion.div>
        </div>
      </div>

      {/* Card 3: Ticketing (Green) */}
      <div className="bg-[#D1FFD9] p-10 rounded-[60px] min-h-[550px] flex flex-col border-4 border-transparent hover:border-green-300 transition-all group">
        <div className="flex-1">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-green-600 shadow-sm mb-6">
            <Ticket size={28} strokeWidth={2.5} />
          </div>
          <h3 className="text-4xl font-black tracking-tighter leading-[0.9] mb-4 uppercase">
            Tickets <br /> in a <span className="italic">Tap.</span>
          </h3>
          <p className="text-base font-bold text-green-900/60 leading-tight mb-8">
            Secure, fast, and 100% digital. Buy tickets to any event in PH
            without leaving the app.
          </p>
        </div>

        {/* Illustration Space */}
        <div className="w-full h-48 bg-white/40 rounded-[32px] border-2 border-dashed border-green-300 relative flex items-center justify-center overflow-hidden">
          <motion.div
            whileHover={{ scale: 1.1, y: -5 }}
            className="relative w-full h-full"
          >
            <Image
              src="https://res.cloudinary.com/dzhfiblg7/image/upload/f_auto,q_auto,w_800/v1778055100/kivo_events/inhouse/digital_ticketing.png"
              alt="Digital ticketing illustration"
              fill
              className="object-cover"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
