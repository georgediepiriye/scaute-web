"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";

interface PayoutFormProps {
  availableBalance: number;
  eventId: string;
  onSuccess: () => void;
}

export function PayoutRequestForm({
  availableBalance,
  eventId,
  onSuccess,
}: PayoutFormProps) {
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = Number(amount);

    if (!amount || !bankName || !accountNumber || !accountName) {
      return toast.error(
        "All billing fields are required to process manual banking settlement.",
      );
    }
    if (parsedAmount < 100) {
      return toast.error(
        "Minimum platform payout threshold configuration is ₦100.",
      );
    }
    if (parsedAmount > availableBalance) {
      return toast.error(
        "Requested withdrawal value exceeds your currently available earnings pool allocation.",
      );
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("skaute_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/payouts/request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({
            eventId,
            amount: parsedAmount,
            bankDetails: { bankName, accountNumber, accountName },
          }),
        },
      );

      const result = await res.json();
      if (res.ok) {
        toast.success(
          "Settlement instruction filed! Awaiting processing validation.",
        );
        setAmount("");
        onSuccess();
      } else {
        toast.error(
          result.message || "Could not process payment transfer setup request.",
        );
      }
    } catch (err) {
      toast.error("Network communication pipeline fault. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleRequestSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider block mb-1.5">
            Settlement Volume (₦)
          </label>
          <input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-slate-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-slate-900 transition-all"
          />
        </div>
        <div>
          <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider block mb-1.5">
            Destination Bank Name
          </label>
          <input
            type="text"
            placeholder="e.g., Access Bank, GTBank"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            className="w-full bg-slate-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-slate-900 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider block mb-1.5">
            Account Number (10 digits)
          </label>
          <input
            type="text"
            placeholder="0123456789"
            maxLength={10}
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            className="w-full bg-slate-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold font-mono outline-none focus:border-slate-900 transition-all"
          />
        </div>
        <div>
          <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider block mb-1.5">
            Account Holder Name
          </label>
          <input
            type="text"
            placeholder="As registered on bank records"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            className="w-full bg-slate-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold uppercase outline-none focus:border-slate-900 transition-all"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting || availableBalance < 100}
        className="w-full mt-2 bg-slate-900 text-white rounded-xl py-3.5 text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 transition-all"
      >
        {submitting
          ? "Transmitting Instructions..."
          : "Execute Settlement Transfer"}
      </button>
    </form>
  );
}
