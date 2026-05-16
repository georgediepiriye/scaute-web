"use client";
import { motion } from "framer-motion";
import { X, Navigation } from "lucide-react";
import Image from "next/image";

interface HotspotModalProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hotspot: any;
  onClose: () => void;
}

export default function HotspotModal({ hotspot, onClose }: HotspotModalProps) {
  if (!hotspot) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-0 left-0 md:bottom-auto md:top-[10vh] md:left-1/2 md:-translate-x-1/2 w-full md:max-w-2xl bg-white rounded-t-[40px] md:rounded-[40px] shadow-2xl z-[100] overflow-hidden flex flex-col max-h-[85vh] md:max-h-[85vh]"
    >
      <div className="bg-white rounded-[32px] shadow-2xl border border-gray-100 overflow-hidden relative">
        <div className="relative h-44 w-full">
          <Image
            src={hotspot.image}
            alt="Hotspot"
            fill
            className="object-cover"
          />
          <div className="absolute top-4 right-4 z-[120]">
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white shadow-lg rounded-full flex items-center justify-center"
            >
              <X size={16} />
            </button>
          </div>
        </div>
        <div className="p-6">
          <h3 className="text-xl font-black text-gray-900 tracking-tighter mb-2">
            {hotspot.title || hotspot.name}
          </h3>
          <p className="text-gray-500 text-xs mb-6 leading-relaxed">
            {hotspot.description || "An active hub in the city."}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button className="py-3 bg-gray-50 text-gray-900 font-black rounded-2xl text-[10px] uppercase border border-gray-100 flex items-center justify-center gap-2">
              <Navigation size={12} /> Directions
            </button>
            <button className="py-3 bg-black text-white font-black rounded-2xl text-[10px] uppercase tracking-widest">
              Explore
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
