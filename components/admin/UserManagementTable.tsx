/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  ShieldCheck,
  Mail,
  Ban,
  Wallet,
  ExternalLink,
  MoreVertical,
  UserCheck,
  UserX,
  History,
} from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

interface UserManagementTableProps {
  users: any[];
  onVerify: () => void;
}

export function UserManagementTable({
  users,
  onVerify,
}: UserManagementTableProps) {
  const handleAction = (action: string, userName: string) => {
    toast.success(`${action} initiated for ${userName}`);
    // Implement actual API calls here
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">
              Lead Info
            </th>
            <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">
              Account Type
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
          {users.map((user) => (
            <tr
              key={user._id}
              className="hover:bg-blue-50/30 transition-colors group"
            >
              {/* USER INFO */}
              <td className="px-8 py-5">
                <div className="flex items-center gap-4">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                    <Image
                      src={user.image || "/default-avatar.png"}
                      alt={user.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-900 uppercase italic tracking-tighter flex items-center gap-1">
                      {user.name}{" "}
                      {user.isVerified && (
                        <ShieldCheck size={12} className="text-blue-500" />
                      )}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 lowercase">
                      {user.email}
                    </p>
                  </div>
                </div>
              </td>

              {/* ACCOUNT TYPE */}
              <td className="px-8 py-5">
                <span
                  className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                    user.organizerType === "business"
                      ? "bg-purple-50 text-purple-600 border-purple-100"
                      : "bg-slate-50 text-slate-500 border-slate-100"
                  }`}
                >
                  {user.organizerType || "Individual"}
                </span>
              </td>

              {/* STATUS */}
              <td className="px-8 py-5">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${user.isActive ? "bg-green-500" : "bg-red-500"}`}
                  />
                  <p className="text-[10px] font-black uppercase text-gray-700 tracking-tighter">
                    {user.isActive ? "Active" : "Suspended"}
                  </p>
                </div>
              </td>

              {/* ACTIONS SECTION */}
              <td className="px-8 py-5 text-right">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* VERIFY USER */}
                  {!user.isVerified && (
                    <ActionButton
                      onClick={() => onVerify()}
                      icon={<UserCheck size={14} />}
                      label="Verify"
                      color="blue"
                    />
                  )}

                  {/* FINANCIAL HISTORY */}
                  <ActionButton
                    onClick={() => handleAction("Wallet Audit", user.name)}
                    icon={<Wallet size={14} />}
                    label="Wallet"
                    color="emerald"
                  />

                  {/* MESSAGE USER */}
                  <ActionButton
                    onClick={() => handleAction("Support Message", user.name)}
                    icon={<Mail size={14} />}
                    label="Contact"
                    color="slate"
                  />

                  {/* BAN/RESTRICT */}
                  <ActionButton
                    onClick={() => handleAction("Suspension", user.name)}
                    icon={<UserX size={14} />}
                    label="Restrict"
                    color="red"
                  />

                  <div className="h-6 w-[1px] bg-gray-100 mx-2" />

                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
                    <ExternalLink size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ActionButton({ icon, onClick, label, color }: any) {
  const colors: any = {
    blue: "hover:bg-blue-50 text-blue-600 hover:text-blue-700",
    emerald: "hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700",
    red: "hover:bg-red-50 text-red-600 hover:text-red-700",
    slate: "hover:bg-slate-50 text-slate-600 hover:text-slate-700",
  };

  return (
    <button
      onClick={onClick}
      title={label}
      className={`p-2.5 rounded-xl transition-all duration-200 ${colors[color]}`}
    >
      {icon}
    </button>
  );
}
