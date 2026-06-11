import { create } from "zustand";
import type { Memorial, Photo, Message, Flower, Candle } from "@/types";
import { generateId } from "@/utils";

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
  reminderEnabled: false,
  reminderDays: 7,
};

export const useMemorialStore = create<MemorialState>((set, get) => ({
  memorials: [],
  isLoaded: false,

  loadMemorials: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        set({ memorials: JSON.parse(stored), isLoaded: true });
      } else {
        set({ isLoaded: true });
      }
    } catch (error) {
      console.error("Failed to load memorials:", error);
      set({ isLoaded: true });
    }
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
