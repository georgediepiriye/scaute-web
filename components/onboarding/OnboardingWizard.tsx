"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { API } from "@/lib/api";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// Broader vibe groupings mapping directly to your core EVENT_CATEGORIES keys
const VIBE_CLUSTERS = [
  {
    id: "nightlife_social",
    name: "Parties & Socials",
    icon: "🍾",
    tags: ["party", "social", "hangout", "entertainment"],
  },
  {
    id: "arts_culture",
    name: "Music & Culture",
    icon: "🎨",
    tags: ["music", "culture", "gaming"],
  },
  {
    id: "food_commerce",
    name: "Food & Markets",
    icon: "🍔",
    tags: ["food", "market"],
  },
  {
    id: "active_wellness",
    name: "Sports & Wellness",
    icon: "💪",
    tags: ["fitness", "wellness", "sports"],
  },
  {
    id: "growth_career",
    name: "Tech & Business",
    icon: "🚀",
    tags: ["tech", "business", "education"],
  },
  {
    id: "community_faith",
    name: "Community & Faith",
    icon: "🙏",
    tags: ["religious"],
  },
];

const PH_NEIGHBORHOODS = [
  "Old GRA",
  "New GRA",
  "Peter Odili",
  "Trans Amadi",
  "Ada George",
  "Rumuola",
  "Woji",
  "Eliozu",
];

export default function OnboardingWizard({
  user,
  onComplete,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
  onComplete: () => void;
}) {
  const [step, setStep] = useState(1);
  const [selectedClusters, setSelectedClusters] = useState<string[]>([]);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const toggleCluster = (id: string) => {
    setSelectedClusters((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleFinish = async () => {
    setSubmitting(true);

    // Map selected broad clusters back down to a single flat array of granular category strings
    const flattenedInterests = VIBE_CLUSTERS.filter((cluster) =>
      selectedClusters.includes(cluster.id),
    ).flatMap((cluster) => cluster.tags);

    try {
      await API.patch("/v1/users/updateMe", {
        interests: flattenedInterests,
        location: {
          type: "Point",
          coordinates: [7.0085, 4.8156],
          neighborhood: selectedNeighborhood,
          city: "Port Harcourt",
        },
      });

      localStorage.removeItem("skaute_onboarding_lock");
      toast.success("Profile customized!");
      onComplete();
      router.push("/profile");
    } catch (err) {
      toast.error("Failed to save your preferences.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#111] border border-zinc-800 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-black/80">
        {/* Step Indicator Bar */}
        <div className="flex gap-2 mb-8">
          <div
            className="h-1 flex-1 rounded-full transition-colors duration-300"
            style={{ backgroundColor: step >= 1 ? "#FFD700" : "#27272a" }}
          />
          <div
            className="h-1 flex-1 rounded-full transition-colors duration-300"
            style={{ backgroundColor: step >= 2 ? "#FFD700" : "#27272a" }}
          />
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h3 className="text-2xl font-black uppercase tracking-tight mb-2 flex items-center gap-2">
                Pick Your Vibe{" "}
                <Sparkles className="w-5 h-5" style={{ color: "#FFD700" }} />
              </h3>
              <p className="text-zinc-400 text-sm mb-6">
                What kind of events are you looking to experience?
              </p>

              <div className="grid grid-cols-2 gap-3 mb-8 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
                {VIBE_CLUSTERS.map((cluster) => {
                  const isSelected = selectedClusters.includes(cluster.id);

                  return (
                    <button
                      key={cluster.id}
                      type="button"
                      onClick={() => toggleCluster(cluster.id)}
                      className="p-4 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between h-24 bg-zinc-900 text-zinc-400 hover:border-zinc-700"
                      style={{
                        borderColor: isSelected ? "#FFD700" : "transparent",
                        backgroundColor: isSelected
                          ? "rgba(255, 215, 0, 0.06)"
                          : "",
                        color: isSelected ? "#fff" : "",
                      }}
                    >
                      <span className="text-xl">{cluster.icon}</span>
                      <span className="text-xs font-black uppercase tracking-wider mt-auto block leading-tight">
                        {cluster.name}
                      </span>
                      {isSelected && (
                        <CheckCircle2
                          className="w-4 h-4 absolute bottom-3 right-3"
                          style={{ color: "#FFD700" }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                disabled={selectedClusters.length === 0}
                onClick={() => setStep(2)}
                className="w-full py-4 bg-white text-black font-black uppercase text-xs tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                style={{
                  backgroundColor: selectedClusters.length > 0 ? "#FFD700" : "",
                }}
              >
                Next Step <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h3 className="text-2xl font-black uppercase tracking-tight mb-2 flex items-center gap-2">
                Your Zone{" "}
                <MapPin className="w-5 h-5" style={{ color: "#FFD700" }} />
              </h3>
              <p className="text-zinc-400 text-sm mb-6">
                Select your primary area to filter close events.
              </p>

              <div className="grid grid-cols-2 gap-2 mb-8 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                {PH_NEIGHBORHOODS.map((zone) => {
                  const isSelected = selectedNeighborhood === zone;
                  return (
                    <button
                      key={zone}
                      type="button"
                      onClick={() => setSelectedNeighborhood(zone)}
                      className="p-3 rounded-xl border text-center text-xs font-bold transition-all border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700"
                      style={{
                        borderColor: isSelected ? "#FFD700" : "",
                        backgroundColor: isSelected
                          ? "rgba(255, 215, 0, 0.1)"
                          : "",
                        color: isSelected ? "#fff" : "",
                      }}
                    >
                      {zone}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-4 border border-zinc-800 rounded-xl text-xs font-black uppercase tracking-widest text-zinc-400 hover:bg-zinc-900/50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={!selectedNeighborhood || submitting}
                  onClick={handleFinish}
                  className="flex-1 py-4 text-black font-black uppercase text-xs tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{
                    backgroundColor:
                      !selectedNeighborhood || submitting
                        ? "#27272a"
                        : "#FFD700",
                    color:
                      !selectedNeighborhood || submitting ? "#a1a1aa" : "#000",
                  }}
                >
                  {submitting ? "Locking in..." : "Enter Skaute"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
