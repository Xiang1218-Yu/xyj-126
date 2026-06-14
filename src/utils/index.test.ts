import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  generateId,
  formatDate,
  formatDateShort,
  daysUntilDeathAnniversary,
  calculateAge,
  hashPassword,
  verifyPassword,
  compressImage,
  getFlowerType,
  getFlowerEmoji,
  getFlowerName,
  getFlowerMeaning,
  getFlowerColor,
  getWrapperStyle,
  getWrapperName,
  getFlowerItemsDisplay,
  getTotalFlowerCount,
  parseBiographyToTimeline,
  getCurrentFestival,
} from "./index";
import type { FlowerItem } from "@/types";

describe("generateId", () => {
  it("should generate a string id", () => {
    const id = generateId();
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);
  });

  it("should generate unique ids", () => {
    const ids = new Set<string>();
    for (let i = 0; i < 100; i++) {
      ids.add(generateId());
    }
    expect(ids.size).toBe(100);
  });
});

describe("formatDate", () => {
  it("should format date string to Chinese format", () => {
    expect(formatDate("2024-01-15")).toBe("2024年01月15日");
    expect(formatDate("2023-12-05")).toBe("2023年12月05日");
  });
});

describe("formatDateShort", () => {
  it("should format date string to short format", () => {
    expect(formatDateShort("2024-01-15")).toBe("2024.01.15");
    expect(formatDateShort("2023-12-05")).toBe("2023.12.05");
  });
});

describe("daysUntilDeathAnniversary", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should calculate days until anniversary this year if not passed", () => {
    vi.setSystemTime(new Date("2024-01-01"));
    const days = daysUntilDeathAnniversary("2020-01-15");
    expect(days).toBe(14);
  });

  it("should calculate days until anniversary next year if passed", () => {
    vi.setSystemTime(new Date("2024-02-01"));
    const days = daysUntilDeathAnniversary("2020-01-15");
    expect(days).toBe(349);
  });

  it("should return 0 for today", () => {
    vi.setSystemTime(new Date("2024-01-15"));
    const days = daysUntilDeathAnniversary("2020-01-15");
    expect(days).toBe(0);
  });
});

describe("calculateAge", () => {
  it("should calculate age correctly when death month is after birth month", () => {
    expect(calculateAge("1950-01-15", "2020-06-20")).toBe(70);
  });

  it("should calculate age correctly when death month is before birth month", () => {
    expect(calculateAge("1950-06-15", "2020-01-20")).toBe(69);
  });

  it("should calculate age correctly when same month but death day is before birth day", () => {
    expect(calculateAge("1950-06-20", "2020-06-15")).toBe(69);
  });

  it("should calculate age correctly when same month and day", () => {
    expect(calculateAge("1950-06-15", "2020-06-15")).toBe(70);
  });
});

describe("hashPassword", () => {
  it("should hash password to a hex string", async () => {
    const hash = await hashPassword("test123");
    expect(typeof hash).toBe("string");
    expect(hash.length).toBe(64);
    expect(/^[0-9a-f]+$/.test(hash)).toBe(true);
  });

  it("should produce same hash for same password", async () => {
    const hash1 = await hashPassword("test123");
    const hash2 = await hashPassword("test123");
    expect(hash1).toBe(hash2);
  });

  it("should produce different hash for different password", async () => {
    const hash1 = await hashPassword("test123");
    const hash2 = await hashPassword("test456");
    expect(hash1).not.toBe(hash2);
  });
});

describe("verifyPassword", () => {
  it("should return true for matching password", async () => {
    const hash = await hashPassword("test123");
    const result = await verifyPassword("test123", hash);
    expect(result).toBe(true);
  });

  it("should return false for non-matching password", async () => {
    const hash = await hashPassword("test123");
    const result = await verifyPassword("wrongpass", hash);
    expect(result).toBe(false);
  });
});

