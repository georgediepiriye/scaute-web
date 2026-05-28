/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldAlert,
  Cpu,
  CheckCircle2,
  Users2,
  RefreshCw,
  Radio,
} from "lucide-react";
import toast from "react-hot-toast";

interface GateControlProps {
  eventId: string;
}

export function GateControlTab({ eventId }: GateControlProps) {
  const [telemetry, setTelemetry] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTelemetry = useCallback(
    async (showToast = false) => {
      if (showToast) setRefreshing(true);
      try {
        const token = localStorage.getItem("skaute_token");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/events/${eventId}/gate-control`,
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
          setTelemetry(result.data);
          if (showToast) toast.success("Gate logs updated live");
        }
      } catch (err) {
        console.error("Telemetry link dropped:", err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [eventId],
  );

  // Set up auto-polling tracking cycle every 8 seconds for active gates
  useEffect(() => {
    fetchTelemetry(false);
    const interval = setInterval(() => fetchTelemetry(false), 8000);
    return () => clearInterval(interval);
  }, [fetchTelemetry]);

  if (loading) {
    return (
      <div className="p-12 text-center text-xs font-black uppercase tracking-widest text-gray-400">
        Assembling gate streams...
      </div>
    );
  }

  const summary = telemetry?.summary || {
    verifiedCount: 0,
    remainingCount: 0,
    activeDevicesCount: 0,
    fraudAlertsCount: 0,
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-200">
      {/* Header section with live polling indicators */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 italic flex items-center gap-2">
            Gate Control & <span className="text-yellow-500">Security</span>
          </h3>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 flex items-center gap-1.5">
            <Radio size={10} className="text-green-500 animate-pulse" /> Live
            validation auditing and device mapping streams
          </p>
        </div>
        <button
          onClick={() => fetchTelemetry(true)}
          disabled={refreshing}
          className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-xl text-slate-700 transition-all active:scale-95 disabled:opacity-40"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Hardware Telemetry Metric Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[9px] font-black uppercase tracking-widest">
              Checked In
            </span>
            <CheckCircle2 size={14} className="text-green-500" />
          </div>
          <h4 className="text-xl font-black text-slate-900">
            {summary.verifiedCount}
          </h4>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[9px] font-black uppercase tracking-widest">
              Expected Guest Remaining
            </span>
            <Users2 size={14} className="text-slate-400" />
          </div>
          <h4 className="text-xl font-black text-slate-900">
            {summary.remainingCount}
          </h4>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[9px] font-black uppercase tracking-widest">
              Active Scanners
            </span>
            <Cpu size={14} className="text-blue-500" />
          </div>
          <h4 className="text-xl font-black text-slate-900">
            {summary.activeDevicesCount}
          </h4>
        </div>
      </div>

      {/* Critical Security Incidents Alert Section */}
      {telemetry?.fraudAlerts?.length > 0 && (
        <div className="bg-red-50/60 border border-red-100 rounded-[2rem] p-6 space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-red-600 flex items-center gap-2">
            <ShieldAlert size={14} /> Critical Security Intercept Logs
          </h4>
          <div className="divide-y divide-red-100/60 text-xs">
            {telemetry.fraudAlerts.map((alert: any, idx: number) => (
              <div
                key={idx}
                className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-4"
              >
                <div>
                  <p className="font-black text-red-900 uppercase tracking-tight">
                    {alert.guestName} —{" "}
                    <span className="font-mono text-red-600">{alert.code}</span>
                  </p>
                  <p className="text-[11px] text-red-700/80 mt-0.5 font-medium">
                    {alert.message}
                  </p>
                </div>
                <span className="font-mono text-[9px] font-bold text-red-400 whitespace-nowrap">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Stream Verification Tracker */}
      <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900">
            Real-time Verification Stream
          </h4>
          <span className="text-[9px] font-black uppercase tracking-widest text-green-500 bg-green-50 px-2.5 py-1 rounded-full flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-ping" />{" "}
            Feed Sync Active
          </span>
        </div>

        {telemetry?.liveFeed?.length === 0 ? (
          <div className="p-12 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
            No entry passes recorded at the doors yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[9px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">
                  <th className="p-4">Attendee Pass</th>
                  <th className="p-4">Ticket Type</th>
                  <th className="p-4">Terminal Route</th>
                  <th className="p-4">Timestamp</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50 text-[11px]">
                {telemetry?.liveFeed?.map((feed: any) => (
                  <tr
                    key={feed.ticketId}
                    className="hover:bg-slate-50/40 transition-colors font-medium"
                  >
                    <td className="p-4">
                      <span className="font-black text-slate-900 block">
                        {feed.guestName}
                      </span>
                      <span className="font-mono text-[10px] text-gray-400 block mt-0.5">
                        {feed.code}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-800 text-[9px] font-black uppercase tracking-tight rounded-full">
                        {feed.tier}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-blue-600 font-bold bg-blue-50/50 px-2 py-0.5 rounded-md text-[10px]">
                        {feed.deviceId}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold text-gray-400">
                      {new Date(feed.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
