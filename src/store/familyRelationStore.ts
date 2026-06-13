import { create } from "zustand";
import type { FamilyRelation, Memorial, RelationType } from "@/types";
import { RELATION_LABELS, INVERSE_RELATIONS } from "@/types";
import { createCRUDStore, type CRUDStoreState } from "./createCRUDStore";
import { getSampleFamilyRelations } from "./sampleData";

const RELATIONS_STORAGE_KEY = "memorial_family_relations";

interface FamilyRelationExtraState {
  addRelation: (
    fromId: string,
    toId: string,
    relation: RelationType,
    memorials: Memorial[],
    note?: string
  ) => FamilyRelation | null;
  getRelationsForMemorial: (
    memorialId: string,
    memorials: Memorial[]
  ) => Array<{ relation: FamilyRelation; otherMemorial: Memorial; label: string }>;
  getRelatedMemorials: (memorialId: string, memorials: Memorial[]) => Memorial[];
  removeRelationsForMemorial: (memorialId: string) => void;
}

export type FamilyRelationStore = CRUDStoreState<FamilyRelation> & FamilyRelationExtraState;

const baseStore = createCRUDStore<FamilyRelation>({
  storageKey: RELATIONS_STORAGE_KEY,
  sampleData: getSampleFamilyRelations,
});

export const useFamilyRelationStore = create<FamilyRelationStore>((set, get) => ({
  ...baseStore.getState(),

  addRelation: (fromId, toId, relation, memorials, note) => {
    if (fromId === toId) return null;
    const { items } = get();
    const exists = items.some(
      (r) =>
        (r.fromMemorialId === fromId && r.toMemorialId === toId) ||
        (r.fromMemorialId === toId && r.toMemorialId === fromId)
    );
    if (exists) return null;

    const fromMemorial = memorials.find((m) => m.id === fromId);
    const toMemorial = memorials.find((m) => m.id === toId);
    if (!fromMemorial || !toMemorial) return null;

    const newRelation = get().create({
      fromMemorialId: fromId,
      toMemorialId: toId,
      relation,
      note,
    } as Partial<FamilyRelation>);
    return newRelation;
  },

  getRelationsForMemorial: (memorialId, memorials) => {
    const { items } = get();
    const result: Array<{ relation: FamilyRelation; otherMemorial: Memorial; label: string }> = [];

    for (const r of items) {
      let otherId: string | null = null;
      let label: string | null = null;

      if (r.fromMemorialId === memorialId) {
        otherId = r.toMemorialId;
        label = RELATION_LABELS[r.relation];
      } else if (r.toMemorialId === memorialId) {
        otherId = r.fromMemorialId;
        const fromMemorial = memorials.find((m) => m.id === r.fromMemorialId);
        if (fromMemorial) {
          const gender = fromMemorial.gender === "unknown" ? "male" : fromMemorial.gender;
          const inverse = INVERSE_RELATIONS[r.relation][gender];
          label = RELATION_LABELS[inverse];
        } else {
          label = RELATION_LABELS[r.relation];
        }
      }

      if (otherId && label) {
        const otherMemorial = memorials.find((m) => m.id === otherId);
        if (otherMemorial) {
          result.push({ relation: r, otherMemorial, label });
        }
      }
    }

    return result;
  },

  getRelatedMemorials: (memorialId, memorials) => {
    const { items } = get();
    const relatedIds = new Set<string>();

    for (const r of items) {
      if (r.fromMemorialId === memorialId) {
        relatedIds.add(r.toMemorialId);
      } else if (r.toMemorialId === memorialId) {
        relatedIds.add(r.fromMemorialId);
      }
    }

    return memorials.filter((m) => relatedIds.has(m.id));
  },

  removeRelationsForMemorial: (memorialId) => {
    const { items } = get();
    const toRemove = items.filter(
      (r) => r.fromMemorialId === memorialId || r.toMemorialId === memorialId
    );
    toRemove.forEach((r) => get().remove(r.id));
  },
}));
