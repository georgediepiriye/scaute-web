import { Zap, CalendarDays, Sparkles, ArrowRight } from "lucide-react";

import { motion } from "framer-motion";

export const MoveTypeSelector = ({
  onSelect,
}: {
  onSelect: (type: "activity" | "showcase") => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="max-w-2xl mx-auto py-8 md:py-12 px-4"
  >
    {/* TOP */}
    <div className="text-center">
      {/* BADGE */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400 text-slate-950 text-[10px] font-black uppercase mb-5 shadow-sm border border-slate-950">
        <Sparkles size={12} fill="currentColor" />
        Start something people can join
      </div>

      {/* TITLE */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter uppercase text-slate-950 italic leading-none">
        What&apos;s The <span className="text-blue-600">Move?</span>
      </h1>

      {/* SUBTEXT */}
      <p className="mt-4 text-sm md:text-base text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
        Choose what you want to create. Tap one of the options below to
        continue.
      </p>

      {/* MOBILE HELPER */}
      <div className="mt-5 flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest text-blue-600 sm:hidden">
        <span>Pick one below</span>
        <ArrowRight size={13} />
      </div>
    </div>

    {/* CARDS */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mt-8 md:mt-12">
      <SelectionCard
        title="Activity"
        subtitle="Casual & intimate"
        icon={<Zap size={30} />}
        desc="Small plans, spontaneous linkups, and chill hangouts with nearby people."
        perfectFor="Game nights • House parties • Meetups • Study groups"
        accent="yellow"
        onClick={() => onSelect("activity")}
      />

      <SelectionCard
        title="Event"
        subtitle="Public & organized"
        icon={<CalendarDays size={30} />}
        desc="Bigger experiences designed for larger crowds, audiences, or productions."
        perfectFor="Concerts • Festivals • Conferences • Nightlife"
        accent="blue"
        onClick={() => onSelect("showcase")}
      />
    </div>
  </motion.div>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SelectionCard = ({
  title,
  subtitle,
  icon,
  desc,
  perfectFor,
  onClick,
  accent,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}: any) => (
  <button
    onClick={onClick}
    className="group relative overflow-hidden rounded-[34px] border-[2px] border-slate-200 bg-white p-5 md:p-7 text-left transition-all duration-300 hover:border-blue-600 hover:-translate-y-1 hover:shadow-[0_14px_0_0_#020617] active:translate-y-0 active:shadow-none"
  >
    {/* TOP TAG */}
    <div className="flex items-start justify-between gap-3 mb-5">
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
          accent === "yellow"
            ? "bg-yellow-100 text-yellow-600 group-hover:bg-yellow-400 group-hover:text-slate-950"
            : "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
        }`}
      >
        {icon}
      </div>

      <div className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest">
        Tap to select
      </div>
    </div>

    {/* TITLE */}
    <div className="mb-4">
      <h3 className="text-2xl font-black uppercase tracking-tight text-slate-950">
        {title}
      </h3>

      <p className="text-[11px] uppercase tracking-[0.2em] font-black text-blue-600 mt-1">
        {subtitle}
      </p>
    </div>

    {/* DESCRIPTION */}
    <p className="text-[14px] text-slate-600 font-medium leading-relaxed mb-6">
      {desc}
    </p>

    {/* PERFECT FOR */}
    <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 group-hover:border-blue-100 group-hover:bg-blue-50/40 transition-all">
      <span className="block text-[10px] font-black uppercase tracking-widest text-blue-600 mb-2">
        Perfect for
      </span>

      <p className="text-[12px] text-slate-500 font-bold leading-relaxed">
        {perfectFor}
      </p>
    </div>

    {/* CTA */}
    <div className="mt-5 flex items-center justify-between">
      <span className="text-[11px] font-black uppercase tracking-widest text-slate-950">
        Continue
      </span>

      <div className="w-9 h-9 rounded-full bg-slate-950 text-white flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1">
        <ArrowRight size={16} />
      </div>
    </div>
  </button>
);
