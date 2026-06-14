import { vi } from "vitest";

Object.defineProperty(window, "crypto", {
  value: {
    subtle: {
      digest: vi.fn().mockImplementation(async (algorithm: string, data: Uint8Array) => {
        const hash = new Uint8Array(32);
        for (let i = 0; i < Math.min(data.length, 32); i++) {
          hash[i] = data[i] || 0;
        }
        return hash.buffer;
      }),
    },
  },
});

class LocalStorageMock {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }
}

Object.defineProperty(window, "localStorage", {
  value: new LocalStorageMock(),
});

Object.defineProperty(global, "localStorage", {
  value: new LocalStorageMock(),
});

vi.spyOn(console, "error").mockImplementation(() => {});
