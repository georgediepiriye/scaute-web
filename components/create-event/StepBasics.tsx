/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import {
  Hash,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import axios from "axios";

// BRAND COLOR CONSTANTS
const KIVO_BLUE = "#0052FF";
const KIVO_YELLOW = "#FFD700";

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
    <div className="bg-white p-6 md:p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
      <div className="space-y-6">
        {/* 1. MOVE NAME & AUTO-SLUG */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400">
              Move Name
            </label>
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
              // UPDATED: focus:border-[#FFD700]
              className="w-full text-xl md:text-2xl p-6 bg-gray-50 rounded-[24px] outline-none font-black border-2 border-transparent focus:border-[#FFD700] transition-all"
            />
          </div>

          {/* 2. CUSTOM EVENT LINK */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-2">
              <LinkIcon size={12} style={{ color: KIVO_BLUE }} /> Custom Event
              Link
            </label>

            <div
              className={`flex items-center rounded-[24px] border-2 transition-all overflow-hidden ${
                isAvailable === true
                  ? "border-green-500 bg-green-50/30"
                  : isAvailable === false
                    ? "border-red-400 bg-red-50/30"
                    : "border-transparent bg-gray-50"
              } focus-within:border-[#FFD700] focus-within:bg-white`}
            >
              <span className="pl-6 pr-1 text-gray-400 font-bold text-sm select-none whitespace-nowrap">
                kivo.com/e/
              </span>

              <input
                type="text"
                placeholder="..."
                value={formData.slug || ""}
                onChange={(e) => {
                  updateForm("slug", generateSlug(e.target.value));
                  updateForm("slugManuallyEdited", true);
                }}
                className="w-full p-5 ml-1 bg-transparent font-black text-sm outline-none placeholder:text-gray-300"
              />

              <div className="pr-5 flex items-center gap-2">
                {isChecking && (
                  <Loader2 size={18} className="text-blue-600 animate-spin" />
                )}
                {!isChecking && isAvailable === true && (
                  <CheckCircle2 size={18} className="text-green-500" />
                )}
                {!isChecking && isAvailable === false && (
                  <AlertCircle size={18} className="text-red-500" />
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1 ml-2">
              {isAvailable === false && (
                <p className="text-[10px] text-red-500 font-bold uppercase italic">
                  This handle is already taken.
                </p>
              )}
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">
                {formData.slug
                  ? `Preview: kivo.com/e/${formData.slug}`
                  : "The link people will use to join your move."}
              </p>
            </div>
          </div>
        </div>

        {/* 3. DESCRIPTION */}
        <div className="space-y-2 pt-2">
          <label className="text-[10px] font-black uppercase text-gray-400">
            Description
          </label>
          <textarea
            placeholder="The vibe..."
            value={formData.description || ""}
            onChange={(e) => updateForm("description", e.target.value)}
            // UPDATED: focus:border-[#FFD700]
            className="w-full p-6 bg-gray-50 rounded-[24px] h-40 outline-none font-medium text-lg resize-none border-2 border-transparent focus:border-[#FFD700] transition-all"
          />
        </div>

        {/* 4. TAGS */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-gray-400">
            Tags
          </label>
          <div className="relative">
            <input
              placeholder="music, outdoor, networking"
              value={formData.tags || ""}
              onChange={(e) => updateForm("tags", e.target.value)}
              // UPDATED: focus:border-[#FFD700]
              className="w-full p-4 pl-12 bg-gray-50 rounded-2xl font-bold outline-none text-base sm:text-sm border border-transparent focus:border-[#FFD700] transition-all"
            />
            <Hash
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
            />
          </div>
        </div>

        {/* 5. CATEGORY SELECTION */}
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase text-gray-400">
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat: string) => (
              <button
                key={cat}
                type="button"
                onClick={() => updateForm("category", cat)}
                // UPDATED: border-[#FFD700] and bg-[#FFFBEB] (yellow tint)
                className={`px-4 py-2 rounded-2xl text-[10px] font-bold border-2 transition-all ${
                  formData.category === cat
                    ? "border-[#FFD700] bg-[#FFFBEB] text-[#92400E] shadow-sm"
                    : "border-gray-50 text-gray-400 hover:border-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
