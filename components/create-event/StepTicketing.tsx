/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Users,
  Ticket,
  LinkIcon,
  Trash2,
  Ban,
  MessageCircle,
} from "lucide-react";
import { motion } from "framer-motion";

// BRAND COLOR CONSTANTS
const KIVO_BLUE = "#0052FF";
const KIVO_YELLOW = "#FFD700";

export const StepTicketing = ({ formData, updateForm }: any) => {
  const ticketingType = formData.ticketingType || "none";
  const tiers = formData.ticketTiers || [];

  const addTier = () => {
    const newTiers = [
      ...tiers,
      { name: "General Admission", price: 0, capacity: 50 },
    ];
    updateForm("ticketTiers", newTiers);
  };

  const removeTier = (index: number) => {
    const newTiers = tiers.filter((_: any, i: number) => i !== index);
    updateForm("ticketTiers", newTiers);
  };

  const updateTier = (index: number, field: string, value: any) => {
    const newTiers = [...tiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    updateForm("ticketTiers", newTiers);
  };

  const TICKET_OPTIONS = [
    { id: "none", label: "No Tickets", sub: "Open entry", icon: Ban },
    { id: "internal", label: "Kivo Tickets", sub: "Sell on app", icon: Ticket },
    {
      id: "external",
      label: "External Ticket Link",
      sub: "Third-party",
      icon: LinkIcon,
    },
  ];

  return (
    <div className="bg-white p-6 md:p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-10">
      {/* 1. Selection Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TICKET_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isActive = ticketingType === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => updateForm("ticketingType", opt.id)}
              className={`p-6 rounded-[24px] border-2 flex flex-col items-center text-center gap-3 transition-all ${
                isActive
                  ? "bg-blue-50/50"
                  : "border-gray-50 bg-gray-50/50 text-gray-400 hover:border-gray-200"
              }`}
              style={{
                borderColor: isActive ? KIVO_BLUE : "",
                color: isActive ? KIVO_BLUE : "",
              }}
            >
              <Icon
                size={24}
                style={{ color: isActive ? KIVO_BLUE : "#D1D5DB" }}
              />
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider">
                  {opt.label}
                </p>
                <p className="text-[9px] font-bold opacity-60 uppercase">
                  {opt.sub}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* 2. Internal Ticketing UI */}
      {ticketingType === "internal" && (
        <div className="space-y-6 pt-4 border-t border-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase text-gray-400">
              Ticket Tiers
            </h3>
            <span
              className="text-[10px] font-black text-gray-900 px-3 py-1 rounded-full shadow-sm"
              style={{ backgroundColor: KIVO_YELLOW }}
            >
              {tiers.length} Active
            </span>
          </div>

          <div className="space-y-4">
            {tiers.map((tier: any, idx: number) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={idx}
                className="p-6 bg-gray-50 rounded-[32px] grid md:grid-cols-3 gap-6 relative border border-transparent transition-colors hover:border-blue-100"
              >
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-gray-400 ml-1">
                    Tier Name
                  </label>
                  <input
                    placeholder="e.g. Early Bird"
                    value={tier.name}
                    onChange={(e) => updateTier(idx, "name", e.target.value)}
                    className="w-full p-4 rounded-2xl bg-white font-bold text-sm outline-none shadow-sm focus:ring-2 transition-all"
                    style={{ "--tw-ring-color": `${KIVO_BLUE}15` } as any}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-gray-400 ml-1">
                    Price (₦)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={tier.price}
                    onChange={(e) =>
                      updateTier(idx, "price", Number(e.target.value))
                    }
                    className="w-full p-4 rounded-2xl bg-white font-bold text-sm outline-none shadow-sm focus:ring-2 transition-all"
                    style={{ "--tw-ring-color": `${KIVO_BLUE}15` } as any}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-gray-400 ml-1">
                    Capacity
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="100"
                      value={tier.capacity}
                      onChange={(e) =>
                        updateTier(idx, "capacity", Number(e.target.value))
                      }
                      className="w-full p-4 rounded-2xl bg-white font-bold text-sm outline-none shadow-sm focus:ring-2 transition-all"
                      style={{ "--tw-ring-color": `${KIVO_BLUE}15` } as any}
                    />
                    <Users
                      size={14}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeTier(idx)}
                  className="absolute -top-2 -right-2 bg-white text-red-500 p-2.5 rounded-full shadow-lg border border-gray-100 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))}
          </div>

          <button
            type="button"
            onClick={addTier}
            className="w-full py-6 border-2 border-dashed border-gray-200 rounded-[32px] text-[10px] font-black uppercase text-gray-400 hover:bg-blue-50/50 transition-all"
          >
            + Add New Ticket Tier
          </button>
        </div>
      )}

      {/* 3. External Link UI */}
      {ticketingType === "external" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4 pt-4 border-t border-gray-50"
        >
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">
              External Ticket URL
            </label>
            <div className="relative">
              <input
                placeholder="https://eventbrite.com/your-event"
                value={formData.externalTicketLink || ""}
                onChange={(e) =>
                  updateForm("externalTicketLink", e.target.value)
                }
                className="w-full p-5 bg-gray-50 rounded-[24px] font-bold outline-none text-sm border border-transparent focus:bg-white transition-all shadow-sm"
              />
              <LinkIcon
                size={16}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300"
              />
            </div>
            <p className="text-[9px] text-gray-400 font-bold uppercase ml-1">
              Followers will be redirected to this link to purchase tickets.
            </p>
          </div>
        </motion.div>
      )}

      {/* 4. Community & Group Links (WhatsApp/Telegram) */}
      <div className="space-y-4 pt-8 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-2">
          <MessageCircle size={16} style={{ color: KIVO_BLUE }} />
          <h3 className="text-[10px] font-black uppercase text-gray-400">
            Community Management
          </h3>
        </div>

        <div className="space-y-2">
          <label className="text-[9px] font-black uppercase text-gray-400 ml-1">
            WhatsApp / Telegram / Facebook / Group Link
          </label>
          <div className="relative">
            <input
              placeholder="https://chat.whatsapp.com/..."
              value={formData.communityLink || ""}
              onChange={(e) => updateForm("communityLink", e.target.value)}
              className="w-full p-5 bg-gray-50 rounded-[24px] font-bold outline-none text-sm border border-transparent focus:bg-white focus:border-blue-200 transition-all shadow-sm"
            />
            <div className="absolute right-5 top-1/2 -translate-y-1/2 px-2 py-1 rounded-md bg-white border border-gray-100 text-[8px] font-black text-gray-400 uppercase">
              Optional
            </div>
          </div>
          <p className="text-[9px] text-gray-400 font-bold uppercase ml-1">
            Share a link for attendees to join your event group chat for live
            updates.
          </p>
        </div>
      </div>
    </div>
  );
};
