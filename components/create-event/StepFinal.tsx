/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ImageIcon,
  Settings2,
  ShieldAlert,
  Users,
  Sparkles,
  Eye,
  UserRound,
  ChevronRight,
  UploadCloud,
} from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

// BRAND COLOR CONSTANTS
const SKAUTE_BLUE = "#0052FF";
const SKAUTE_YELLOW = "#FFD700";

const Toggle = ({ label, sub, value, field, updateForm, icon }: any) => {
  const Icon = icon;

  return (
    <div className="flex items-center justify-between gap-4 p-4 rounded-[24px] bg-white/5 border border-white/10 hover:border-white/20 transition-all">
      <div className="flex items-start gap-4">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
          style={{
            backgroundColor: value ? SKAUTE_YELLOW : "#1F2937",
            color: value ? "#000" : "#9CA3AF",
          }}
        >
          <Icon size={18} />
        </div>

        <div className="space-y-1">
          <p className="text-[11px] font-black uppercase tracking-wider text-white">
            {label}
          </p>

          <p className="text-[10px] font-bold text-gray-400 uppercase leading-relaxed">
            {sub}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => updateForm(field, !value)}
        className="w-14 h-8 rounded-full transition-all relative shrink-0"
        style={{
          backgroundColor: value ? SKAUTE_YELLOW : "#374151",
        }}
      >
        <motion.div
          animate={{ x: value ? 26 : 4 }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
          className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg"
        />
      </button>
    </div>
  );
};

