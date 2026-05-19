import Dexie, { Table } from "dexie";

export interface PendingSync {
  id?: number;
  checkInCode: string;
  eventId: string;
  timestamp: number;
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

    this.version(3).stores({
      tickets:
        "id, eventId, checkInCode, status, updatedAt, [checkInCode+eventId]",

      outbox: "++id, checkInCode, eventId, timestamp",
    });
  }
}

export const db = new SkauteScannerDB();
