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
  Video, // Added for online moves
  Globe, // Added for hybrid moves
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

  const eventLink = `skaute-isca.onrender.com/e/${data.slug}`;

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

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />

      {/* Main Modal Container */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-lg bg-white rounded-[32px] sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="overflow-y-auto custom-scrollbar">
          {/* 1. Image Preview Section */}
          <div className="relative aspect-video w-full bg-gray-100 shrink-0">
            {preview ? (
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-cover"
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-300">
                <Sparkles size={32} />
                <p className="text-[10px] font-black uppercase mt-2 tracking-tighter">
                  No Image Uploaded
                </p>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-5 right-5 sm:bottom-6 sm:left-8 sm:right-8">
              <span
                className="px-2.5 py-1 text-gray-900 text-[8px] sm:text-[9px] font-black uppercase rounded-full tracking-wider"
                style={{ backgroundColor: SKAUTE_YELLOW }}
              >
                {data.category || "General"}
              </span>
              <h2 className="text-white text-xl sm:text-2xl font-black uppercase mt-2 line-clamp-2 leading-none tracking-tighter">
                {data.title || "Move"}
              </h2>
            </div>
          </div>

          {/* 2. Details Body */}
          <div className="p-5 sm:p-8 space-y-6">
            {/* Custom Link Section */}
            {(data.slug || data.customLink) && (
              <div className="p-4 sm:p-5 bg-blue-50 rounded-[24px] sm:rounded-[32px] border border-blue-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Link2 size={14} className="text-blue-600" />
                    <p className="text-[9px] font-black uppercase text-blue-600 tracking-widest">
                      Custom Move Link
                    </p>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1 bg-white border border-blue-100 rounded-full shadow-sm hover:bg-blue-50 transition-colors group"
                  >
                    {copied ? (
                      <Check size={10} className="text-green-600" />
                    ) : (
                      <Copy
                        size={10}
                        className="text-blue-600 group-hover:scale-110 transition-transform"
                      />
                    )}
                    <span
                      className={`text-[8px] font-black uppercase tracking-tighter ${copied ? "text-green-600" : "text-blue-600"}`}
                    >
                      {copied ? "Copied!" : "Copy Link"}
                    </span>
                  </button>
                </div>

                <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm">
                  <p className="text-xs sm:text-sm font-black text-gray-900 break-all">
                    {eventLink}
                  </p>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex items-start gap-2">
                    <Info size={14} className="text-blue-600 mt-0.5 shrink-0" />
                    <p className="text-[9px] font-bold text-gray-700 uppercase leading-snug">
                      Goes live after approval. View in{" "}
                      <span className="text-blue-700 underline">
                        Event Details
                      </span>{" "}
                      on profile.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
              <div className="space-y-1.5">
                <p className="text-[9px] font-black uppercase text-gray-400 flex items-center gap-1.5 tracking-widest">
                  <Calendar size={12} style={{ color: SKAUTE_BLUE }} /> Date &
                  Time
                </p>
                <div className="text-xs font-bold text-gray-900 leading-snug">
                  <p>{formatNGRDate(data.startDate)}</p>
                  <p
                    className="mt-0.5 uppercase font-black"
                    style={{ color: SKAUTE_BLUE }}
                  >
                    {formatNGRTime(data.startTime)}
                  </p>
                </div>
              </div>

              {/* UPDATED: Venue/Link Section */}
              <div className="space-y-1.5">
                <p className="text-[9px] font-black uppercase text-gray-400 flex items-center gap-1.5 tracking-widest">
                  {data.eventFormat === "online" ? (
                    <Video size={12} style={{ color: SKAUTE_BLUE }} />
                  ) : data.eventFormat === "hybrid" ? (
                    <Globe size={12} style={{ color: SKAUTE_BLUE }} />
                  ) : (
                    <MapPin size={12} style={{ color: SKAUTE_BLUE }} />
                  )}
                  {data.eventFormat === "online" ? "Meeting Link" : "Venue"}
                </p>

                <div className="text-xs font-bold text-gray-900">
                  {data.eventFormat === "online" ? (
                    <p className="text-blue-600 underline break-all line-clamp-2">
                      {data.meetingLink || "Link not provided"}
                    </p>
                  ) : (
                    <>
                      <p className="line-clamp-2 leading-tight">
                        {data.location || "Location not set"}
                      </p>
                      {data.neighborhood && (
                        <p
                          className="text-[9px] uppercase font-black mt-1 flex items-center gap-1"
                          style={{ color: SKAUTE_BLUE }}
                        >
                          <Navigation size={8} /> {data.neighborhood}
                        </p>
                      )}
                      {data.eventFormat === "hybrid" && data.meetingLink && (
                        <p className="mt-2 text-[10px] font-black text-blue-600 uppercase flex items-center gap-1">
                          <Link2 size={10} /> + Online Link
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Tags Section */}
            <div className="space-y-2">
              <p className="text-[9px] font-black uppercase text-gray-400 flex items-center gap-1.5 tracking-widest">
                <Tag size={12} style={{ color: SKAUTE_BLUE }} /> Tags
              </p>
              <div className="flex flex-wrap gap-2">
                {data.tags &&
                typeof data.tags === "string" &&
                data.tags.trim() !== "" ? (
                  data.tags.split(",").map((tag: string, i: number) => (
                    <span
                      key={i}
                      className="text-[9px] font-black uppercase bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl text-gray-600"
                    >
                      #{tag.trim()}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] font-bold text-gray-300 italic">
                    No tags
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-5 sm:p-8 pt-0 flex flex-col sm:flex-row gap-3 bg-white shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-4 sm:py-5 bg-gray-50 hover:bg-gray-100 rounded-[20px] sm:rounded-[24px] font-black text-[10px] uppercase transition-all order-2 sm:order-1"
          >
            Edit Move
          </button>
          <button
            onClick={onConfirm}
            disabled={submitting}
            className="flex-1 py-4 sm:py-5 text-white rounded-[20px] sm:rounded-[24px] font-black text-[10px] uppercase transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 order-1 sm:order-2"
            style={{
              backgroundColor: SKAUTE_BLUE,
              boxShadow: `0 8px 15px -3px ${SKAUTE_BLUE}30`,
            }}
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin" size={14} />
                <span>Broadcasting...</span>
              </>
            ) : (
              "Confirm & Broadcast"
            )}
          </button>
        </div>

        {/* Submit Overlay */}
        <AnimatePresence>
          {submitting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[100] bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center"
            >
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="w-16 h-16 border-4 border-gray-100 border-t-blue-600 rounded-full"
                  style={{ borderTopColor: SKAUTE_BLUE }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Send size={20} style={{ color: SKAUTE_BLUE }} />
                </div>
              </div>
              <p className="mt-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-900 animate-pulse">
                Sending to the streets...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
