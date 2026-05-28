/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  Save,
  Loader2,
  MapPin,
  Calendar,
  Ticket,
  Info,
  Navigation,
  X,
  Plus,
  Trash2,
  AlertCircle,
  CreditCard,
  ShieldAlert,
  Type,
  AlignLeft,
  Eye,
  EyeOff,
  Globe,
  Tag,
  Users,
  Link2,
  Repeat,
  Lock,
} from "lucide-react";

import dynamic from "next/dynamic";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

// Components
import Navbar from "@/components/layout/NavBar";
import AuthGuard from "@/components/auth/AuthGuard";

// Types
interface MapProps {
  selectedCoords: { lat: number; lng: number } | null;
  onSelect: (coords: { lat: number; lng: number }) => void;
}

// Dynamic Imports
const SearchBox = dynamic(
  () => import("@mapbox/search-js-react").then((m) => m.SearchBox),
  {
    ssr: false,
    loading: () => (
      <div className="h-14 w-full bg-slate-50 animate-pulse rounded-2xl" />
    ),
  },
);

const CreateEventMap = dynamic<MapProps>(
  () => import("@/components/map/CreateEventMap"),
  { ssr: false },
);

export default function EventSettingsPage() {
  const params = useParams();
  const router = useRouter();

  // States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const [formData, setFormData] = useState<any>({
    title: "",
    description: "",
    category: "",
    type: "activity",

    isPublic: true,
    allowAnonymous: true,

    startDate: "",
    endDate: "",

    eventFormat: "physical",
    joinLink: "",
    meetingLink: "",
    communityLink: "",
    externalTicketLink: "",

    ageRestriction: "All Ages",
    refundPolicy: "none",

    tags: [],

    isRecurring: false,
    recurrenceFrequency: "weekly",

    ticketingType: "none",

    location: "",
    neighborhood: "",
    locationCoords: null,

    status: "active",
    ticketTiers: [],
  });

  // =========================
  // EVENT STATE
  // =========================

  const hasStarted = formData.startDate
    ? new Date(formData.startDate) <= new Date()
    : false;

  const hasEnded = formData.endDate
    ? new Date(formData.endDate) < new Date()
    : false;

  const isLocked = hasEnded;

  // =========================
  // FETCH EVENT
  // =========================

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const token = localStorage.getItem("skaute_token");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/events/${params.eventId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          },
        );

        const result = await res.json();

        if (res.ok) {
          const event = result.data.event;

          setFormData({
            title: event.title || "",
            description: event.description || "",

            category: event.category || "",
            type: event.type || "activity",

            isPublic: event.isPublic ?? true,
            allowAnonymous: event.allowAnonymous ?? true,

            startDate: event.startDate
              ? new Date(event.startDate).toISOString().slice(0, 16)
              : "",

            endDate: event.endDate
              ? new Date(event.endDate).toISOString().slice(0, 16)
              : "",

            eventFormat: event.eventFormat || "physical",

            joinLink: event.joinLink || "",
            meetingLink: event.meetingLink || "",
            communityLink: event.communityLink || "",
            externalTicketLink: event.externalTicketLink || "",

            ageRestriction: event.ageRestriction || "All Ages",
            refundPolicy: event.refundPolicy || "none",

            tags: event.tags || [],

            isRecurring: event.isRecurring || false,

            recurrenceFrequency: event.recurrence?.frequency || "weekly",

            ticketingType: event.ticketingType || "none",

            location: event.location?.address || "",
            neighborhood: event.location?.neighborhood || "",

            locationCoords: event.location?.coordinates
              ? {
                  lng: event.location.coordinates[0],
                  lat: event.location.coordinates[1],
                }
              : null,

            status: event.status,
            ticketTiers: event.ticketTiers || [],
          });
        } else {
          toast.error("Could not load event");
        }
      } catch (e) {
        toast.error("Failed to load Move");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [params.eventId]);

  // =========================
  // HELPERS
  // =========================

  const updateField = (key: string, value: any) => {
    if (isLocked) {
      toast.error("This move has ended. Editing is now locked.");
      return;
    }

    setFormData((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  const useCurrentLocation = () => {
    if (isLocked) {
      return toast.error("Completed events cannot be modified.");
    }

    if (!navigator.geolocation) return toast.error("GPS not supported");

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        await reverseGeocode(latitude, longitude);

        setIsLocating(false);

        toast.success("Location Updated");
      },

      () => {
        setIsLocating(false);
        toast.error("Access denied");
      },

      { enableHighAccuracy: true },
    );
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&types=address,neighborhood`,
      );

      const data = await res.json();

      if (data.features?.length > 0) {
        const feature = data.features[0];

        setFormData((prev: any) => ({
          ...prev,

          location: feature.place_name,

          neighborhood:
            feature.context?.find((c: any) => c.id.startsWith("neighborhood"))
              ?.text || "",

          locationCoords: { lat, lng },
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // =========================
  // UPDATE EVENT
  // =========================

  const handleUpdate = async () => {
    if (isLocked) {
      return toast.error("This move has ended and can no longer be updated.");
    }

    setSaving(true);

    const loadingToast = toast.loading("Publishing latest changes...");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const payload = {
        ...formData,

        startDate: formData.startDate
          ? new Date(formData.startDate).toISOString()
          : undefined,

        endDate: formData.endDate
          ? new Date(formData.endDate).toISOString()
          : undefined,

        recurrence: formData.isRecurring
          ? {
              frequency: formData.recurrenceFrequency,
              interval: 1,
            }
          : undefined,

        location: {
          address: formData.location,
          neighborhood: formData.neighborhood,
          type: "Point",

          coordinates: formData.locationCoords
            ? [formData.locationCoords.lng, formData.locationCoords.lat]
            : undefined,
        },
      };

      const token = localStorage.getItem("skaute_token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/events/${params.eventId}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },

          body: JSON.stringify(payload),
        },
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Update failed");
      }

      toast.dismiss(loadingToast);

      toast.success("Move Updated Successfully 🚀");
    } catch (e: any) {
      toast.dismiss(loadingToast);

      toast.error(e.message || "Could not update move.");
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#020817]">
        <div className="relative w-12 h-12 mb-4">
          <div className="absolute inset-0 border-4 border-yellow-500/10 rounded-xl" />
          <div className="absolute inset-0 border-4 border-t-yellow-500 rounded-xl animate-spin" />
        </div>

        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-500/60">
          Syncing with skaute...
        </p>
      </div>
    );

  // =========================
  // UI
  // =========================

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-32 selection:bg-yellow-500/20">
        <Toaster position="bottom-center" />
        <Navbar />

        {/* HEADER */}
        <div className="pt-24 sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 rounded-2xl hover:border-yellow-500/50 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>

              <div>
                <h1 className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-600">
                  Control Center
                </h1>

                <p className="text-xl font-black uppercase tracking-tight">
                  {formData.title || "Move"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {isLocked && (
                <div className="px-4 py-3 rounded-2xl bg-red-50 border border-red-100 text-red-500 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider">
                  <Lock size={14} />
                  Event Locked
                </div>
              )}

              <button
                onClick={handleUpdate}
                disabled={saving || isLocked}
                className="px-10 py-4 bg-yellow-400 disabled:bg-slate-200 disabled:text-slate-500 text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] flex items-center gap-2 hover:bg-yellow-500 active:translate-y-[2px] active:shadow-none transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}

                {saving ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>

        {/* LOCKED WARNING */}
        {isLocked && (
          <div className="max-w-6xl mx-auto px-6 pt-6">
            <div className="bg-red-50 border border-red-100 rounded-[2rem] p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-500 shrink-0">
                <AlertCircle size={20} />
              </div>

              <div>
                <h3 className="text-sm font-black uppercase text-red-500">
                  Editing Disabled
                </h3>

                <p className="text-xs font-bold text-slate-500 mt-2 leading-relaxed uppercase">
                  This move has already ended. Ticketing, scheduling, venue
                  configuration and attendee-facing settings are now locked to
                  preserve historical integrity.
                </p>
              </div>
            </div>
          </div>
        )}

        <main className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* LEFT */}
          <div className="lg:col-span-8 space-y-12">
            {/* BASIC INFO */}
            <section className="bg-white p-10 rounded-[2.5rem] border border-slate-200/60 shadow-sm space-y-8">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                <Info size={16} className="text-yellow-500" />
                Basic Details
              </h3>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                    <Type size={12} />
                    Move Title
                  </label>

                  <input
                    type="text"
                    disabled={isLocked}
                    value={formData.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    className="w-full p-5 bg-slate-50 border border-transparent focus:border-yellow-500/20 focus:bg-white rounded-2xl text-sm font-bold outline-none transition-all disabled:opacity-50"
                    placeholder="E.g. Port Harcourt Night Run"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                    <AlignLeft size={12} />
                    Description
                  </label>

                  <textarea
                    rows={5}
                    disabled={isLocked}
                    value={formData.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    className="w-full p-5 bg-slate-50 border border-transparent focus:border-yellow-500/20 focus:bg-white rounded-2xl text-sm font-bold outline-none transition-all resize-none disabled:opacity-50"
                    placeholder="Tell them what's happening..."
                  />
                </div>

                {/* CATEGORY + TYPE */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                      <Tag size={12} />
                      Category
                    </label>

                    <input
                      type="text"
                      disabled={isLocked}
                      value={formData.category}
                      onChange={(e) => updateField("category", e.target.value)}
                      className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-bold outline-none disabled:opacity-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Event Type
                    </label>

                    <select
                      disabled={isLocked}
                      value={formData.type}
                      onChange={(e) => updateField("type", e.target.value)}
                      className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-bold outline-none disabled:opacity-50"
                    >
                      <option value="activity">Activity</option>
                      <option value="event">Event</option>
                      <option value="hangout">Hangout</option>
                    </select>
                  </div>
                </div>

                {/* VISIBILITY */}
                <div className="pt-4 flex items-center justify-between bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 rounded-xl ${
                        formData.isPublic
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {formData.isPublic ? (
                        <Eye size={18} />
                      ) : (
                        <EyeOff size={18} />
                      )}
                    </div>

                    <div>
                      <p className="text-[10px] font-black uppercase tracking-tight">
                        Visibility
                      </p>

                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                        {formData.isPublic
                          ? "Visible to everyone on skaute"
                          : "Private / Invite Only"}
                      </p>
                    </div>
                  </div>

                  <button
                    disabled={isLocked}
                    onClick={() => updateField("isPublic", !formData.isPublic)}
                    className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase border transition-all disabled:opacity-50 ${
                      formData.isPublic
                        ? "border-yellow-200 text-yellow-700 bg-white hover:bg-yellow-50"
                        : "border-slate-200 text-slate-500 bg-white hover:bg-slate-50"
                    }`}
                  >
                    {formData.isPublic ? "Make Private" : "Make Public"}
                  </button>
                </div>
              </div>
            </section>

            {/* SCHEDULE */}
            <section className="bg-white p-10 rounded-[2.5rem] border border-slate-200/60 shadow-sm space-y-8">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                <Calendar size={16} className="text-yellow-500" />
                Schedule
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Start Date/Time
                  </label>

                  <input
                    type="datetime-local"
                    disabled={hasStarted || isLocked}
                    value={formData.startDate}
                    onChange={(e) => updateField("startDate", e.target.value)}
                    className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-bold disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    End Date/Time
                  </label>

                  <input
                    type="datetime-local"
                    disabled={isLocked}
                    value={formData.endDate}
                    onChange={(e) => updateField("endDate", e.target.value)}
                    className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-bold disabled:opacity-50"
                  />
                </div>
              </div>

              {/* RECURRING */}
              <div className="bg-slate-50 rounded-2xl p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase flex items-center gap-2">
                      <Repeat size={14} />
                      Recurring Event
                    </p>

                    <p className="text-[9px] font-bold uppercase text-slate-400 mt-1">
                      Automatically repeat this move
                    </p>
                  </div>

                  <button
                    disabled={isLocked}
                    onClick={() =>
                      updateField("isRecurring", !formData.isRecurring)
                    }
                    className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase disabled:opacity-50 ${
                      formData.isRecurring
                        ? "bg-yellow-400 text-black"
                        : "bg-white border border-slate-200 text-slate-500"
                    }`}
                  >
                    {formData.isRecurring ? "Enabled" : "Disabled"}
                  </button>
                </div>

                {formData.isRecurring && (
                  <select
                    disabled={isLocked}
                    value={formData.recurrenceFrequency}
                    onChange={(e) =>
                      updateField("recurrenceFrequency", e.target.value)
                    }
                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold disabled:opacity-50"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                )}
              </div>
            </section>

            {/* FORMAT + LINKS */}
            <section className="bg-white p-10 rounded-[2.5rem] border border-slate-200/60 shadow-sm space-y-8">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                <Globe size={16} className="text-yellow-500" />
                Format & Links
              </h3>

              <select
                disabled={isLocked}
                value={formData.eventFormat}
                onChange={(e) => updateField("eventFormat", e.target.value)}
                className="w-full p-5 bg-slate-50 rounded-2xl text-sm font-bold outline-none disabled:opacity-50"
              >
                <option value="physical">Physical</option>
                <option value="online">Online</option>
                <option value="hybrid">Hybrid</option>
              </select>

              {(formData.eventFormat === "online" ||
                formData.eventFormat === "hybrid") && (
                <div className="space-y-5">
                  <input
                    disabled={isLocked}
                    value={formData.joinLink}
                    onChange={(e) => updateField("joinLink", e.target.value)}
                    placeholder="Join Link"
                    className="w-full p-4 bg-slate-50 rounded-2xl font-bold disabled:opacity-50"
                  />

                  <input
                    disabled={isLocked}
                    value={formData.meetingLink}
                    onChange={(e) => updateField("meetingLink", e.target.value)}
                    placeholder="Meeting Link"
                    className="w-full p-4 bg-slate-50 rounded-2xl font-bold disabled:opacity-50"
                  />

                  <input
                    disabled={isLocked}
                    value={formData.communityLink}
                    onChange={(e) =>
                      updateField("communityLink", e.target.value)
                    }
                    placeholder="Community Link"
                    className="w-full p-4 bg-slate-50 rounded-2xl font-bold disabled:opacity-50"
                  />
                </div>
              )}
            </section>

            {/* LOCATION */}
            {formData.eventFormat !== "online" && (
              <section className="bg-white p-10 rounded-[2.5rem] border border-slate-200/60 shadow-sm space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <MapPin size={16} className="text-yellow-500" />
                    Venue
                  </h3>

                  {!hasStarted && !isLocked && (
                    <button
                      onClick={useCurrentLocation}
                      className="text-[10px] font-black text-yellow-600 flex items-center gap-1 hover:opacity-70 transition-opacity"
                    >
                      <Navigation
                        size={12}
                        className={isLocating ? "animate-pulse" : ""}
                      />

                      {isLocating ? "Locating..." : "Use GPS"}
                    </button>
                  )}
                </div>

                <div
                  className={
                    hasStarted || isLocked
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                >
                  <SearchBox
                    accessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN!}
                    value={formData.location}
                    onRetrieve={(res: any) => {
                      const feature = res.features[0];

                      setFormData((prev: any) => ({
                        ...prev,

                        location: feature.properties.full_address,

                        neighborhood:
                          feature.properties.context?.neighborhood?.name || "",

                        locationCoords: {
                          lng: feature.geometry.coordinates[0],

                          lat: feature.geometry.coordinates[1],
                        },
                      }));
                    }}
                  />
                </div>

                <button
                  disabled={hasStarted || isLocked}
                  onClick={() => setShowMapPicker(true)}
                  className="w-full py-5 bg-black disabled:bg-slate-200 disabled:text-slate-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-yellow-500 hover:text-black transition-all shadow-lg active:scale-95"
                >
                  {formData.locationCoords
                    ? "Adjust Pin on Map"
                    : "Drop Map Pin"}
                </button>
              </section>
            )}

            {/* TICKETS */}
            <section className="bg-white p-10 rounded-[2.5rem] border border-slate-200/60 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                  <Ticket size={16} className="text-yellow-500" />
                  Tickets
                </h3>

                <button
                  disabled={isLocked}
                  onClick={() =>
                    setFormData({
                      ...formData,

                      ticketTiers: [
                        ...formData.ticketTiers,

                        {
                          name: "New Tier",
                          price: 0,
                          capacity: 50,
                          sold: 0,
                        },
                      ],
                    })
                  }
                  className="px-4 py-2 bg-yellow-400 disabled:bg-slate-200 disabled:text-slate-500 text-black rounded-xl text-[9px] font-black uppercase flex items-center gap-2 hover:bg-yellow-500 transition-colors shadow-sm"
                >
                  <Plus size={12} />
                  Add Tier
                </button>
              </div>

              <div className="space-y-4">
                {formData.ticketTiers.map((tier: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-6 bg-slate-50 rounded-[2rem] grid grid-cols-1 md:grid-cols-4 gap-6 relative border border-slate-100 group"
                  >
                    <div className="space-y-1">
                      <p className="text-[8px] font-black uppercase text-slate-400">
                        Tier Name
                      </p>

                      <input
                        disabled={isLocked}
                        value={tier.name}
                        onChange={(e) => {
                          const updated = [...formData.ticketTiers];

                          updated[idx].name = e.target.value;

                          setFormData({
                            ...formData,
                            ticketTiers: updated,
                          });
                        }}
                        className="bg-transparent font-bold text-sm outline-none w-full disabled:opacity-50"
                      />
                    </div>

                    <div className="space-y-1">
                      <p className="text-[8px] font-black uppercase text-slate-400">
                        Price (₦)
                      </p>

                      <input
                        disabled={isLocked}
                        type="number"
                        value={tier.price}
                        onChange={(e) => {
                          const updated = [...formData.ticketTiers];

                          updated[idx].price = Number(e.target.value);

                          setFormData({
                            ...formData,
                            ticketTiers: updated,
                          });
                        }}
                        className="bg-transparent font-bold text-sm outline-none w-full disabled:opacity-50"
                      />
                    </div>

                    <div className="space-y-1">
                      <p className="text-[8px] font-black uppercase text-slate-400">
                        Capacity
                      </p>

                      <input
                        disabled={isLocked}
                        type="number"
                        value={tier.capacity}
                        onChange={(e) => {
                          const updated = [...formData.ticketTiers];

                          updated[idx].capacity = Number(e.target.value);

                          setFormData({
                            ...formData,
                            ticketTiers: updated,
                          });
                        }}
                        className="bg-transparent font-bold text-sm outline-none w-full disabled:opacity-50"
                      />
                    </div>

                    <div className="space-y-1">
                      <p className="text-[8px] font-black uppercase text-slate-400">
                        Sold
                      </p>

                      <div className="text-lg font-black text-yellow-600">
                        {tier.sold || 0}
                      </div>
                    </div>

                    {!isLocked && (
                      <button
                        onClick={() =>
                          setFormData({
                            ...formData,

                            ticketTiers: formData.ticketTiers.filter(
                              (_: any, i: number) => i !== idx,
                            ),
                          })
                        }
                        className="absolute -top-2 -right-2 bg-white p-2 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-slate-200 hover:bg-red-50"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* SIDEBAR */}
          <aside className="lg:col-span-4 space-y-6">
            {/* STATS */}
            <div className="bg-[#0F172A] rounded-[3rem] p-10 space-y-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <CreditCard size={120} className="text-yellow-500" />
              </div>

              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2 relative z-10">
                <CreditCard size={14} />
                Stats
              </h3>

              <div className="grid grid-cols-2 gap-4 relative z-10">
                <div className="p-5 bg-white/5 rounded-3xl border border-white/10">
                  <p className="text-[10px] font-black uppercase text-slate-400">
                    Tickets Sold
                  </p>

                  <p className="text-3xl font-black mt-1 text-yellow-400">
                    {formData.ticketTiers?.reduce(
                      (acc: any, t: any) => acc + (t.sold || 0),
                      0,
                    )}
                  </p>
                </div>

                <div className="p-5 bg-white/5 rounded-3xl border border-white/10">
                  <p className="text-[10px] font-black uppercase text-slate-400">
                    Ticket Tiers
                  </p>

                  <p className="text-3xl font-black mt-1 text-white">
                    {formData.ticketTiers?.length}
                  </p>
                </div>
              </div>

              <button className="w-full py-5 bg-yellow-400 text-black hover:bg-yellow-500 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 relative z-10 shadow-xl shadow-yellow-900/20">
                Request Payout
              </button>
            </div>

            {/* DANGER ZONE */}
            <div className="bg-red-50/50 rounded-[2.5rem] border border-red-100 p-8">
              <h3 className="text-[10px] font-black uppercase text-red-500 mb-4 flex items-center gap-2">
                <ShieldAlert size={14} />
                Danger Zone
              </h3>

              <p className="text-[9px] font-bold text-slate-400 uppercase mb-6 leading-relaxed">
                Canceling will notify all attendees and trigger automatic
                Paystack refunds.
              </p>

              <button
                disabled={isLocked}
                className="w-full py-4 bg-white disabled:opacity-50 border border-red-200 text-red-500 rounded-2xl font-black text-[10px] uppercase hover:bg-red-500 hover:text-white transition-all active:scale-95"
              >
                Cancel Move
              </button>

              <div className="mt-8 pt-8 border-t border-red-100 flex flex-col items-center">
                <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">
                  Built in Port Harcourt
                </p>
              </div>
            </div>
          </aside>
        </main>
      </div>

      {/* MAP MODAL */}
      <AnimatePresence>
        {showMapPicker && !isLocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white flex flex-col"
          >
            <div className="absolute top-6 right-6 z-[110]">
              <button
                onClick={() => setShowMapPicker(false)}
                className="p-4 bg-slate-900 text-white rounded-full hover:bg-yellow-500 hover:text-black transition-colors shadow-2xl"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1">
              <CreateEventMap
                selectedCoords={formData.locationCoords}
                onSelect={(coords) => {
                  setFormData((prev: any) => ({
                    ...prev,
                    locationCoords: coords,
                  }));

                  reverseGeocode(coords.lat, coords.lng);
                }}
              />
            </div>

            <div className="p-10 bg-white border-t border-slate-100 flex justify-center">
              <button
                onClick={() => setShowMapPicker(false)}
                className="px-12 py-5 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-yellow-500 hover:text-black active:scale-95 transition-all"
              >
                Confirm Pin
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthGuard>
  );
}
