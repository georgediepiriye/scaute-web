/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ShieldAlert,
  Smartphone,
  Activity,
  CheckCircle2,
  Clock,
  Search,
  Radio,
  Wifi,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

interface TelemetryProps {
  eventId?: string; // Optional: if omitted, tracks global platform-wide gate telemetry
}

export function GateTelemetryTab({ eventId }: TelemetryProps) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [telemetry, setTelemetry] = useState<any>(null);
  const [searchTerminal, setSearchTerminal] = useState("");

  const fetchTelemetryData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const token = localStorage.getItem("skaute_token");
      const targetEndpoint = eventId
        ? `${process.env.NEXT_PUBLIC_API_URL}/v1/admin/telemetry/events/${eventId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/v1/admin/telemetry/global`;

      const response = await fetch(targetEndpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const result = await response.json();
      if (response.ok) {
        setTelemetry(result.data);
      } else {
        toast.error(result.message || "Failed to establish telemetry link.");
      }
    } catch (err) {
      console.error("Telemetry sync failure:", err);
      toast.error("Network disruption. Telemetry stream broken.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Live structural long polling link to simulate real-time operations
  useEffect(() => {
    fetchTelemetryData();
    const liveStreamInterval = setInterval(() => {
      fetchTelemetryData(true); // Polling silent refreshes in background every 8 seconds
    }, 8000);

    return () => clearInterval(liveStreamInterval);
  }, [eventId]);

  // Filter out terminal devices cleanly based on operational search
  const filteredTerminals = useMemo(() => {
    const devices = telemetry?.terminals || [];
    if (!searchTerminal) return devices;
    return devices.filter(
      (device: any) =>
        device.deviceId.toLowerCase().includes(searchTerminal.toLowerCase()) ||
        device.operatorName
          ?.toLowerCase()
          .includes(searchTerminal.toLowerCase()),
    );
  }, [telemetry?.terminals, searchTerminal]);

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center bg-white rounded-[2rem] border border-gray-100 shadow-sm">
        <LoaderPulse />
        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mt-4">
          Binding Real-time Security Telemetry Matrix...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* SECTION HEADER BLOCK */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 italic">
              Gate Operations &{" "}
              <span className="text-blue-600">Live Telemetry</span>
            </h3>
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
            {eventId
              ? "Monitoring live hardware nodes for this event"
              : "Platform-wide scanner connection arrays"}
          </p>
        </div>

        <button
          onClick={() => fetchTelemetryData(true)}
          disabled={refreshing}
          className="self-start sm:self-auto flex items-center gap-2 bg-slate-50 border border-gray-200 text-slate-700 text-[9px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl hover:bg-slate-900 hover:text-white transition-all disabled:opacity-50"
        >
          <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Syncing..." : "Force Sync"}
        </button>
      </div>

      {/* CORE OPERATIONAL METRIC METERS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[9px] font-black uppercase tracking-wider">
              Checked In / Sold
            </span>
            <CheckCircle2 size={14} className="text-emerald-500" />
          </div>
          <h4 className="text-2xl font-black text-slate-900 italic">
            {telemetry?.summary?.verifiedCount?.toLocaleString() ?? 0}
            <span className="text-xs text-gray-300 font-normal not-italic ml-1">
              / {telemetry?.summary?.totalTicketsSold?.toLocaleString() ?? 0}
            </span>
          </h4>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[9px] font-black uppercase tracking-wider">
              Active Handsets
            </span>
            <Smartphone size={14} className="text-blue-500" />
          </div>
          <h4 className="text-2xl font-black text-slate-900 italic">
            {telemetry?.summary?.activeDevicesCount ?? 0}
            <span className="text-[10px] text-emerald-500 font-bold ml-2 uppercase tracking-tighter">
              Live
            </span>
          </h4>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[9px] font-black uppercase tracking-wider">
              Validation Velocity
            </span>
            <Activity size={14} className="text-purple-500" />
          </div>
          <h4 className="text-2xl font-black text-slate-900 italic">
            {telemetry?.summary?.scansPerMinute ?? 0}
            <span className="text-xs text-gray-400 font-bold ml-1 uppercase">
              spm
            </span>
          </h4>
        </div>

        <div className="bg-white border border-rose-100 bg-rose-50/20 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-rose-400 mb-2">
            <span className="text-[9px] font-black uppercase tracking-wider text-rose-900">
              Security Collisions
            </span>
            <ShieldAlert size={14} className="text-rose-600 animate-bounce" />
          </div>
          <h4
            className={`text-2xl font-black italic ${telemetry?.summary?.fraudAlertsCount > 0 ? "text-rose-600" : "text-slate-900"}`}
          >
            {telemetry?.summary?.fraudAlertsCount ?? 0}
          </h4>
        </div>
      </div>

      {/* TWO-COLUMN VIEWPORT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: REAL-TIME HARDWARE SCANNERS DIRECTORY */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
              <Radio size={14} className="text-blue-600 animate-pulse" /> Live
              Terminal Registry
            </h4>
            <span className="text-[9px] font-black bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
              {filteredTerminals.length} Total
            </span>
          </div>

          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={14}
            />
            <input
              type="text"
              placeholder="Filter by hardware ID or operator..."
              value={searchTerminal}
              onChange={(e) => setSearchTerminal(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-9 pr-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-blue-600 transition-all shadow-sm"
            />
          </div>

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {filteredTerminals.length === 0 ? (
              <div className="p-8 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest border border-dashed border-gray-200 rounded-2xl bg-white">
                No tracking terminal devices matched this signature block.
              </div>
            ) : (
              filteredTerminals.map((device: any) => (
                <div
                  key={device.deviceId}
                  className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center justify-between hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-xl ${device.status === "online" ? "bg-emerald-50 text-emerald-600" : "bg-gray-50 text-gray-400"}`}
                    >
                      <Smartphone size={16} />
                    </div>
                    <div>
                      <span className="font-mono text-[11px] font-bold text-slate-900 block">
                        {device.deviceId}
                      </span>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tight block">
                        Op: {device.operatorName || "Unassigned Gate Agent"}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] font-black text-slate-900 block italic">
                      {device.scanCount}{" "}
                      <span className="text-[8px] uppercase font-bold text-gray-400 not-italic">
                        scans
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-1 mt-0.5">
                      <Wifi
                        size={10}
                        className={
                          device.status === "online"
                            ? "text-emerald-500"
                            : "text-gray-300"
                        }
                      />
                      <span
                        className={`text-[8px] font-black uppercase tracking-widest ${device.status === "online" ? "text-emerald-600" : "text-gray-400"}`}
                      >
                        {device.status}
                      </span>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: SECURITY COLLISION INTERCEPTORS & VALIDATION FEED */}
        <div className="lg:col-span-7 space-y-6">
          {/* PERIMETER VIOLATIONS & FRAUD ENGINE NOTIFICATIONS */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-rose-600 flex items-center gap-2">
              <ShieldAlert size={14} /> Security Intercept Protocols
            </h4>

            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {!telemetry?.fraudAlerts ||
                telemetry.fraudAlerts.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-6 border border-emerald-100 bg-emerald-50/10 rounded-2xl text-center"
                  >
                    <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">
                      ✓ No validation collisions or replica tickets intercepted
                      at perimeter gates.
                    </p>
                  </motion.div>
                ) : (
                  telemetry.fraudAlerts.map((alert: any) => (
                    <motion.div
                      key={alert.id || alert.code}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="border border-rose-200 bg-rose-50/40 rounded-2xl p-4 flex items-start gap-3.5 shadow-sm shadow-rose-100/10"
                    >
                      <div className="p-2 bg-rose-600 text-white rounded-xl mt-0.5">
                        <AlertTriangle size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-rose-900 bg-rose-100 px-2 py-0.5 rounded-md">
                            {alert.type}
                          </span>
                          <span className="text-[9px] font-bold text-gray-400">
                            {new Date(alert.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-[11px] font-bold text-slate-900 mt-1.5">
                          Pass Code:{" "}
                          <span className="font-mono bg-white border border-rose-100 px-1.5 py-0.2 rounded font-black">
                            {alert.code}
                          </span>{" "}
                          ({alert.guestName})
                        </p>
                        <p className="text-[10px] text-gray-500 font-medium mt-0.5 leading-relaxed">
                          {alert.message}
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* STREAMING LIVE VALIDATION LOGS FEED */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
              <Clock size={14} className="text-gray-400" /> Perimeter Live
              Traffic Feed
            </h4>

            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              <div className="max-h-[320px] overflow-y-auto">
                {!telemetry?.liveFeed || telemetry.liveFeed.length === 0 ? (
                  <div className="p-12 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Awaiting gate validation metrics...
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[8px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">
                        <th className="p-3.5 pl-5">Guest Ticket Target</th>
                        <th className="p-3.5">Verification Key</th>
                        <th className="p-3.5">Terminal ID</th>
                        <th className="p-3.5 pr-5 text-right">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-[10px] font-bold">
                      {telemetry.liveFeed.map((scan: any) => (
                        <tr
                          key={scan.ticketId}
                          className="hover:bg-slate-50/40 transition-colors"
                        >
                          <td className="p-3.5 pl-5">
                            <span className="text-slate-900 block">
                              {scan.guestName}
                            </span>
                            <span className="text-[8px] text-gray-400 uppercase tracking-tight block mt-0.5">
                              {scan.tier}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className="font-mono text-blue-600 bg-blue-50/40 border border-blue-100/50 px-1.5 py-0.5 rounded">
                              {scan.code}
                            </span>
                          </td>
                          <td className="p-3.5 font-mono text-slate-600 uppercase">
                            {scan.deviceId}
                          </td>
                          <td className="p-3.5 pr-5 text-right text-gray-400 font-medium">
                            {new Date(scan.timestamp).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoaderPulse() {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-2 h-6 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-2 h-6 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-2 h-6 bg-blue-600 rounded-full animate-bounce"></div>
    </div>
  );
}
