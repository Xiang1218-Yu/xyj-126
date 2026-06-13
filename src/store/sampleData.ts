import type { Memorial, FamilyRelation, VisualTheme, BiographyDisplayMode } from "@/types";
import { hashPassword } from "@/utils";

export async function getSampleMemorials(): Promise<Memorial[]> {
  const now = new Date();
  const sample1Date = new Date(now.getTime() - 86400000 * 30);
  const sample2Date = new Date(now.getTime() - 86400000 * 60);
  const privatePassword = await hashPassword("123456");

  return [
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
          { id: "c1", name: "追思灯", message: "愿您在天堂安息", isEternal: true, createdAt: sample1Date.toISOString() },
          { id: "c2", name: "", message: "照亮回家的路", isEternal: false, createdAt: sample1Date.toISOString() },
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
          { id: "c3", name: "慈母心灯", message: "妈妈，想您了", isEternal: true, createdAt: sample2Date.toISOString() },
          { id: "c4", name: "", message: "点亮心灯照亮归途", isEternal: false, createdAt: sample2Date.toISOString() },
          { id: "c5", name: "感恩灯", message: "愿您安息", isEternal: false, createdAt: sample2Date.toISOString() },
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
          { id: "c6", name: "", message: "", isEternal: false, createdAt: sample2Date.toISOString() },
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
    ];
}

export async function migrateMemorials(memorials: Memorial[]): Promise<Memorial[]> {
  return memorials.map((m) => ({
    ...m,
    adminPassword: m.adminPassword ?? "",
    gender: m.gender ?? "unknown",
    theme: (m.theme as VisualTheme) ?? "default",
    biographyDisplayMode: (m.biographyDisplayMode as BiographyDisplayMode) ?? "text",
    collaborators: m.collaborators ?? [],
    contributions: m.contributions ?? [],
    inviteLinks: m.inviteLinks ?? [],
    candles: (m.candles ?? []).map((c) => ({
      ...c,
      name: c.name ?? "",
      isEternal: c.isEternal ?? false,
    })),
  }));
}

export function getSampleFamilyRelations(): FamilyRelation[] {
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

export const defaultMemorial: Omit<Memorial, "id" | "createdAt" | "updatedAt"> = {
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
