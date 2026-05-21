// @/lib/db.ts
import Dexie, { type Table } from "dexie";

export interface PendingSync {
  id?: number;
  checkInCode: string;
  eventId: string;
  timestamp: number;
  deviceFingerprint: string;
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

    this.version(4).stores({
      // Compound index ensures lightning fast scanning matching during gate control checks
      tickets:
        "id, eventId, checkInCode, status, updatedAt, [checkInCode+eventId]",

      // Clean and minimal indexing footprint optimized for FIFO (First-In, First-Out) queuing
      outbox: "++id, eventId",
    });
  }
}

export const db = new SkauteScannerDB();
