import { Zap, CalendarDays, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export const MoveTypeSelector = ({
  onSelect,
}: {
  onSelect: (type: "activity" | "showcase") => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center max-w-2xl mx-auto py-10"
  >
    {/* Badge using Kivo Yellow for high-visibility entry point */}
    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-400 text-slate-950 text-[10px] font-black uppercase mb-6 shadow-sm border border-slate-950">
      <Sparkles size={12} fill="currentColor" /> Start Something
    </div>

    <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 uppercase text-slate-950">
      What&apos;s the <span className="text-blue-600">Move?</span>
    </h1>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mt-12">
      <SelectionCard
        title="Activity"
        icon={<Zap size={28} />}
        desc="Casual meetups or quick sessions."
        onClick={() => onSelect("activity")}
      />
      <SelectionCard
        title="Event"
        icon={<CalendarDays size={28} />}
        desc="Concerts, summits, or productions."
        onClick={() => onSelect("showcase")}
      />
    </div>
  </motion.div>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SelectionCard = ({ title, icon, desc, onClick }: any) => (
  <button
    onClick={onClick}
    className="p-8 bg-white rounded-[40px] border-[3px] border-slate-100 hover:border-blue-600 text-left transition-all group shadow-sm hover:shadow-[0_12px_0_0_#020617] hover:-translate-y-1 active:translate-y-0 active:shadow-none"
  >
    {/* Icons utilize Blue for brand consistency */}
    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
      {icon}
    </div>

    <h3 className="text-xl font-black uppercase mb-2 text-slate-950 tracking-tight">
      {title}
    </h3>

    <p className="text-xs text-slate-400 font-bold uppercase tracking-tight">
      {desc}
    </p>
  </button>
);
