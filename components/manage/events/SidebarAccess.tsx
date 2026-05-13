/* eslint-disable @typescript-eslint/no-explicit-any */
import { Shield, Mail, X, Plus, Loader2 } from "lucide-react";

export const SidebarAccess = ({
  event,
  isOrganizer,
  coOrgEmail,
  setCoOrgEmail,
  onAdd,
  adding,
}: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm">
    <div className="flex items-center gap-2 mb-6">
      <Shield size={16} className="text-yellow-500" />
      <h3 className="text-xs font-black uppercase tracking-[0.2em]">
        Access Control
      </h3>
    </div>
    <div className="space-y-4">
      {event.coOrganizers?.map((co: any) => (
        <div
          key={co._id}
          className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center font-black text-[10px]">
              {co.email[0].toUpperCase()}
            </div>
            <div className="truncate w-24">
              <p className="text-[10px] font-black uppercase truncate">
                {co.email}
              </p>
              <p className="text-[8px] font-bold text-slate-400 uppercase">
                Partner
              </p>
            </div>
          </div>
          {isOrganizer && (
            <button className="text-slate-300 hover:text-red-500 transition-colors">
              <X size={14} />
            </button>
          )}
        </div>
      ))}

      {isOrganizer && (
        <div className="pt-4 border-t border-slate-50">
          <p className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest">
            Add Partner
          </p>
          <div className="flex gap-2">
            <input
              value={coOrgEmail}
              onChange={(e) => setCoOrgEmail(e.target.value)}
              className="flex-1 bg-slate-50 p-3 rounded-xl text-[10px] font-bold outline-none border border-transparent focus:border-yellow-400"
              placeholder="Email"
            />
            <button
              onClick={onAdd}
              disabled={adding}
              className="bg-black text-white p-3 rounded-xl active:scale-95 transition-all"
            >
              {adding ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Plus size={14} />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
);
