/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { X, ShieldCheck, ArrowRight } from "lucide-react";
import imageCompression from "browser-image-compression";

// Components
import Navbar from "@/components/layout/NavBar";
import { StepHeader } from "@/components/create-event/FormElements";
import { MoveTypeSelector } from "@/components/create-event/MoveTypeSelector";
import { StepBasics } from "@/components/create-event/StepBasics";
import { StepLogistics } from "@/components/create-event/StepLogistics";
import { StepTicketing } from "@/components/create-event/StepTicketing";
import { StepFinal } from "@/components/create-event/StepFinal";
import { PreviewModal } from "@/components/create-event/PreviewModal";
import { EVENT_CATEGORIES } from "@/lib/categories";
import CreateEventMap from "@/components/map/CreateEventMap";
import { useAuth } from "@/components/auth/AuthGuard";

// --- AUTH GUARD MODAL COMPONENT ---
const AuthGuardModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const router = useRouter();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        className="relative w-full max-w-sm bg-white rounded-[40px] p-10 text-center shadow-2xl"
      >
        <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
          <ShieldCheck size={40} className="text-blue-600" />
        </div>
        <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">
          skaute ID Required
        </h3>
        <p className="text-gray-500 text-sm font-medium mb-8 leading-relaxed">
          Only verified members can broadcast moves. Sign in to share your event
          with Port Harcourt.
        </p>
        <div className="space-y-3">
          <button
            onClick={() =>
              router.push("/auth/signin?callbackUrl=%2Fcreate-event")
            }
            className="w-full py-5 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-600/10 active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-blue-600"
          >
            Sign In Now <ArrowRight size={14} />
          </button>
          <button
            onClick={onClose}
            className="w-full py-4 text-gray-400 font-black text-[10px] uppercase hover:text-black transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default function CreateEventPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [step, setStep] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showAuthGuard, setShowAuthGuard] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    tags: "",
    type: null as "activity" | "showcase" | null,
    eventFormat: "physical" as "physical" | "online" | "hybrid",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    location: "",
    neighborhood: "",
    locationCoords: null as { lat: number; lng: number } | null,
    ticketingType: "none" as "none" | "internal" | "external",
    ticketTiers: [] as any[],
    externalTicketLink: "",
    meetingLink: "",
    isPublic: true,
    allowAnonymous: true,
    refundPolicy: "none",
    ageRestriction: "All Ages",
    isRecurring: false,
    recurrenceFrequency: "none",
    recurrenceInterval: 1,
    recurrenceEndDate: "",
    selectedDays: [] as string[],
    imageFile: null as File | null,
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const isLoggedIn = !!user;

  // ⚡ OVERHAUL UX FIX: Lifecycle controlled step-change scroll manager
  useEffect(() => {
    // We add a tiny 10ms frame delay so Framer Motion layouts completely mount before scrolling
    const scrollTimeout = setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 10);

    return () => clearTimeout(scrollTimeout);
  }, [step]); // Triggers smoothly on both Forward and Backward step adjustments

  const updateForm = (field: string, value: any) => {
    if (field === "recurrenceInterval" && value !== "" && parseInt(value) < 1) {
      value = 1;
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRetrieve = (res: any) => {
    const feature = res.features[0];
    if (feature) {
      const [lng, lat] = feature.geometry.coordinates;
      const placeName =
        feature.properties.full_address ||
        feature.properties.name ||
        feature.place_name;
      const neighborhood =
        feature.properties.context?.neighborhood?.name ||
        feature.properties.context?.locality?.name ||
        "Port Harcourt";

      setFormData((prev) => ({
        ...prev,
        location: placeName,
        locationCoords: { lng: Number(lng), lat: Number(lat) },
        neighborhood: neighborhood,
      }));
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&types=address,place,locality,neighborhood,poi`,
      );

      const data = await res.json();

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];

        const address =
          feature.place_name ||
          feature.properties?.full_address ||
          "Current Location";

        const neighborhood =
          feature.context?.find((c: any) => c.id.startsWith("neighborhood"))
            ?.text ||
          feature.context?.find((c: any) => c.id.startsWith("locality"))
            ?.text ||
          "Port Harcourt";

        // 🔥 THIS updates the visible search field immediately
        setFormData((prev) => ({
          ...prev,
          location: address,
          neighborhood,
          locationCoords: {
            lat,
            lng,
          },
        }));

        return {
          address,
          neighborhood,
        };
      }

      return null;
    } catch (error) {
      console.error("Geocoding failed", error);
      toast.error("Failed to get address details");
      return null;
    }
  };

  const useCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported");
      return;
    }

    if (
      window.location.protocol !== "https:" &&
      window.location.hostname !== "localhost"
    ) {
      toast.error("Location only works on HTTPS");
      return;
    }

    try {
      setIsLocating(true);

      const loadingToast = toast.loading("Detecting location...");

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            console.log("coords:", latitude, longitude);

            // 🔥 Reverse geocode immediately
            const locationData = await reverseGeocode(latitude, longitude);

            // 🔥 EXTRA fallback in case geocoder returns nothing
            if (!locationData) {
              setFormData((prev) => ({
                ...prev,
                location: `${latitude}, ${longitude}`,
                neighborhood: "Current Area",
                locationCoords: {
                  lat: latitude,
                  lng: longitude,
                },
              }));
            }

            toast.dismiss(loadingToast);
            toast.success("Location detected");
          } catch (err) {
            console.error(err);
            toast.dismiss(loadingToast);
            toast.error("Failed to process location");
          } finally {
            setIsLocating(false);
          }
        },

        (error) => {
          console.error(error);

          toast.dismiss();

          switch (error.code) {
            case error.PERMISSION_DENIED:
              toast.error("Location permission denied");
              break;

            case error.POSITION_UNAVAILABLE:
              toast.error("Location unavailable");
              break;

            case error.TIMEOUT:
              toast.error("Location request timed out");
              break;

            default:
              toast.error("Unable to detect location");
          }

          setIsLocating(false);
        },

        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        },
      );
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
      setIsLocating(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && !isLoggedIn) {
      setShowAuthGuard(true);
      return;
    }
    if (step === 1 && (!formData.title || !formData.category)) {
      return toast.error("Title and Category are required.");
    }

    if (step === 2) {
      if (
        !formData.startDate ||
        !formData.startTime ||
        !formData.endDate ||
        !formData.endTime
      ) {
        return toast.error("Please set both start and end dates/times.");
      }

      const start = new Date(`${formData.startDate}T${formData.startTime}`);
      const end = new Date(`${formData.endDate}T${formData.endTime}`);

      if (end <= start) {
        return toast.error(
          "The move must end AFTER it starts. Check your dates/times!",
        );
      }
    }

    if (step === 3) {
      if (
        formData.ticketingType === "internal" &&
        (!formData.ticketTiers || formData.ticketTiers.length === 0)
      ) {
        return toast.error(
          "Please add at least one ticket tier to sell on skaute.",
        );
      }
      if (
        formData.ticketingType === "external" &&
        !formData.externalTicketLink
      ) {
        return toast.error("Please provide the external ticket URL.");
      }
    }

    setStep((s) => s + 1);
    // 💡 REMOVED: Old window.scrollTo line here was executing too early!
  };

  const handleSubmit = async () => {
    if (!isLoggedIn) return setShowAuthGuard(true);
    if (!formData.imageFile) {
      toast.error("Please upload an image before broadcasting.");
      setShowPreview(false);
      return;
    }
    setSubmitting(true);

    try {
      const categoryKey =
        Object.keys(EVENT_CATEGORIES).find(
          (k) => (EVENT_CATEGORIES as any)[k].label === formData.category,
        ) || formData.category;
      const generatedSlug = formData.title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const payload = {
        title: formData.title,
        slug: generatedSlug,
        description: formData.description,
        category: categoryKey,
        type: formData.type,
        eventFormat: formData.eventFormat,
        isOnline: formData.eventFormat === "online",
        startDate: new Date(
          `${formData.startDate}T${formData.startTime}`,
        ).toISOString(),
        endDate: new Date(
          `${formData.endDate}T${formData.endTime}`,
        ).toISOString(),
        tags: formData.tags
          ? formData.tags.split(",").map((t: string) => t.trim())
          : [],
        location:
          formData.eventFormat !== "online" && formData.locationCoords
            ? {
                type: "Point",
                coordinates: [
                  Number(formData.locationCoords.lng),
                  Number(formData.locationCoords.lat),
                ],
                address: formData.location,
                neighborhood: formData.neighborhood || "Port Harcourt",
              }
            : null,
        isRecurring: formData.isRecurring,
        recurrence: {
          frequency: formData.isRecurring
            ? formData.recurrenceFrequency
            : "none",
          interval: Number(formData.recurrenceInterval) || 1,
          daysOfWeek:
            formData.isRecurring && formData.recurrenceFrequency === "weekly"
              ? formData.selectedDays?.map((d: string) =>
                  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(d),
                )
              : [],
          endDate:
            formData.isRecurring && formData.recurrenceEndDate
              ? new Date(formData.recurrenceEndDate).toISOString()
              : undefined,
        },
        ticketingType: formData.ticketingType,
        ticketTiers: formData.ticketTiers.map((tier) => ({
          ...tier,
          price: Number(tier.price),
          capacity: Number(tier.capacity),
          sold: 0,
        })),
        externalTicketLink: formData.externalTicketLink || "",
        meetingLink: formData.meetingLink || "",
        isPublic: formData.isPublic,
        allowAnonymous: formData.allowAnonymous,
        ageRestriction: formData.ageRestriction || "All Ages",
        refundPolicy: formData.refundPolicy || "none",
        organizerType: "individual",
      };

      const data = new FormData();
      data.append("image", formData.imageFile);
      data.append("eventData", JSON.stringify(payload));

      const token = localStorage.getItem("skaute_token");
      const headers: HeadersInit = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/events`, {
        method: "POST",
        headers,
        body: data,
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Broadcast failed.");
      }

      toast.success("Move Submitted! Waiting for Skaute Team approval.");
      setTimeout(() => router.push("/profile"), 2500);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageChange = async (event: any) => {
    const imageFile = event.target.files[0];
    if (!imageFile) return;

    const options = {
      maxSizeMB: 0.8,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
    };
    try {
      const compressedFile = await imageCompression(imageFile, options);
      setPreviewImage(URL.createObjectURL(compressedFile));
      updateForm("imageFile", compressedFile);
    } catch (error) {
      console.log(error);
    }
  };

  const totalSteps = 4;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-gray-900 pb-32">
      <Toaster position="bottom-center" />
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 pt-24 md:pt-32">
        {step > 0 && (
          <StepHeader
            step={step}
            totalSteps={totalSteps}
            title={
              step === 1
                ? "Basics"
                : step === 2
                  ? "Logistics"
                  : step === 3
                    ? "Ticketing"
                    : "Final"
            }
          />
        )}

        <AnimatePresence mode="wait">
          {step === 0 && (
            <MoveTypeSelector
              onSelect={(type) => {
                updateForm("type", type);
                setStep(1);
              }}
            />
          )}
          {step === 1 && (
            <StepBasics
              formData={formData}
              updateForm={updateForm}
              categories={Object.values(EVENT_CATEGORIES).map((c) => c.label)}
            />
          )}
          {step === 2 && (
            <StepLogistics
              formData={formData}
              updateForm={updateForm}
              setShowMapPicker={setShowMapPicker}
              handleRetrieve={handleRetrieve}
              useCurrentLocation={useCurrentLocation}
              isLocating={isLocating}
            />
          )}
          {step === 3 && (
            <StepTicketing formData={formData} updateForm={updateForm} />
          )}
          {step === 4 && (
            <StepFinal
              formData={formData}
              updateForm={updateForm}
              previewImage={previewImage}
              handleImageChange={handleImageChange}
              onPreview={() => setShowPreview(true)}
            />
          )}
        </AnimatePresence>

        {step > 0 && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t md:relative md:bg-transparent md:border-none md:mt-12 z-50">
            <div className="max-w-4xl mx-auto flex justify-between gap-4">
              <button
                onClick={() => setStep(step - 1)}
                className="px-8 py-4 rounded-2xl font-black text-[10px] uppercase text-gray-400 bg-white border border-gray-100 hover:text-black transition-colors"
              >
                Back
              </button>
              {step < 4 ? (
                <button
                  onClick={nextStep}
                  className="flex-1 md:flex-none px-12 py-4 bg-black text-white rounded-2xl font-black text-[10px] uppercase shadow-xl hover:bg-blue-600 transition-all"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (!formData.imageFile)
                      return toast.error(
                        "Please upload an image before broadcasting.",
                      );
                    setShowPreview(true);
                  }}
                  className="flex-1 md:flex-none px-12 py-4 bg-black text-white rounded-2xl font-black text-[10px] uppercase shadow-xl shadow-blue-600/10 hover:bg-blue-600 transition-all"
                >
                  Preview & Broadcast
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {showMapPicker && (
        <div className="fixed inset-0 z-[700] bg-white flex flex-col">
          <div className="absolute top-6 left-6 right-6 z-[710] flex justify-between items-center pointer-events-none">
            <div className="bg-white/90 backdrop-blur px-6 py-3 rounded-2xl border border-gray-100 shadow-xl pointer-events-auto">
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">
                {formData.locationCoords
                  ? "Location Pinned"
                  : "Tap Map to Drop Pin"}
              </p>
            </div>
            <button
              onClick={() => setShowMapPicker(false)}
              className="p-4 bg-black text-white rounded-full shadow-2xl hover:bg-blue-600 transition pointer-events-auto"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 w-full h-full">
            <CreateEventMap
              selectedCoords={formData.locationCoords}
              onSelect={(coords) => {
                updateForm("locationCoords", coords);
                reverseGeocode(coords.lat, coords.lng);
              }}
            />
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[710] w-full max-w-xs px-4">
            <button
              onClick={() => setShowMapPicker(false)}
              className="w-full py-5 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-blue-600/20 active:scale-95 transition-all hover:bg-blue-600"
            >
              Confirm Location
            </button>
          </div>
        </div>
      )}

      <PreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        data={formData}
        preview={previewImage}
        submitting={submitting}
        onConfirm={handleSubmit}
      />
      <AuthGuardModal
        isOpen={showAuthGuard}
        onClose={() => setShowAuthGuard(false)}
      />
    </div>
  );
}
