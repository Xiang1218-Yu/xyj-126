import type { TimelineNode, FlowerType, WrapperStyle, FlowerItem } from "@/types";
import { FLOWER_TYPES, WRAPPER_STYLES } from "@/types";

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}年${month}月${day}日`;
}

export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

export function daysUntilDeathAnniversary(deathDate: string): number {
  const today = new Date();
  const death = new Date(deathDate);
  const thisYearAnniversary = new Date(today.getFullYear(), death.getMonth(), death.getDate());

  if (thisYearAnniversary < today) {
    thisYearAnniversary.setFullYear(today.getFullYear() + 1);
  }

  const diffTime = thisYearAnniversary.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function calculateAge(birthDate: string, deathDate: string): number {
  const birth = new Date(birthDate);
  const death = new Date(deathDate);
  let age = death.getFullYear() - birth.getFullYear();
  const monthDiff = death.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && death.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

export function compressImage(file: File, maxWidth: number = 800, quality: number = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context not available"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function getFlowerType(type: string): FlowerType | undefined {
  return FLOWER_TYPES.find((f) => f.id === type);
}

export function getFlowerEmoji(type: string): string {
  const flower = getFlowerType(type);
  return flower?.emoji || "🌸";
}

export function getFlowerName(type: string): string {
  const flower = getFlowerType(type);
  return flower?.name || "花";
}

export function getFlowerMeaning(type: string): string {
  const flower = getFlowerType(type);
  return flower?.meaning || "";
}

export function getFlowerColor(type: string): string {
  const flower = getFlowerType(type);
  return flower?.color || "#9CA3AF";
}

export function getWrapperStyle(id: string): WrapperStyle | undefined {
  return WRAPPER_STYLES.find((w) => w.id === id);
}

export function getWrapperName(id: string): string {
  const wrapper = getWrapperStyle(id);
  return wrapper?.name || "素雅白";
}

export function getFlowerItemsDisplay(items?: FlowerItem[]): string {
  if (!items || items.length === 0) return "";
  return items
    .map((item) => `${getFlowerEmoji(item.type)}×${item.quantity}`)
    .join(" ");
}

export function getTotalFlowerCount(items?: FlowerItem[]): number {
  if (!items || items.length === 0) return 0;
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

interface ParsedDate {
  year: number;
  month: number;
  day: number;
  dateText: string;
  date: string;
}

const DATE_PATTERNS = [
  /(\d{4})年(\d{1,2})月(\d{1,2})日/g,
  /(\d{4})[年.／\-/](\d{1,2})[月.／\-/](\d{1,2})日?/g,
  /(\d{4})年(\d{1,2})月/g,
  /(\d{4})[年.／\-/](\d{1,2})月?/g,
  /(\d{4})年/g,
];

const ERA_PATTERNS: Array<{ pattern: RegExp; yearOffset: (birthYear: number) => number; label: string }> = [
  { pattern: /(出生|诞生|出世)/g, yearOffset: (y) => y, label: "出生" },
  { pattern: /(幼年|童年|小时候)/g, yearOffset: (y) => y + 5, label: "幼年" },
  { pattern: /(少年|青年时期|青年时代|年轻时|年轻的时候)/g, yearOffset: (y) => y + 18, label: "青年" },
  { pattern: /(中年|壮年)/g, yearOffset: (y) => y + 40, label: "中年" },
  { pattern: /(晚年|老年|退休后|退休以后)/g, yearOffset: (y) => y + 60, label: "晚年" },
  { pattern: /(逝世|去世|离世|辞世|驾鹤|因病医治无效)/g, yearOffset: () => 9999, label: "逝世" },
];

function parseDateFromText(text: string, birthYear: number, deathYear: number): ParsedDate | null {
  for (const pattern of DATE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const m = match[0];
      const nums = m.match(/\d+/g);
      if (nums) {
        const year = parseInt(nums[0], 10);
        const month = nums[1] ? parseInt(nums[1], 10) : 6;
        const day = nums[2] ? parseInt(nums[2], 10) : 15;
        const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        return { year, month, day, dateText: m, date: dateStr };
      }
    }
  }

  for (const era of ERA_PATTERNS) {
    if (era.pattern.test(text)) {
      const y = era.label === "逝世" ? deathYear : era.yearOffset(birthYear);
      const month = 6;
      const day = 15;
      const dateStr = `${y}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      return { year: y, month, day, dateText: era.label, date: dateStr };
    }
  }

  return null;
}

