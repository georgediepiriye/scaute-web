/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Loader2,
  MapPin,
  Calendar,
  Tag,
  X,
  Navigation,
  Send,
  Link2,
  Info,
  Copy,
  Check,
  Video,
  Globe,
  Clock3,
  ShieldCheck,
  Eye,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const SKAUTE_BLUE = "#0052FF";
const SKAUTE_YELLOW = "#FFD700";

export const PreviewModal = ({
  isOpen,
  onClose,
  data,
  preview,
  submitting,
  onConfirm,
}: any) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const eventLink = `skaute.onrender.com/e/${data.slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(eventLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  const formatNGRDate = (dateString: string) => {
    if (!dateString) return "TBD";

    const date = new Date(dateString);

    return date.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatNGRTime = (timeString: string) => {
    if (!timeString) return "00:00";

    const [hours, minutes] = timeString.split(":");

    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const renderFormatBadge = () => {
    switch (data.eventFormat) {
      case "online":
        return {
          icon: <Video size={12} />,
          label: "Online",
        };

      case "hybrid":
        return {
          icon: <Globe size={12} />,
          label: "Hybrid",
        };

      default:
        return {
          icon: <MapPin size={12} />,
          label: "Physical",
        };
    }
  };

  const formatBadge = renderFormatBadge();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-5">
          {/* BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* MODAL */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.25 }}
            className="relative w-full max-w-2xl bg-white rounded-[32px] sm:rounded-[40px] overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.25)] max-h-[94vh] flex flex-col"
          >
            {/* CLOSE */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-50 w-11 h-11 rounded-full bg-black/25 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-black/40 transition-all"
            >
              <X size={18} />
            </button>

            {/* SCROLLABLE BODY */}
            <div className="overflow-y-auto">
              {/* HERO IMAGE */}
              <div className="relative aspect-[1.1/1] sm:aspect-video overflow-hidden">
                {preview ? (
                  <Image
                    src={preview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center text-gray-400">
                    <Sparkles size={34} />
                    <p className="mt-3 text-[10px] font-black uppercase tracking-[0.25em]">
                      No Cover Uploaded
                    </p>
                  </div>
                )}

                {/* OVERLAY */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                {/* TOP BADGES */}
                <div className="absolute top-5 left-5 flex flex-wrap items-center gap-2">
                  <div
                    className="px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-black"
                    style={{ backgroundColor: SKAUTE_YELLOW }}
                  >
                    {formatBadge.icon}
                    {formatBadge.label}
                  </div>

                  {data.category && (
                    <div className="px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-xl border border-white/10 text-white text-[9px] font-black uppercase tracking-[0.18em]">
                      {data.category}
                    </div>
                  )}
                </div>

                {/* TITLE */}
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
                  <div className="max-w-xl">
                    <h1 className="text-white text-2xl sm:text-4xl font-black uppercase leading-[0.95] tracking-[-0.04em]">
                      {data.title || "Untitled Move"}
                    </h1>

                    {data.description && (
                      <p className="mt-3 text-white/80 text-sm font-medium line-clamp-3 leading-relaxed">
                        {data.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* CONTENT */}
              <div className="p-5 sm:p-8 space-y-7">
                {/* LINK CARD */}
                {(data.slug || data.customLink) && (
                  <div className="relative overflow-hidden rounded-[28px] border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5 sm:p-6">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-blue-100/30 rounded-full blur-3xl" />

                    <div className="relative z-10">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Link2 size={14} className="text-blue-600" />

                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
                              Shareable Link
                            </span>
                          </div>

                          <p className="text-sm sm:text-base font-black text-gray-900 break-all leading-relaxed">
                            {eventLink}
                          </p>
                        </div>

                        <button
                          onClick={handleCopy}
                          className={`shrink-0 h-11 px-4 rounded-2xl border transition-all flex items-center gap-2 ${
                            copied
                              ? "bg-green-50 border-green-200"
                              : "bg-white border-blue-100 hover:bg-blue-50"
                          }`}
                        >
                          {copied ? (
                            <Check size={14} className="text-green-600" />
                          ) : (
                            <Copy size={14} className="text-blue-600" />
                          )}

                          <span
                            className={`text-[10px] font-black uppercase tracking-wider ${
                              copied ? "text-green-600" : "text-blue-600"
                            }`}
                          >
                            {copied ? "Copied" : "Copy"}
                          </span>
                        </button>
                      </div>

                      <div className="mt-4 flex items-start gap-2">
                        <Info
                          size={14}
                          className="text-blue-600 mt-0.5 shrink-0"
                        />

                        <p className="text-[10px] font-bold uppercase tracking-wide text-gray-600 leading-relaxed">
                          This link becomes active once your move is approved.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* QUICK INFO GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* DATE */}
                  <div className="rounded-[28px] border border-gray-100 bg-gray-50 p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center"
                        style={{
                          backgroundColor: `${SKAUTE_BLUE}12`,
                        }}
                      >
                        <Calendar size={18} style={{ color: SKAUTE_BLUE }} />
                      </div>

                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">
                          Date
                        </p>

                        <p className="text-xs font-bold text-gray-500 uppercase">
                          Event Schedule
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-black text-gray-900 leading-relaxed">
                        {formatNGRDate(data.startDate)}
                      </p>

                      <div className="flex items-center gap-2">
                        <Clock3 size={13} style={{ color: SKAUTE_BLUE }} />

                        <p
                          className="text-xs font-black uppercase tracking-wide"
                          style={{ color: SKAUTE_BLUE }}
                        >
                          {formatNGRTime(data.startTime)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* LOCATION */}
                  <div className="rounded-[28px] border border-gray-100 bg-gray-50 p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center"
                        style={{
                          backgroundColor: `${SKAUTE_BLUE}12`,
                        }}
                      >
                        {data.eventFormat === "online" ? (
                          <Video size={18} style={{ color: SKAUTE_BLUE }} />
                        ) : data.eventFormat === "hybrid" ? (
                          <Globe size={18} style={{ color: SKAUTE_BLUE }} />
                        ) : (
                          <MapPin size={18} style={{ color: SKAUTE_BLUE }} />
                        )}
                      </div>

                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">
                          {data.eventFormat === "online"
                            ? "Meeting Link"
                            : "Venue"}
                        </p>

                        <p className="text-xs font-bold text-gray-500 uppercase">
                          Location Details
                        </p>
                      </div>
                    </div>

                    {data.eventFormat === "online" ? (
                      <p className="text-sm font-black text-blue-600 break-all leading-relaxed">
                        {data.meetingLink || "No link added"}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm font-black text-gray-900 leading-relaxed">
                          {data.location || "No location selected"}
                        </p>

                        {data.neighborhood && (
                          <div className="flex items-center gap-1.5">
                            <Navigation
                              size={11}
                              style={{ color: SKAUTE_BLUE }}
                            />

                            <p
                              className="text-[10px] font-black uppercase tracking-wide"
                              style={{ color: SKAUTE_BLUE }}
                            >
                              {data.neighborhood}
                            </p>
                          </div>
                        )}

                        {data.eventFormat === "hybrid" && data.meetingLink && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100">
                            <Link2 size={10} className="text-blue-600" />

                            <span className="text-[9px] font-black uppercase text-blue-600 tracking-wide">
                              Includes Online Access
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* TAGS */}
                <div className="rounded-[28px] border border-gray-100 p-5 sm:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Tag size={14} style={{ color: SKAUTE_BLUE }} />

                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                      Tags
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {data.tags &&
                    typeof data.tags === "string" &&
                    data.tags.trim() !== "" ? (
                      data.tags.split(",").map((tag: string, i: number) => (
                        <div
                          key={i}
                          className="px-4 py-2 rounded-2xl bg-gray-50 border border-gray-100"
                        >
                          <span className="text-[10px] font-black uppercase tracking-wide text-gray-700">
                            #{tag.trim()}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm font-medium text-gray-400 italic">
                        No tags added yet
                      </p>
                    )}
                  </div>
                </div>

                {/* STATUS CARD */}
                <div className="rounded-[30px] bg-black text-white p-5 sm:p-6 relative overflow-hidden">
                  <div
                    className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-30"
                    style={{ backgroundColor: SKAUTE_BLUE }}
                  />

                  <div className="relative z-10 flex items-start gap-4">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${SKAUTE_YELLOW}` }}
                    >
                      <ShieldCheck size={26} color="#000" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Eye size={13} style={{ color: SKAUTE_YELLOW }} />

                        <p
                          className="text-[10px] font-black uppercase tracking-[0.2em]"
                          style={{ color: SKAUTE_YELLOW }}
                        >
                          Moderation Review
                        </p>
                      </div>

                      <p className="text-sm font-bold text-white leading-relaxed">
                        Your move will be reviewed before appearing publicly on
                        the map and discovery feed.
                      </p>

                      <p className="mt-3 text-[10px] font-black uppercase tracking-wide text-white/50">
                        Estimated approval time: 1–12 hours
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="p-5 sm:p-8 pt-2 sm:pt-4 flex flex-col sm:flex-row gap-4 bg-white shrink-0 border-t border-gray-100">
              <button
                onClick={onClose}
                className="flex-1 min-h-[64px] px-6 py-5 bg-gray-100 hover:bg-gray-200 rounded-[24px] font-black text-[11px] tracking-wide uppercase transition-all active:scale-[0.99] order-2 sm:order-1 shadow-sm"
              >
                Edit Move
              </button>

              <button
                onClick={onConfirm}
                disabled={submitting}
                className="flex-1 min-h-[64px] px-6 py-5 text-white rounded-[24px] font-black text-[11px] tracking-wide uppercase transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 order-1 sm:order-2 shadow-xl"
                style={{
                  backgroundColor: SKAUTE_BLUE,
                  boxShadow: `0 12px 24px -6px ${SKAUTE_BLUE}40`,
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Broadcasting...
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    Confirm & Broadcast
                  </>
                )}
              </button>
            </div>

            {/* SUBMITTING OVERLAY */}
            <AnimatePresence>
              {submitting && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-[120] bg-white/90 backdrop-blur-md flex flex-col items-center justify-center"
                >
                  <div className="relative">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.5,
                        ease: "linear",
                      }}
                      className="w-20 h-20 rounded-full border-[5px] border-gray-100"
                      style={{
                        borderTopColor: SKAUTE_BLUE,
                      }}
                    />

                    <div className="absolute inset-0 flex items-center justify-center">
                      <Send size={24} style={{ color: SKAUTE_BLUE }} />
                    </div>
                  </div>

                  <p className="mt-6 text-[10px] font-black uppercase tracking-[0.35em] text-gray-900 animate-pulse">
                    Sending To The Streets...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