export const StepFinal = ({
  formData,
  updateForm,
  previewImage,
  handleImageChange,
}: any) => {
  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100 border border-yellow-200">
          <Sparkles size={12} className="text-yellow-700" />
          <span className="text-[10px] font-black uppercase tracking-widest text-yellow-900">
            Final Setup
          </span>
        </div>

        <div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-950">
            Almost Ready To Launch
          </h2>

          <p className="text-sm md:text-base text-slate-500 font-medium mt-2 max-w-2xl leading-relaxed">
            Add your cover image, choose visibility settings, and finalize how
            attendees experience your move.
          </p>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* LEFT SIDE */}
        <div className="xl:col-span-8">
          <div className="bg-white border border-gray-100 rounded-[36px] md:rounded-[44px] p-5 md:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.03)] overflow-hidden">
            {/* TOP BAR */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">
                  Event Banner
                </p>

                <h3 className="text-xl md:text-2xl font-black tracking-tight text-slate-950 mt-1">
                  Upload Cover Image
                </h3>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100">
                <UploadCloud size={14} style={{ color: SKAUTE_BLUE }} />

                <span className="text-[10px] font-black uppercase tracking-wider text-slate-700">
                  High Resolution Recommended
                </span>
              </div>
            </div>

            {/* IMAGE AREA */}
            <label className="group relative block overflow-hidden rounded-[32px] cursor-pointer">
              <div className="relative h-[320px] md:h-[440px] bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-200 transition-all duration-300 group-hover:border-yellow-300">
                {previewImage ? (
                  <>
                    <Image
                      src={previewImage}
                      alt="Preview"
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />

                    {/* OVERLAY */}
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* FLOATING BUTTON */}
                    <div className="absolute bottom-5 left-5 right-5">
                      <div className="backdrop-blur-xl bg-white/90 rounded-2xl px-5 py-4 flex items-center justify-between shadow-2xl border border-white/50">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                            Cover Uploaded
                          </p>

                          <p className="text-sm font-bold text-slate-950">
                            Tap to replace image
                          </p>
                        </div>

                        <div className="w-11 h-11 rounded-2xl bg-yellow-400 flex items-center justify-center">
                          <ChevronRight size={18} className="text-black" />
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="w-24 h-24 rounded-[28px] bg-white shadow-lg flex items-center justify-center mb-6 border border-gray-100"
                    >
                      <ImageIcon
                        size={40}
                        strokeWidth={1.5}
                        className="text-yellow-500"
                      />
                    </motion.div>

                    <h4 className="text-xl font-black tracking-tight text-slate-950">
                      Upload Event Banner
                    </h4>

                    <p className="text-sm text-slate-500 font-medium mt-2 max-w-sm leading-relaxed">
                      Use a bold, eye-catching image that captures the vibe of
                      your move.
                    </p>

                    <div className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-yellow-400 text-black font-black text-[11px] uppercase tracking-widest shadow-lg">
                      <UploadCloud size={16} />
                      Choose Image
                    </div>
                  </div>
                )}
              </div>

              <input
                type="file"
                className="hidden"
                required
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>

            {/* FOOTNOTE */}
            <div className="flex flex-wrap items-center gap-3 mt-5">
              <div className="px-3 py-2 rounded-full bg-gray-100 text-[10px] font-black uppercase tracking-wider text-gray-600">
                JPG / PNG
              </div>

              <div className="px-3 py-2 rounded-full bg-gray-100 text-[10px] font-black uppercase tracking-wider text-gray-600">
                Recommended: 1920×1080
              </div>

              <div className="px-3 py-2 rounded-full bg-gray-100 text-[10px] font-black uppercase tracking-wider text-gray-600">
                Max 10MB
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="xl:col-span-4">
          <div className="relative overflow-hidden bg-[#0B0B0F] rounded-[36px] md:rounded-[44px] border border-white/5 shadow-[0_25px_60px_rgba(0,0,0,0.25)]">
            {/* BACKGROUND GLOW */}
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-yellow-400/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="relative p-6 md:p-8 space-y-8">
              {/* HEADER */}
              <div className="space-y-3">
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border"
                  style={{
                    borderColor: `${SKAUTE_YELLOW}30`,
                    backgroundColor: `${SKAUTE_YELLOW}10`,
                  }}
                >
                  <Settings2 size={14} style={{ color: SKAUTE_YELLOW }} />

                  <span
                    className="text-[10px] font-black uppercase tracking-widest"
                    style={{ color: SKAUTE_YELLOW }}
                  >
                    Advanced Settings
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-black tracking-tight text-white">
                    Visibility & Rules
                  </h3>

                  <p className="text-sm text-gray-400 font-medium mt-2 leading-relaxed">
                    Control who sees your event and how attendees interact.
                  </p>
                </div>
              </div>

              {/* TOGGLES */}
              <div className="space-y-4">
                <Toggle
                  label="Public Visibility"
                  sub="Show on discovery feed and map"
                  value={formData.isPublic}
                  field="isPublic"
                  updateForm={updateForm}
                  icon={Eye}
                />

                <Toggle
                  label="Allow Anonymous"
                  sub="Guest check-ins without profile"
                  value={formData.allowAnonymous}
                  field="allowAnonymous"
                  updateForm={updateForm}
                  icon={UserRound}
                />
              </div>

              {/* AGE RESTRICTION */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Age Restriction
                  </label>

                  <Users size={14} className="text-gray-500" />
                </div>

                <div className="relative">
                  <select
                    value={formData.ageRestriction || "All Ages"}
                    onChange={(e) =>
                      updateForm("ageRestriction", e.target.value)
                    }
                    className="w-full h-14 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-5 text-white font-bold text-sm outline-none focus:ring-2 appearance-none"
                    style={
                      {
                        "--tw-ring-color": `${SKAUTE_YELLOW}40`,
                      } as any
                    }
                  >
                    <option value="All Ages" className="text-black">
                      All Ages
                    </option>
                    <option value="13+" className="text-black">
                      13+ (Teens)
                    </option>
                    <option value="18+" className="text-black">
                      18+ (Adults Only)
                    </option>
                    <option value="21+" className="text-black">
                      21+ (Restricted)
                    </option>
                  </select>
                </div>
              </div>

              {/* REFUND POLICY */}
              <div className="space-y-3 pt-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Refund Policy
                </label>

                <div className="relative">
                  <select
                    value={formData.refundPolicy}
                    onChange={(e) => updateForm("refundPolicy", e.target.value)}
                    className="w-full h-14 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-5 text-white font-bold text-sm outline-none focus:ring-2 appearance-none"
                    style={
                      {
                        "--tw-ring-color": `${SKAUTE_YELLOW}40`,
                      } as any
                    }
                  >
                    <option value="none" className="text-black">
                      No Refunds
                    </option>
                    <option value="flexible" className="text-black">
                      Flexible
                    </option>
                    <option value="24h" className="text-black">
                      24h Before Event
                    </option>
                    <option value="7d" className="text-black">
                      7 Days Before Event
                    </option>
                  </select>
                </div>
              </div>

              {/* SUMMARY CARD */}
              <div className="p-5 rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-xl">
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: `${SKAUTE_YELLOW}20`,
                    }}
                  >
                    <Sparkles size={20} style={{ color: SKAUTE_YELLOW }} />
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                      Quick Reminder
                    </p>

                    <p className="text-sm font-bold text-white leading-relaxed">
                      Your move becomes more discoverable with a strong banner,
                      clear settings, and community links.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODERATION NOTICE */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[36px] border border-yellow-200 bg-gradient-to-br from-yellow-50 via-yellow-50 to-orange-50 p-6 md:p-8"
      >
        {/* BACKGROUND GLOW */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-yellow-300/20 blur-3xl" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* ICON */}
          <div className="w-20 h-20 rounded-[28px] bg-white shadow-lg border border-yellow-100 flex items-center justify-center shrink-0">
            <ShieldAlert size={38} style={{ color: SKAUTE_YELLOW }} />
          </div>

          {/* TEXT */}
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-yellow-100 border border-yellow-200 mb-4">
              <Sparkles size={12} className="text-yellow-800" />

              <span className="text-[10px] font-black uppercase tracking-widest text-yellow-900">
                Quality & Safety Review
              </span>
            </div>

            <h4 className="text-xl md:text-2xl font-black tracking-tight text-yellow-950 mb-2">
              Every Move Is Moderated
            </h4>

            <p className="text-sm md:text-base font-medium text-yellow-900/80 leading-relaxed max-w-3xl">
              To maintain quality across the Skaute ecosystem, all submitted
              events are reviewed before going live. Once approved, your move
              will appear on the map and discovery feed within 1–12 hours.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
