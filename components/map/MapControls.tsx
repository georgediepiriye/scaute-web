"use client";
import { Info, Flame, LocateFixed } from "lucide-react";

interface MapControlsProps {
  showHotspots: boolean;
  setShowHotspots: (show: boolean) => void;
  setShowGuide: (show: boolean) => void;
  handleLocateUser: () => void;
}

export default function MapControls({
  showHotspots,
  setShowHotspots,
  setShowGuide,
  handleLocateUser,
}: MapControlsProps) {
  return (
    <div className="absolute bottom-36 right-4 z-[40] md:bottom-10 md:right-10 flex flex-col gap-2.5">
      <button
        onClick={() => setShowGuide(true)}
        className="w-10 h-10 bg-white/95 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center text-gray-400 border border-gray-100 active:scale-90"
      >
        <Info size={18} />
      </button>
      <button
        onClick={() => setShowHotspots(!showHotspots)}
        className={`w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all border active:scale-90 ${
          showHotspots
            ? "bg-gray-900 text-white border-gray-900"
            : "bg-white text-gray-400 border-gray-100"
        }`}
      >
        <Flame size={18} fill={showHotspots ? "currentColor" : "none"} />
      </button>
      <button
        onClick={handleLocateUser}
        className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-black border border-gray-100 active:scale-90"
      >
        <LocateFixed size={18} />
      </button>
    </div>
  );
}
