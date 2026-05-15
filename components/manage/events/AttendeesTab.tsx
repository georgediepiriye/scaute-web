/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  RotateCcw,
  UserPlus,
} from "lucide-react";

export const AttendeesTab = ({
  currentItems,
  searchTerm,
  setSearchTerm,
  currentPage,
  totalPages,
  setCurrentPage,
  onRefund,
}: any) => {
  const [statusFilter, setStatusFilter] = useState("all");

  // Local filtering based on your expanded TICKET_STATUS
  const filteredItems = currentItems.filter((item: any) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "checked-in") return item.status === "used";
    if (statusFilter === "pending") return item.status === "valid";
    if (statusFilter === "refunded") return item.status === "refunded";
    if (statusFilter === "transferred") return item.status === "transferred";
    return true;
  });

  // Helper to render consistent badges for all statuses
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "used":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "valid":
        return "bg-green-50 text-green-600 border-green-100";
      case "refunded":
        return "bg-red-50 text-red-600 border-red-100";
      case "cancelled":
        return "bg-slate-100 text-slate-500 border-slate-200";
      case "transferred":
        return "bg-blue-50 text-blue-600 border-blue-100";
      default:
        return "bg-slate-50 text-slate-400";
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header & Search/Filters */}
      <div className="p-8 border-b border-slate-50 space-y-4 md:space-y-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-yellow-500" />
          <h3 className="text-xs font-black uppercase tracking-[0.2em]">
            Guest List
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={12}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-8 pr-8 py-2.5 bg-slate-50 border border-transparent focus:border-yellow-500/20 rounded-xl text-[9px] font-black uppercase transition-all outline-none appearance-none cursor-pointer"
            >
              <option value="all">All Passes</option>
              <option value="checked-in">Checked In</option>
              <option value="pending">Valid / Pending</option>
              <option value="transferred">Transferred</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
              size={14}
            />
            <input
              type="text"
              placeholder="Search guests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-slate-50 border border-transparent focus:border-yellow-500/20 focus:bg-white rounded-xl text-[10px] font-black uppercase transition-all outline-none w-full md:w-48"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Attendee
              </th>
              <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Access Tier
              </th>
              <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Check-In Info
              </th>
              <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">
                Status / Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredItems.length > 0 ? (
              filteredItems.map((t: any, i: number) => (
                <tr
                  key={i}
                  className={`transition-colors group ${
                    t.status === "refunded" || t.status === "cancelled"
                      ? "opacity-60 bg-slate-50/30"
                      : "hover:bg-yellow-50/30"
                  }`}
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-black text-sm uppercase tracking-tight group-hover:text-yellow-700 transition-colors">
                          {t.buyerInfo.firstName} {t.buyerInfo.lastName}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase">
                          {t.buyerInfo.email}
                        </p>
                      </div>
                      {t.status === "transferred" && (
                        <UserPlus
                          size={12}
                          className="text-blue-500"
                          aria-label="Ticket Transferred"
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[10px] font-black uppercase px-3 py-1 bg-slate-100 rounded-lg text-slate-600">
                      {t.tierName}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    {t.status === "used" && t.checkedInAt ? (
                      <div className="flex flex-col">
                        <p className="text-[11px] font-black uppercase text-slate-900 tracking-tight">
                          {new Date(t.checkedInAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                        <p className="text-[10px] font-bold text-blue-600 uppercase mt-0.5">
                          {new Date(t.checkedInAt).toLocaleTimeString("en-GB", {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </p>
                        <p className="text-[9px] font-medium text-slate-400 uppercase tracking-tighter mt-1 border-t border-slate-100 pt-1">
                          By: {t.checkedInBy?.name || "Gate Staff"}
                        </p>
                      </div>
                    ) : (
                      <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">
                        {t.status === "refunded"
                          ? "Invalidated"
                          : "Not scanned"}
                      </p>
                    )}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <span
                        className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-full border ${getStatusBadge(t.status)}`}
                      >
                        {t.status === "valid" ? "Valid Pass" : t.status}
                      </span>

                      {/* Refund Action - Only show if not already refunded/cancelled */}
                      {t.status !== "refunded" && t.status !== "cancelled" && (
                        <button
                          onClick={() => onRefund && onRefund(t.ticketCode)}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Issue Refund"
                        >
                          <RotateCcw size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-20 text-center">
                  <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.3em]">
                    No matching guests found
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-6 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p: number) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 disabled:opacity-30 hover:text-yellow-600 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() =>
                setCurrentPage((p: number) => Math.min(p + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 disabled:opacity-30 hover:text-yellow-600 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
