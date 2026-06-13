import { create } from "zustand";
import type { DriftBottle, Memorial } from "@/types";
import { createCRUDStore, type CRUDStoreState } from "./createCRUDStore";

const DRIFT_BOTTLE_STORAGE_KEY = "memorial_drift_bottles";

interface DriftBottleExtraState {
  sendBottle: (fromMemorialId: string, content: string, memorials: Memorial[]) => DriftBottle | null;
  getBottlesForMemorial: (memorialId: string) => DriftBottle[];
  markBottleRead: (bottleId: string) => void;
  getUnreadCount: (memorialId: string) => number;
}

export type DriftBottleStore = CRUDStoreState<DriftBottle> & DriftBottleExtraState;

const baseStore = createCRUDStore<DriftBottle>({
  storageKey: DRIFT_BOTTLE_STORAGE_KEY,
});

export const useDriftBottleStore = create<DriftBottleStore>((set, get) => ({
  ...baseStore.getState(),

  sendBottle: (fromMemorialId, content, memorials) => {
    const fromMemorial = memorials.find((m) => m.id === fromMemorialId);
    if (!fromMemorial) return null;

    const publicMemorials = memorials.filter(
      (m) => !m.isPrivate && m.id !== fromMemorialId
    );
    if (publicMemorials.length === 0) return null;

    const targetMemorial =
      publicMemorials[Math.floor(Math.random() * publicMemorials.length)];

    const bottle = get().create({
      content,
      fromMemorialId,
      fromMemorialName: fromMemorial.name,
      toMemorialId: targetMemorial.id,
      isRead: false,
    } as Partial<DriftBottle>);
    return bottle;
  },

  getBottlesForMemorial: (memorialId) => {
    return get().items.filter((b) => b.toMemorialId === memorialId);
  },

  markBottleRead: (bottleId) => {
    get().update(bottleId, { isRead: true } as Partial<DriftBottle>);
  },

  getUnreadCount: (memorialId) => {
    return get().items.filter(
      (b) => b.toMemorialId === memorialId && !b.isRead
    ).length;
  },
}));
