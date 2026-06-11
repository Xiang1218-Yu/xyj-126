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

export interface Memorial {
  id: string;
  name: string;
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
