/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Navigation,
  MapPin,
  Repeat,
  Video,
  Link as LinkIcon,
  Calendar,
  Clock,
  Sparkles,
  Globe,
  MapPinned,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

// BRAND COLOR CONSTANTS
const SKAUTE_BLUE = "#0052FF";
const SKAUTE_YELLOW = "#FFD700";

const SearchBox = dynamic(
  () => import("@mapbox/search-js-react").then((m) => m.SearchBox),
  {
    ssr: false,
    loading: () => (
      <div className="h-16 w-full bg-gray-100 animate-pulse rounded-[28px]" />
    ),
  },
);

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const StepLogistics = ({
  formData,
  updateForm,
  useCurrentLocation,
  isLocating,
  handleRetrieve,
  setShowMapPicker,
}: any) => {
  const toggleDay = (day: string) => {
    const currentDays = formData.selectedDays || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d: string) => d !== day)
      : [...currentDays, day];

    updateForm("selectedDays", newDays);
  };

  const isOnlineOrHybrid =
    formData.eventFormat === "online" || formData.eventFormat === "hybrid";

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="bg-white border border-gray-100 shadow-[0_20px_60px_rgba(0,0,0,0.06)] rounded-[36px] md:rounded-[44px] overflow-hidden"
    >
      {/* HEADER */}
      <div className="px-6 md:px-10 pt-8 md:pt-10 pb-6 border-b border-gray-100 bg-gradient-to-b from-[#FFFDF3] to-white">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFD700] text-black text-[10px] font-black uppercase tracking-wider shadow-sm mb-5">
          <Sparkles size={12} fill="currentColor" />
          Location & Schedule
        </div>

        <h2 className="text-2xl md:text-4xl font-black tracking-tight uppercase text-slate-950 leading-none">
          Set The <span className="text-[#0052FF]">Logistics</span>
        </h2>

        <p className="mt-3 text-sm md:text-base text-slate-500 font-medium max-w-xl leading-relaxed">
          Choose when your move happens, where people should go, and whether it
          repeats over time.
        </p>
      </div>

      <div className="p-6 md:p-10 space-y-10">
        {/* FORMAT TOGGLE */}
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              Move Format
            </label>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              {
                key: "physical",
                label: "Physical",
                icon: <MapPinned size={18} />,
              },
              {
                key: "online",
                label: "Online",
                icon: <Globe size={18} />,
              },
              {
                key: "hybrid",
                label: "Hybrid",
                icon: <Video size={18} />,
              },
            ].map((item) => {
              const active = formData.eventFormat === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => updateForm("eventFormat", item.key)}
                  className={`relative overflow-hidden rounded-[26px] p-4 md:p-5 border-2 transition-all duration-300 ${
                    active
                      ? "border-[#FFD700] bg-[#FFF9D7] shadow-[0_12px_30px_rgba(255,215,0,0.18)] scale-[1.02]"
                      : "border-gray-100 bg-gray-50 hover:bg-white hover:border-gray-200"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center mb-3 transition-all ${
                      active
                        ? "bg-[#FFD700] text-black"
                        : "bg-white text-gray-500"
                    }`}
                  >
                    {item.icon}
                  </div>

                  <p
                    className={`text-[11px] md:text-xs font-black uppercase tracking-wide ${
                      active ? "text-black" : "text-gray-500"
                    }`}
                  >
                    {item.label}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* DATE + TIME */}
        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              Schedule
            </label>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* START */}
            <div className="rounded-[30px] border border-gray-100 bg-gray-50/70 p-5 md:p-6 space-y-5">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#0052FF] text-white flex items-center justify-center">
                  <Calendar size={16} />
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Starts
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    When your move begins
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 group">
                  <Calendar
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10"
                  />

                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => updateForm("startDate", e.target.value)}
                    className="w-full pl-11 pr-4 py-4 bg-white rounded-2xl font-bold outline-none text-sm border-2 border-transparent focus:border-[#FFD700] transition-all appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full"
                  />
                </div>

                <div className="relative w-full sm:w-40 group">
                  <Clock
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10"
                  />

                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => updateForm("startTime", e.target.value)}
                    className="w-full pl-11 pr-4 py-4 bg-white rounded-2xl font-bold outline-none text-sm border-2 border-transparent focus:border-[#FFD700] transition-all appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full"
                  />
                </div>
              </div>
            </div>

            {/* END */}
            <div className="rounded-[30px] border border-gray-100 bg-gray-50/70 p-5 md:p-6 space-y-5">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center">
                  <Clock size={16} />
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Ends
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    When everything wraps up
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 group">
                  <Calendar
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10"
                  />

                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => updateForm("endDate", e.target.value)}
                    className="w-full pl-11 pr-4 py-4 bg-white rounded-2xl font-bold outline-none text-sm border-2 border-transparent focus:border-[#FFD700] transition-all appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full"
                  />
                </div>

                <div className="relative w-full sm:w-40 group">
                  <Clock
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10"
                  />

                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => updateForm("endTime", e.target.value)}
                    className="w-full pl-11 pr-4 py-4 bg-white rounded-2xl font-bold outline-none text-sm border-2 border-transparent focus:border-[#FFD700] transition-all appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MEETING LINK */}
        <AnimatePresence>
          {isOnlineOrHybrid && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="rounded-[30px] border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 md:p-7"
            >
              <div className="flex items-start gap-4 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-[#0052FF] text-white flex items-center justify-center shrink-0">
                  <Video size={20} />
                </div>

                <div>
                  <h3 className="text-lg font-black uppercase text-slate-950">
                    Meeting Link
                  </h3>

                  <p className="text-sm text-slate-500 font-medium leading-relaxed">
                    Add the Zoom, Google Meet, or livestream link attendees will
                    use to join.
                  </p>
                </div>
              </div>

              <div className="relative">
                <LinkIcon
                  size={16}
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300"
                />

                <input
                  type="url"
                  required
                  placeholder="https://zoom.us/j/..."
                  value={formData.meetingLink || ""}
                  onChange={(e) => updateForm("meetingLink", e.target.value)}
                  className="w-full h-16 pl-12 pr-5 rounded-[24px] bg-white border-2 border-transparent focus:border-[#FFD700] outline-none font-bold text-sm shadow-sm transition-all"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* RECURRING */}
        <div className="rounded-[32px] border border-gray-100 bg-[#FCFCFC] p-6 md:p-7 space-y-7">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FFD700] text-black flex items-center justify-center shrink-0">
                <Repeat size={20} />
              </div>

              <div>
                <h3 className="text-lg font-black uppercase text-slate-950">
                  Recurring Move
                </h3>

                <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-md">
                  Turn this into a weekly, monthly, or repeating experience.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => updateForm("isRecurring", !formData.isRecurring)}
              className={`relative w-16 h-9 rounded-full transition-all ${
                formData.isRecurring ? "bg-[#FFD700]" : "bg-gray-200"
              }`}
            >
              <motion.div
                animate={{ x: formData.isRecurring ? 30 : 4 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="absolute top-1 w-7 h-7 rounded-full bg-white shadow-md"
              />
            </button>
          </div>

          <AnimatePresence>
            {formData.isRecurring && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-6 overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Frequency
                    </label>

                    <select
                      value={formData.recurrenceFrequency ?? ""}
                      onChange={(e) =>
                        updateForm("recurrenceFrequency", e.target.value)
                      }
                      className="w-full h-14 px-5 bg-white border border-gray-100 rounded-2xl font-bold outline-none text-sm focus:border-[#FFD700]"
                    >
                      <option value="none">Select...</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Interval
                    </label>

                    <input
                      type="number"
                      min="1"
                      placeholder="1"
                      value={formData.recurrenceInterval ?? ""}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);

                        if (val < 1) {
                          updateForm("recurrenceInterval", 1);
                        } else {
                          updateForm("recurrenceInterval", e.target.value);
                        }
                      }}
                      className="w-full h-14 px-5 bg-white border border-gray-100 rounded-2xl font-bold outline-none text-sm focus:border-[#FFD700]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Ending On
                    </label>

                    <div className="relative">
                      <Calendar
                        size={14}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        type="date"
                        value={formData.recurrenceEndDate ?? ""}
                        onChange={(e) =>
                          updateForm("recurrenceEndDate", e.target.value)
                        }
                        className="w-full h-14 pl-11 pr-4 bg-white border border-gray-100 rounded-2xl font-bold outline-none text-sm focus:border-[#FFD700] appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full"
                      />
                    </div>
                  </div>
                </div>

                {formData.recurrenceFrequency === "weekly" && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Repeat On
                    </label>

                    <div className="flex flex-wrap gap-3">
                      {DAYS_OF_WEEK.map((day) => {
                        const active = formData.selectedDays?.includes(day);

                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleDay(day)}
                            className={`w-14 h-14 rounded-2xl border-2 text-xs font-black uppercase transition-all ${
                              active
                                ? "bg-[#FFD700] border-[#FFD700] text-black shadow-lg shadow-yellow-300/30 scale-105"
                                : "bg-white border-gray-100 text-gray-400 hover:border-gray-300"
                            }`}
                          >
                            {day.slice(0, 1)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* VENUE */}
        {formData.eventFormat !== "online" && (
          <div className="rounded-[34px] border border-gray-100 overflow-hidden">
            {/* TOP */}
            <div className="p-6 md:p-7 border-b border-gray-100 bg-gradient-to-r from-[#FFFDF3] to-white">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center shrink-0">
                    <MapPin size={20} />
                  </div>

                  <div>
                    <h3 className="text-lg font-black uppercase text-slate-950">
                      Venue & Address
                    </h3>

                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                      Help people find exactly where the move is happening.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={useCurrentLocation}
                  className="h-12 px-5 rounded-2xl bg-white border border-gray-200 text-[11px] font-black uppercase tracking-wide flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-sm"
                  style={{ color: SKAUTE_BLUE }}
                >
                  <Navigation
                    size={14}
                    className={isLocating ? "animate-pulse" : ""}
                  />
                  {isLocating ? "Locating..." : "Use Current Location"}
                </button>
              </div>
            </div>

            {/* CONTENT */}
            <div className="p-6 md:p-7 space-y-5">
              {/* 💡 RESTORED: Pure, unstyled SearchBox wrapped in a clean, relative wrapper to support the dropdown */}
              <div className="relative w-full z-30 searchbox-working-wrapper">
                <SearchBox
                  accessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string}
                  value={formData.location || ""}
                  onRetrieve={handleRetrieve}
                  onChange={(val: string) => updateForm("location", val)}
                  placeholder="Search venue, area, or address..."
                  options={{
                    country: "ng",
                    proximity: [7.0086, 4.8197], // Port Harcourt
                    bbox: [6.85, 4.65, 7.25, 5.05],
                    types: "poi,address,neighborhood,locality",
                    limit: 10,
                  }}
                />
              </div>

              {/* TIP */}
              <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4">
                <p className="text-[11px] font-bold text-blue-900 leading-relaxed">
                  💡 If your venue doesn&apos;t appear, type it manually and use
                  the map pin button below to set the exact location.
                </p>
              </div>

              {/* SELECTED ADDRESS */}
              {(formData.location || formData.neighborhood) && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-[26px] border border-yellow-200 bg-[#FFF9D7] p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#FFD700] text-black flex items-center justify-center shrink-0">
                      <MapPin size={16} />
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-black/60">
                        Selected Address
                      </p>

                      <p className="text-sm font-bold text-slate-900 leading-relaxed">
                        {formData.location || "No address selected"}
                      </p>

                      {formData.neighborhood && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-[10px] font-black uppercase">
                          <MapPin size={10} />
                          {formData.neighborhood}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* MAP PIN BUTTON */}
              <button
                type="button"
                onClick={() => setShowMapPicker(true)}
                className={`w-full h-16 rounded-[24px] font-black text-[11px] uppercase tracking-wide flex items-center justify-center gap-3 transition-all ${
                  formData.locationCoords
                    ? "bg-[#FFD700] text-black shadow-[0_20px_40px_rgba(255,215,0,0.25)]"
                    : "bg-black text-white hover:bg-slate-900"
                }`}
              >
                <MapPin size={18} />
                {formData.locationCoords
                  ? "Location Pinned ✓"
                  : "Drop Exact Map Pin"}
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
