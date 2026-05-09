/* eslint-disable @typescript-eslint/no-explicit-any */
import { ImageIcon, Settings2, ShieldAlert } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

// BRAND COLOR CONSTANTS
const KIVO_BLUE = "#0052FF";
const KIVO_YELLOW = "#FFD700";

const Toggle = ({ label, sub, value, field, updateForm }: any) => (
  <div className="flex items-center justify-between group">
    <div className="space-y-0.5">
      <p className="text-[10px] font-black uppercase text-white">{label}</p>
      <p className="text-[9px] font-bold text-gray-400 uppercase">{sub}</p>
    </div>
    <button
      type="button"
      onClick={() => updateForm(field, !value)}
      className="w-12 h-7 rounded-full transition-all relative"
      style={{ backgroundColor: value ? KIVO_BLUE : "#374151" }}
    >
      <motion.div
        animate={{ x: value ? 22 : 4 }}
        className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm"
      />
    </button>
  </div>
);

export const StepFinal = ({
  formData,
  updateForm,
  previewImage,
  handleImageChange,
}: any) => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT: Banner Upload */}
        <div className="lg:col-span-8">
          <div className="bg-white p-6 md:p-10 rounded-[40px] border border-gray-100 shadow-sm">
            <h3 className="text-[10px] font-black uppercase text-gray-400 mb-6 tracking-widest">
              Event Banner <span className="text-red-500">*</span>
            </h3>
            <label
              className="block h-80 bg-gray-50 rounded-[32px] border-4 border-dashed border-gray-100 cursor-pointer overflow-hidden relative group transition-colors"
              style={{ "--hover-border": `${KIVO_BLUE}40` } as any}
            >
              {previewImage ? (
                <Image
                  src={previewImage}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-300 group-hover:text-blue-500 transition-colors">
                  <ImageIcon
                    size={48}
                    strokeWidth={1.5}
                    style={{ color: "inherit" }}
                  />
                  <span className="text-[10px] font-black uppercase mt-4">
                    Upload High-Res Cover
                  </span>
                </div>
              )}
              <input
                type="file"
                className="hidden"
                required
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          </div>
        </div>

        {/* RIGHT: Preferences & Action */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-gray-900 text-white p-8 rounded-[40px] shadow-xl space-y-8">
            <div
              className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest"
              style={{ color: KIVO_YELLOW }}
            >
              <Settings2 size={16} /> Advanced Settings
            </div>

            <div className="space-y-6">
              <Toggle
                label="Public Visibility"
                sub="Show on Discovery Feed and Map"
                value={formData.isPublic}
                field="isPublic"
                updateForm={updateForm}
              />

              <Toggle
                label="Allow Anonymous"
                sub="Guest check-ins allowed"
                value={formData.allowAnonymous}
                field="allowAnonymous"
                updateForm={updateForm}
              />

              <div className="space-y-2 pt-2">
                <label className="text-[9px] font-black uppercase text-gray-500">
                  Refund Policy
                </label>
                <select
                  value={formData.refundPolicy}
                  onChange={(e) => updateForm("refundPolicy", e.target.value)}
                  className="w-full bg-gray-800 text-white p-4 rounded-2xl font-bold text-xs outline-none border border-gray-700 transition-all"
                  style={{ focusBorderColor: KIVO_BLUE } as any}
                >
                  <option value="none">No Refunds</option>
                  <option value="24h">24h before event</option>
                  <option value="7d">7 days before event</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODERATION NOTICE CARD */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 border-2 border-blue-100 p-8 rounded-[40px] flex flex-col md:flex-row items-center gap-6"
      >
        <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-sm shrink-0">
          <ShieldAlert size={32} className="text-blue-600" />
        </div>
        <div>
          <h4 className="text-[12px] font-black uppercase text-blue-900 tracking-wider mb-1">
            Kivo Moderation Process
          </h4>
          <p className="text-xs font-bold text-blue-700/80 leading-relaxed uppercase">
            To maintain quality in the Port Harcourt ecosystem, all new moves
            are reviewed by our team. Your event will be visible on the map and
            discovery feed within 1-12 hours once approved.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
