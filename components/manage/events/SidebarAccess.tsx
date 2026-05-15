/* eslint-disable @typescript-eslint/no-explicit-any */
import { Shield, X, Plus, Loader2, Settings2 } from "lucide-react";

export const SidebarAccess = ({
  event,
  isOrganizer,
  coOrgEmail,
  setCoOrgEmail,
  onAdd,
  onRemove,
  adding,
}: any) => {
  // Human-readable transform helper mapping permission array keys to UI labels
  const getLabel = (perm: string) => {
    switch (perm) {
      case "view_revenue":
        return "Revenue";
      case "issue_refunds":
        return "Refunds";
      case "send_broadcasts":
        return "Broadcasts";
      case "scan_tickets":
        return "Scanning";
      default:
        return perm;
    }
  };

  return (
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
            key={co.user?._id || co._id}
            className="flex flex-col gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center font-black text-[10px] text-slate-400">
                  {co.user?.email ? co.user.email[0].toUpperCase() : "P"}
                </div>
                <div className="truncate w-28">
                  <p className="text-[10px] font-black uppercase truncate text-slate-900">
                    {co.user?.name || co.user?.email || "Partner"}
                  </p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                    {co.user?.email || "Pending Email"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {isOrganizer && (
                  <button
                    onClick={() => onRemove(co.user?._id || co._id)}
                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-white rounded-lg transition-all"
                    title="Remove Partner"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Render Badges matching saved string entries in DB */}
            <div className="flex flex-wrap gap-1 pt-1">
              {co.permissions?.length === 0 ? (
                <span className="text-[7px] font-black px-2 py-0.5 rounded bg-slate-200 text-slate-500 uppercase">
                  No Access
                </span>
              ) : (
                co.permissions?.map((perm: string) => (
                  <span
                    key={perm}
                    className="text-[7px] font-black px-1.5 py-0.5 rounded bg-yellow-400/10 text-yellow-700 border border-yellow-400/20 uppercase"
                  >
                    {getLabel(perm)}
                  </span>
                ))
              )}
            </div>
          </div>
        ))}

        {isOrganizer && (
          <div className="pt-4 border-t border-slate-100">
            <p className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest">
              Add Partner
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                value={coOrgEmail}
                onChange={(e) => setCoOrgEmail(e.target.value)}
                className="flex-1 bg-slate-50 p-3 rounded-xl text-[10px] font-bold outline-none border border-transparent focus:border-yellow-400 focus:bg-white transition-all"
                placeholder="Partner email"
              />
              <button
                onClick={onAdd}
                disabled={adding || !coOrgEmail}
                className="bg-black text-white p-3 rounded-xl active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all shadow-lg shadow-slate-200"
              >
                {adding ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Plus size={14} />
                )}
              </button>
            </div>
            <p className="text-[7px] font-bold text-slate-400 uppercase mt-3 leading-relaxed">
              New partners default to ticket scanning privileges. You can manage
              specialized permissions directly inside your Settings panel.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
