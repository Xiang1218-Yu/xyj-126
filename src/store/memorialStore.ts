import { create } from "zustand";
import type {
  Memorial,
  Photo,
  Message,
  Flower,
  Candle,
  FamilyRelation,
  RelationType,
  VisualTheme,
  Collaborator,
  Contribution,
  InviteLink,
  ContributionType,
  DriftBottle,
} from "@/types";
import { RELATION_LABELS, INVERSE_RELATIONS } from "@/types";
import { generateId } from "@/utils";
import {
  addNestedItem,
  addNestedItemToFront,
  addNestedItemWithOrder,
  removeNestedItem,
  updateNestedItem,
  mapParentById,
  nowISO,
  addNestedItemRaw,
  addNestedItemRawToFront,
} from "./nestedEntityUtils";
import {
  getSampleMemorials,
  migrateMemorials,
  getSampleFamilyRelations,
  defaultMemorial,
} from "./sampleData";

const STORAGE_KEY = "memorial_memorials";
const RELATIONS_STORAGE_KEY = "memorial_family_relations";
const DRIFT_BOTTLE_STORAGE_KEY = "memorial_drift_bottles";
const COLLABORATOR_STORAGE_KEY = "memorial_current_collaborator";

function loadStorage<T>(key: string): T[] | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T[];
    } catch (parseError) {
      console.error(`load [${key}] JSON parse failed:`, parseError);
      throw parseError;
    }
  } catch (e) {
    console.error(`load [${key}] failed:`, e);
    if (e instanceof SyntaxError) {
      throw e;
    }
    return null;
  }
}

function saveStorage<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`save [${key}] failed:`, e);
  }
}

export interface MemorialState {
  memorials: Memorial[];
  familyRelations: FamilyRelation[];
  currentCollaboratorId: string | null;
  driftBottles: DriftBottle[];
  isLoaded: boolean;
  loadMemorials: () => void;
  saveMemorials: () => void;
  loadFamilyRelations: () => void;
  saveFamilyRelations: () => void;
  loadDriftBottles: () => void;
  saveDriftBottles: () => void;
  createMemorial: (data: Partial<Memorial>) => Memorial;
  updateMemorial: (id: string, data: Partial<Memorial>) => void;
  deleteMemorial: (id: string) => void;
  getMemorial: (id: string) => Memorial | undefined;
  addPhoto: (
    memorialId: string,
    photo: Omit<Photo, "id" | "order">,
    collaboratorId?: string,
    collaboratorName?: string
  ) => void;
  removePhoto: (memorialId: string, photoId: string) => void;
  addMessage: (memorialId: string, message: Omit<Message, "id" | "createdAt">) => void;
  addFlower: (memorialId: string, flower: Omit<Flower, "id" | "createdAt">) => void;
  addCandle: (memorialId: string, candle: Omit<Candle, "id" | "createdAt">) => void;
  searchMemorials: (query: string) => Memorial[];
  resetToSampleData: () => Promise<void>;
  addFamilyRelation: (
    fromId: string,
    toId: string,
    relation: RelationType,
    note?: string
  ) => FamilyRelation | null;
  removeFamilyRelation: (relationId: string) => void;
  getRelationsForMemorial: (
    memorialId: string
  ) => Array<{ relation: FamilyRelation; otherMemorial: Memorial; label: string }>;
  getRelatedMemorials: (memorialId: string) => Memorial[];
  getAllFamilyRelations: () => FamilyRelation[];
  setMemorialTheme: (memorialId: string, theme: VisualTheme) => void;
  createInviteLink: (
    memorialId: string,
    createdBy: string,
    maxUses?: number,
    validDays?: number
  ) => InviteLink;
  getInviteLinkByToken: (token: string) => InviteLink | null;
  joinMemorialByInvite: (
    token: string,
    name: string,
    relation: string
  ) => { success: boolean; memorial?: Memorial; collaborator?: Collaborator; message: string };
  addCollaborator: (memorialId: string, name: string, relation: string) => Collaborator | null;
  removeCollaborator: (memorialId: string, collaboratorId: string) => void;
  getCollaborators: (memorialId: string) => Collaborator[];
  addContribution: (
    memorialId: string,
    collaboratorId: string,
    collaboratorName: string,
    type: ContributionType,
    summary: string,
    detail?: string
  ) => void;
  getContributions: (memorialId: string) => Contribution[];
  setCurrentCollaborator: (collaboratorId: string | null) => void;
  updateCollaboratorLastActive: (memorialId: string, collaboratorId: string) => void;
  sendDriftBottle: (fromMemorialId: string, content: string) => DriftBottle | null;
  getDriftBottlesForMemorial: (memorialId: string) => DriftBottle[];
  markDriftBottleRead: (bottleId: string) => void;
  getUnreadDriftBottleCount: (memorialId: string) => number;
}

