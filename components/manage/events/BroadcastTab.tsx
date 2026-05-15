// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const BroadcastTab = ({ attendeesCount }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm">
    <div className="mb-6">
      <h3 className="text-xs font-black uppercase tracking-widest">
        Broadcast to {attendeesCount} Attendees
      </h3>
      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
        Send a move update via Email
      </p>
    </div>
    <div className="space-y-4">
      <input
        className="w-full bg-slate-50 p-4 rounded-2xl text-xs font-bold outline-none"
        placeholder="Subject (e.g. Venue Change)"
      />
      <textarea
        className="w-full bg-slate-50 p-4 rounded-2xl text-xs font-bold outline-none min-h-[150px]"
        placeholder="Type your message..."
      />
      <button className="w-full bg-black text-white py-4 rounded-2xl font-black text-[10px] uppercase hover:bg-yellow-400 hover:text-black transition-all">
        Send Broadcast
      </button>
    </div>
  </div>
);
