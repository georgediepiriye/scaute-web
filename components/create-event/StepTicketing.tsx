/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Users,
  Ticket,
  LinkIcon,
  Trash2,
  Ban,
  MessageCircle,
  CalendarDays,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SKAUTE_BLUE = "#0052FF";
const SKAUTE_YELLOW = "#FFD700";

export const StepTicketing = ({ formData, updateForm }: any) => {
  const ticketingType = formData.ticketingType || "none";
  const tiers = formData.ticketTiers || [];

  const addTier = () => {
    const newTiers = [
      ...tiers,
      {
        name: "General Admission",
        price: 0,
        capacity: 50,
        salesEnd: formData.startDate || "",
      },
    ];
    updateForm("ticketTiers", newTiers);
  };

  const removeTier = (index: number) => {
    const newTiers = tiers.filter((_: any, i: number) => i !== index);
    updateForm("ticketTiers", newTiers);
  };

  const updateTier = (index: number, field: string, value: any) => {
    const newTiers = [...tiers];

    let formattedValue = value;

    if (field === "price" || field === "capacity") {
      const parsedNum = value === "" ? 0 : Number(value);
      formattedValue = isNaN(parsedNum) || parsedNum < 0 ? 0 : parsedNum;
    }

    newTiers[index] = { ...newTiers[index], [field]: formattedValue };
    updateForm("ticketTiers", newTiers);
  };

  const handleNumericKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "-" || e.key === "+" || e.key === "e" || e.key === "E") {
      e.preventDefault();
    }
  };

  const handleNumericPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasteData = e.clipboardData.getData("text");
    if (/[^0-9.]/.test(pasteData) || Number(pasteData) < 0) {
      e.preventDefault();
    }
  };

  const TICKET_OPTIONS = [
    {
      id: "none",
      label: "No Tickets",
      sub: "Open entry for everyone",
      icon: Ban,
      accent: "bg-gray-100",
    },
    {
      id: "internal",
      label: "Skaute Tickets",
      sub: "Sell directly on Skaute",
      icon: Ticket,
      accent: "bg-yellow-100",
    },
    {
      id: "external",
      label: "External Link",
      sub: "Use Eventbrite or others",
      icon: LinkIcon,
      accent: "bg-blue-100",
    },
  ];

  return (
    <div className="bg-white p-5 md:p-10 rounded-[32px] md:rounded-[40px] border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] space-y-10 overflow-hidden">
      {/* HEADER */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100 border border-yellow-200">
          <Sparkles size={12} className="text-yellow-700" />
          <span className="text-[10px] font-black uppercase tracking-wider text-yellow-900">
            Monetize Your Move
          </span>
        </div>

        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-950">
            Ticketing & Access
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1 max-w-xl leading-relaxed">
            Choose how people join your event — free entry, sell tickets on
            Skaute, or redirect externally.
          </p>
        </div>
      </div>

      {/* TICKET OPTIONS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              Select Ticketing Type
            </p>
          </div>

          <div className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase text-gray-300">
            <ArrowRight size={12} />
            Choose One
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TICKET_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isActive = ticketingType === opt.id;

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => updateForm("ticketingType", opt.id)}
                className={`relative overflow-hidden rounded-[28px] border-2 p-5 md:p-6 text-left transition-all duration-300 group ${
                  isActive
                    ? "border-yellow-400 bg-yellow-50 shadow-[0_10px_30px_rgba(255,215,0,0.15)] scale-[1.01]"
                    : "border-gray-100 bg-white hover:border-gray-200 hover:-translate-y-1"
                }`}
              >
                {/* ACTIVE BADGE */}
                {isActive && (
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black text-white text-[9px] font-black uppercase tracking-wider">
                    Selected
                  </div>
                )}

                {/* ICON */}
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all ${
                    isActive
                      ? "bg-yellow-400 text-black"
                      : `${opt.accent} text-slate-700`
                  }`}
                >
                  <Icon size={24} />
                </div>

                {/* CONTENT */}
                <div className="space-y-2">
                  <h3 className="text-sm md:text-base font-black uppercase tracking-tight text-slate-950">
                    {opt.label}
                  </h3>

                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    {opt.sub}
                  </p>
                </div>

                {/* ACTIVE GLOW */}
                {isActive && (
                  <motion.div
                    layoutId="ticketing-glow"
                    className="absolute inset-0 rounded-[28px] border border-yellow-300 pointer-events-none"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* INTERNAL TICKETING */}
      <AnimatePresence>
        {ticketingType === "internal" && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6 pt-2"
          >
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h3 className="text-lg font-black tracking-tight text-slate-950">
                  Ticket Tiers
                </h3>

                <p className="text-sm text-slate-500 font-medium">
                  Create different access levels and pricing options.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 self-start px-4 py-2 rounded-full bg-yellow-100 border border-yellow-200">
                <Ticket size={14} className="text-yellow-800" />
                <span className="text-[10px] font-black uppercase tracking-wider text-yellow-900">
                  {tiers.length} Active Tier
                  {tiers.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* TIERS */}
            <div className="space-y-5">
              {tiers.map((tier: any, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative bg-gradient-to-b from-white to-gray-50 border border-gray-100 rounded-[32px] p-5 md:p-7 shadow-sm"
                >
                  {/* TIER LABEL */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-yellow-100 flex items-center justify-center">
                        <Ticket size={16} className="text-yellow-800" />
                      </div>

                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                          Ticket Tier
                        </p>

                        <h4 className="text-lg font-black text-slate-950">
                          {tier.name || `Tier ${idx + 1}`}
                        </h4>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeTier(idx)}
                      className="w-10 h-10 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-red-500 hover:bg-red-50 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* GRID */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {/* NAME */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                        Tier Name
                      </label>

                      <input
                        placeholder="e.g. Early Bird"
                        value={tier.name}
                        onChange={(e) =>
                          updateTier(idx, "name", e.target.value)
                        }
                        className="w-full h-14 px-5 rounded-2xl bg-white border border-gray-100 font-bold text-base outline-none focus:ring-2 focus:border-yellow-300 transition-all"
                        style={
                          {
                            "--tw-ring-color": `${SKAUTE_YELLOW}40`,
                          } as any
                        }
                      />
                    </div>

                    {/* PRICE */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                        Price (₦)
                      </label>

                      <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-sm font-black text-gray-400">
                          ₦
                        </span>

                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={tier.price === 0 ? "" : tier.price}
                          onKeyDown={handleNumericKeyDown}
                          onPaste={handleNumericPaste}
                          onChange={(e) =>
                            updateTier(idx, "price", e.target.value)
                          }
                          className="w-full h-14 pl-10 pr-4 rounded-2xl bg-white border border-gray-100 font-bold text-base outline-none focus:ring-2 focus:border-yellow-300 transition-all"
                          style={
                            {
                              "--tw-ring-color": `${SKAUTE_YELLOW}40`,
                            } as any
                          }
                        />
                      </div>
                    </div>

                    {/* CAPACITY */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                        Capacity
                      </label>

                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          placeholder="100"
                          value={tier.capacity === 0 ? "" : tier.capacity}
                          onKeyDown={handleNumericKeyDown}
                          onPaste={handleNumericPaste}
                          onChange={(e) =>
                            updateTier(idx, "capacity", e.target.value)
                          }
                          className="w-full h-14 px-5 pr-12 rounded-2xl bg-white border border-gray-100 font-bold text-base outline-none focus:ring-2 focus:border-yellow-300 transition-all"
                          style={
                            {
                              "--tw-ring-color": `${SKAUTE_YELLOW}40`,
                            } as any
                          }
                        />

                        <Users
                          size={16}
                          className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300"
                        />
                      </div>
                    </div>

                    {/* SALES END */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                        Sales End
                      </label>

                      <div className="relative">
                        <input
                          type="datetime-local"
                          value={
                            tier.salesEnd
                              ? new Date(tier.salesEnd)
                                  .toISOString()
                                  .slice(0, 16)
                              : ""
                          }
                          onChange={(e) =>
                            updateTier(idx, "salesEnd", e.target.value)
                          }
                          className="w-full h-14 px-5 pr-12 rounded-2xl bg-white border border-gray-100 font-bold text-[12px] outline-none focus:ring-2 focus:border-yellow-300 transition-all"
                          style={
                            {
                              "--tw-ring-color": `${SKAUTE_YELLOW}40`,
                            } as any
                          }
                        />

                        <CalendarDays
                          size={16}
                          className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* ADD BUTTON */}
            <button
              type="button"
              onClick={addTier}
              className="w-full py-6 rounded-[28px] border-2 border-dashed border-yellow-300 bg-yellow-50 hover:bg-yellow-100 transition-all group"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-white border border-yellow-200 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                  <Ticket size={18} className="text-yellow-700" />
                </div>

                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-950">
                    Add New Ticket Tier
                  </p>

                  <p className="text-[10px] text-slate-500 font-bold uppercase">
                    VIP • Early Bird • Backstage
                  </p>
                </div>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EXTERNAL */}
      <AnimatePresence>
        {ticketingType === "external" && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-5 border-t border-gray-100 pt-6"
          >
            <div>
              <h3 className="text-lg font-black tracking-tight text-slate-950">
                External Ticket Provider
              </h3>

              <p className="text-sm text-slate-500 font-medium mt-1">
                Redirect attendees to another platform for checkout.
              </p>
            </div>

            <div className="relative">
              <input
                placeholder="https://eventbrite.com/your-event"
                value={formData.externalTicketLink || ""}
                onChange={(e) =>
                  updateForm("externalTicketLink", e.target.value)
                }
                className="w-full h-16 pl-6 pr-14 rounded-[24px] bg-gray-50 border border-transparent font-bold text-base outline-none focus:bg-white focus:ring-2 transition-all"
                style={
                  {
                    "--tw-ring-color": `${SKAUTE_YELLOW}40`,
                  } as any
                }
              />

              <LinkIcon
                size={18}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* COMMUNITY */}
      <div className="pt-8 border-t border-gray-100 space-y-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
            <MessageCircle size={20} style={{ color: SKAUTE_BLUE }} />
          </div>

          <div>
            <h3 className="text-lg font-black tracking-tight text-slate-950">
              Community Management
            </h3>

            <p className="text-sm text-slate-500 font-medium mt-1 leading-relaxed">
              Add a WhatsApp, Telegram, or Discord link so attendees can stay
              connected before and after the move.
            </p>
          </div>
        </div>

        <div className="relative">
          <input
            placeholder="https://chat.whatsapp.com/..."
            value={formData.communityLink || ""}
            onChange={(e) => updateForm("communityLink", e.target.value)}
            className="w-full h-16 pl-6 pr-14 rounded-[24px] bg-gray-50 border border-transparent font-bold text-base outline-none focus:bg-white focus:ring-2 transition-all"
            style={
              {
                "--tw-ring-color": `${SKAUTE_YELLOW}40`,
              } as any
            }
          />

          <MessageCircle
            size={18}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300"
          />
        </div>
      </div>
    </div>
  );
};
