/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { AlertCircle, Copy, Check } from "lucide-react";
import toast from "react-hot-toast";

export function PayoutManagementTable({ payouts, onPayoutProcessed }: any) {
  const [selectedPayout, setSelectedPayout] = useState<any>(null);

  const [manualRef, setManualRef] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);

    setCopiedId(id);

    toast.success("Copied to clipboard!");

    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleProcessPayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!manualRef.trim()) {
      return toast.error("Please insert a payment reference ID");
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem("skaute_token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/admin/payouts/${selectedPayout._id}/complete`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",

            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },

          body: JSON.stringify({
            reference: manualRef,
          }),
        },
      );

      if (!res.ok) {
        throw new Error("Failed to process payout");
      }

      toast.success("Payout marked as completed successfully!");

      setSelectedPayout(null);

      setManualRef("");

      onPayoutProcessed();
    } catch (err) {
      toast.error("Could not update settlement record status");
    } finally {
      setSubmitting(false);
    }
  };

  if (!payouts?.length) {
    return (
      <div className="p-16 flex flex-col items-center justify-center text-center">
        <AlertCircle className="text-gray-300 mb-3" size={32} />

        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
          No payout records found
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-4 text-[9px] font-black uppercase text-gray-400 tracking-wider">
                Organizer
              </th>

              <th className="p-4 text-[9px] font-black uppercase text-gray-400 tracking-wider">
                Event
              </th>

              <th className="p-4 text-[9px] font-black uppercase text-gray-400 tracking-wider">
                Bank Details
              </th>

              <th className="p-4 text-[9px] font-black uppercase text-gray-400 tracking-wider">
                Amount
              </th>

              <th className="p-4 text-[9px] font-black uppercase text-gray-400 tracking-wider">
                Status
              </th>

              <th className="p-4 text-[9px] font-black uppercase text-gray-400 tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50 text-[11px] font-bold text-gray-700">
            {payouts.map((payout: any) => (
              <tr
                key={payout._id}
                className="hover:bg-gray-50/50 transition-colors"
              >
                {/* ORGANIZER */}
                <td className="p-4">
                  <p className="text-gray-900 font-black uppercase tracking-tight">
                    {payout.organizer?.name || "Unknown Organizer"}
                  </p>

                  <p className="text-[9px] text-gray-400 font-medium lowercase mt-1">
                    {payout.organizer?.email}
                  </p>
                </td>

                {/* EVENT */}
                <td className="p-4">
                  <p className="text-gray-900 font-black">
                    {payout.event?.title || "Untitled Event"}
                  </p>

                  <p className="text-[9px] text-gray-400 mt-1">
                    {new Date(payout.createdAt).toLocaleDateString()}
                  </p>
                </td>

                {/* BANK */}
                <td className="p-4 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-[9px] font-black uppercase">
                      {payout.bankDetails?.bankName}
                    </span>

                    <span className="font-mono tracking-wider text-gray-900">
                      {payout.bankDetails?.accountNumber}
                    </span>

                    <button
                      onClick={() =>
                        handleCopy(
                          payout.bankDetails?.accountNumber,
                          payout._id,
                        )
                      }
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      {copiedId === payout._id ? (
                        <Check size={12} className="text-green-600" />
                      ) : (
                        <Copy size={12} />
                      )}
                    </button>
                  </div>

                  <p className="text-[9px] uppercase tracking-wide text-gray-400 font-bold">
                    {payout.bankDetails?.accountName}
                  </p>
                </td>

                {/* AMOUNT */}
                <td className="p-4">
                  <p className="text-gray-900 font-black italic">
                    ₦{Number(payout.amount || 0).toLocaleString()}
                  </p>
                </td>

                {/* STATUS */}
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                      payout.status === "pending"
                        ? "bg-amber-50 text-amber-700 border border-amber-100"
                        : payout.status === "processing"
                          ? "bg-blue-50 text-blue-700 border border-blue-100"
                          : payout.status === "completed"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-rose-50 text-rose-700 border border-rose-100"
                    }`}
                  >
                    {payout.status}
                  </span>
                </td>

                {/* ACTIONS */}
                <td className="p-4 text-right">
                  {payout.status === "pending" ? (
                    <button
                      onClick={() => setSelectedPayout(payout)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-xl transition-all shadow-sm"
                    >
                      Mark Paid
                    </button>
                  ) : (
                    <span className="text-[9px] font-mono text-gray-400 uppercase tracking-tight">
                      Ref: {payout.paymentReference || "N/A"}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {selectedPayout && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 border border-gray-100 shadow-xl space-y-4">
            <div>
              <h4 className="text-md font-black uppercase tracking-tight text-gray-900 italic">
                Confirm Settlement
              </h4>

              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">
                Record successful transfer reference
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2 text-[11px]">
              <div className="flex justify-between">
                <span className="text-gray-400 uppercase">Payee</span>

                <strong className="uppercase">
                  {selectedPayout.organizer?.name}
                </strong>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400 uppercase">Account</span>

                <strong className="font-mono">
                  {selectedPayout.bankDetails?.accountNumber}
                </strong>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400 uppercase">Amount</span>

                <strong className="text-blue-600">
                  ₦{Number(selectedPayout.amount || 0).toLocaleString()}
                </strong>
              </div>
            </div>

            <form onSubmit={handleProcessPayoutSubmit} className="space-y-4">
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-2">
                  Payment Reference
                </label>

                <input
                  type="text"
                  required
                  value={manualRef}
                  onChange={(e) => setManualRef(e.target.value)}
                  placeholder="e.g. PAY-938493"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[11px] font-bold outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPayout(null);
                    setManualRef("");
                  }}
                  className="w-1/2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-[9px] font-black uppercase tracking-widest py-3 rounded-xl"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting || !manualRef.trim()}
                  className="w-1/2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-[9px] font-black uppercase tracking-widest py-3 rounded-xl"
                >
                  {submitting ? "Processing..." : "Confirm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
