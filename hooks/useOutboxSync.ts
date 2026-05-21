// @/hooks/useOutboxSync.ts
import { useEffect, useState } from "react";
import { db } from "@/lib/db";
import toast from "react-hot-toast";

export function useOutboxSync(onSyncComplete?: () => void) {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof window !== "undefined" ? navigator.onLine : true,
  );
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Monitor real-time connectivity status changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Connection restored! Flushing queue...");
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.error("Offline mode enabled");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Process the queue item by item to guarantee chronological order
  useEffect(() => {
    if (!isOnline || isSyncing) return;

    const flushOutboxQueue = async () => {
      const pendingItems = await db.outbox.orderBy("id").toArray();
      if (pendingItems.length === 0) return;

      setIsSyncing(true);
      const token = localStorage.getItem("skaute_token");
      let successCount = 0;

      for (const item of pendingItems) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/v1/tickets/check-in/${item.eventId}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify({
                checkInCode: item.checkInCode,
                deviceFingerprint: item.deviceFingerprint,
                offlineTimestamp: item.timestamp, // Pass timestamp so logs reflect actual scan time
              }),
            },
          );

          // Delete from outbox if processed successfully OR explicitly rejected (invalid token/fraud)
          // This keeps bad data from getting stuck forever, spinning the loader endlessly
          if (
            response.ok ||
            response.status === 400 ||
            response.status === 404
          ) {
            if (item.id) {
              await db.outbox.delete(item.id);
              if (response.ok) successCount++;
            }
          }
        } catch (error) {
          console.error("Failed to sync outbox item:", error);
          // Network request dropped midway? Stop execution and retry the loop on next reconnect
          break;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully uploaded ${successCount} offline logs.`);
        if (onSyncComplete) onSyncComplete();
      }
      setIsSyncing(false);
    };

    flushOutboxQueue();
  }, [isOnline, isSyncing, onSyncComplete]);

  return { isOnline, isSyncing };
}
