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
  photos: Photo[];
  messages: Message[];
  flowers: Flower[];
  candles: Candle[];
  isPrivate: boolean;
  password: string;
  adminPassword: string;
  reminderEnabled: boolean;
  reminderDays: number;
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
