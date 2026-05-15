/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import {
  Tag,
  Percent,
  Copy,
  Check,
  TrendingUp,
  Share2,
  Ticket,
  Loader2,
  Calendar,
  Trash2,
  Hash, // Added for usage limit icon
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export const MarketingTab = ({ id, event: initialEvent }: any) => {
  const router = useRouter();

  const [discounts, setDiscounts] = useState(initialEvent.discounts || []);
  const [copied, setCopied] = useState(false);
  const [showAddCode, setShowAddCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: "",
    discountPercentage: "",
    usageLimit: "", // Added this field
    expiryDate: "",
    applicableTickets: [] as string[],
  });

  const eventLink = `https://kivo-isca.onrender.com/e/${initialEvent.slug}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveDiscount = async () => {
    if (!formData.code || !formData.discountPercentage) {
      return toast.error("Please fill in the required fields");
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/events/${id}/discounts`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            code: formData.code.toUpperCase().trim(),
            discountPercentage: Number(formData.discountPercentage),
            usageLimit: formData.usageLimit
              ? Number(formData.usageLimit)
              : null, // Send to backend
            expiryDate: formData.expiryDate || null,
            applicableTickets: formData.applicableTickets,
          }),
        },
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to save");

      toast.success("Discount code activated!");
      setShowAddCode(false);
      setFormData({
        code: "",
        discountPercentage: "",
        usageLimit: "", // Reset field
        expiryDate: "",
        applicableTickets: [],
      });

      setDiscounts(data.data.event.discounts);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDiscount = async (discountId: string) => {
    if (!confirm("Are you sure you want to delete this code?")) return;

    const previousDiscounts = [...discounts];
    setDiscounts(discounts.filter((d: any) => d._id !== discountId));
    setIsDeleting(discountId);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/events/${id}/discounts/${discountId}`,
        { method: "DELETE", credentials: "include" },
      );

      if (!response.ok) throw new Error("Failed to delete");

      toast.success("Discount removed");
      router.refresh();
    } catch (error: any) {
      setDiscounts(previousDiscounts);
      toast.error(error.message);
    } finally {
      setIsDeleting(null);
    }
  };

  const toggleTicketTier = (tierName: string) => {
    setFormData((prev) => ({
      ...prev,
      applicableTickets: prev.applicableTickets.includes(tierName)
        ? prev.applicableTickets.filter((t) => t !== tierName)
        : [...prev.applicableTickets, tierName],
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Stats Section stays the same */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: "Promo Usage",
            value: discounts.reduce(
              (acc: number, d: any) => acc + (d.usedCount || 0),
              0,
            ),
            icon: Tag,
            color: "text-blue-500",
          },
          {
            label: "Referral Sales",
            value: "₦0",
            icon: TrendingUp,
            color: "text-green-500",
          },
          {
            label: "Page Views",
            value: initialEvent.views || "---",
            icon: Share2,
            color: "text-purple-500",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm"
          >
            <stat.icon size={16} className={`${stat.color} mb-3`} />
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
              {stat.label}
            </p>
            <p className="text-xl font-black mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main Link Section stays the same */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-yellow-400 mb-4">
            Main Event Link
          </h3>
          <div className="flex items-center gap-3 bg-white/10 p-2 pl-6 rounded-2xl border border-white/10">
            <p className="text-[10px] font-bold truncate flex-1 opacity-80">
              {eventLink}
            </p>
            <button
              onClick={() => copyToClipboard(eventLink)}
              className="bg-yellow-400 text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase flex items-center gap-2 hover:bg-yellow-300 transition-all active:scale-95"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy Link"}
            </button>
          </div>
        </div>
      </div>

      {/* Discounts Management */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Percent size={16} className="text-yellow-500" />
            <h3 className="text-xs font-black uppercase tracking-[0.2em]">
              Discount Codes
            </h3>
          </div>
          <button
            onClick={() => setShowAddCode(!showAddCode)}
            className="text-[10px] font-black uppercase bg-slate-900 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
          >
            {showAddCode ? "Cancel" : "Create Code"}
          </button>
        </div>

        <div className="p-8">
          {showAddCode && (
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-6 animate-in zoom-in-95 duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2 mb-1 block">
                    Code Name
                  </label>
                  <input
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="PHCITY20"
                    className="w-full p-4 rounded-2xl bg-white border border-slate-100 text-[10px] font-bold uppercase outline-none focus:border-yellow-400"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2 mb-1 block">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    value={formData.discountPercentage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountPercentage: e.target.value,
                      })
                    }
                    placeholder="20"
                    className="w-full p-4 rounded-2xl bg-white border border-slate-100 text-[10px] font-bold outline-none focus:border-yellow-400"
                  />
                </div>
                {/* NEW USAGE LIMIT FIELD */}
                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2 mb-1 block">
                    Usage Limit
                  </label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) =>
                      setFormData({ ...formData, usageLimit: e.target.value })
                    }
                    placeholder="50"
                    className="w-full p-4 rounded-2xl bg-white border border-slate-100 text-[10px] font-bold outline-none focus:border-yellow-400"
                  />
                </div>
                {/* UPDATED DATE-TIME FIELD */}
                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2 mb-1 block">
                    Expiry Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.expiryDate}
                    onChange={(e) =>
                      setFormData({ ...formData, expiryDate: e.target.value })
                    }
                    className="w-full p-4 rounded-2xl bg-white border border-slate-100 text-[10px] font-bold outline-none focus:border-yellow-400"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-2 mb-2 block">
                  Apply to Specific Tickets (Optional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {initialEvent.ticketTiers?.map((ticket: any) => (
                    <button
                      key={ticket.name}
                      type="button"
                      onClick={() => toggleTicketTier(ticket.name)}
                      className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase border transition-all ${formData.applicableTickets.includes(ticket.name) ? "bg-yellow-400 border-yellow-400 text-black" : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"}`}
                    >
                      {ticket.name}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSaveDiscount}
                disabled={isSubmitting}
                className="w-full mt-6 bg-yellow-400 p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Saving...
                  </>
                ) : (
                  "Activate Discount"
                )}
              </button>
            </div>
          )}

          {/* List display logic stays the same */}
          <div className="space-y-3">
            {discounts.length > 0 ? (
              discounts.map((discount: any) => (
                <div
                  key={discount._id}
                  className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-yellow-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center text-yellow-600">
                      <Ticket size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-900">
                        {discount.code}
                      </p>
                      <div className="text-[8px] font-bold text-slate-400 uppercase flex flex-wrap items-center gap-2 mt-0.5">
                        <span className="text-yellow-600">
                          {discount.discountPercentage}% OFF
                        </span>
                        <span>•</span>
                        {/* Display Limit Info if it exists */}
                        <span>
                          {discount.usedCount || 0} /{" "}
                          {discount.usageLimit || "∞"} uses
                        </span>
                        {discount.applicableTickets?.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[7px]">
                              {discount.applicableTickets.join(", ")}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteDiscount(discount._id)}
                    disabled={isDeleting === discount._id}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    {isDeleting === discount._id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                </div>
              ))
            ) : (
              <p className="text-[10px] font-black text-center text-slate-300 uppercase py-8 border border-dashed rounded-3xl">
                No active codes
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