export const useMemorialStore = create<MemorialState>((set, get) => ({
  memorials: [],
  familyRelations: [],
  driftBottles: [],
  currentCollaboratorId: localStorage.getItem(COLLABORATOR_STORAGE_KEY),
  isLoaded: false,

  loadMemorials: () => {
    (async () => {
      try {
        const stored = loadStorage<Memorial>(STORAGE_KEY);
        if (stored) {
          const migrated = await migrateMemorials(stored);
          set({ memorials: migrated, isLoaded: true });
          if (JSON.stringify(migrated) !== JSON.stringify(stored)) {
            saveStorage(STORAGE_KEY, migrated);
          }
        } else {
          const sample = await getSampleMemorials();
          set({ memorials: sample, isLoaded: true });
          saveStorage(STORAGE_KEY, sample);
        }
      } catch (error) {
        console.error("Failed to load memorials:", error);
        set({ isLoaded: true });
      }
    })();
  },

  saveMemorials: () => {
    saveStorage(STORAGE_KEY, get().memorials);
  },

  loadFamilyRelations: () => {
    try {
      const stored = loadStorage<FamilyRelation>(RELATIONS_STORAGE_KEY);
      if (stored) {
        set({ familyRelations: stored });
      } else {
        const sample = getSampleFamilyRelations();
        set({ familyRelations: sample });
        saveStorage(RELATIONS_STORAGE_KEY, sample);
      }
    } catch (error) {
      console.error("Failed to load family relations:", error);
    }
  },

  saveFamilyRelations: () => {
    saveStorage(RELATIONS_STORAGE_KEY, get().familyRelations);
  },

  loadDriftBottles: () => {
    try {
      const stored = loadStorage<DriftBottle>(DRIFT_BOTTLE_STORAGE_KEY);
      if (stored) {
        set({ driftBottles: stored });
      }
    } catch (error) {
      console.error("Failed to load drift bottles:", error);
    }
  },

  saveDriftBottles: () => {
    saveStorage(DRIFT_BOTTLE_STORAGE_KEY, get().driftBottles);
  },

  createMemorial: (data) => {
    const now = nowISO();
    const newMemorial: Memorial = {
      ...defaultMemorial,
      ...data,
      id: data.id || generateId(),
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({ memorials: [newMemorial, ...state.memorials] }));
    get().saveMemorials();
    return newMemorial;
  },

  updateMemorial: (id, data) => {
    set((state) => ({
      memorials: state.memorials.map((m) =>
        m.id === id ? { ...m, ...data, updatedAt: nowISO() } : m
      ),
    }));
    get().saveMemorials();
  },

  deleteMemorial: (id) => {
    set((state) => ({
      memorials: state.memorials.filter((m) => m.id !== id),
      familyRelations: state.familyRelations.filter(
        (r) => r.fromMemorialId !== id && r.toMemorialId !== id
      ),
    }));
    get().saveMemorials();
    get().saveFamilyRelations();
  },

  getMemorial: (id) => get().memorials.find((m) => m.id === id),

  addPhoto: (memorialId, photo, collaboratorId, collaboratorName) => {
    set((state) => ({
      memorials: mapParentById(state.memorials, memorialId, (m) =>
        addNestedItemWithOrder<Memorial, Photo>(m, "photos", photo)
      ),
    }));
    get().saveMemorials();
    if (collaboratorId && collaboratorName) {
      get().addContribution(memorialId, collaboratorId, collaboratorName, "photo", "上传了照片");
    }
  },

  removePhoto: (memorialId, photoId) => {
    set((state) => ({
      memorials: mapParentById(state.memorials, memorialId, (m) =>
        removeNestedItem<Memorial>(m, "photos", photoId)
      ),
    }));
    get().saveMemorials();
  },

  addMessage: (memorialId, message) => {
    set((state) => ({
      memorials: mapParentById(state.memorials, memorialId, (m) =>
        addNestedItemToFront<Memorial, Message>(m, "messages", message)
      ),
    }));
    get().saveMemorials();
  },

  addFlower: (memorialId, flower) => {
    set((state) => ({
      memorials: mapParentById(state.memorials, memorialId, (m) =>
        addNestedItem<Memorial, Flower>(m, "flowers", flower)
      ),
    }));
    get().saveMemorials();
  },

  addCandle: (memorialId, candle) => {
    set((state) => ({
      memorials: mapParentById(state.memorials, memorialId, (m) =>
        addNestedItem<Memorial, Candle>(m, "candles", candle)
      ),
    }));
    get().saveMemorials();
  },

  searchMemorials: (query) => {
    const { memorials } = get();
    if (!query.trim()) return memorials;
    const lower = query.toLowerCase();
    return memorials.filter(
      (m) => m.name.toLowerCase().includes(lower) || m.epitaph.toLowerCase().includes(lower)
    );
  },

  resetToSampleData: async () => {
    const sampleMemorials = await getSampleMemorials();
    const sampleRelations = getSampleFamilyRelations();
    set({ memorials: sampleMemorials, familyRelations: sampleRelations, isLoaded: true, driftBottles: [] });
    saveStorage(STORAGE_KEY, sampleMemorials);
    saveStorage(RELATIONS_STORAGE_KEY, sampleRelations);
    saveStorage(DRIFT_BOTTLE_STORAGE_KEY, []);
  },

  addFamilyRelation: (fromId, toId, relation, note) => {
    if (fromId === toId) return null;
    const { familyRelations, memorials } = get();
    const exists = familyRelations.some(
      (r) =>
        (r.fromMemorialId === fromId && r.toMemorialId === toId) ||
        (r.fromMemorialId === toId && r.toMemorialId === fromId)
    );
    if (exists) return null;
    const fromMem = memorials.find((m) => m.id === fromId);
    const toMem = memorials.find((m) => m.id === toId);
    if (!fromMem || !toMem) return null;

    const newRelation: FamilyRelation = {
      id: generateId(),
      fromMemorialId: fromId,
      toMemorialId: toId,
      relation,
      note,
      createdAt: nowISO(),
    };
    set((state) => ({ familyRelations: [...state.familyRelations, newRelation] }));
    get().saveFamilyRelations();
    return newRelation;
  },

  removeFamilyRelation: (relationId) => {
    set((state) => ({
      familyRelations: state.familyRelations.filter((r) => r.id !== relationId)
    }));
    get().saveFamilyRelations();
  },

  getRelationsForMemorial: (memorialId) => {
    const { familyRelations, memorials } = get();
    const result: Array<{ relation: FamilyRelation; otherMemorial: Memorial; label: string }> = [];

    for (const r of familyRelations) {
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
        if (otherMemorial) result.push({ relation: r, otherMemorial, label });
      }
    }
    return result;
  },

  getRelatedMemorials: (memorialId) => {
    const { familyRelations, memorials } = get();
    const relatedIds = new Set<string>();
    for (const r of familyRelations) {
      if (r.fromMemorialId === memorialId) relatedIds.add(r.toMemorialId);
      else if (r.toMemorialId === memorialId) relatedIds.add(r.fromMemorialId);
    }
    return memorials.filter((m) => relatedIds.has(m.id));
  },

  getAllFamilyRelations: () => get().familyRelations,

  setMemorialTheme: (memorialId, theme) => {
    set((state) => ({
      memorials: state.memorials.map((m) =>
        m.id === memorialId ? { ...m, theme, updatedAt: nowISO() } : m
      ),
    }));
    get().saveMemorials();
  },

  createInviteLink: (memorialId, createdBy, maxUses = 10, validDays = 30) => {
    const token = generateId() + generateId().substring(0, 8);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + validDays * 24 * 60 * 60 * 1000).toISOString();

    const newInvite: InviteLink = {
      id: generateId(),
      memorialId,
      token,
      createdBy,
      createdAt: now.toISOString(),
      expiresAt,
      maxUses,
      usedCount: 0,
      isActive: true,
    };

    set((state) => ({
      memorials: mapParentById(state.memorials, memorialId, (m) =>
        addNestedItemRaw<Memorial, InviteLink>(m, "inviteLinks", newInvite)
      ),
    }));
    get().saveMemorials();
    return newInvite;
  },

  getInviteLinkByToken: (token) => {
    const { memorials } = get();
    for (const m of memorials) {
      const invite = (m.inviteLinks || []).find((i) => i.token === token);
      if (invite) return invite;
    }
    return null;
  },

  joinMemorialByInvite: (token, name, relation) => {
    const { memorials, getInviteLinkByToken } = get();
    const invite = getInviteLinkByToken(token);
    if (!invite) return { success: false, message: "邀请链接无效" };
    if (!invite.isActive) return { success: false, message: "邀请链接已失效" };
    if (new Date(invite.expiresAt) < new Date()) return { success: false, message: "邀请链接已过期" };
    if (invite.usedCount >= invite.maxUses) return { success: false, message: "邀请链接已达使用上限" };

    const memorial = memorials.find((m) => m.id === invite.memorialId);
    if (!memorial) return { success: false, message: "纪念页不存在" };

    const collaborator = get().addCollaborator(invite.memorialId, name, relation);
    if (!collaborator) return { success: false, message: "加入失败，请重试" };

    set((state) => ({
      memorials: mapParentById(state.memorials, invite.memorialId, (m) =>
        updateNestedItem<Memorial, InviteLink>(m, "inviteLinks", invite.id, {
          usedCount: invite.usedCount + 1,
        } as Partial<InviteLink>)
      ),
    }));
    get().saveMemorials();
    get().setCurrentCollaborator(collaborator.id);
    return { success: true, memorial, collaborator, message: "成功加入纪念页协作" };
  },

  addCollaborator: (memorialId, name, relation) => {
    const now = nowISO();
    const newCollaborator: Collaborator = {
      id: generateId(),
      name,
      relation,
      joinedAt: now,
      lastActiveAt: now,
    };
    set((state) => ({
      memorials: mapParentById(state.memorials, memorialId, (m) =>
        addNestedItemRaw<Memorial, Collaborator>(m, "collaborators", newCollaborator)
      ),
    }));
    get().saveMemorials();
    return newCollaborator;
  },

  removeCollaborator: (memorialId, collaboratorId) => {
    set((state) => ({
      memorials: mapParentById(state.memorials, memorialId, (m) =>
        removeNestedItem<Memorial>(m, "collaborators", collaboratorId)
      ),
    }));
    get().saveMemorials();
  },

  getCollaborators: (memorialId) => get().getMemorial(memorialId)?.collaborators || [],

  addContribution: (memorialId, collaboratorId, collaboratorName, type, summary, detail) => {
    const now = nowISO();
    const newContribution: Contribution = {
      id: generateId(),
      memorialId,
      collaboratorId,
      collaboratorName,
      type,
      summary,
      detail,
      createdAt: now,
    };
    set((state) => ({
      memorials: mapParentById(state.memorials, memorialId, (m) =>
        addNestedItemRawToFront<Memorial, Contribution>(m, "contributions", newContribution)
      ),
    }));
    get().saveMemorials();
    get().updateCollaboratorLastActive(memorialId, collaboratorId);
  },

  getContributions: (memorialId) => get().getMemorial(memorialId)?.contributions || [],

  setCurrentCollaborator: (collaboratorId) => {
    if (collaboratorId) localStorage.setItem(COLLABORATOR_STORAGE_KEY, collaboratorId);
    else localStorage.removeItem(COLLABORATOR_STORAGE_KEY);
    set({ currentCollaboratorId: collaboratorId });
  },

  updateCollaboratorLastActive: (memorialId, collaboratorId) => {
    const now = nowISO();
    set((state) => ({
      memorials: mapParentById(state.memorials, memorialId, (m) =>
        updateNestedItem<Memorial, Collaborator>(m, "collaborators", collaboratorId, {
          lastActiveAt: now,
        } as Partial<Collaborator>)
      ),
    }));
  },

  sendDriftBottle: (fromMemorialId, content) => {
    const { memorials } = get();
    const fromMemorial = memorials.find((m) => m.id === fromMemorialId);
    if (!fromMemorial) return null;
    const publicMemorials = memorials.filter((m) => !m.isPrivate && m.id !== fromMemorialId);
    if (publicMemorials.length === 0) return null;
    const targetMemorial = publicMemorials[Math.floor(Math.random() * publicMemorials.length)];
    const bottle: DriftBottle = {
      id: generateId(),
      content,
      fromMemorialId,
      fromMemorialName: fromMemorial.name,
      toMemorialId: targetMemorial.id,
      createdAt: nowISO(),
      isRead: false,
    };
    set((state) => ({ driftBottles: [...state.driftBottles, bottle] }));
    get().saveDriftBottles();
    return bottle;
  },

  getDriftBottlesForMemorial: (memorialId) =>
    get().driftBottles.filter((b) => b.toMemorialId === memorialId),

  markDriftBottleRead: (bottleId) => {
    set((state) => ({
      driftBottles: state.driftBottles.map((b) =>
        b.id === bottleId ? { ...b, isRead: true } : b
      ),
    }));
    get().saveDriftBottles();
  },

  getUnreadDriftBottleCount: (memorialId) =>
    get().driftBottles.filter((b) => b.toMemorialId === memorialId && !b.isRead).length,
}));