describe("compressImage", () => {
  let mockCanvas: any;
  let mockFileReader: any;
  let mockImage: any;

  beforeEach(() => {
    vi.useFakeTimers();
    mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn().mockReturnValue({
        drawImage: vi.fn(),
      }),
      toDataURL: vi.fn().mockReturnValue("data:image/jpeg;base64,mock"),
    };

    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      if (tag === "canvas") {
        return mockCanvas as unknown as HTMLCanvasElement;
      }
      return document.createElement(tag);
    });

    mockFileReader = vi.fn(function(this: any) {
      const reader = {
        result: "data:image/jpeg;base64,test",
        readAsDataURL: vi.fn(() => {
          if (reader.onload) reader.onload({ target: { result: reader.result } });
        }),
        onload: null as any,
        onerror: null as any,
      };
      return reader;
    });

    mockImage = vi.fn(function(this: any) {
      const img = {
        width: 1200,
        height: 800,
        src: "",
        onload: null as any,
        onerror: null as any,
      };
      Object.defineProperty(img, "src", {
        set() {
          if (img.onload) img.onload();
        },
        get() { return ""; },
      });
      return img;
    });

    (globalThis as any).FileReader = mockFileReader;
    (globalThis as any).Image = mockImage;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should compress image and return data URL", async () => {
    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
    const result = await compressImage(file, 800, 0.8);
    expect(result).toBe("data:image/jpeg;base64,mock");
  });

  it("should not resize if image width is less than maxWidth", async () => {
    const mockImageSmall = vi.fn(function(this: any) {
      const img = {
        width: 600,
        height: 400,
        src: "",
        onload: null as any,
        onerror: null as any,
      };
      Object.defineProperty(img, "src", {
        set() {
          if (img.onload) img.onload();
        },
        get() { return ""; },
      });
      return img;
    });
    (globalThis as any).Image = mockImageSmall;

    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
    const result = await compressImage(file, 800, 0.8);
    expect(result).toBe("data:image/jpeg;base64,mock");
  });

  it("should handle canvas context error", async () => {
    mockCanvas.getContext = vi.fn().mockReturnValue(null);

    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
    await expect(compressImage(file)).rejects.toThrow("Canvas context not available");
  });

  it("should handle FileReader error", async () => {
    (globalThis as any).FileReader = vi.fn(function(this: any) {
      const reader = {
        result: "data:image/jpeg;base64,test",
        readAsDataURL: vi.fn(() => {
          if (reader.onerror) reader.onerror(new Error("read error"));
        }),
        onload: null as any,
        onerror: null as any,
      };
      return reader;
    });

    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
    await expect(compressImage(file)).rejects.toThrow("read error");
  });

  it("should handle Image error", async () => {
    (globalThis as any).Image = vi.fn(function(this: any) {
      const img = {
        width: 1200,
        height: 800,
        src: "",
        onload: null as any,
        onerror: null as any,
      };
      Object.defineProperty(img, "src", {
        set() {
          if (img.onerror) img.onerror(new Error("image error"));
        },
        get() { return ""; },
      });
      return img;
    });

    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
    await expect(compressImage(file)).rejects.toThrow("image error");
  });
});

describe("getFlowerType", () => {
  it("should return flower type for valid id", () => {
    const flower = getFlowerType("chrysanthemum");
    expect(flower).toBeDefined();
    expect(flower?.id).toBe("chrysanthemum");
  });

  it("should return undefined for invalid id", () => {
    const flower = getFlowerType("invalid");
    expect(flower).toBeUndefined();
  });
});

describe("getFlowerEmoji", () => {
  it("should return emoji for valid flower type", () => {
    expect(getFlowerEmoji("chrysanthemum")).toBe("🌼");
  });

  it("should return default emoji for invalid flower type", () => {
    expect(getFlowerEmoji("invalid")).toBe("🌸");
  });
});

describe("getFlowerName", () => {
  it("should return name for valid flower type", () => {
    expect(getFlowerName("chrysanthemum")).toBe("菊花");
  });

  it("should return default name for invalid flower type", () => {
    expect(getFlowerName("invalid")).toBe("花");
  });
});

