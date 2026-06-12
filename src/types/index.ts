export interface Photo {
  id: string;
  url: string;
  caption: string;
  order: number;
}

export interface Message {
  id: string;
  content: string;
  author: string;
  createdAt: string;
}

export interface Flower {
  id: string;
  type: string;
  message: string;
  createdAt: string;
}

export interface Candle {
  id: string;
  message: string;
  createdAt: string;
}

export type Gender = "male" | "female" | "unknown";

export interface Memorial {
  id: string;
  name: string;
  gender: Gender;
  birthDate: string;
  deathDate: string;
  avatar: string;
  epitaph: string;
  biography: string;
  biographyDisplayMode: BiographyDisplayMode;
  photos: Photo[];
  messages: Message[];
  flowers: Flower[];
  candles: Candle[];
  isPrivate: boolean;
  password: string;
  adminPassword: string;
  reminderEnabled: boolean;
  reminderDays: number;
  theme: VisualTheme;
  collaborators: Collaborator[];
  contributions: Contribution[];
  inviteLinks: InviteLink[];
  createdAt: string;
  updatedAt: string;
}

export interface FlowerType {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

export type RelationType =
  | "spouse"
  | "father"
  | "mother"
  | "son"
  | "daughter"
  | "brother"
  | "sister"
  | "grandfather"
  | "grandmother"
  | "grandson"
  | "granddaughter"
  | "uncle"
  | "aunt"
  | "nephew"
  | "niece"
  | "cousin"
  | "other";

export const RELATION_LABELS: Record<RelationType, string> = {
  spouse: "配偶",
  father: "父亲",
  mother: "母亲",
  son: "儿子",
  daughter: "女儿",
  brother: "兄弟",
  sister: "姐妹",
  grandfather: "祖父",
  grandmother: "祖母",
  grandson: "孙子",
  granddaughter: "孙女",
  uncle: "叔叔/伯伯",
  aunt: "姑姑/阿姨",
  nephew: "侄子",
  niece: "侄女",
  cousin: "堂/表亲",
  other: "其他",
};

export const RELATION_GENDER: Record<RelationType, "male" | "female" | "neutral"> = {
  spouse: "neutral",
  father: "male",
  mother: "female",
  son: "male",
  daughter: "female",
  brother: "male",
  sister: "female",
  grandfather: "male",
  grandmother: "female",
  grandson: "male",
  granddaughter: "female",
  uncle: "male",
  aunt: "female",
  nephew: "male",
  niece: "female",
  cousin: "neutral",
  other: "neutral",
};

export const INVERSE_RELATIONS: Record<RelationType, Record<"male" | "female", RelationType>> = {
  spouse: { male: "spouse", female: "spouse" },
  father: { male: "son", female: "daughter" },
  mother: { male: "son", female: "daughter" },
  son: { male: "father", female: "mother" },
  daughter: { male: "father", female: "mother" },
  brother: { male: "brother", female: "sister" },
  sister: { male: "brother", female: "sister" },
  grandfather: { male: "grandson", female: "granddaughter" },
  grandmother: { male: "grandson", female: "granddaughter" },
  grandson: { male: "grandfather", female: "grandmother" },
  granddaughter: { male: "grandfather", female: "grandmother" },
  uncle: { male: "nephew", female: "niece" },
  aunt: { male: "nephew", female: "niece" },
  nephew: { male: "uncle", female: "aunt" },
  niece: { male: "uncle", female: "aunt" },
  cousin: { male: "cousin", female: "cousin" },
  other: { male: "other", female: "other" },
};

export interface FamilyRelation {
  id: string;
  fromMemorialId: string;
  toMemorialId: string;
  relation: RelationType;
  note?: string;
  createdAt: string;
}

export type VisualTheme = "default" | "sakura" | "autumn" | "snow" | "starry";

export interface ThemeConfig {
  id: VisualTheme;
  name: string;
  icon: string;
  description: string;
  bgGradient: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  cardBg: string;
  cardBorder: string;
}

export interface TimelineNode {
  id: string;
  date: string;
  dateText: string;
  title: string;
  content: string;
  year: number;
  month: number;
  day: number;
}

export type BiographyDisplayMode = "text" | "timeline";

export type RitualStepType =
  | "purification"
  | "incense"
  | "bow"
  | "toast"
  | "chanting"
  | "offering"
  | "prayer"
  | "completion";

export interface RitualStep {
  id: RitualStepType;
  title: string;
  subtitle: string;
  description: string;
  duration: number;
  icon: string;
}

export interface RitualRecord {
  id: string;
  memorialId: string;
  participant: string;
  stepsCompleted: RitualStepType[];
  prayerMessage: string;
  offerings: string[];
  createdAt: string;
}

export const RITUAL_STEPS: RitualStep[] = [
  {
    id: "purification",
    title: "净手静心",
    subtitle: "第一步",
    description: "净手洁面，整理衣冠，以一颗虔诚恭敬之心，准备开始祭奠仪式。",
    duration: 3000,
    icon: "💧",
  },
  {
    id: "incense",
    title: "敬香三炷",
    subtitle: "第二步",
    description: "点燃檀香三炷，双手奉持，向先人致以最崇高的敬意。香氲袅袅，心意通达。",
    duration: 5000,
    icon: "🕯️",
  },
  {
    id: "bow",
    title: "三鞠躬礼",
    subtitle: "第三步",
    description: "向先人遗像行三鞠躬大礼，一鞠躬——再鞠躬——三鞠躬，表达无限追思与缅怀。",
    duration: 6000,
    icon: "🙇",
  },
  {
    id: "toast",
    title: "敬酒献茶",
    subtitle: "第四步",
    description: "谨以清茶美酒一杯，敬献于先人灵前，愿您在另一个世界安好无恙。",
    duration: 4000,
    icon: "🍶",
  },
  {
    id: "chanting",
    title: "诵经祈福",
    subtitle: "第五步",
    description: "默诵追思经文，愿佛光普照，先人早登极乐，福泽绵长，庇佑后人。",
    duration: 8000,
    icon: "📿",
  },
  {
    id: "offering",
    title: "敬献祭品",
    subtitle: "第六步",
    description: "献上鲜花、鲜果、糕点，奉先人喜爱之物，聊表寸心，愿您欢喜受用。",
    duration: 4000,
    icon: "🌸",
  },
  {
    id: "prayer",
    title: "致祭文/祈愿",
    subtitle: "第七步",
    description: "倾诉心中话语，寄托无尽哀思。写下您想对先人说的话，愿此心意上达天听。",
    duration: 0,
    icon: "📜",
  },
  {
    id: "completion",
    title: "礼成回向",
    subtitle: "圆满",
    description: "祭奠仪式圆满礼成，愿以此功德回向先人，愿您离苦得乐，往生净土，早证菩提。",
    duration: 4000,
    icon: "🙏",
  },
];

export interface Collaborator {
  id: string;
  name: string;
  relation: string;
  avatar?: string;
  joinedAt: string;
  lastActiveAt: string;
}

export type ContributionType =
  | "biography"
  | "photo"
  | "photo_caption"
  | "epitaph"
  | "message"
  | "flower"
  | "candle"
  | "timeline"
  | "theme";

export const CONTRIBUTION_LABELS: Record<ContributionType, string> = {
  biography: "编辑生平介绍",
  photo: "上传照片",
  photo_caption: "编辑照片说明",
  epitaph: "编辑墓志铭",
  message: "发表留言",
  flower: "敬献鲜花",
  candle: "点燃蜡烛",
  timeline: "编辑时间轴",
  theme: "切换主题",
};

export interface Contribution {
  id: string;
  memorialId: string;
  collaboratorId: string;
  collaboratorName: string;
  type: ContributionType;
  summary: string;
  detail?: string;
  createdAt: string;
}

export interface InviteLink {
  id: string;
  memorialId: string;
  token: string;
  createdBy: string;
  createdAt: string;
  expiresAt: string;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
}

export const CHANTING_TEXTS = [
  "南无阿弥陀佛",
  "愿以此功德，庄严佛净土",
  "上报四重恩，下济三途苦",
  "若有见闻者，悉发菩提心",
  "尽此一报身，同生极乐国",
  "愿先人往生净土，离苦得乐",
  "阿弥陀佛身金色，相好光明无等伦",
  "白毫宛转五须弥，绀目澄清四大海",
  "光中化佛无数亿，化菩萨众亦无边",
  "四十八愿度众生，九品咸令登彼岸",
];
