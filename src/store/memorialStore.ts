import { create } from "zustand";
import type { Memorial, Photo, Message, Flower, Candle } from "@/types";
import { generateId, hashPassword } from "@/utils";

interface MemorialState {
  memorials: Memorial[];
  isLoaded: boolean;
  loadMemorials: () => void;
  saveMemorials: () => void;
  createMemorial: (data: Partial<Memorial>) => Memorial;
  updateMemorial: (id: string, data: Partial<Memorial>) => void;
  deleteMemorial: (id: string) => void;
  getMemorial: (id: string) => Memorial | undefined;
  addPhoto: (memorialId: string, photo: Omit<Photo, "id" | "order">) => void;
  removePhoto: (memorialId: string, photoId: string) => void;
  addMessage: (memorialId: string, message: Omit<Message, "id" | "createdAt">) => void;
  addFlower: (memorialId: string, flower: Omit<Flower, "id" | "createdAt">) => void;
  addCandle: (memorialId: string, candle: Omit<Candle, "id" | "createdAt">) => void;
  searchMemorials: (query: string) => Memorial[];
  resetToSampleData: () => Promise<void>;
}

const STORAGE_KEY = "memorial_memorials";

const defaultMemorial: Omit<Memorial, "id" | "createdAt" | "updatedAt"> = {
  name: "",
  birthDate: "",
  deathDate: "",
  avatar: "",
  epitaph: "",
  biography: "",
  photos: [],
  messages: [],
  flowers: [],
  candles: [],
  isPrivate: false,
  password: "",
  adminPassword: "",
  reminderEnabled: false,
  reminderDays: 7,
};

export const useMemorialStore = create<MemorialState>((set, get) => ({
  memorials: [],
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

  resetToSampleData: async () => {
    const sampleData = await getSampleMemorials();
    set({ memorials: sampleData, isLoaded: true });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleData));
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
    }));
    get().saveMemorials();
  },

  getMemorial: (id) => {
    return get().memorials.find((m) => m.id === id);
  },

  addPhoto: (memorialId, photo) => {
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
        birthDate: "1945-03-15",
        deathDate: "2023-11-20",
        avatar: "",
        epitaph: "一生勤劳善良，永远怀念您",
        biography:
          "张敬山同志，1945年3月15日生于山东济南。\n\n青年时期投身教育事业，执教四十余载，桃李满天下。为人正直善良，待人宽厚，是晚辈们的榜样。\n\n退休后仍热心社区公益，深受邻里尊敬。2023年11月20日因病医治无效逝世，享年78岁。\n\n音容宛在，风范长存。",
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
          { id: "f1", type: "chrysanthemum", message: "", createdAt: sample1Date.toISOString() },
          { id: "f2", type: "lily", message: "", createdAt: sample1Date.toISOString() },
          { id: "f3", type: "rose", message: "", createdAt: sample1Date.toISOString() },
        ],
        candles: [
          { id: "c1", message: "", createdAt: sample1Date.toISOString() },
          { id: "c2", message: "", createdAt: sample1Date.toISOString() },
        ],
        isPrivate: false,
        password: "",
        adminPassword: "",
        reminderEnabled: true,
        reminderDays: 7,
        createdAt: sample1Date.toISOString(),
        updatedAt: sample1Date.toISOString(),
      },
      {
        id: "sample-002",
        name: "李秀英",
        birthDate: "1952-08-08",
        deathDate: "2024-05-12",
        avatar: "",
        epitaph: "慈母手中线，游子身上衣",
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
          { id: "f4", type: "carnation", message: "", createdAt: sample2Date.toISOString() },
          { id: "f5", type: "lily", message: "", createdAt: sample2Date.toISOString() },
          { id: "f6", type: "chrysanthemum", message: "", createdAt: sample2Date.toISOString() },
          { id: "f7", type: "sunflower", message: "", createdAt: sample2Date.toISOString() },
          { id: "f8", type: "tulip", message: "", createdAt: sample2Date.toISOString() },
        ],
        candles: [
          { id: "c3", message: "", createdAt: sample2Date.toISOString() },
          { id: "c4", message: "", createdAt: sample2Date.toISOString() },
          { id: "c5", message: "", createdAt: sample2Date.toISOString() },
        ],
        isPrivate: false,
        password: "",
        adminPassword: "",
        reminderEnabled: true,
        reminderDays: 3,
        createdAt: sample2Date.toISOString(),
        updatedAt: sample2Date.toISOString(),
      },
      {
        id: "sample-003",
        name: "王老先生",
        birthDate: "1938-12-25",
        deathDate: "2022-12-25",
        avatar: "",
        epitaph: "私密纪念，深情珍藏",
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
  }));
}
