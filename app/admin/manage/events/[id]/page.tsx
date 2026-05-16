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

  const fetchManagementData = async () => {
    try {
      // Retrieve explicitly stored auth string token
      const token = localStorage.getItem("kivo_token");

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
      if (result.status === "success") setData(result.data);
    } catch (error) {
      toast.error("Failed to sync management data");
    } finally {
      setLoading(false);
    }
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
                <span
                  className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${event.status === "featured" ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"}`}
                >
                  {event.status} Move
                </span>
                {event.isCancelled && (
                  <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-[9px] font-black uppercase tracking-tighter italic">
                    Cancelled
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 uppercase italic tracking-tighter">
                {event.title}
              </h1>
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
            {/* CORE EVENT CONFIGURATION (Privacy, Format, Links) */}
            <section className="bg-white rounded-[40px] border border-gray-100 p-8 shadow-sm">
              <div className="flex flex-col md:flex-row gap-8 mb-8">
                <div className="relative w-full md:w-64 h-64 rounded-[32px] overflow-hidden flex-shrink-0 border border-gray-100">
                  <Image
                    src={event.image}
                    alt=""
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 space-y-6">
                  {/* Category & Format Badges */}
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

                  {/* Date & Location Grid */}
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
                      value={event.location?.venueName || "Online"}
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

            {/* LIVE ANALYTICS */}
            <ManagementStats analytics={analytics} event={event} />

            {/* TRANSACTION LEDGER */}
            <section className="bg-white rounded-[40px] border border-gray-100 p-8 shadow-sm">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                <History size={14} /> Transaction Ledger
              </h3>
              <TransactionLedger orders={orders} />
            </section>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="lg:col-span-4 space-y-8">
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
      className={`flex items-center justify-between p-3 rounded-xl border border-transparent hover:border-gray-100 bg-white shadow-sm transition-all group`}
    >
      <span className="text-[10px] font-black uppercase text-gray-600 tracking-tighter">
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
