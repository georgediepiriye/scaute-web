import { ArrowLeft, SearchCheck, QrCode } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DashboardHeader = ({ event, id, router }: any) => (
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
    <div>
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-400 hover:text-yellow-600 transition-colors mb-4"
      >
        <ArrowLeft size={14} />
        <span className="text-[10px] font-black uppercase tracking-widest">
          Back to Profile
        </span>
      </button>
      <div className="flex items-center gap-3 mb-2">
        <span className="px-2 py-1 bg-slate-900 text-white text-[8px] font-black uppercase tracking-[0.2em] rounded">
          Live Move
        </span>
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-md border ${
            event.approvalStatus === "approved"
              ? "bg-green-50 text-green-600 border-green-100"
              : "bg-amber-50 text-amber-600 border-amber-100"
          }`}
        >
          <SearchCheck size={10} />
          <span className="text-[8px] font-black uppercase">
            {event.approvalStatus || "Pending"}
          </span>
        </div>
      </div>
      <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic">
        {event?.title}
      </h1>
    </div>

    <div className="flex gap-3 w-full md:w-auto">
      {/* Updated Scanner Link */}
      <button
        onClick={() => router.push(`/manage/scanner/${id}`)}
        className="flex-1 md:flex-none px-6 py-4 bg-white border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
      >
        <QrCode size={14} /> Scanner Mode
      </button>

      {/* Updated Edit Event Link */}
      <button
        onClick={() => router.push(`/manage/events/settings/${id}`)}
        className="flex-1 md:flex-none px-6 py-4 bg-yellow-400 text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-yellow-500 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
      >
        Edit Event
      </button>
    </div>
  </div>
);
