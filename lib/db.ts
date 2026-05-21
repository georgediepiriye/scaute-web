import Dexie, { Table } from "dexie";

export interface PendingSync {
  id?: number;
  checkInCode: string;
  eventId: string;
  timestamp: number;
  deviceFingerprint: string; // <-- Add this field here
}

export interface LocalTicket {
  id: string;
  eventId: string;
  checkInCode: string;
  guestName: string;
  tier: string;
  status: string;
  updatedAt: number;
}

export class SkauteScannerDB extends Dexie {
  tickets!: Table<LocalTicket>;
  outbox!: Table<PendingSync>;

  constructor() {
    super("SkauteScannerDB");

    // Incremented to version 4 to accommodate the new offline telemetry field
    this.version(4).stores({
      tickets:
        "id, eventId, checkInCode, status, updatedAt, [checkInCode+eventId]",

      outbox: "++id, checkInCode, eventId, timestamp",
    });
  }
}

export const db = new SkauteScannerDB();
