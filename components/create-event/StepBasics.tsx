/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import {
  Hash,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import axios from "axios";

// BRAND COLORS
const SKAUTE_BLUE = "#0052FF";
const SKAUTE_YELLOW = "#FFD700";

export const StepBasics = ({ formData, updateForm, categories }: any) => {
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  /**
   * Helper to sanitize text into a URL-friendly slug.
   */
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  /**
   * AVAILABILITY CHECK LOGIC
   */
  useEffect(() => {
    const slugValue = formData.slug;

    if (!slugValue || slugValue.length < 3) {
      setIsAvailable(null);
      return;
    }

    const checkSlug = async () => {
      setIsChecking(true);

      try {
        await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/events/slug/${slugValue}`,
        );

        setIsAvailable(false);
      } catch (error: any) {
        if (error.response?.status === 404) {
          setIsAvailable(true);
        } else {
          setIsAvailable(null);
        }
      } finally {
        setIsChecking(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      checkSlug();
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [formData.slug]);

  return (
    <div className="bg-white rounded-[40px] border border-slate-200 shadow-[0_8px_40px_rgba(2,6,23,0.04)] overflow-hidden">
      {/* HEADER */}
      <div className="relative px-6 md:px-10 py-7 border-b border-slate-100 bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-100/20 blur-3xl rounded-full" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-400 text-slate-950 text-[10px] font-black uppercase mb-4 border border-slate-900 shadow-sm">
            <Sparkles size={11} fill="currentColor" />
            Basic Move Details
          </div>

          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-950">
            Tell people what the move is about.
          </h2>

          <p className="mt-2 text-sm text-slate-500 font-medium max-w-xl leading-relaxed">
            Add a strong title, custom link, vibe description and category so
            people instantly understand your event.
          </p>
        </div>
      </div>

      <div className="p-6 md:p-10 space-y-10">
        {/* MOVE NAME */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Move Name
            </label>

            <div className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              First impressions matter
            </div>
          </div>

          <div className="relative group">
            <input
              type="text"
              placeholder="e.g. PH Startup Sunday"
              value={formData.title || ""}
              onChange={(e) => {
                const newTitle = e.target.value;

                updateForm("title", newTitle);

                if (formData.slugManuallyEdited !== true) {
                  updateForm("slug", generateSlug(newTitle));
                }
              }}
              className="w-full text-2xl md:text-3xl p-6 md:p-7 bg-slate-50 rounded-[30px] outline-none font-black border-2 border-transparent focus:border-[#FFD700] focus:bg-white transition-all placeholder:text-slate-300 text-slate-950"
            />

            <div className="absolute inset-0 rounded-[30px] ring-0 ring-yellow-300/20 group-focus-within:ring-[8px] transition-all pointer-events-none" />
          </div>

          <p className="text-[11px] text-slate-400 font-semibold leading-relaxed px-1">
            Keep it short, memorable and instantly recognizable.
          </p>
        </div>

        {/* CUSTOM LINK */}
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <LinkIcon size={13} style={{ color: SKAUTE_BLUE }} />
              Custom Event Link
            </label>

            <div className="text-[10px] font-black uppercase text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              Your public invite URL
            </div>
          </div>

          <div
            className={`relative overflow-hidden rounded-[30px] border-2 transition-all duration-300 ${
              isAvailable === true
                ? "border-green-400 bg-green-50/40"
                : isAvailable === false
                  ? "border-red-400 bg-red-50/40"
                  : "border-slate-200 bg-slate-50"
            } focus-within:border-[#FFD700] focus-within:bg-white`}
          >
            {/* glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-transparent to-yellow-50/20 pointer-events-none" />

            <div className="relative flex items-center">
              <div className="pl-6 md:pl-7 pr-3 py-5 border-r border-slate-200/60">
                <span className="text-slate-400 font-black text-sm md:text-base whitespace-nowrap">
                  skaute.com/e/
                </span>
              </div>

              <input
                type="text"
                placeholder="your-move-name"
                value={formData.slug || ""}
                onChange={(e) => {
                  updateForm("slug", generateSlug(e.target.value));
                  updateForm("slugManuallyEdited", true);
                }}
                className="w-full px-5 py-5 bg-transparent font-black text-base outline-none placeholder:text-slate-300 text-slate-950"
              />

              <div className="pr-5 flex items-center">
                {isChecking && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <Loader2 size={18} className="animate-spin" />
                  </div>
                )}

                {!isChecking && isAvailable === true && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 size={18} />
                  </div>
                )}

                {!isChecking && isAvailable === false && (
                  <div className="flex items-center gap-2 text-red-500">
                    <AlertCircle size={18} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* STATUS */}
          <div className="space-y-2 px-1">
            {isAvailable === true && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 size={14} />
                <p className="text-[11px] font-black uppercase tracking-wide">
                  Link available
                </p>
              </div>
            )}

            {isAvailable === false && (
              <div className="flex items-center gap-2 text-red-500">
                <AlertCircle size={14} />
                <p className="text-[11px] font-black uppercase tracking-wide">
                  This handle is already taken
                </p>
              </div>
            )}

            <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3">
              <p className="text-[10px] uppercase font-black text-slate-400 mb-1 tracking-wide">
                Preview
              </p>

              <p className="text-sm font-black text-slate-700 break-all">
                {formData.slug
                  ? `skaute.com/e/${formData.slug}`
                  : "skaute.com/e/your-move"}
              </p>
            </div>
          </div>
        </div>

        {/* DESCRIPTION */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Description
            </label>

            <div className="text-[10px] font-black uppercase text-slate-500">
              Set the vibe
            </div>
          </div>

          <div className="relative group">
            <textarea
              placeholder="Tell people what makes this move worth showing up for..."
              value={formData.description || ""}
              onChange={(e) => updateForm("description", e.target.value)}
              className="w-full p-6 md:p-7 bg-slate-50 rounded-[30px] h-44 outline-none font-medium text-base md:text-lg resize-none border-2 border-transparent focus:border-[#FFD700] focus:bg-white transition-all placeholder:text-slate-300 text-slate-900 leading-relaxed"
            />

            <div className="absolute inset-0 rounded-[30px] ring-0 ring-yellow-300/20 group-focus-within:ring-[8px] transition-all pointer-events-none" />
          </div>

          <p className="text-[11px] text-slate-400 font-semibold px-1">
            Mention the energy, audience, location, dress code or expectations.
          </p>
        </div>

        {/* TAGS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Tags
            </label>

            <div className="text-[10px] font-black uppercase text-slate-500">
              Improve discovery
            </div>
          </div>

          <div className="relative group">
            <input
              placeholder="music, networking, outdoors"
              value={formData.tags || ""}
              onChange={(e) => updateForm("tags", e.target.value)}
              className="w-full p-5 pl-14 bg-slate-50 rounded-[24px] font-bold outline-none text-base border-2 border-transparent focus:border-[#FFD700] focus:bg-white transition-all placeholder:text-slate-300"
            />

            <Hash
              size={18}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"
            />

            <div className="absolute inset-0 rounded-[24px] ring-0 ring-yellow-300/20 group-focus-within:ring-[8px] transition-all pointer-events-none" />
          </div>

          <p className="text-[11px] text-slate-400 font-semibold px-1">
            Separate tags with commas to help nearby people discover your move.
          </p>
        </div>

        {/* CATEGORY */}
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Category
            </label>

            <div className="text-[10px] font-black uppercase text-slate-500">
              Choose one
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {categories.map((cat: string) => {
              const active = formData.category === cat;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => updateForm("category", cat)}
                  className={`relative px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wide border-2 transition-all duration-200 ${
                    active
                      ? "border-[#FFD700] bg-[#FFF9DB] text-slate-950 shadow-[0_6px_0_0_#FACC15]"
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:-translate-y-0.5"
                  }`}
                >
                  {active && (
                    <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#FFD700] border border-slate-900" />
                  )}

                  {cat}
                </button>
              );
            })}
          </div>

          <p className="text-[11px] text-slate-400 font-semibold px-1">
            This helps skaute recommend your move to the right people.
          </p>
        </div>
      </div>
    </div>
  );
};
