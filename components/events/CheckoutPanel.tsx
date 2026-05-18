/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Mail,
  ChevronRight,
  Timer,
  Loader2,
  UserCheck,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";

interface CheckoutPanelProps {
  isOpen: boolean;
  onClose: () => void;
  event: any;
}

export default function CheckoutPanel({
  isOpen,
  onClose,
  event,
}: CheckoutPanelProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedTier, setSelectedTier] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900);

  // User Auth State
  const [user, setUser] = useState<any>(null);

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");

  // Discount State
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
  const [isValidatingCode, setIsValidatingCode] = useState(false);

  // Check if entire event is sold out via the manual toggle
  const isEventSoldOut = event?.isSoldOut;

  // Calculation Logic
  const subtotal = useMemo(
    () => quantity * (selectedTier?.price || 0),
    [quantity, selectedTier],
  );

  const discountAmount = useMemo(() => {
    if (!appliedDiscount) return 0;
    return (subtotal * appliedDiscount.discountPercentage) / 100;
  }, [subtotal, appliedDiscount]);

  const total = useMemo(
    () => Math.max(0, subtotal - discountAmount),
    [subtotal, discountAmount],
  );

  // Synchronize Auth State from localStorage directly
  const syncLocalUser = useCallback(() => {
    try {
      const token = localStorage.getItem("kivo_token");
      const localUserData = localStorage.getItem("user");

      if (token && localUserData) {
        const parsedUser = JSON.parse(localUserData);
        setUser(parsedUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Checkout: Error parsing user from localStorage", error);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      syncLocalUser();
      setTimeLeft(900);
      // Auto-select first available tier (checks both manual sold out flag and capacity)
      if (event?.ticketTiers?.length > 0) {
        const availableTier = event.ticketTiers.find(
          (t: any) => !t.isSoldOut && t.capacity - (t.sold || 0) > 0,
        );
        setSelectedTier(availableTier || event.ticketTiers[0]);
      }
    }
  }, [isOpen, syncLocalUser, event]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.error("Session expired.");
          resetAndClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  const handleUseMyDetails = () => {
    if (!user) return toast.error("Could not find profile details");

    // Parse name string into first and last name variables safely
    const names = user.name ? user.name.split(" ") : ["", ""];
    setFirstName(names[0] || "");
    setLastName(names.slice(1).join(" ") || "");
    setEmail(user.email || "");
    setConfirmEmail(user.email || "");
    toast.success("Details filled from profile");
  };

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    setIsValidatingCode(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/events/${event._id}/discounts/validate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: discountCode.toUpperCase().trim(),
            tierName: selectedTier.name,
          }),
        },
      );

      const result = await response.json();

      if (response.ok) {
        setAppliedDiscount(result.discount);
        toast.success(
          `${result.discount.discountPercentage}% discount applied!`,
        );
      } else {
        toast.error(result.message || "Invalid discount code");
        setAppliedDiscount(null);
      }
    } catch (error) {
      toast.error("Network error. Please check your connection.");
    } finally {
      setIsValidatingCode(false);
    }
  };

  const handleProcessOrder = async () => {
    setLoading(true);
    try {
      // 1. Fetch the authorization token directly from storage
      const token = localStorage.getItem("kivo_token");

      // 2. Dynamically build headers
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/tickets/book`,
        {
          method: "POST",
          headers: headers,
          body: JSON.stringify({
            eventId: event._id,
            tierName: selectedTier.name,
            quantity,
            email: email.toLowerCase().trim(),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            discountCode: appliedDiscount?.code || "",
          }),
        },
      );

      const result = await response.json();

      if (response.ok && result.status === "success") {
        if (result.data.isFree) {
          const code = result.data.checkInCode || "";
          const reference = result.data.reference || "";
          const eventTitle = encodeURIComponent(event.title);
          router.push(
            `/booking-success?ref=${reference}&checkInCode=${code}&event=${eventTitle}`,
          );
        } else {
          window.location.href = result.data.authorization_url;
        }
      } else {
        toast.error(result.message || "Booking failed. Please try again.");
      }
    } catch (error: any) {
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const validateAndProceed = () => {
    if (step === 1) {
      if (!selectedTier) return toast.error("Please select a ticket tier");

      const remaining = selectedTier.capacity - (selectedTier.sold || 0);
      if (selectedTier.isSoldOut || remaining <= 0) {
        return toast.error("This tier is sold out!");
      }

      setStep(2);
      return;
    }

    if (!firstName.trim() || !lastName.trim())
      return toast.error("Name is required");
    if (!email.trim() || email.toLowerCase() !== confirmEmail.toLowerCase()) {
      return toast.error("Emails must match!");
    }
    handleProcessOrder();
  };

  const resetAndClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setLoading(false);
      setAppliedDiscount(null);
      setDiscountCode("");
      setFirstName("");
      setLastName("");
      setEmail("");
      setConfirmEmail("");
    }, 500);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        key="checkout-overlay"
        onClick={resetAndClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
      />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        key="checkout-panel-container"
        exit={{ x: "110%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[201] shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black tracking-tighter uppercase italic">
              {isEventSoldOut ? "Fully Booked" : "Checkout"}
            </h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate max-w-[200px]">
              {event.title}
            </p>
          </div>
          <button
            onClick={resetAndClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {isEventSoldOut ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
              <AlertCircle size={32} />
            </div>
            <h3 className="font-black uppercase italic tracking-tighter text-xl">
              Event Sold Out
            </h3>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest leading-relaxed">
              This move is fully booked. Stay tuned for future events.
            </p>
          </div>
        ) : (
          <>
            {/* Timer */}
            <div className="bg-amber-50 px-6 py-2.5 flex items-center justify-between border-b border-amber-100">
              <span className="text-[10px] font-black text-amber-700 uppercase flex items-center gap-2">
                <Timer size={14} className="animate-pulse" /> Inventory Reserved
              </span>
              <span className="font-mono font-bold text-amber-700 text-sm">
                {formatTime(timeLeft)}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-8">
                {step === 1 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Select Ticket Tier
                      </p>
                      <div className="space-y-3">
                        {event.ticketTiers?.map((tier: any, index: number) => {
                          const remaining = tier.capacity - (tier.sold || 0);
                          const isTierSoldOut =
                            tier.isSoldOut || remaining <= 0;

                          return (
                            <button
                              key={`${tier._id || "tier"}-${index}`}
                              disabled={isTierSoldOut}
                              onClick={() => setSelectedTier(tier)}
                              className={`w-full p-5 rounded-[24px] border-2 text-left transition-all ${
                                isTierSoldOut
                                  ? "opacity-50 grayscale cursor-not-allowed border-gray-100 bg-gray-50"
                                  : selectedTier?.name === tier.name
                                    ? "border-black bg-gray-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                                    : "border-gray-100 bg-white hover:border-gray-300"
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-black text-sm uppercase">
                                    {tier.name}
                                  </p>
                                  <p
                                    className={`text-[10px] font-bold uppercase ${isTierSoldOut ? "text-red-500" : "text-gray-400"}`}
                                  >
                                    {isTierSoldOut
                                      ? "Sold Out"
                                      : `${remaining} available`}
                                  </p>
                                </div>
                                <p className="font-black">
                                  {tier.price === 0
                                    ? "FREE"
                                    : `₦${tier.price.toLocaleString()}`}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Quantity
                      </p>
                      <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-[24px] justify-center">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-12 h-12 rounded-xl bg-white shadow-sm font-black text-xl"
                        >
                          -
                        </button>
                        <span className="font-black text-2xl w-8 text-center">
                          {quantity}
                        </span>
                        <button
                          onClick={() =>
                            setQuantity(Math.min(10, quantity + 1))
                          }
                          className="w-12 h-12 rounded-xl bg-white shadow-sm font-black text-xl"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* Autofill Banner (Now securely bound to localStorage auth check) */}
                    {user && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        type="button"
                        onClick={handleUseMyDetails}
                        className="w-full p-4 bg-blue-50 border-2 border-blue-200 rounded-2xl flex items-center justify-between text-left group transition-all hover:bg-blue-100/70 active:scale-[0.99]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-200">
                            <Sparkles size={16} />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-900 uppercase tracking-tight">
                              Autofill from Profile?
                            </p>
                            <p className="text-[10px] font-bold text-blue-600/90 uppercase tracking-wider mt-0.5 truncate max-w-[180px]">
                              Logged in as {user.name}
                            </p>
                          </div>
                        </div>
                        <div className="px-3 py-1.5 bg-white rounded-xl border border-blue-200 text-[10px] font-black uppercase text-blue-700 tracking-wider flex items-center gap-1 shadow-sm group-hover:border-blue-400 transition-colors">
                          <UserCheck size={12} /> Sync
                        </div>
                      </motion.button>
                    )}

                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Contact Info
                      </p>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-black text-[16px] font-bold outline-none"
                            placeholder="First Name"
                          />
                          <input
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-black text-[16px] font-bold outline-none"
                            placeholder="Last Name"
                          />
                        </div>
                        <div className="relative">
                          <Mail
                            className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
                            size={18}
                          />
                          <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            className="w-full pl-14 pr-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-black text-[16px] font-bold outline-none"
                            placeholder="Email Address"
                          />
                        </div>
                        <div className="relative">
                          <Mail
                            className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
                            size={18}
                          />
                          <input
                            value={confirmEmail}
                            onChange={(e) => setConfirmEmail(e.target.value)}
                            type="email"
                            className="w-full pl-14 pr-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-black text-[16px] font-bold outline-none"
                            placeholder="Confirm Email"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-dashed">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Discount Code
                      </p>
                      <div className="flex gap-2">
                        <input
                          value={discountCode}
                          onChange={(e) =>
                            setDiscountCode(e.target.value.toUpperCase())
                          }
                          disabled={!!appliedDiscount}
                          placeholder="PROMO20"
                          className="flex-1 px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-black text-base font-bold outline-none uppercase placeholder:text-gray-400"
                        />
                        <button
                          onClick={
                            appliedDiscount
                              ? () => {
                                  setAppliedDiscount(null);
                                  setDiscountCode("");
                                }
                              : handleApplyDiscount
                          }
                          disabled={
                            isValidatingCode ||
                            (!discountCode && !appliedDiscount)
                          }
                          className={`px-6 rounded-2xl font-black text-[10px] uppercase transition-all ${
                            appliedDiscount
                              ? "bg-red-50 text-red-500"
                              : "bg-yellow-400 text-black hover:bg-yellow-300"
                          }`}
                        >
                          {isValidatingCode ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : appliedDiscount ? (
                            "Remove"
                          ) : (
                            "Apply"
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="p-6 rounded-[32px] bg-gray-50 border border-gray-100 space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase">
                        <span>
                          Subtotal ({selectedTier?.name} x {quantity})
                        </span>
                        <span>₦{subtotal.toLocaleString()}</span>
                      </div>
                      {appliedDiscount && (
                        <div className="flex justify-between items-center text-green-600">
                          <p className="text-[10px] font-black uppercase">
                            Discount ({appliedDiscount.discountPercentage}%)
                          </p>
                          <p className="font-bold text-sm">
                            -₦{discountAmount.toLocaleString()}
                          </p>
                        </div>
                      )}
                      <div className="pt-2 border-t border-gray-200 flex justify-between items-end">
                        <p className="text-[10px] font-black text-black uppercase">
                          Final Total
                        </p>
                        <p className="font-black text-xl">
                          {total === 0 ? "FREE" : `₦${total.toLocaleString()}`}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            <div className="p-6 border-t bg-white">
              <button
                onClick={validateAndProceed}
                disabled={loading}
                className="w-full py-5 bg-black text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 active:scale-95 disabled:bg-gray-300"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    {step === 1
                      ? "Continue"
                      : total === 0
                        ? "Claim Free Spot"
                        : `Pay ₦${total.toLocaleString()}`}{" "}
                    <ChevronRight size={18} />
                  </>
                )}
              </button>
              {step === 2 && !loading && (
                <button
                  onClick={() => setStep(1)}
                  className="w-full mt-4 text-[10px] font-black text-gray-400 uppercase hover:text-black"
                >
                  Change Selection
                </button>
              )}
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
