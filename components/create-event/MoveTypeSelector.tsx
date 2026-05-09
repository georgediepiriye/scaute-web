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
    className="text-center max-w-2xl mx-auto py-10 px-4"
  >
    {/* Badge using Kivo Yellow */}
    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-400 text-slate-950 text-[10px] font-black uppercase mb-6 shadow-sm border border-slate-950">
      <Sparkles size={12} fill="currentColor" /> Start something people can join
    </div>

    <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 uppercase text-slate-950 italic">
      What&apos;s The <span className="text-blue-600">Move?</span>
    </h1>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mt-12">
      <SelectionCard
        title="Activity"
        icon={<Zap size={28} />}
        desc="Small plans, spontaneous linkups, and intimate hangouts with friends or nearby people."
        perfectFor="Game nights, Mini house parties, meetups, Study groups."
        onClick={() => onSelect("activity")}
      />
      <SelectionCard
        title="Event"
        icon={<CalendarDays size={28} />}
        desc="Bigger experiences built for larger crowds, public audiences, or organized productions."
        perfectFor="Concerts, Parties & nightlife, Conferences, Festivals."
        onClick={() => onSelect("showcase")}
      />
    </div>
  </motion.div>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SelectionCard = ({ title, icon, desc, perfectFor, onClick }: any) => (
  <button
    onClick={onClick}
    className="p-8 bg-white rounded-[40px] border-[3px] border-slate-100 hover:border-blue-600 text-left transition-all group shadow-sm hover:shadow-[0_12px_0_0_#020617] hover:-translate-y-1 active:translate-y-0 active:shadow-none h-full flex flex-col"
  >
    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
      {icon}
    </div>

    <h3 className="text-xl font-black uppercase mb-2 text-slate-950 tracking-tight">
      {title}
    </h3>

    <p className="text-[13px] text-slate-600 font-medium leading-relaxed mb-4">
      {desc}
    </p>

    <div className="mt-auto pt-4 border-t border-slate-100 group-hover:border-blue-100 transition-colors">
      <span className="block text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">
        Perfect for:
      </span>
      <p className="text-[11px] text-slate-400 font-bold leading-tight">
        {perfectFor}
      </p>
    </div>
  </button>
);
