import { create } from "zustand";
import type { Memorial, Photo, Message, Flower, Candle, FamilyRelation, RelationType, VisualTheme, BiographyDisplayMode, Collaborator, Contribution, InviteLink, ContributionType, DriftBottle } from "@/types";
import { RELATION_LABELS, INVERSE_RELATIONS } from "@/types";
import { generateId, hashPassword } from "@/utils";

interface MemorialState {
  memorials: Memorial[];
  familyRelations: FamilyRelation[];
  currentCollaboratorId: string | null;
  isLoaded: boolean;
  loadMemorials: () => void;
  saveMemorials: () => void;
  loadFamilyRelations: () => void;
  saveFamilyRelations: () => void;
  createMemorial: (data: Partial<Memorial>) => Memorial;
  updateMemorial: (id: string, data: Partial<Memorial>) => void;
  deleteMemorial: (id: string) => void;
  getMemorial: (id: string) => Memorial | undefined;
  addPhoto: (memorialId: string, photo: Omit<Photo, "id" | "order">, collaboratorId?: string, collaboratorName?: string) => void;
  removePhoto: (memorialId: string, photoId: string) => void;
  addMessage: (memorialId: string, message: Omit<Message, "id" | "createdAt">) => void;
  addFlower: (memorialId: string, flower: Omit<Flower, "id" | "createdAt">) => void;
  addCandle: (memorialId: string, candle: Omit<Candle, "id" | "createdAt">) => void;
  searchMemorials: (query: string) => Memorial[];
  resetToSampleData: () => Promise<void>;
  addFamilyRelation: (fromId: string, toId: string, relation: RelationType, note?: string) => FamilyRelation | null;
  removeFamilyRelation: (relationId: string) => void;
  getRelationsForMemorial: (memorialId: string) => Array<{ relation: FamilyRelation; otherMemorial: Memorial; label: string }>;
  getRelatedMemorials: (memorialId: string) => Memorial[];
  getAllFamilyRelations: () => FamilyRelation[];
  setMemorialTheme: (memorialId: string, theme: VisualTheme) => void;
  createInviteLink: (memorialId: string, createdBy: string, maxUses?: number, validDays?: number) => InviteLink;
  getInviteLinkByToken: (token: string) => InviteLink | null;
  joinMemorialByInvite: (token: string, name: string, relation: string) => { success: boolean; memorial?: Memorial; collaborator?: Collaborator; message: string };
  addCollaborator: (memorialId: string, name: string, relation: string) => Collaborator | null;
  removeCollaborator: (memorialId: string, collaboratorId: string) => void;
  getCollaborators: (memorialId: string) => Collaborator[];
  addContribution: (memorialId: string, collaboratorId: string, collaboratorName: string, type: ContributionType, summary: string, detail?: string) => void;
  getContributions: (memorialId: string) => Contribution[];
  setCurrentCollaborator: (collaboratorId: string | null) => void;
  updateCollaboratorLastActive: (memorialId: string, collaboratorId: string) => void;
  driftBottles: DriftBottle[];
  loadDriftBottles: () => void;
  saveDriftBottles: () => void;
  sendDriftBottle: (fromMemorialId: string, content: string) => DriftBottle | null;
  getDriftBottlesForMemorial: (memorialId: string) => DriftBottle[];
  markDriftBottleRead: (bottleId: string) => void;
  getUnreadDriftBottleCount: (memorialId: string) => number;
}

const STORAGE_KEY = "memorial_memorials";
const RELATIONS_STORAGE_KEY = "memorial_family_relations";

const defaultMemorial: Omit<Memorial, "id" | "createdAt" | "updatedAt"> = {
  name: "",
  gender: "unknown",
  birthDate: "",
  deathDate: "",
  avatar: "",
  epitaph: "",
  biography: "",
  biographyDisplayMode: "text",
  photos: [],
  messages: [],
  flowers: [],
  candles: [],
  isPrivate: false,
  password: "",
  adminPassword: "",
  reminderEnabled: false,
  reminderDays: 7,
  theme: "default",
  collaborators: [],
  contributions: [],
  inviteLinks: [],
};

