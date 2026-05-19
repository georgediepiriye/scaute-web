/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  History,
  Calendar,
  MapPin,
  Clock,
  ExternalLink,
  Tag,
  AlignLeft,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Link as LinkIcon,
  Globe,
  Users2,
  AlertCircle,
  RefreshCw,
  Layers,
  Sparkles,
  Zap,
  Award,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";

// Analytics & Sub-components
import { ManagementStats } from "@/components/admin/manage/events/ManagementStats";
import { TransactionLedger } from "@/components/admin/manage/events/TransactionLedger";
import { LiveVibeMonitor } from "@/components/admin/manage/events/LiveVibeMonitor";
import Navbar from "@/components/layout/NavBar";

export default function EventManagementPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // local promotion form states
  const [isSkauteHosted, setIsSkauteHosted] = useState(false);
  const [isBoosted, setIsBoosted] = useState(false);
  const [boostTier, setBoostTier] = useState("standard");
  const [boostDays, setBoostDays] = useState(7);
  const [statusArray, setStatusArray] = useState<string[]>([]);

  const fetchManagementData = async () => {
    try {
      const token = localStorage.getItem("skaute_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/admin/events/manage/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      );
      const result = await res.json();
      if (result.status === "success" || result.success) {
        setData(result.data);
        // Initialize promotion states from incoming document schema
        setIsSkauteHosted(result.data.event.isSkauteHosted || false);
        setIsBoosted(result.data.event.isBoosted || false);
        setBoostTier(result.data.event.boostTier || "standard");
        setStatusArray(result.data.event.status || []);
      }
    } catch (error) {
      toast.error("Failed to sync management data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePromotion = async () => {
    setUpdating(true);
    try {
      const token = localStorage.getItem("skaute_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/admin/events/${id}/promotion`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            isSkauteHosted,
            isBoosted,
            boostTier,
            boostDays,
            statusArray,
          }),
        },
      );

      const result = await res.json();
      if (result.success || result.status === "success") {
        toast.success("Discovery metrics optimized successfully!");
        // Re-sync parent layout numbers cleanly
        await fetchManagementData();
      } else {
        toast.error(result.message || "Failed to update promotions");
      }
    } catch (error) {
      toast.error("Network error modifying discovery properties");
    } finally {
      setUpdating(false);
    }
  };

  const toggleStatusTag = (tag: "verified" | "featured") => {
    setStatusArray((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  useEffect(() => {
    if (id) fetchManagementData();
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center italic font-black uppercase tracking-widest text-blue-600">
        Syncing Move Data...
      </div>
    );
  if (!data)
    return (
      <div className="p-20 text-center uppercase font-black">
        Move not found
      </div>
    );

  const { event, analytics, orders, tickets } = data;

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20">
      <Navbar />
      {/* HEADER SECTION */}
      <header className="bg-white border-b border-gray-100 pt-32 pb-10 px-8">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-colors mb-6"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {event.isSkauteHosted && (
                  <span className="px-3 py-1 bg-amber-400 text-black rounded-full text-[9px] font-black uppercase tracking-tighter">
                    Skaute Official
                  </span>
                )}
                {event.status?.map((st: string) => (
                  <span
                    key={st}
                    className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                      st === "featured"
                        ? "bg-purple-50 text-purple-600"
                        : "bg-emerald-50 text-emerald-600"
                    }`}
                  >
                    {st}
                  </span>
                ))}
                {event.isCancelled && (
                  <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-[9px] font-black uppercase tracking-tighter italic">
                    Cancelled
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 uppercase italic tracking-tighter">
                {event.title}
              </h1>
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-tight mt-1">
                Engine Priority Rank Tier Level:{" "}
                <span className="text-blue-600 font-black">
                  {event.priorityLevel || 0}
                </span>
              </p>
            </div>
            <div className="bg-blue-600 text-white p-6 rounded-[32px] shadow-xl shadow-blue-100 min-w-[240px]">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">
                Gross Revenue
              </p>
              <p className="text-3xl font-black italic tracking-tighter leading-none">
                ₦{analytics.totalRevenue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            {/* CORE EVENT CONFIGURATION */}
            <section className="bg-white rounded-[40px] border border-gray-100 p-8 shadow-sm">
              <div className="flex flex-col md:flex-row gap-8 mb-8">
                <div className="relative w-full md:w-64 h-64 rounded-[32px] overflow-hidden flex-shrink-0 border border-gray-100">
                  <Image
                    src={event.image || "/placeholder-event.jpg"}
                    alt=""
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 space-y-6">
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      icon={<Tag size={10} />}
                      label={event.category}
                      color="slate"
                    />
                    <Badge
                      icon={<Globe size={10} />}
                      label={event.eventFormat}
                      color="blue"
                    />
                    <Badge
                      icon={
                        event.isPublic ? (
                          <Eye size={10} />
                        ) : (
                          <EyeOff size={10} />
                        )
                      }
                      label={event.isPublic ? "Public" : "Private"}
                      color={event.isPublic ? "green" : "red"}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50/50 p-6 rounded-[28px]">
                    <LogisticsItem
                      icon={<Calendar size={14} className="text-blue-600" />}
                      label="Schedule"
                      value={`${new Date(event.startDate).toLocaleDateString()} - ${new Date(event.endDate).toLocaleDateString()}`}
                      sub={`${event.startTime || "---"} to ${event.endTime || "Late"}`}
                    />
                    <LogisticsItem
                      icon={<MapPin size={14} className="text-red-500" />}
                      label="Location"
                      value={event.location?.address || "Online"}
                      sub={event.location?.neighborhood || "Global"}
                    />
                  </div>
                </div>
              </div>

              {/* EXTERNAL LINKS & PRIVACY FLAGS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-50 pt-8">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2 mb-2">
                    <LinkIcon size={14} /> Access Links
                  </h4>
                  {event.externalTicketLink && (
                    <LinkItem
                      label="External Tickets"
                      url={event.externalTicketLink}
                      color="blue"
                    />
                  )}
                  {event.communityLink && (
                    <LinkItem
                      label="Community"
                      url={event.communityLink}
                      color="purple"
                    />
                  )}
                  {event.meetingLink && (
                    <LinkItem
                      label="Virtual Meeting"
                      url={event.meetingLink}
                      color="emerald"
                    />
                  )}
                  {!event.externalTicketLink && !event.communityLink && (
                    <p className="text-[10px] text-gray-300 italic">
                      No external links provided
                    </p>
                  )}
                </div>
                <div className="space-y-3 bg-gray-50 p-6 rounded-[24px]">
                  <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2 mb-2">
                    <Lock size={14} /> Permissions
                  </h4>
                  <PermissionToggle
                    label="Allow Anonymous Join"
                    active={event.allowAnonymous}
                  />
                  <PermissionToggle
                    label="Is Recurring Move"
                    active={event.isRecurring}
                  />
                  <PermissionToggle
                    label="Age Restricted"
                    active={!!event.ageRestriction}
                    val={event.ageRestriction}
                  />
                </div>
              </div>
            </section>

            <ManagementStats analytics={analytics} event={event} />

            <section className="bg-white rounded-[40px] border border-gray-100 p-8 shadow-sm">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                <History size={14} /> Transaction Ledger
              </h3>
              <TransactionLedger orders={orders} />
            </section>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="lg:col-span-4 space-y-8">
            {/* 💡 INTERACTIVE DISCOVERY & PROMOTION CONTROL PANEL */}
            <section className="bg-white rounded-[40px] border border-gray-100 p-8 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-100/30 to-transparent pointer-events-none rounded-bl-full" />

              <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-900 mb-6 flex items-center gap-2">
                <Sparkles size={14} className="text-amber-500" /> Discovery
                Engine Panel
              </h3>

              <div className="space-y-6">
                {/* Toggle: Skaute Hosted Elite Tier */}
                <div
                  className={`p-4 rounded-2xl border transition-all ${isSkauteHosted ? "bg-amber-50/60 border-amber-300 shadow-sm" : "bg-gray-50/50 border-gray-100"}`}
                >
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isSkauteHosted}
                      onChange={(e) => setIsSkauteHosted(e.target.checked)}
                      className="mt-1 accent-black h-4 w-4 rounded"
                    />
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-tight flex items-center gap-1 text-gray-900">
                        <Award
                          size={12}
                          className="text-amber-600 fill-amber-500"
                        />{" "}
                        Skaute Official Move
                      </span>
                      <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                        Forces placement priority above all commercial boosts
                        (+8 score modifier).
                      </p>
                    </div>
                  </label>
                </div>

                {/* Status Badging Checkboxes */}
                <div className="space-y-2.5">
                  <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                    Ecosystem Status Placement
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => toggleStatusTag("verified")}
                      className={`p-3 rounded-xl font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all border ${
                        statusArray.includes("verified")
                          ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                          : "bg-white border-gray-100 text-gray-400 hover:bg-gray-50"
                      }`}
                    >
                      <CheckCircle2 size={12} /> Verified
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleStatusTag("featured")}
                      className={`p-3 rounded-xl font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all border ${
                        statusArray.includes("featured")
                          ? "bg-purple-50 border-purple-300 text-purple-700"
                          : "bg-white border-gray-100 text-gray-400 hover:bg-gray-50"
                      }`}
                    >
                      <Sparkles size={12} /> Featured
                    </button>
                  </div>
                </div>

                {/* Commercial Boosting Section */}
                <div className="border-t border-gray-100 pt-5 space-y-4">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-[11px] font-black uppercase tracking-tight flex items-center gap-1 text-gray-900">
                      <Zap size={12} className="text-blue-500 fill-blue-500" />{" "}
                      Apply Commercial Boost
                    </span>
                    <input
                      type="checkbox"
                      checked={isBoosted}
                      onChange={(e) => setIsBoosted(e.target.checked)}
                      className="accent-blue-600 h-4 w-4"
                    />
                  </label>

                  {isBoosted && (
                    <div className="p-4 bg-blue-50/40 rounded-2xl border border-blue-100 space-y-4 animate-fadeIn">
                      <div>
                        <label className="text-[9px] font-black uppercase tracking-wider text-blue-700 block mb-1.5">
                          Boost Tier Level
                        </label>
                        <select
                          value={boostTier}
                          onChange={(e) => setBoostTier(e.target.value)}
                          className="w-full text-xs font-bold bg-white border border-blue-200 rounded-xl p-2.5 uppercase tracking-wide focus:outline-none focus:ring-1 focus:ring-blue-400 text-gray-700"
                        >
                          <option value="standard">
                            Standard (+3 Priority)
                          </option>
                          <option value="premium">Premium (+5 Priority)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[9px] font-black uppercase tracking-wider text-blue-700 block mb-1.5">
                          Campaign Duration
                        </label>
                        <select
                          value={boostDays}
                          onChange={(e) => setBoostDays(Number(e.target.value))}
                          className="w-full text-xs font-bold bg-white border border-blue-200 rounded-xl p-2.5 uppercase tracking-wide focus:outline-none focus:ring-1 focus:ring-blue-400 text-gray-700"
                        >
                          <option value={3}>3 Days Campaign</option>
                          <option value={7}>7 Days Campaign</option>
                          <option value={14}>14 Days Campaign</option>
                          <option value={30}>30 Days Campaign</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Submission Button */}
                <button
                  type="button"
                  disabled={updating}
                  onClick={handleUpdatePromotion}
                  className="w-full mt-2 py-3 bg-black text-white hover:bg-gray-900 disabled:bg-gray-200 disabled:text-gray-400 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  {updating ? (
                    <>
                      <RefreshCw size={12} className="animate-spin" />{" "}
                      Optimizing Feed Placement...
                    </>
                  ) : (
                    "Apply Curation Updates"
                  )}
                </button>
              </div>
            </section>

            <LiveVibeMonitor
              event={event}
              tickets={tickets}
              analytics={analytics}
            />

            {/* TICKET TIER INVENTORY */}
            <section className="bg-white rounded-[40px] border border-gray-100 p-8 shadow-sm">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                <Layers size={14} /> Inventory Management
              </h3>
              <div className="space-y-4">
                {event.ticketTiers?.map((tier: any) => (
                  <div key={tier.name} className="p-4 bg-gray-50 rounded-2xl">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-[10px] font-black uppercase text-gray-900">
                        {tier.name}
                      </p>
                      <p className="text-xs font-black italic">
                        ₦{tier.price.toLocaleString()}
                      </p>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600"
                        style={{
                          width: `${(tier.sold / tier.capacity) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-[9px] font-bold text-gray-400 uppercase">
                      <span>Sold: {tier.sold}</span>
                      <span>Total: {tier.capacity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

/* HELPER COMPONENTS */
function Badge({ icon, label, color }: any) {
  const colors: any = {
    slate: "bg-slate-50 text-slate-500 border-slate-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-emerald-50 text-emerald-600 border-emerald-100",
    red: "bg-red-50 text-red-600 border-red-100",
  };
  return (
    <span
      className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${colors[color]}`}
    >
      {icon} {label}
    </span>
  );
}

function LogisticsItem({ icon, label, value, sub }: any) {
  return (
    <div className="space-y-1">
      <p className="text-[9px] font-black uppercase text-gray-400 flex items-center gap-1 tracking-widest">
        {icon} {label}
      </p>
      <p className="text-xs font-black text-gray-700">{value}</p>
      <p className="text-[10px] font-medium text-gray-400">{sub}</p>
    </div>
  );
}

function LinkItem({ label, url, color }: any) {
  return (
    <a
      href={url}
      target="_blank"
      className="flex items-center justify-between p-3 rounded-xl border border-transparent hover:border-gray-100 bg-white shadow-sm transition-all group"
    >
      <span className="text-[10px] font-black uppercase text-gray-600 tracking-tighter={color}">
        {label}
      </span>
      <ExternalLink
        size={12}
        className="text-blue-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
      />
    </a>
  );
}

function PermissionToggle({ label, active, val }: any) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-[10px] font-bold text-gray-500 uppercase">{label}</p>
      <span
        className={`text-[9px] font-black px-2 py-0.5 rounded ${active ? "text-emerald-600 bg-emerald-50" : "text-gray-400 bg-gray-100"}`}
      >
        {val ? val : active ? "YES" : "NO"}
      </span>
    </div>
  );
}
