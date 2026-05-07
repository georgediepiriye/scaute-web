/* eslint-disable @typescript-eslint/no-explicit-any */
import { Navigation, MapPin, Repeat } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

// BRAND COLOR CONSTANTS
const KIVO_BLUE = "#0052FF";
const KIVO_YELLOW = "#FFD700";

const SearchBox = dynamic(
  () => import("@mapbox/search-js-react").then((m) => m.SearchBox),
  {
    ssr: false,
    loading: () => (
      <div className="h-14 w-full bg-gray-50 animate-pulse rounded-[24px]" />
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

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="bg-white p-6 md:p-10 rounded-[32px] md:rounded-[40px] border border-gray-100 shadow-sm space-y-8"
    >
      {/* 1. Format Toggle */}
      <div className="flex p-1 bg-gray-50 rounded-2xl w-fit border border-gray-100">
        {["physical", "online", "hybrid"].map((f) => (
          <button
            key={f}
            onClick={() => updateForm("eventFormat", f)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${
              formData.eventFormat === f
                ? "bg-white shadow-sm border border-gray-200"
                : "text-gray-400"
            }`}
            style={{ color: formData.eventFormat === f ? KIVO_BLUE : "" }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* 2. Date & Time Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            Start <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => updateForm("startDate", e.target.value)}
              className="flex-1 p-4 bg-gray-50 rounded-2xl font-bold outline-none text-sm focus:bg-white focus:ring-2 transition-all"
              style={{ "--tw-ring-color": `${KIVO_BLUE}20` } as any}
            />
            <input
              type="time"
              value={formData.startTime}
              required
              onChange={(e) => updateForm("startTime", e.target.value)}
              className="w-1/3 p-4 bg-gray-50 rounded-2xl font-bold outline-none text-sm focus:bg-white focus:ring-2 transition-all"
              style={{ "--tw-ring-color": `${KIVO_BLUE}20` } as any}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            End <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              required
              value={formData.endDate}
              onChange={(e) => updateForm("endDate", e.target.value)}
              className="flex-1 p-4 bg-gray-50 rounded-2xl font-bold outline-none text-sm focus:bg-white focus:ring-2 transition-all"
              style={{ "--tw-ring-color": `${KIVO_BLUE}20` } as any}
            />
            <input
              type="time"
              required
              value={formData.endTime}
              onChange={(e) => updateForm("endTime", e.target.value)}
              className="w-1/3 p-4 bg-gray-50 rounded-2xl font-bold outline-none text-sm focus:bg-white focus:ring-2 transition-all"
              style={{ "--tw-ring-color": `${KIVO_BLUE}20` } as any}
            />
          </div>
        </div>
      </div>

      {/* 3. Recurrence Section */}
      <div className="pt-6 border-t border-gray-100 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-black uppercase flex items-center gap-2">
              <Repeat size={16} style={{ color: KIVO_BLUE }} /> Recurring Move?
            </p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
              Does this happen more than once?
            </p>
          </div>
          <button
            onClick={() => updateForm("isRecurring", !formData.isRecurring)}
            className={`w-14 h-8 rounded-full transition-all relative ${formData.isRecurring ? "" : "bg-gray-200"}`}
            style={{ backgroundColor: formData.isRecurring ? KIVO_BLUE : "" }}
          >
            <motion.div
              animate={{ x: formData.isRecurring ? 24 : 4 }}
              className="absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm"
            />
          </button>
        </div>

        <AnimatePresence>
          {formData.isRecurring && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-6 overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400">
                    Frequency
                  </label>
                  <select
                    value={formData.recurrenceFrequency ?? ""}
                    onChange={(e) =>
                      updateForm("recurrenceFrequency", e.target.value)
                    }
                    className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none text-sm focus:bg-white border-none"
                  >
                    <option value="none">Select...</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400">
                    Every (Interval)
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
                    className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none text-sm focus:ring-2"
                    style={{ "--tw-ring-color": `${KIVO_BLUE}20` } as any}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400">
                    Ending On
                  </label>
                  <input
                    type="date"
                    value={formData.recurrenceEndDate ?? ""}
                    onChange={(e) =>
                      updateForm("recurrenceEndDate", e.target.value)
                    }
                    className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none text-sm focus:bg-white"
                  />
                </div>
              </div>

              {formData.recurrenceFrequency === "weekly" && (
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-gray-400">
                    Repeat On
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS_OF_WEEK.map((day) => (
                      <button
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`w-12 h-12 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${
                          formData.selectedDays?.includes(day)
                            ? "text-white shadow-lg shadow-blue-600/20"
                            : "border-gray-100 bg-gray-50 text-gray-400"
                        }`}
                        style={{
                          backgroundColor: formData.selectedDays?.includes(day)
                            ? KIVO_BLUE
                            : "",
                          borderColor: formData.selectedDays?.includes(day)
                            ? KIVO_BLUE
                            : "",
                        }}
                      >
                        {day[0]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. Venue Section */}
      {formData.eventFormat !== "online" && (
        <div className="space-y-4 pt-6 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Venue
            </label>
            <button
              type="button"
              onClick={useCurrentLocation}
              className="text-[10px] font-black flex items-center gap-1 hover:opacity-70 transition-opacity"
              style={{ color: KIVO_BLUE }}
            >
              <Navigation
                size={12}
                className={isLocating ? "animate-pulse" : ""}
              />{" "}
              {isLocating ? "Locating..." : "Use current location"}
            </button>
          </div>

          <SearchBox
            accessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN!}
            value={formData.location}
            onRetrieve={handleRetrieve}
            placeholder="Search venue..."
            theme={{
              variables: { borderRadius: "24px", fontFamily: "inherit" },
            }}
          />

          {(formData.location || formData.neighborhood) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl border space-y-1"
              style={{
                backgroundColor: `${KIVO_BLUE}05`,
                borderColor: `${KIVO_BLUE}20`,
              }}
            >
              <p
                className="text-[10px] font-black uppercase tracking-tighter opacity-70"
                style={{ color: KIVO_BLUE }}
              >
                Selected Address
              </p>
              <p className="text-sm font-bold text-gray-900 leading-tight">
                {formData.location || "No address selected"}
              </p>
              {formData.neighborhood && (
                <div className="flex items-center gap-1.5 mt-1">
                  <MapPin size={10} style={{ color: KIVO_BLUE }} />
                  <p
                    className="text-[10px] font-black uppercase"
                    style={{ color: KIVO_BLUE }}
                  >
                    Area: {formData.neighborhood}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          <button
            type="button"
            onClick={() => setShowMapPicker(true)}
            className="w-full py-5 font-black text-[10px] uppercase rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg"
            style={{
              backgroundColor: formData.locationCoords ? KIVO_BLUE : "#000000",
              color: "#FFFFFF",
              boxShadow: formData.locationCoords
                ? `0 10px 15px -3px ${KIVO_BLUE}40`
                : "",
            }}
          >
            <MapPin size={16} />{" "}
            {formData.locationCoords ? "Location Pinned ✓" : "Drop Map Pin"}
          </button>
        </div>
      )}
    </motion.div>
  );
};
