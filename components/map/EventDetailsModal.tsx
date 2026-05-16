"use client";
import { motion } from "framer-motion";
import {
  X,
  Calendar,
  Clock,
  Sparkles,
  MapPin,
  Ticket,
  Heart,
  ArrowRight,
  Lock,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface EventDetailsModalProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selected: any;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  timeLeft: any;
  followedUsers: Set<string>;
  toggleFollow: (name: string) => void;
  likedEvents: Set<string>;
  toggleLike: (e: React.MouseEvent, id: string) => void;
  displayPrice: string;
}

export default function EventDetailsModal({
  selected,
  onClose,
  timeLeft,
  followedUsers,
  toggleFollow,
  likedEvents,
  toggleLike,
  displayPrice,
}: EventDetailsModalProps) {
  const router = useRouter();
  if (!selected) return null;

  const isSoldOut = displayPrice === "Sold Out";
  const isFreeOption = displayPrice === "Free" || displayPrice === "Free +";

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90]"
      />

      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed bottom-0 left-0 md:inset-0 md:m-auto w-full md:max-w-2xl md:h-fit bg-white rounded-t-[40px] md:rounded-[40px] shadow-2xl z-[600] overflow-hidden flex flex-col max-h-[85vh] md:max-h-[85vh]"
      >
        <div className="absolute top-0 left-0 w-full h-12 flex items-center justify-center z-[120] pointer-events-none">
          <div className="w-12 h-1.5 bg-gray-200/80 backdrop-blur-md rounded-full" />
        </div>

        <div className="overflow-y-auto pb-32 z-[100]">
          <div className="relative w-full h-64 sm:h-80">
            <Image
              src={selected.image}
              alt={selected.title}
              fill
              priority
              className={`object-cover ${isSoldOut ? "grayscale opacity-80" : ""}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

            <button
              onClick={onClose}
              className="absolute top-6 right-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 active:scale-90 transition-all shadow-lg z-[130]"
            >
              <X size={20} />
            </button>

            {isSoldOut && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
                <div className="bg-white px-6 py-2.5 rounded-2xl flex items-center gap-2 shadow-2xl border border-white/50">
                  <Lock size={16} className="text-red-500 fill-red-500" />
                  <span className="font-black text-[12px] uppercase tracking-[0.2em] text-gray-900">
                    Sold Out
                  </span>
                </div>
              </div>
            )}

            {timeLeft && timeLeft.label !== "Ended" && !isSoldOut && (
              <div className="absolute top-6 left-6 flex justify-start z-[130]">
                <div className="bg-black/40 backdrop-blur-xl border border-white/20 px-5 py-3 rounded-[24px] flex flex-col shadow-2xl">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-400 leading-none mb-2">
                    {timeLeft.label}
                  </p>
                  <div className="flex items-center gap-3 text-white tabular-nums">
                    {timeLeft.d > 0 && (
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-lg font-black">{timeLeft.d}</span>
                        <span className="text-[9px] font-black opacity-60 uppercase">
                          Days
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-lg font-black">{timeLeft.h}</span>
                        <span className="text-[9px] font-black opacity-60 uppercase">
                          Hrs
                        </span>
                      </div>
                      <span className="text-xs font-black opacity-30">:</span>
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-lg font-black">{timeLeft.m}</span>
                        <span className="text-[9px] font-black opacity-60 uppercase">
                          Min
                        </span>
                      </div>
                      <span className="text-xs font-black opacity-30">:</span>
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-lg font-black">{timeLeft.s}</span>
                        <span className="text-[9px] font-black opacity-60 uppercase">
                          Sec
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 md:p-8 -mt-10 relative z-10">
            <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-black/5 border border-gray-50 mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`flex items-center gap-1.5 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                    selected.timeStatus === "ongoing"
                      ? "bg-green-100 text-green-600"
                      : "bg-amber-50 text-amber-600"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      selected.timeStatus === "ongoing"
                        ? "bg-green-500 animate-pulse"
                        : "bg-amber-400"
                    }`}
                  />
                  {selected.timeStatus}
                </span>
                <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-3 py-1 rounded-full uppercase tracking-widest">
                  👥 {selected.attendees || 0} Joined
                </span>
              </div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tighter leading-tight">
                {selected.title}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-4 bg-gray-50/50 p-5 rounded-[28px] border border-gray-100">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-900 shadow-sm border border-gray-100">
                  <Calendar size={22} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">
                    Schedule Date
                  </p>
                  <p className="text-base font-bold text-gray-900">
                    {new Date(selected.startDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-gray-50/50 p-5 rounded-[28px] border border-gray-100">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-900 shadow-sm border border-gray-100">
                  <Clock size={22} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">
                    Start Time
                  </p>
                  <p className="text-base font-bold text-gray-900">
                    {new Date(selected.startDate).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-1 flex items-center justify-between p-4 bg-gray-900 rounded-[32px] text-white">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 rounded-full overflow-hidden border border-white/20">
                    <Image
                      src={selected.organizerImage}
                      alt="Org"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="text-xs font-bold">
                    {selected.organizerName}
                  </span>
                </div>
                <button
                  onClick={() => toggleFollow(selected.organizerName)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  {followedUsers.has(selected.organizerName)
                    ? "Following"
                    : "Follow"}
                </button>
              </div>

              <div className="flex items-center gap-4 p-4 px-6 bg-amber-50 rounded-[32px] border border-amber-100">
                <Sparkles size={18} className="text-amber-600" />
                <div>
                  <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest leading-none mb-1">
                    Vibe
                  </p>
                  <p className="text-sm font-black text-amber-900 capitalize">
                    {selected.category}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-[28px] bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={14} className="text-gray-400" />
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    Venue
                  </span>
                </div>
                <p className="text-sm font-bold text-gray-900 truncate">
                  {selected.isOnline
                    ? "Virtual Room"
                    : selected.location?.neighborhood || "Port Harcourt"}
                </p>
              </div>

              <div className="p-5 rounded-[28px] bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <Ticket size={14} className="text-gray-400" />
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    Entry
                  </span>
                </div>
                <p
                  className={`text-sm font-black ${
                    isSoldOut
                      ? "text-red-500"
                      : isFreeOption
                        ? "text-green-600"
                        : "text-gray-900"
                  }`}
                >
                  {displayPrice}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-6 bg-white/90 backdrop-blur-xl border-t border-gray-100 flex gap-4 items-center shadow-[0_-10px_40px_rgba(0,0,0,0.08)] z-[110]">
          <button
            onClick={(e) => toggleLike(e, selected._id)}
            className="w-16 h-16 rounded-3xl border border-gray-200 flex items-center justify-center active:scale-90 transition-all bg-white"
          >
            <Heart
              size={24}
              className={
                likedEvents.has(selected._id)
                  ? "fill-red-500 text-red-500"
                  : "text-gray-300"
              }
            />
          </button>

          <button
            onClick={() =>
              !isSoldOut && router.push(`/discover/${selected.id}`)
            }
            disabled={isSoldOut}
            className={`flex-1 h-16 font-black rounded-3xl shadow-xl transition-all uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 ${
              isSoldOut
                ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                : "bg-[#FFD700] text-black hover:bg-[#ffe033] active:scale-95"
            }`}
          >
            {isSoldOut ? "Sold Out" : "Get Tickets"} <ArrowRight size={18} />
          </button>
        </div>
      </motion.div>
    </>
  );
}
