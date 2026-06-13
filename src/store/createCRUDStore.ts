import { create } from "zustand";
import { generateId } from "@/utils";

export interface EntityWithId {
  id: string;
}

export interface EntityWithTimestamps extends EntityWithId {
  createdAt: string;
  updatedAt: string;
}

export interface EntityWithCreatedAt extends EntityWithId {
  createdAt: string;
}

export interface CRUDStoreOptions<T extends EntityWithId> {
  storageKey: string;
  defaultData?: T[];
  sampleData?: () => T[] | Promise<T[]>;
  migrate?: (data: T[]) => T[] | Promise<T[]>;
}

export interface CRUDStoreState<T extends EntityWithId> {
  items: T[];
  isLoaded: boolean;
  load: () => void;
  save: () => void;
  create: (data: Partial<T>) => T;
  update: (id: string, data: Partial<T>) => void;
  remove: (id: string) => void;
  getById: (id: string) => T | undefined;
  getAll: () => T[];
  resetToSample: () => Promise<void>;
}

function loadFromStorage<T>(storageKey: string): T[] | null {
  try {
    const stored = localStorage.getItem(storageKey);
    return stored ? (JSON.parse(stored) as T[]) : null;
  } catch (error) {
    console.error(`Failed to load from storage [${storageKey}]:`, error);
    return null;
  }
}

function saveToStorage<T>(storageKey: string, data: T[]): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to save to storage [${storageKey}]:`, error);
  }
}

function hasKey(obj: unknown, key: string): boolean {
  return typeof obj === "object" && obj !== null && key in obj;
}

export function createCRUDStore<T extends EntityWithId>(
  options: CRUDStoreOptions<T>
) {
  const { storageKey, defaultData = [], sampleData, migrate } = options;

  return create<CRUDStoreState<T>>((set, get) => ({
    items: defaultData,
    isLoaded: false,

    load: () => {
      (async () => {
        try {
          const stored = loadFromStorage<T>(storageKey);
          if (stored) {
            const migrated = migrate ? await migrate(stored) : stored;
            set({ items: migrated as T[], isLoaded: true });
            if (JSON.stringify(migrated) !== JSON.stringify(stored)) {
              saveToStorage(storageKey, migrated as T[]);
            }
          } else if (sampleData) {
            const initial = await sampleData();
            set({ items: initial as T[], isLoaded: true });
            saveToStorage(storageKey, initial as T[]);
          } else {
            set({ isLoaded: true });
          }
        } catch (error) {
          console.error(`Failed to load store [${storageKey}]:`, error);
          set({ isLoaded: true });
        }
      })();
    },

    save: () => {
      saveToStorage(storageKey, get().items);
    },

    create: (data) => {
      const now = new Date().toISOString();
      const base: Record<string, unknown> = {
        ...data,
        id: (data as Partial<T>).id || generateId(),
      };
      const dataRecord = data as Record<string, unknown>;
      if (hasKey(dataRecord, "createdAt") && !dataRecord.createdAt) {
        base.createdAt = now;
      } else if (!hasKey(dataRecord, "createdAt")) {
        base.createdAt = now;
      }
      if (!hasKey(dataRecord, "updatedAt") && hasKey(defaultData[0] ?? {}, "updatedAt")) {
        base.updatedAt = now;
      }
      const newItem = base as T;

      set((state) => ({
        items: [newItem, ...state.items],
      }));
      get().save();
      return newItem;
    },

    update: (id, data) => {
      set((state) => ({
        items: state.items.map((item) => {
          if (item.id !== id) return item;
          const merged: Record<string, unknown> = { ...item, ...data };
          if (hasKey(item, "updatedAt")) {
            merged.updatedAt = new Date().toISOString();
          }
          return merged as T;
        }),
      }));
      get().save();
    },

    remove: (id) => {
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
      }));
      get().save();
    },

    getById: (id) => {
      return get().items.find((item) => item.id === id);
    },

    getAll: () => {
      return get().items;
    },

    resetToSample: async () => {
      if (sampleData) {
        const initial = await sampleData();
        set({ items: initial as T[], isLoaded: true });
        saveToStorage(storageKey, initial as T[]);
      }
    },
  }));
}