describe("getFlowerMeaning", () => {
  it("should return meaning for valid flower type", () => {
    expect(getFlowerMeaning("chrysanthemum")).toBe("悼念、追思、高洁");
  });

  it("should return empty string for invalid flower type", () => {
    expect(getFlowerMeaning("invalid")).toBe("");
  });
});

describe("getFlowerColor", () => {
  it("should return color for valid flower type", () => {
    expect(getFlowerColor("chrysanthemum")).toBe("#FCD34D");
  });

  it("should return default color for invalid flower type", () => {
    expect(getFlowerColor("invalid")).toBe("#9CA3AF");
  });
});

describe("getWrapperStyle", () => {
  it("should return wrapper style for valid id", () => {
    const wrapper = getWrapperStyle("white");
    expect(wrapper).toBeDefined();
    expect(wrapper?.id).toBe("white");
  });

  it("should return undefined for invalid id", () => {
    const wrapper = getWrapperStyle("invalid");
    expect(wrapper).toBeUndefined();
  });
});

describe("getWrapperName", () => {
  it("should return name for valid wrapper id", () => {
    expect(getWrapperName("white")).toBe("素雅白");
  });

  it("should return default name for invalid wrapper id", () => {
    expect(getWrapperName("invalid")).toBe("素雅白");
  });
});

describe("getFlowerItemsDisplay", () => {
  it("should return empty string for undefined items", () => {
    expect(getFlowerItemsDisplay(undefined)).toBe("");
  });

  it("should return empty string for empty items", () => {
    expect(getFlowerItemsDisplay([])).toBe("");
  });

  it("should format flower items display", () => {
    const items: FlowerItem[] = [
      { type: "chrysanthemum", quantity: 3 },
      { type: "rose", quantity: 2 },
    ];
    expect(getFlowerItemsDisplay(items)).toBe("🌼×3 🌹×2");
  });
});

describe("getTotalFlowerCount", () => {
  it("should return 0 for undefined items", () => {
    expect(getTotalFlowerCount(undefined)).toBe(0);
  });

  it("should return 0 for empty items", () => {
    expect(getTotalFlowerCount([])).toBe(0);
  });

  it("should sum quantities correctly", () => {
    const items: FlowerItem[] = [
      { type: "chrysanthemum", quantity: 3 },
      { type: "rose", quantity: 2 },
    ];
    expect(getTotalFlowerCount(items)).toBe(5);
  });
});