function extractTitle(content: string, dateText: string): string {
  const cleaned = content.replace(dateText, "").trim();
  const firstSentence = cleaned.split(/[。！？\n.]/)[0].trim();
  if (firstSentence.length > 0 && firstSentence.length <= 30) {
    return firstSentence;
  }
  return cleaned.substring(0, 20) + (cleaned.length > 20 ? "..." : "");
}

export function parseBiographyToTimeline(
  biography: string,
  birthDate: string,
  deathDate: string
): TimelineNode[] {
  if (!biography.trim()) return [];

  const birthYear = birthDate ? new Date(birthDate).getFullYear() : 1950;
  const deathYear = deathDate ? new Date(deathDate).getFullYear() : 2000;

  const lines = biography
    .split(/\n+/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const nodes: TimelineNode[] = [];
  let accumulatedText = "";
  let currentDate: ParsedDate | null = null;
  let nodeIndex = 0;

  const finalizeNode = () => {
    if (currentDate && accumulatedText.trim()) {
      const title = extractTitle(accumulatedText, currentDate.dateText);
      nodes.push({
        id: `tl-${Date.now()}-${nodeIndex++}`,
        date: currentDate.date,
        dateText: currentDate.dateText,
        title,
        content: accumulatedText.trim(),
        year: currentDate.year,
        month: currentDate.month,
        day: currentDate.day,
      });
    }
    accumulatedText = "";
  };

  for (const line of lines) {
    const parsedDate = parseDateFromText(line, birthYear, deathYear);

    if (parsedDate) {
      finalizeNode();
      currentDate = parsedDate;
      accumulatedText = line;
    } else if (currentDate) {
      accumulatedText += (accumulatedText ? "\n" : "") + line;
    } else {
      const fallbackYear = birthYear + Math.floor(nodes.length * 10);
      const month = 6;
      const day = 15;
      currentDate = {
        year: fallbackYear,
        month,
        day,
        dateText: `${fallbackYear}年`,
        date: `${fallbackYear}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      };
      accumulatedText = line;
    }
  }
  finalizeNode();

  if (nodes.length === 0 && biography.trim()) {
    const fallbackYear = birthYear;
    nodes.push({
      id: `tl-${Date.now()}-0`,
      date: `${fallbackYear}-06-15`,
      dateText: "生平",
      title: "生平简介",
      content: biography.trim(),
      year: fallbackYear,
      month: 6,
      day: 15,
    });
  }

  nodes.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    if (a.month !== b.month) return a.month - b.month;
    return a.day - b.day;
  });

  return nodes.map((n, i) => ({ ...n, id: `tl-${Date.now()}-${i}` }));
}

export type FestivalType =
  | "spring"
  | "qingming"
  | "midautumn"
  | "dragonboat"
  | "yuanxiao"
  | "chongyang"
  | null;

export interface FestivalInfo {
  type: FestivalType;
  name: string;
  decoration: string;
}

export function getCurrentFestival(): FestivalInfo | null {
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  if ((month === 1 && day >= 20) || (month === 2 && day <= 20)) {
    return { type: "spring", name: "春节", decoration: "lantern" };
  }

  if (month === 4 && day >= 1 && day <= 10) {
    return { type: "qingming", name: "清明节", decoration: "willow" };
  }

  if ((month === 9 && day >= 15) || (month === 10 && day <= 15)) {
    return { type: "midautumn", name: "中秋节", decoration: "moon" };
  }

  if ((month === 5 && day >= 25) || (month === 6 && day <= 25)) {
    return { type: "dragonboat", name: "端午节", decoration: "zongzi" };
  }

  if (month === 2 && day >= 5 && day <= 25) {
    return { type: "yuanxiao", name: "元宵节", decoration: "lantern" };
  }

  if (month === 10 && day >= 1 && day <= 30) {
    return { type: "chongyang", name: "重阳节", decoration: "chrysanthemum" };
  }

  return null;
}