const COLLABORATOR_STORAGE_KEY = "memorial_current_collaborator";
const DRIFT_BOTTLE_STORAGE_KEY = "memorial_drift_bottles";

export const useMemorialStore = create<MemorialState>((set, get) => ({
  memorials: [],
  familyRelations: [],
  currentCollaboratorId: localStorage.getItem(COLLABORATOR_STORAGE_KEY),
  driftBottles: [],
  isLoaded: false,

  loadMemorials: () => {
    (async () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          const migrated = await migrateMemorials(parsed);
          set({ memorials: migrated, isLoaded: true });
          if (JSON.stringify(migrated) !== JSON.stringify(parsed)) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
          }
        } else {
          const sampleData = await getSampleMemorials();
          set({ memorials: sampleData, isLoaded: true });
          localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleData));
        }
      } catch (error) {
        console.error("Failed to load memorials:", error);
        set({ isLoaded: true });
      }
    })();
  },

  loadFamilyRelations: () => {
    try {
      const stored = localStorage.getItem(RELATIONS_STORAGE_KEY);
      if (stored) {
        set({ familyRelations: JSON.parse(stored) });
      } else {
        const sampleRelations = getSampleFamilyRelations();
        set({ familyRelations: sampleRelations });
        localStorage.setItem(RELATIONS_STORAGE_KEY, JSON.stringify(sampleRelations));
      }
    } catch (error) {
      console.error("Failed to load family relations:", error);
    }
  },

  saveFamilyRelations: () => {
    try {
      const { familyRelations } = get();
      localStorage.setItem(RELATIONS_STORAGE_KEY, JSON.stringify(familyRelations));
    } catch (error) {
      console.error("Failed to save family relations:", error);
    }
  },

  resetToSampleData: async () => {
    const sampleData = await getSampleMemorials();
    const sampleRelations = getSampleFamilyRelations();
    set({ memorials: sampleData, familyRelations: sampleRelations, isLoaded: true });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleData));
    localStorage.setItem(RELATIONS_STORAGE_KEY, JSON.stringify(sampleRelations));
  },

  saveMemorials: () => {
    try {
      const { memorials } = get();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memorials));
    } catch (error) {
      console.error("Failed to save memorials:", error);
    }
  },

  createMemorial: (data) => {
    const now = new Date().toISOString();
    const newMemorial: Memorial = {
      ...defaultMemorial,
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };

    set((state) => ({
      memorials: [newMemorial, ...state.memorials],
    }));

    get().saveMemorials();
    return newMemorial;
  },

  updateMemorial: (id, data) => {
    set((state) => ({
      memorials: state.memorials.map((m) =>
        m.id === id ? { ...m, ...data, updatedAt: new Date().toISOString() } : m
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

  getMemorial: (id) => {
    return get().memorials.find((m) => m.id === id);
  },

  addPhoto: (memorialId, photo, collaboratorId, collaboratorName) => {
    set((state) => ({
      memorials: state.memorials.map((m) => {
        if (m.id !== memorialId) return m;
        const newPhoto: Photo = {
          ...photo,
          id: generateId(),
          order: m.photos.length,
        };
        return {
          ...m,
          photos: [...m.photos, newPhoto],
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
    get().saveMemorials();
    if (collaboratorId && collaboratorName) {
      get().addContribution(memorialId, collaboratorId, collaboratorName, "photo", "上传了照片");
    }
  },

  removePhoto: (memorialId, photoId) => {
    set((state) => ({
      memorials: state.memorials.map((m) => {
        if (m.id !== memorialId) return m;
        return {
          ...m,
          photos: m.photos.filter((p) => p.id !== photoId),
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
    get().saveMemorials();
  },

  addMessage: (memorialId, message) => {
    set((state) => ({
      memorials: state.memorials.map((m) => {
        if (m.id !== memorialId) return m;
        const newMessage: Message = {
          ...message,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        return {
          ...m,
          messages: [newMessage, ...m.messages],
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
    get().saveMemorials();
  },

  addFlower: (memorialId, flower) => {
    set((state) => ({
      memorials: state.memorials.map((m) => {
        if (m.id !== memorialId) return m;
        const newFlower: Flower = {
          ...flower,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        return {
          ...m,
          flowers: [...m.flowers, newFlower],
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
    get().saveMemorials();
  },

  addCandle: (memorialId, candle) => {
    set((state) => ({
      memorials: state.memorials.map((m) => {
        if (m.id !== memorialId) return m;
        const newCandle: Candle = {
          ...candle,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        return {
          ...m,
          candles: [...m.candles, newCandle],
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
    get().saveMemorials();
  },

  searchMemorials: (query) => {
    const { memorials } = get();
    if (!query.trim()) return memorials;
    const lowerQuery = query.toLowerCase();
    return memorials.filter(
      (m) =>
        m.name.toLowerCase().includes(lowerQuery) ||
        m.epitaph.toLowerCase().includes(lowerQuery)
    );
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

    const fromMemorial = memorials.find((m) => m.id === fromId);
    const toMemorial = memorials.find((m) => m.id === toId);
    if (!fromMemorial || !toMemorial) return null;

    const newRelation: FamilyRelation = {
      id: generateId(),
      fromMemorialId: fromId,
      toMemorialId: toId,
      relation,
      note,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      familyRelations: [...state.familyRelations, newRelation],
    }));
    get().saveFamilyRelations();
    return newRelation;
  },

  removeFamilyRelation: (relationId) => {
    set((state) => ({
      familyRelations: state.familyRelations.filter((r) => r.id !== relationId),
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
        if (otherMemorial) {
          result.push({ relation: r, otherMemorial, label });
        }
      }
    }

    return result;
  },

  getRelatedMemorials: (memorialId) => {
    const { familyRelations, memorials } = get();
    const relatedIds = new Set<string>();

    for (const r of familyRelations) {
      if (r.fromMemorialId === memorialId) {
        relatedIds.add(r.toMemorialId);
      } else if (r.toMemorialId === memorialId) {
        relatedIds.add(r.fromMemorialId);
      }
    }

    return memorials.filter((m) => relatedIds.has(m.id));
  },

  getAllFamilyRelations: () => {
    return get().familyRelations;
  },

  setMemorialTheme: (memorialId, theme) => {
    set((state) => ({
      memorials: state.memorials.map((m) =>
        m.id === memorialId ? { ...m, theme, updatedAt: new Date().toISOString() } : m
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
      memorials: state.memorials.map((m) =>
        m.id === memorialId
          ? { ...m, inviteLinks: [...(m.inviteLinks || []), newInvite], updatedAt: now.toISOString() }
          : m
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

    if (!invite) {
      return { success: false, message: "邀请链接无效" };
    }

    if (!invite.isActive) {
      return { success: false, message: "邀请链接已失效" };
    }

    if (new Date(invite.expiresAt) < new Date()) {
      return { success: false, message: "邀请链接已过期" };
    }

    if (invite.usedCount >= invite.maxUses) {
      return { success: false, message: "邀请链接已达使用上限" };
    }

    const memorial = memorials.find((m) => m.id === invite.memorialId);
    if (!memorial) {
      return { success: false, message: "纪念页不存在" };
    }

    const collaborator = get().addCollaborator(invite.memorialId, name, relation);
    if (!collaborator) {
      return { success: false, message: "加入失败，请重试" };
    }

    set((state) => ({
      memorials: state.memorials.map((m) =>
        m.id === invite.memorialId
          ? {
              ...m,
              inviteLinks: (m.inviteLinks || []).map((i) =>
                i.id === invite.id ? { ...i, usedCount: i.usedCount + 1 } : i
              ),
            }
          : m
      ),
    }));
    get().saveMemorials();
    get().setCurrentCollaborator(collaborator.id);

    return { success: true, memorial, collaborator, message: "成功加入纪念页协作" };
  },

  addCollaborator: (memorialId, name, relation) => {
    const now = new Date().toISOString();
    const newCollaborator: Collaborator = {
      id: generateId(),
      name,
      relation,
      joinedAt: now,
      lastActiveAt: now,
    };

    set((state) => ({
      memorials: state.memorials.map((m) =>
        m.id === memorialId
          ? {
              ...m,
              collaborators: [...(m.collaborators || []), newCollaborator],
              updatedAt: now,
            }
          : m
      ),
    }));
    get().saveMemorials();
    return newCollaborator;
  },

  removeCollaborator: (memorialId, collaboratorId) => {
    set((state) => ({
      memorials: state.memorials.map((m) =>
        m.id === memorialId
          ? {
              ...m,
              collaborators: (m.collaborators || []).filter((c) => c.id !== collaboratorId),
              updatedAt: new Date().toISOString(),
            }
          : m
      ),
    }));
    get().saveMemorials();
  },

  getCollaborators: (memorialId) => {
    const memorial = get().getMemorial(memorialId);
    return memorial?.collaborators || [];
  },

  addContribution: (memorialId, collaboratorId, collaboratorName, type, summary, detail) => {
    const now = new Date().toISOString();
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
      memorials: state.memorials.map((m) =>
        m.id === memorialId
          ? {
              ...m,
              contributions: [newContribution, ...(m.contributions || [])],
              updatedAt: now,
            }
          : m
      ),
    }));
    get().saveMemorials();
    get().updateCollaboratorLastActive(memorialId, collaboratorId);
  },

  getContributions: (memorialId) => {
    const memorial = get().getMemorial(memorialId);
    return memorial?.contributions || [];
  },

  setCurrentCollaborator: (collaboratorId) => {
    if (collaboratorId) {
      localStorage.setItem(COLLABORATOR_STORAGE_KEY, collaboratorId);
    } else {
      localStorage.removeItem(COLLABORATOR_STORAGE_KEY);
    }
    set({ currentCollaboratorId: collaboratorId });
  },

  updateCollaboratorLastActive: (memorialId, collaboratorId) => {
    const now = new Date().toISOString();
    set((state) => ({
      memorials: state.memorials.map((m) =>
        m.id === memorialId
          ? {
              ...m,
              collaborators: (m.collaborators || []).map((c) =>
                c.id === collaboratorId ? { ...c, lastActiveAt: now } : c
              ),
            }
          : m
      ),
    }));
  },

  loadDriftBottles: () => {
    try {
      const stored = localStorage.getItem(DRIFT_BOTTLE_STORAGE_KEY);
      if (stored) {
        set({ driftBottles: JSON.parse(stored) });
      }
    } catch (error) {
      console.error("Failed to load drift bottles:", error);
    }
  },

  saveDriftBottles: () => {
    try {
      const { driftBottles } = get();
      localStorage.setItem(DRIFT_BOTTLE_STORAGE_KEY, JSON.stringify(driftBottles));
    } catch (error) {
      console.error("Failed to save drift bottles:", error);
    }
  },

  sendDriftBottle: (fromMemorialId, content) => {
    const { memorials } = get();
    const fromMemorial = memorials.find((m) => m.id === fromMemorialId);
    if (!fromMemorial) return null;

    const publicMemorials = memorials.filter(
      (m) => !m.isPrivate && m.id !== fromMemorialId
    );
    if (publicMemorials.length === 0) return null;

    const targetMemorial =
      publicMemorials[Math.floor(Math.random() * publicMemorials.length)];

    const bottle: DriftBottle = {
      id: generateId(),
      content,
      fromMemorialId,
      fromMemorialName: fromMemorial.name,
      toMemorialId: targetMemorial.id,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    set((state) => ({
      driftBottles: [...state.driftBottles, bottle],
    }));
    get().saveDriftBottles();
    return bottle;
  },

  getDriftBottlesForMemorial: (memorialId) => {
    return get().driftBottles.filter((b) => b.toMemorialId === memorialId);
  },

  markDriftBottleRead: (bottleId) => {
    set((state) => ({
      driftBottles: state.driftBottles.map((b) =>
        b.id === bottleId ? { ...b, isRead: true } : b
      ),
    }));
    get().saveDriftBottles();
  },

  getUnreadDriftBottleCount: (memorialId) => {
    return get().driftBottles.filter(
      (b) => b.toMemorialId === memorialId && !b.isRead
    ).length;
  },
}));

function getSampleMemorials(): Promise<Memorial[]> {
  return new Promise(async (resolve) => {
    const now = new Date();
    const sample1Date = new Date(now.getTime() - 86400000 * 30);
    const sample2Date = new Date(now.getTime() - 86400000 * 60);
    const privatePassword = await hashPassword("123456");

    resolve([
      {
        id: "sample-001",
        name: "张敬山",
        gender: "male",
        birthDate: "1945-03-15",
        deathDate: "2023-11-20",
        avatar: "",
        epitaph: "一生勤劳善良，永远怀念您",
        biographyDisplayMode: "timeline",
        biography:
          "1945年3月15日，张敬山同志生于山东济南一个普通的工人家庭。\n\n青年时期，他以优异成绩考入师范学院，毕业后投身教育事业，执教四十余载，桃李满天下。\n\n中年时期，他担任学校校长职务，带领学校获得多项省市级荣誉，为人正直善良，待人宽厚，是晚辈们的榜样。\n\n退休后仍热心社区公益，积极参与关心下一代工作，深受邻里尊敬和爱戴。\n\n2023年11月20日因病医治无效逝世，享年78岁。音容宛在，风范长存。",
        photos: [],
        messages: [
          {
            id: "msg-1",
            content: "爷爷，孙女想您了。您在那边还好吗？",
            author: "小明",
            createdAt: sample1Date.toISOString(),
          },
          {
            id: "msg-2",
            content: "张老师，您的学生来看您了。感谢您当年的教诲。",
            author: "您的学生",
            createdAt: new Date(sample1Date.getTime() + 86400000).toISOString(),
          },
        ],
        flowers: [
          { id: "f1", type: "chrysanthemum", message: "爷爷一路走好", createdAt: sample1Date.toISOString() },
          { id: "f2", type: "lily", message: "永远怀念您", createdAt: sample1Date.toISOString() },
          { id: "f3", type: "rose", message: "爱您的孙女敬上", createdAt: sample1Date.toISOString() },
        ],
        candles: [
          { id: "c1", message: "愿您在天堂安息", createdAt: sample1Date.toISOString() },
          { id: "c2", message: "照亮回家的路", createdAt: sample1Date.toISOString() },
        ],
        isPrivate: false,
        password: "",
        adminPassword: "",
        reminderEnabled: true,
        reminderDays: 7,
        theme: "default",
        collaborators: [
          {
            id: "col-001",
            name: "张小明",
            relation: "孙子",
            joinedAt: sample1Date.toISOString(),
            lastActiveAt: sample1Date.toISOString(),
          },
          {
            id: "col-002",
            name: "张小红",
            relation: "孙女",
            joinedAt: new Date(sample1Date.getTime() + 86400000).toISOString(),
            lastActiveAt: new Date(sample1Date.getTime() + 86400000 * 2).toISOString(),
          },
        ],
        contributions: [
          {
            id: "ctr-001",
            memorialId: "sample-001",
            collaboratorId: "col-001",
            collaboratorName: "张小明",
            type: "biography",
            summary: "补充了爷爷的生平事迹",
            detail: "添加了爷爷退休后参与社区公益工作的详细描述",
            createdAt: sample1Date.toISOString(),
          },
          {
            id: "ctr-002",
            memorialId: "sample-001",
            collaboratorId: "col-002",
            collaboratorName: "张小红",
            type: "message",
            summary: "发表了追思留言",
            createdAt: new Date(sample1Date.getTime() + 86400000).toISOString(),
          },
        ],
        inviteLinks: [],
        createdAt: sample1Date.toISOString(),
        updatedAt: sample1Date.toISOString(),
      },
      {
        id: "sample-002",
        name: "李秀英",
        gender: "female",
        birthDate: "1952-08-08",
        deathDate: "2024-05-12",
        avatar: "",
        epitaph: "慈母手中线，游子身上衣",
        biographyDisplayMode: "text",
        biography:
          "李秀英，1952年8月8日出生于江苏苏州。\n\n一位普通而伟大的母亲，一生勤俭持家，含辛茹苦将三个子女抚养成人。她的慈爱与温暖是每个孩子心中最柔软的港湾。\n\n她热爱生活，喜欢养花、烹饪，家里总是收拾得井井有条，充满温馨。\n\n2024年5月12日安详离世，享年72岁。\n\n妈妈，我们永远爱您。",
        photos: [],
        messages: [
          {
            id: "msg-3",
            content: "妈妈，今天是您的生日，我们都很想您。",
            author: "大女儿",
            createdAt: sample2Date.toISOString(),
          },
        ],
        flowers: [
          { id: "f4", type: "carnation", message: "妈妈，我们永远爱您", createdAt: sample2Date.toISOString() },
          { id: "f5", type: "lily", message: "愿您在天堂安好", createdAt: sample2Date.toISOString() },
          { id: "f6", type: "chrysanthemum", message: "您的孩子敬上", createdAt: sample2Date.toISOString() },
          { id: "f7", type: "sunflower", message: "像阳光一样温暖的您", createdAt: sample2Date.toISOString() },
          { id: "f8", type: "tulip", message: "永远怀念", createdAt: sample2Date.toISOString() },
        ],
        candles: [
          { id: "c3", message: "妈妈，想您了", createdAt: sample2Date.toISOString() },
          { id: "c4", message: "点亮心灯照亮归途", createdAt: sample2Date.toISOString() },
          { id: "c5", message: "愿您安息", createdAt: sample2Date.toISOString() },
        ],
        isPrivate: false,
        password: "",
        adminPassword: "",
        reminderEnabled: true,
        reminderDays: 3,
        theme: "sakura",
        collaborators: [],
        contributions: [],
        inviteLinks: [],
        createdAt: sample2Date.toISOString(),
        updatedAt: sample2Date.toISOString(),
      },
      {
        id: "sample-003",
        name: "王老先生",
        gender: "male",
        birthDate: "1938-12-25",
        deathDate: "2022-12-25",
        avatar: "",
        epitaph: "私密纪念，深情珍藏",
        biographyDisplayMode: "text",
        biography: "这是一个私密纪念页示例，输入密码 123456 即可查看。",
        photos: [],
        messages: [
          {
            id: "msg-4",
            content: "爸爸，我们永远怀念您。",
            author: "家人",
            createdAt: new Date(sample2Date.getTime() - 86400000 * 10).toISOString(),
          },
        ],
        flowers: [
          { id: "f9", type: "chrysanthemum", message: "", createdAt: sample2Date.toISOString() },
          { id: "f10", type: "lily", message: "", createdAt: sample2Date.toISOString() },
        ],
        candles: [
          { id: "c6", message: "", createdAt: sample2Date.toISOString() },
        ],
        isPrivate: true,
        password: privatePassword,
        adminPassword: privatePassword,
        reminderEnabled: false,
        reminderDays: 7,
        theme: "starry",
        collaborators: [],
        contributions: [],
        inviteLinks: [],
        createdAt: new Date(sample2Date.getTime() - 86400000 * 30).toISOString(),
        updatedAt: new Date(sample2Date.getTime() - 86400000 * 30).toISOString(),
      },
    ]);
  });
}

async function migrateMemorials(memorials: Memorial[]): Promise<Memorial[]> {
  return memorials.map((m) => ({
    ...m,
    adminPassword: m.adminPassword ?? "",
    gender: m.gender ?? "unknown",
    theme: (m.theme as VisualTheme) ?? "default",
    biographyDisplayMode: (m.biographyDisplayMode as BiographyDisplayMode) ?? "text",
    collaborators: m.collaborators ?? [],
    contributions: m.contributions ?? [],
    inviteLinks: m.inviteLinks ?? [],
  }));
}

function getSampleFamilyRelations(): FamilyRelation[] {
  const now = new Date().toISOString();
  return [
    {
      id: "rel-001",
      fromMemorialId: "sample-001",
      toMemorialId: "sample-002",
      relation: "spouse",
      note: "夫妻",
      createdAt: now,
    },
    {
      id: "rel-002",
      fromMemorialId: "sample-001",
      toMemorialId: "sample-003",
      relation: "father",
      note: "父子",
      createdAt: now,
    },
  ];
}