describe("parseBiographyToTimeline", () => {
  it("should return empty array for empty biography", () => {
    const result = parseBiographyToTimeline("", "1950-01-01", "2000-01-01");
    expect(result).toEqual([]);
  });

  it("should parse dates in Chinese format", () => {
    const biography = "1945年3月15日，生于山东济南。\n青年时期，考入师范学院。\n2023年11月20日因病医治无效逝世。";
    const result = parseBiographyToTimeline(biography, "1945-03-15", "2023-11-20");
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].year).toBe(1945);
    expect(result[result.length - 1].year).toBe(2023);
  });

  it("should parse dates with dot separator", () => {
    const biography = "1945.3.15 生于山东济南。\n2023.11.20 逝世。";
    const result = parseBiographyToTimeline(biography, "1945-03-15", "2023-11-20");
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].year).toBe(1945);
  });

  it("should parse dates with dash separator", () => {
    const biography = "1945-03-15 生于山东济南。\n2023-11-20 逝世。";
    const result = parseBiographyToTimeline(biography, "1945-03-15", "2023-11-20");
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].year).toBe(1945);
  });

  it("should parse year only dates", () => {
    const biography = "1945年 生于山东济南。\n1965年 参加工作。";
    const result = parseBiographyToTimeline(biography, "1945-03-15", "2023-11-20");
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].year).toBe(1945);
  });

  it("should handle era patterns for birth", () => {
    const biography = "出生于山东济南。";
    const result = parseBiographyToTimeline(biography, "1945-03-15", "2023-11-20");
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].year).toBe(1945);
  });

  it("should handle era patterns for youth", () => {
    const biography = "青年时期，考入师范学院。";
    const result = parseBiographyToTimeline(biography, "1945-03-15", "2023-11-20");
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].year).toBe(1963);
  });

  it("should handle era patterns for childhood", () => {
    const biography = "幼年时期，家境贫寒。";
    const result = parseBiographyToTimeline(biography, "1945-03-15", "2023-11-20");
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].year).toBe(1950);
  });

  it("should handle era patterns for middle age", () => {
    const biography = "中年时期，担任校长职务。";
    const result = parseBiographyToTimeline(biography, "1945-03-15", "2023-11-20");
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].year).toBe(1985);
  });

  it("should handle era patterns for old age", () => {
    const biography = "晚年时期，热心公益。";
    const result = parseBiographyToTimeline(biography, "1945-03-15", "2023-11-20");
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].year).toBe(2005);
  });

  it("should handle era patterns for death", () => {
    const biography = "因病医治无效逝世。";
    const result = parseBiographyToTimeline(biography, "1945-03-15", "2023-11-20");
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].year).toBe(2023);
  });

  it("should handle biography with year and month only", () => {
    const biography = "1945年3月，生于山东济南。";
    const result = parseBiographyToTimeline(biography, "1945-03-15", "2023-11-20");
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].year).toBe(1945);
    expect(result[0].month).toBe(3);
  });

  it("should handle lines without dates using fallback years", () => {
    const biography = "生于山东济南。\n参加工作。\n退休生活。";
    const result = parseBiographyToTimeline(biography, "1945-03-15", "2023-11-20");
    expect(result.length).toBe(1);
    expect(result[0].year).toBe(1945);
    expect(result[0].content).toContain("生于山东济南");
    expect(result[0].content).toContain("参加工作");
    expect(result[0].content).toContain("退休生活");
  });

  it("should accumulate text for same date", () => {
    const biography = "1945年3月15日，生于山东济南。\n家境贫寒，父亲是工人。";
    const result = parseBiographyToTimeline(biography, "1945-03-15", "2023-11-20");
    expect(result.length).toBe(1);
    expect(result[0].content).toContain("生于山东济南");
    expect(result[0].content).toContain("家境贫寒");
  });

  it("should create fallback node when no dates or era patterns found", () => {
    const biography = "喜欢读书和旅行，是一个非常善良的人。";
    const result = parseBiographyToTimeline(biography, "1945-03-15", "2023-11-20");
    expect(result.length).toBe(1);
    expect(result[0].title).toBe("生平简介");
    expect(result[0].dateText).toBe("生平");
    expect(result[0].year).toBe(1945);
  });

  it("should create fallback node when no dates found", () => {
    const biography = "这是一段没有日期的生平介绍。";
    const result = parseBiographyToTimeline(biography, "1945-03-15", "2023-11-20");
    expect(result.length).toBe(1);
    expect(result[0].title).toBe("生平简介");
    expect(result[0].dateText).toBe("生平");
    expect(result[0].year).toBe(1945);
  });

  it("should sort nodes by date", () => {
    const biography = "2000年，退休。\n1960年，参加工作。\n1945年，出生。";
    const result = parseBiographyToTimeline(biography, "1945-03-15", "2023-11-20");
    expect(result[0].year).toBe(1945);
    expect(result[1].year).toBe(1960);
    expect(result[2].year).toBe(2000);
  });

  it("should extract short title from first sentence", () => {
    const biography = "1945年3月15日，生于山东济南。\n他是一个好人。";
    const result = parseBiographyToTimeline(biography, "1945-03-15", "2023-11-20");
    expect(result[0].title).toBe("，生于山东济南");
  });

  it("should truncate long first sentence for title", () => {
    const biography = "1945年3月15日，生于山东济南一个普通的工人家庭，家境非常贫寒，父亲是一名勤劳的工人。";
    const result = parseBiographyToTimeline(biography, "1945-03-15", "2023-11-20");
    expect(result[0].title).toContain("...");
    expect(result[0].title.length).toBe(23);
  });

  it("should handle era pattern for death", () => {
    const biography = "因病医治无效，与世长辞。";
    const result = parseBiographyToTimeline(biography, "1945-03-15", "2023-11-20");
    expect(result.length).toBe(1);
    expect(result[0].year).toBe(2023);
    expect(result[0].title).toContain("与世长辞");
  });

  it("should handle empty birthDate or deathDate", () => {
    const biography = "1945年出生。\n2023年去世。";
    const result = parseBiographyToTimeline(biography, "", "");
    expect(result.length).toBe(2);
    expect(result[0].year).toBe(1945);
    expect(result[1].year).toBe(2023);
  });

  it("should handle biography with only whitespace", () => {
    const result = parseBiographyToTimeline("   \n   ", "1945-03-15", "2023-11-20");
    expect(result).toEqual([]);
  });

  it("should handle era pattern for youth", () => {
    const biography = "青年时期，他参加了工作，开始了自己的职业生涯。";
    const result = parseBiographyToTimeline(biography, "1945-03-15", "2023-11-20");
    expect(result.length).toBe(1);
    expect(result[0].year).toBe(1963);
  });

  it("should sort nodes by date with same year different month", () => {
    const biography = "2000年5月，退休。\n2000年1月，参加工作。";
    const result = parseBiographyToTimeline(biography, "1945-03-15", "2023-11-20");
    expect(result.length).toBe(2);
    expect(result[0].month).toBe(1);
    expect(result[1].month).toBe(5);
  });

  it("should sort nodes by date with same year and month", () => {
    const biography = "2000年1月15日，退休。\n2000年1月10日，参加工作。";
    const result = parseBiographyToTimeline(biography, "1945-03-15", "2023-11-20");
    expect(result.length).toBe(2);
    expect(result[0].day).toBe(10);
    expect(result[1].day).toBe(15);
  });

  it("should handle year only pattern with dot separator", () => {
    const biography = "1945.3 生于山东济南。";
    const result = parseBiographyToTimeline(biography, "1945-03-15", "2023-11-20");
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].year).toBe(1945);
    expect(result[0].month).toBe(3);
  });
});

