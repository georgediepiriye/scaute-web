"use client";
import { Sparkles } from "lucide-react";

type FilterType = "upcoming" | "ongoing";

interface MapFiltersProps {
  activeFilter: FilterType;
  setActiveFilter: (filter: FilterType) => void;
  activeHotspotCat: string;
  setActiveHotspotCat: (catId: string) => void;
  setShowHotspots: (show: boolean) => void;
  categories: Array<{ id: string; label: string; icon: React.ReactNode }>;
}

export default function MapFilters({
  activeFilter,
  setActiveFilter,
  activeHotspotCat,
  setActiveHotspotCat,
  setShowHotspots,
  categories,
}: MapFiltersProps) {
  return (
    <div className="fixed top-[68px] md:top-[100px] left-0 w-full z-[40] flex flex-col items-center">
      <div className="w-full max-w-6xl px-4 relative">
        <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar scroll-mask pb-4 pt-1">
          <div className="flex bg-white/90 backdrop-blur-xl shadow-xl rounded-full p-1 border border-gray-100 shrink-0">
            {(["ongoing", "upcoming"] as FilterType[]).map((status) => (
              <button
                key={status}
                onClick={() => setActiveFilter(status)}
                className={`relative flex items-center gap-2 px-5 py-2 rounded-full transition-all duration-300 font-black text-[10px] uppercase tracking-widest border ${
                  activeFilter === status
                    ? "border-gray-900 text-gray-900 bg-white"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                {status === "ongoing" ? "🔥 Live" : "📅 Upcoming"}
              </button>
            ))}
          </div>

          <div className="w-px h-6 bg-gray-200/60 mx-1 shrink-0" />

          <div className="flex gap-2">
            {categories.map((cat) => {
              const isActive = activeHotspotCat === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveHotspotCat(cat.id);
                    setShowHotspots(true);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border shrink-0 ${
                    isActive
                      ? "bg-white text-gray-900 border-gray-900 shadow-md"
                      : "bg-white/80 backdrop-blur-md text-gray-400 border-gray-100 hover:border-gray-300 shadow-sm"
                  }`}
                >
                  <span
                    className={isActive ? "text-gray-900" : "text-gray-300"}
                  >
                    {cat.icon}
                  </span>
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
