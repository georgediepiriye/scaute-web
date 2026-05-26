"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";

interface PayoutFormProps {
  availableBalance: number;
  eventId: string;
  eventEndDate: string | Date; // Added prop to check event timeline
  onSuccess: () => void;
}

export function PayoutRequestForm({
  availableBalance,
  eventId,
  eventEndDate,
  onSuccess,
}: PayoutFormProps) {
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");

  const [submitting, setSubmitting] = useState(false);

  // Determine if the event is currently active or upcoming
  const isEventActive = new Date(eventEndDate) > new Date();

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Structural Guard: Prevent submission if event hasn't wrapped up yet
    if (isEventActive) {
      return toast.error(
        "Payout operations are restricted until the event has concluded.",
      );
    }

    const parsedAmount = Number(amount);

    if (!amount || !bankName || !accountNumber || !accountName) {
      return toast.error("All payout fields are required.");
    }

    if (parsedAmount < 100) {
      return toast.error("Minimum payout amount is ₦100.");
    }

    if (parsedAmount > availableBalance) {
      return toast.error("Requested amount exceeds available balance.");
    }

    if (accountNumber.length !== 10) {
      return toast.error("Account number must be exactly 10 digits.");
    }

    setSubmitting(true);

    const loadingToast = toast.loading("Preparing payout request...");

    try {
      /**
       * SMALL UX DELAY
       * Makes the interaction feel smoother + intentional
       */
      await new Promise((resolve) => setTimeout(resolve, 1400));

      const token = localStorage.getItem("skaute_token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/payouts/request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && {
              Authorization: `Bearer ${token}`,
            }),
          },
          body: JSON.stringify({
            eventId,
            amount: parsedAmount,
            bankDetails: {
              bankName,
              accountNumber,
              accountName,
            },
          }),
        },
      );

      const result = await res.json();

      if (res.ok) {
        /**
         * SUCCESS TOAST
         */
        toast.success("Payout request submitted successfully!", {
          id: loadingToast,
        });

        /**
         * FOLLOW-UP UX TOAST
         */
        setTimeout(() => {
          toast("Your settlement request is now awaiting admin approval.", {
            icon: "💸",
          });
        }, 700);

        /**
         * RESET FORM
         */
        setAmount("");
        setBankName("");
        setAccountNumber("");
        setAccountName("");

        /**
         * REFRESH DASHBOARD
         */
        onSuccess();
      } else {
        toast.error(result.message || "Could not process payout request.", {
          id: loadingToast,
        });
      }
    } catch (err) {
      toast.error("Network error. Please try again.", {
        id: loadingToast,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleRequestSubmit} className="space-y-4">
      {/* EVENT TIMELINE WARNING BANNER */}
      {isEventActive && (
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-rose-900 text-xs font-medium leading-relaxed">
          <span className="font-black block uppercase text-[9px] tracking-widest text-rose-600 mb-1">
            Settlement Locked
          </span>
          Payout distribution is frozen until the event has wrapped up. Finalize
          your event timeline before generating a settlement request.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* AMOUNT */}
        <div>
          <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider block mb-1.5">
            Settlement Amount (₦)
          </label>
          <input
            type="number"
            placeholder="0.00"
            disabled={isEventActive}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-slate-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
        </div>

        {/* BANK NAME */}
        <div>
          <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider block mb-1.5">
            Bank Name
          </label>
          <input
            type="text"
            placeholder="e.g. Access Bank"
            disabled={isEventActive}
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            className="w-full bg-slate-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ACCOUNT NUMBER */}
        <div>
          <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider block mb-1.5">
            Account Number
          </label>
          <input
            type="text"
            placeholder="0123456789"
            maxLength={10}
            disabled={isEventActive}
            value={accountNumber}
            onChange={(e) =>
              setAccountNumber(e.target.value.replace(/\D/g, ""))
            }
            className="w-full bg-slate-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold font-mono outline-none focus:border-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
        </div>

        {/* ACCOUNT NAME */}
        <div>
          <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider block mb-1.5">
            Account Name
          </label>
          <input
            type="text"
            placeholder="Registered bank account name"
            disabled={isEventActive}
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            className="w-full bg-slate-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold uppercase outline-none focus:border-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
        </div>
      </div>

      {/* BALANCE INFO */}
      <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4">
        <p className="text-[9px] font-black uppercase tracking-widest text-yellow-700">
          Available Balance
        </p>
        <h4 className="text-2xl font-black text-yellow-900 mt-1">
          ₦{Number(availableBalance || 0).toLocaleString()}
        </h4>
      </div>

      {/* SUBMIT */}
      <button
        type="submit"
        disabled={submitting || availableBalance < 100 || isEventActive}
        className="w-full mt-2 bg-slate-900 text-white rounded-xl py-3.5 text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-all"
      >
        {isEventActive
          ? "Settlement Locked Until Event Ends"
          : submitting
            ? "Submitting Request..."
            : "Request Payout"}
      </button>
    </form>
  );
}