describe("getCurrentFestival", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return spring festival in late January to late February", () => {
    vi.setSystemTime(new Date("2024-01-25"));
    const festival = getCurrentFestival();
    expect(festival).toEqual({ type: "spring", name: "春节", decoration: "lantern" });
  });

  it("should return qingming festival in early April", () => {
    vi.setSystemTime(new Date("2024-04-05"));
    const festival = getCurrentFestival();
    expect(festival).toEqual({ type: "qingming", name: "清明节", decoration: "willow" });
  });

  it("should return midautumn festival in late September to mid October", () => {
    vi.setSystemTime(new Date("2024-09-20"));
    const festival = getCurrentFestival();
    expect(festival).toEqual({ type: "midautumn", name: "中秋节", decoration: "moon" });
  });

  it("should return dragonboat festival in late May to late June", () => {
    vi.setSystemTime(new Date("2024-06-10"));
    const festival = getCurrentFestival();
    expect(festival).toEqual({ type: "dragonboat", name: "端午节", decoration: "zongzi" });
  });

  it("should return yuanxiao festival in early to late February", () => {
    vi.setSystemTime(new Date("2024-02-15"));
    const festival = getCurrentFestival();
    expect(festival).toEqual({ type: "yuanxiao", name: "元宵节", decoration: "lantern" });
  });

  it("should return chongyang festival in October", () => {
    vi.setSystemTime(new Date("2024-10-20"));
    const festival = getCurrentFestival();
    expect(festival).toEqual({ type: "chongyang", name: "重阳节", decoration: "chrysanthemum" });
  });

  it("should return yuanxiao festival in late February", () => {
    vi.setSystemTime(new Date("2024-02-22"));
    const festival = getCurrentFestival();
    expect(festival).toEqual({ type: "yuanxiao", name: "元宵节", decoration: "lantern" });
  });

  it("should return null when no festival", () => {
    vi.setSystemTime(new Date("2024-03-15"));
    const festival = getCurrentFestival();
    expect(festival).toBeNull();
  });

  it("should return null in late November", () => {
    vi.setSystemTime(new Date("2024-11-15"));
    const festival = getCurrentFestival();
    expect(festival).toBeNull();
  });
});
