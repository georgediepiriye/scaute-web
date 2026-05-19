/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useTransition } from "react";
import {
  ShieldCheck,
  ExternalLink,
  UserCheck,
  UserX,
  MapPin,
  CalendarDays,
  Ticket,
  Loader2,
  Search,
} from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

// Explicitly typed to map your backend's optimized Mongoose Schema attributes
export interface ManagedUser {
  _id: string;
  name: string;
  email: string;
  image?: string;
  role: "user" | "organizer" | "admin";
  organizerType?: "individual" | "business";
  neighborhood?: string;
  isVerified: boolean;
  status: "active" | "suspended" | "pending"; // Fully maps to your custom Mongoose UserStatus enum
  eventsCount?: number; // Fed directly from your backend's $lookup pipeline
  stats?: {
    ticketsSold: number;
  };
}

interface UserManagementTableProps {
  users: ManagedUser[];
  onVerify: (userId: string) => Promise<void> | void;
  onToggleStatus: (
    userId: string,
    newStatus: "active" | "suspended",
  ) => Promise<void> | void;
}

export function UserManagementTable({
  users,
  onVerify,
  onToggleStatus,
}: UserManagementTableProps) {
  const [isPending, startTransition] = useTransition();
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [localSearch, setLocalSearch] = useState("");

  const handleAction = (action: string, userName: string) => {
    toast.success(`${action} initiated for ${userName}`);
  };

  // Encapsulates row actions with loading states preventing double clicks
  const wrapAsyncAction = (
    userId: string,
    actionFn: () => Promise<void> | void,
  ) => {
    setActiveActionId(userId);
    startTransition(async () => {
      try {
        await actionFn();
      } catch (err) {
        console.error("Dashboard table action operation aborted:", err);
      } finally {
        setActiveActionId(null);
      }
    });
  };

  // Local filtering engine matching names, emails, and physical nodes
  const filteredUsers = users.filter((user) => {
    const term = localSearch.toLowerCase();
    return (
      user.name?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user.neighborhood?.toLowerCase().includes(term)
    );
  });

  if (!users || users.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-[32px] border border-gray-100">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          No matching community leads found.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      {/* LOCAL VIEWPORT SEARCH BAR BARRIER */}
      <div className="relative group w-full max-w-sm">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors"
          size={14}
        />
        <input
          type="text"
          placeholder="Filter down current batch..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="bg-white border border-gray-200 rounded-2xl py-2.5 pl-11 pr-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-blue-600 transition-all w-full shadow-sm"
        />
      </div>

      <div className="w-full overflow-x-auto rounded-[32px] border border-gray-100 bg-white shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50/70 border-b border-gray-100">
              <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">
                Lead Info & Location
              </th>
              <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">
                Account Parameters
              </th>
              <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">
                Volume Activity
              </th>
              <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">
                Status
              </th>
              <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredUsers.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-12 text-center text-[10px] font-black uppercase tracking-widest text-gray-400"
                >
                  No matching items filter matches your console search.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const isRowProcessing =
                  isPending && activeActionId === user._id;
                const isUserActive = user.status === "active";

                return (
                  <tr
                    key={user._id}
                    className="hover:bg-blue-50/10 transition-colors group relative"
                  >
                    {/* 1. LEAD INFO & LOCATION */}
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <ImageWithFallback
                            src={user.image}
                            name={user.name}
                          />
                        </div>
                        <div>
                          <p className="text-xs font-black text-gray-900 uppercase italic tracking-tighter flex items-center gap-1">
                            {user.name}
                            {user.isVerified && (
                              <ShieldCheck
                                size={13}
                                className="text-blue-500 fill-blue-50"
                              />
                            )}
                          </p>
                          <p className="text-[10px] font-bold text-gray-400 lowercase leading-none mb-1">
                            {user.email}
                          </p>
                          {user.neighborhood && (
                            <span className="text-[9px] font-bold text-slate-500 flex items-center gap-0.5 capitalize">
                              <MapPin size={10} className="text-blue-500" />{" "}
                              {user.neighborhood}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* 2. ACCOUNT PARAMETERS */}
                    <td className="px-8 py-5">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-900">
                          Role: {user.role || "user"}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                            user.organizerType === "business"
                              ? "bg-purple-50 text-purple-600 border-purple-100"
                              : "bg-slate-50 text-slate-500 border-slate-100"
                          }`}
                        >
                          {user.organizerType || "Individual"}
                        </span>
                      </div>
                    </td>

                    {/* 3. PLATFORM VOLUME METRICS */}
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4 text-[10px] font-bold text-slate-600">
                        <div
                          className="flex items-center gap-1"
                          title="Events Appended"
                        >
                          <CalendarDays size={12} className="text-slate-400" />
                          <span>{user.eventsCount || 0} Moves</span>
                        </div>
                        <div
                          className="flex items-center gap-1"
                          title="Tickets Relayed"
                        >
                          <Ticket size={12} className="text-slate-400" />
                          <span>{user.stats?.ticketsSold || 0} Sold</span>
                        </div>
                      </div>
                    </td>

                    {/* 4. ACTIVE CONTROL STATUS INDICATORS */}
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            user.status === "active"
                              ? "bg-emerald-500 animate-pulse"
                              : user.status === "pending"
                                ? "bg-amber-500"
                                : "bg-red-500"
                          }`}
                        />
                        <p className="text-[10px] font-black uppercase text-gray-700 tracking-tight capitalize">
                          {user.status || "active"}
                        </p>
                      </div>
                    </td>

                    {/* 5. DYNAMIC ACTIONS CONTROLS */}
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
                        {isRowProcessing ? (
                          <div className="p-2 text-blue-600 animate-spin">
                            <Loader2 size={14} />
                          </div>
                        ) : (
                          <>
                            {/* VERIFY USER FLAG */}
                            {!user.isVerified && (
                              <ActionButton
                                onClick={() =>
                                  wrapAsyncAction(user._id, () =>
                                    onVerify(user._id),
                                  )
                                }
                                icon={<UserCheck size={14} />}
                                label="Approve Verification"
                                color="blue"
                                disabled={isPending}
                              />
                            )}

                            {/* SUSPEND / ACCOUNT LOCKDOWN */}
                            <ActionButton
                              onClick={() =>
                                wrapAsyncAction(user._id, () =>
                                  onToggleStatus(
                                    user._id,
                                    isUserActive ? "suspended" : "active",
                                  ),
                                )
                              }
                              icon={<UserX size={14} />}
                              label={
                                isUserActive
                                  ? "Suspend Account"
                                  : "Lift Suspension"
                              }
                              color={isUserActive ? "red" : "blue"}
                              disabled={isPending}
                            />

                            <div className="h-5 w-[1px] bg-gray-100 mx-1" />

                            <button
                              onClick={() =>
                                handleAction("External View", user.name)
                              }
                              disabled={isPending}
                              className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-gray-400 hover:text-slate-900 disabled:opacity-40"
                            >
                              <ExternalLink size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ROBUST FALLBACK AVATAR COMPONENT */
function ImageWithFallback({ src, name }: { src?: string; name: string }) {
  const [error, setError] = useState(false);
  const initials = name ? name.substring(0, 2).toUpperCase() : "PH";

  if (!src || error) {
    return (
      <div className="w-10 h-10 rounded-full border border-gray-200 bg-slate-100 flex items-center justify-center shadow-sm">
        <span className="text-[10px] font-black text-slate-500 tracking-tighter italic">
          {initials}
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-100 bg-slate-50 shadow-sm">
      <Image
        src={src}
        alt={name}
        fill
        className="object-cover"
        onError={() => setError(true)}
      />
    </div>
  );
}

/* SEPARATED ACTION BUTTON CONTROLS */
interface ActionButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  label: string;
  color: "blue" | "emerald" | "red" | "slate";
  disabled?: boolean;
}

function ActionButton({
  icon,
  onClick,
  label,
  color,
  disabled,
}: ActionButtonProps) {
  const colors = {
    blue: "hover:bg-blue-50 text-blue-600 hover:text-blue-700",
    emerald: "hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700",
    red: "hover:bg-red-50 text-red-600 hover:text-red-700",
    slate: "hover:bg-slate-50 text-slate-600 hover:text-slate-700",
  };

  return (
    <button
      onClick={onClick}
      title={label}
      disabled={disabled}
      className={`p-2 rounded-xl transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none ${colors[color]}`}
    >
      {icon}
    </button>
  );
}
