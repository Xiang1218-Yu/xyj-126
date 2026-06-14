import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useMemorialStore } from "./memorialStore";
import type { Memorial, RelationType, VisualTheme } from "@/types";
import * as sampleData from "./sampleData";

vi.mock("./sampleData", async () => {
  const actual = await vi.importActual<typeof sampleData>("./sampleData");
  return {
    ...actual,
    migrateMemorials: vi.fn(actual.migrateMemorials),
    getSampleMemorials: vi.fn(actual.getSampleMemorials),
    getSampleFamilyRelations: vi.fn(actual.getSampleFamilyRelations),
  };
});

const mockMigrateMemorials = sampleData.migrateMemorials as vi.Mock;
const mockGetSampleMemorials = sampleData.getSampleMemorials as vi.Mock;
const mockGetSampleFamilyRelations = sampleData.getSampleFamilyRelations as vi.Mock;

const mockNow = new Date("2024-01-15T12:00:00.000Z");

vi.useFakeTimers();
vi.setSystemTime(mockNow);

beforeEach(() => {
  localStorage.clear();
  useMemorialStore.setState({
    memorials: [],
    familyRelations: [],
    driftBottles: [],
    currentCollaboratorId: null,
    isLoaded: false,
  });
});

afterEach(() => {
  vi.clearAllMocks();
  mockMigrateMemorials.mockRestore();
  mockGetSampleMemorials.mockRestore();
  mockGetSampleFamilyRelations.mockRestore();
});

describe("loadStorage / saveStorage internal functions", () => {
  it("should handle localStorage getItem error in loadStorage", async () => {
    const originalGetItem = localStorage.getItem;
    localStorage.getItem = vi.fn().mockImplementation(() => {
      throw new Error("getItem error");
    });

    useMemorialStore.getState().loadMemorials();
    await vi.runAllTimersAsync();

    expect(localStorage.getItem).toHaveBeenCalled();
    expect(useMemorialStore.getState().isLoaded).toBe(true);

    localStorage.getItem = originalGetItem;
  });

  it("should handle localStorage setItem error in saveStorage", () => {
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = vi.fn().mockImplementation(() => {
      throw new Error("setItem error");
    });

    useMemorialStore.getState().saveMemorials();

    expect(localStorage.setItem).toHaveBeenCalled();

    localStorage.setItem = originalSetItem;
  });

  it("should handle JSON parse error in loadStorage", async () => {
    localStorage.setItem("memorial_memorials", "invalid json");

    useMemorialStore.getState().loadMemorials();
    await vi.runAllTimersAsync();

    expect(useMemorialStore.getState().isLoaded).toBe(true);
  });
});

describe("memorial CRUD operations", () => {
  it("should create a memorial", () => {
    const memorial = useMemorialStore.getState().createMemorial({
      name: "测试用户",
      gender: "male",
      birthDate: "1950-01-01",
      deathDate: "2020-01-01",
    });

    expect(memorial).toBeDefined();
    expect(memorial.id).toBeDefined();
    expect(memorial.name).toBe("测试用户");
    expect(memorial.createdAt).toBeDefined();
    expect(memorial.updatedAt).toBeDefined();
    expect(useMemorialStore.getState().memorials.length).toBe(1);
  });

  it("should create a memorial with provided id", () => {
    const memorial = useMemorialStore.getState().createMemorial({
      id: "custom-id",
      name: "测试用户",
      gender: "male",
      birthDate: "1950-01-01",
      deathDate: "2020-01-01",
    });

    expect(memorial.id).toBe("custom-id");
  });

  it("should update a memorial", () => {
    const memorial = useMemorialStore.getState().createMemorial({
      name: "测试用户",
      gender: "male",
      birthDate: "1950-01-01",
      deathDate: "2020-01-01",
    });

    const oldUpdatedAt = memorial.updatedAt;
    vi.advanceTimersByTime(1000);

    useMemorialStore.getState().updateMemorial(memorial.id, {
      name: "更新后的名字",
      epitaph: "新的墓志铭",
    });

    const updated = useMemorialStore.getState().getMemorial(memorial.id);
    expect(updated?.name).toBe("更新后的名字");
    expect(updated?.epitaph).toBe("新的墓志铭");
    expect(updated?.updatedAt).not.toBe(oldUpdatedAt);
  });

  it("should delete a memorial", () => {
    const memorial1 = useMemorialStore.getState().createMemorial({
      name: "测试用户1",
      gender: "male",
      birthDate: "1950-01-01",
      deathDate: "2020-01-01",
    });

    const memorial2 = useMemorialStore.getState().createMemorial({
      name: "测试用户2",
      gender: "female",
      birthDate: "1955-01-01",
      deathDate: "2021-01-01",
    });

    useMemorialStore.getState().addFamilyRelation(memorial1.id, memorial2.id, "spouse");

    expect(useMemorialStore.getState().memorials.length).toBe(2);
    expect(useMemorialStore.getState().familyRelations.length).toBe(1);

    useMemorialStore.getState().deleteMemorial(memorial1.id);

    expect(useMemorialStore.getState().memorials.length).toBe(1);
    expect(useMemorialStore.getState().getMemorial(memorial1.id)).toBeUndefined();
    expect(useMemorialStore.getState().familyRelations.length).toBe(0);
  });

  it("should get a memorial by id", () => {
    const memorial = useMemorialStore.getState().createMemorial({
      name: "测试用户",
      gender: "male",
      birthDate: "1950-01-01",
      deathDate: "2020-01-01",
    });

    const found = useMemorialStore.getState().getMemorial(memorial.id);
    expect(found).toEqual(memorial);

    const notFound = useMemorialStore.getState().getMemorial("non-existent");
    expect(notFound).toBeUndefined();
  });

  it("should search memorials", () => {
    useMemorialStore.getState().createMemorial({
      name: "张三",
      gender: "male",
      birthDate: "1950-01-01",
      deathDate: "2020-01-01",
      epitaph: "一生勤劳",
    });

    useMemorialStore.getState().createMemorial({
      name: "李四",
      gender: "female",
      birthDate: "1955-01-01",
      deathDate: "2021-01-01",
      epitaph: "慈母手中线",
    });

    expect(useMemorialStore.getState().searchMemorials("")).toHaveLength(2);
    expect(useMemorialStore.getState().searchMemorials("  ")).toHaveLength(2);
    expect(useMemorialStore.getState().searchMemorials("张")).toHaveLength(1);
    expect(useMemorialStore.getState().searchMemorials("慈母")).toHaveLength(1);
    expect(useMemorialStore.getState().searchMemorials("不存在")).toHaveLength(0);
  });
});

describe("photos operations", () => {
  it("should add a photo", () => {
    const memorial = useMemorialStore.getState().createMemorial({
      name: "测试用户",
      gender: "male",
      birthDate: "1950-01-01",
      deathDate: "2020-01-01",
    });

    useMemorialStore.getState().addPhoto(memorial.id, {
      url: "http://example.com/photo.jpg",
      caption: "测试照片",
    });

    const updated = useMemorialStore.getState().getMemorial(memorial.id);
    expect(updated?.photos.length).toBe(1);
    expect(updated?.photos[0].url).toBe("http://example.com/photo.jpg");
    expect(updated?.photos[0].order).toBe(0);
  });

  it("should add a photo with collaborator info", () => {
    const memorial = useMemorialStore.getState().createMemorial({
      name: "测试用户",
      gender: "male",
      birthDate: "1950-01-01",
      deathDate: "2020-01-01",
    });

    useMemorialStore.getState().addPhoto(
      memorial.id,
      {
        url: "http://example.com/photo.jpg",
        caption: "测试照片",
      },
      "collab-1",
      "测试协作者"
    );

    const updated = useMemorialStore.getState().getMemorial(memorial.id);
    expect(updated?.photos.length).toBe(1);
    expect(updated?.contributions.length).toBe(1);
  });

  it("should remove a photo", () => {
    const memorial = useMemorialStore.getState().createMemorial({
      name: "测试用户",
      gender: "male",
      birthDate: "1950-01-01",
      deathDate: "2020-01-01",
    });

    useMemorialStore.getState().addPhoto(memorial.id, {
      url: "http://example.com/photo.jpg",
      caption: "测试照片",
    });

    const photoId = useMemorialStore.getState().getMemorial(memorial.id)!.photos[0].id;

    useMemorialStore.getState().removePhoto(memorial.id, photoId);

    const updated = useMemorialStore.getState().getMemorial(memorial.id);
    expect(updated?.photos.length).toBe(0);
  });
});

describe("messages operations", () => {
  it("should add a message", () => {
    const memorial = useMemorialStore.getState().createMemorial({
      name: "测试用户",
      gender: "male",
      birthDate: "1950-01-01",
      deathDate: "2020-01-01",
    });

    useMemorialStore.getState().addMessage(memorial.id, {
      content: "测试留言",
      author: "访客",
    });

    const updated = useMemorialStore.getState().getMemorial(memorial.id);
    expect(updated?.messages.length).toBe(1);
    expect(updated?.messages[0].content).toBe("测试留言");
    expect(updated?.messages[0].author).toBe("访客");
  });

  it("should add messages to front", () => {
    const memorial = useMemorialStore.getState().createMemorial({
      name: "测试用户",
      gender: "male",
      birthDate: "1950-01-01",
      deathDate: "2020-01-01",
    });

    useMemorialStore.getState().addMessage(memorial.id, {
      content: "第一条留言",
      author: "访客1",
    });

    useMemorialStore.getState().addMessage(memorial.id, {
      content: "第二条留言",
      author: "访客2",
    });

    const updated = useMemorialStore.getState().getMemorial(memorial.id);
    expect(updated?.messages[0].content).toBe("第二条留言");
    expect(updated?.messages[1].content).toBe("第一条留言");
  });
});

describe("flowers operations", () => {
  it("should add a flower", () => {
    const memorial = useMemorialStore.getState().createMemorial({
      name: "测试用户",
      gender: "male",
      birthDate: "1950-01-01",
      deathDate: "2020-01-01",
    });

    useMemorialStore.getState().addFlower(memorial.id, {
      type: "chrysanthemum",
      message: "一路走好",
    });

    const updated = useMemorialStore.getState().getMemorial(memorial.id);
    expect(updated?.flowers.length).toBe(1);
    expect(updated?.flowers[0].type).toBe("chrysanthemum");
    expect(updated?.flowers[0].message).toBe("一路走好");
  });
});

describe("candles operations", () => {
  it("should add a candle", () => {
    const memorial = useMemorialStore.getState().createMemorial({
      name: "测试用户",
      gender: "male",
      birthDate: "1950-01-01",
      deathDate: "2020-01-01",
    });

    useMemorialStore.getState().addCandle(memorial.id, {
      name: "追思灯",
      message: "愿您安息",
      isEternal: true,
    });

    const updated = useMemorialStore.getState().getMemorial(memorial.id);
    expect(updated?.candles.length).toBe(1);
    expect(updated?.candles[0].name).toBe("追思灯");
    expect(updated?.candles[0].isEternal).toBe(true);
  });
});

describe("family relations operations", () => {
  it("should add a family relation", () => {
    const memorial1 = useMemorialStore.getState().createMemorial({
      name: "测试用户1",
      gender: "male",
      birthDate: "1950-01-01",
      deathDate: "2020-01-01",
    });

    const memorial2 = useMemorialStore.getState().createMemorial({
      name: "测试用户2",
      gender: "female",
      birthDate: "1955-01-01",
      deathDate: "2021-01-01",
    });

    const relation = useMemorialStore.getState().addFamilyRelation(
      memorial1.id,
      memorial2.id,
      "spouse",
      "夫妻"
    );

    expect(relation).not.toBeNull();
    expect(relation?.fromMemorialId).toBe(memorial1.id);
    expect(relation?.toMemorialId).toBe(memorial2.id);
    expect(useMemorialStore.getState().familyRelations.length).toBe(1);
  });

  it("should not add relation when fromId equals toId", () => {
    const memorial = useMemorialStore.getState().createMemorial({
      name: "测试用户",
      gender: "male",
      birthDate: "1950-01-01",
      deathDate: "2020-01-01",
    });

    const relation = useMemorialStore.getState().addFamilyRelation(
      memorial.id,
      memorial.id,
      "spouse"
    );

    expect(relation).toBeNull();
  });

  it("should not add duplicate relation", () => {
    const memorial1 = useMemorialStore.getState().createMemorial({
      name: "测试用户1",
      gender: "male",
      birthDate: "1950-01-01",
      deathDate: "2020-01-01",
    });

    const memorial2 = useMemorialStore.getState().createMemorial({
      name: "测试用户2",
      gender: "female",
      birthDate: "1955-01-01",
      deathDate: "2021-01-01",
    });

    useMemorialStore.getState().addFamilyRelation(memorial1.id, memorial2.id, "spouse");

    const relation = useMemorialStore.getState().addFamilyRelation(
      memorial2.id,
      memorial1.id,
      "spouse"
    );

    expect(relation).toBeNull();
    expect(useMemorialStore.getState().familyRelations.length).toBe(1);
  });

  it("should not add relation for non-existent memorial", () => {
    const relation = useMemorialStore.getState().addFamilyRelation(
      "non-existent-1",
      "non-existent-2",
      "spouse"
    );

    expect(relation).toBeNull();
  });

  it("should remove a family relation", () => {
    const memorial1 = useMemorialStore.getState().createMemorial({
      name: "测试用户1",
      gender: "male",
      birthDate: "1950-01-01",
      deathDate: "2020-01-01",
    });

    const memorial2 = useMemorialStore.getState().createMemorial({
      name: "测试用户2",
      gender: "female",
      birthDate: "1955-01-01",
      deathDate: "2021-01-01",
    });

    const relation = useMemorialStore.getState().addFamilyRelation(
      memorial1.id,
      memorial2.id,
      "spouse"
    );

    expect(useMemorialStore.getState().familyRelations.length).toBe(1);

    useMemorialStore.getState().removeFamilyRelation(relation!.id);

    expect(useMemorialStore.getState().familyRelations.length).toBe(0);
  });

  it("should get relations for memorial (from perspective)", () => {
    const memorial1 = useMemorialStore.getState().createMemorial({
      name: "张三",
      gender: "male",
      birthDate: "1950-01-01",
      deathDate: "2020-01-01",
    });

    const memorial2 = useMemorialStore.getState().createMemorial({
      name: "李四",
      gender: "female",
      birthDate: "1955-01-01",
      deathDate: "2021-01-01",
    });

    useMemorialStore.getState().addFamilyRelation(memorial1.id, memorial2.id, "spouse");

    const relations = useMemorialStore.getState().getRelationsForMemorial(memorial1.id);
    expect(relations.length).toBe(1);
    expect(relations[0].label).toBe("配偶");
    expect(relations[0].otherMemorial.id).toBe(memorial2.id);
  });

  it("should get relations for memorial (to perspective with known gender)", () => {
    const memorial1 = useMemorialStore.getState().createMemorial({
      name: "张三",
      gender: "male",
      birthDate: "1950-01-01",
      deathDate: "2020-01-01",
    });

    const memorial2 = useMemorialStore.getState().createMemorial({
      name: "李四",
      gender: "female",
      birthDate: "1955-01-01",
      deathDate: "2021-01-01",
    });

    useMemorialStore.getState().addFamilyRelation(memorial1.id, memorial2.id, "spouse");

    const relations = useMemorialStore.getState().getRelationsForMemorial(memorial2.id);
    expect(relations.length).toBe(1);
    expect(relations[0].label).toBe("配偶");
  });

  it("should get relations for memorial (to perspective with unknown gender)", () => {
    const memorial1 = useMemorialStore.getState().createMemorial({
      name: "张三",
      gender: "unknown",
      birthDate: "1950-01-01",
      deathDate: "2020-01-01",
    });

    const memorial2 = useMemorialStore.getState().createMemorial({
      name: "李四",
      gender: "female",
      birthDate: "1955-01-01",
      deathDate: "2021-01-01",
    });

    useMemorialStore.getState().addFamilyRelation(memorial1.id, memorial2.id, "father");

    const relations = useMemorialStore.getState().getRelationsForMemorial(memorial2.id);
    expect(relations.length).toBe(1);
    expect(relations[0].label).toBe("儿子");
  });

  it("should get related memorials (to perspective)", () => {
    const memorial1 = useMemorialStore.getState().createMemorial({
      name: "测试用户1",
      gender: "male",
      birthDate: "1950-01-01",
      deathDate: "2020-01-01",
    });

    const memorial2 = useMemorialStore.getState().createMemorial({
      name: "测试用户2",
      gender: "female",
      birthDate: "1955-01-01",
      deathDate: "2021-01-01",
    });

    const memorial3 = useMemorialStore.getState().createMemorial({
      name: "测试用户3",
      gender: "male",
      birthDate: "1980-01-01",
      deathDate: "2022-01-01",
    });

    useMemorialStore.getState().addFamilyRelation(memorial1.id, memorial2.id, "spouse");
    useMemorialStore.getState().addFamilyRelation(memorial3.id, memorial1.id, "father");

    const related = useMemorialStore.getState().getRelatedMemorials(memorial1.id);
    expect(related.length).toBe(2);
    expect(related.map((m) => m.id)).toContain(memorial2.id);
    expect(related.map((m) => m.id)).toContain(memorial3.id);

    const related2 = useMemorialStore.getState().getRelatedMemorials(memorial2.id);
    expect(related2.length).toBe(1);
    expect(related2[0].id).toBe(memorial1.id);

    const related3 = useMemorialStore.getState().getRelatedMemorials(memorial3.id);
    expect(related3.length).toBe(1);
    expect(related3[0].id).toBe(memorial1.id);
  });

  it("should get all family relations", () => {
    expect(useMemorialStore.getState().getAllFamilyRelations()).toEqual([]);

    const memorial1 = useMemorialStore.getState().createMemorial({
      name: "测试用户1",
      gender: "male",
      birthDate: "1950-01-01",
      deathDate: "2020-01-01",
    });

    const memorial2 = useMemorialStore.getState().createMemorial({
      name: "测试用户2",
      gender: "female",
      birthDate: "1955-01-01",
      deathDate: "2021-01-01",
    });

    useMemorialStore.getState().addFamilyRelation(memorial1.id, memorial2.id, "spouse");

    expect(useMemorialStore.getState().getAllFamilyRelations().length).toBe(1);
  });
});

describe("theme operations", () => {
  it("should set memorial theme", () => {
    const memorial = useMemorialStore.getState().createMemorial({
      name: "测试用户",
      gender: "male",
      birthDate: "1950-01-01",
      deathDate: "2020-01-01",
    });

    const oldUpdatedAt = memorial.updatedAt;
    vi.advanceTimersByTime(1000);

    useMemorialStore.getState().setMemorialTheme(memorial.id, "sakura");

    const updated = useMemorialStore.getState().getMemorial(memorial.id);
    expect(updated?.theme).toBe("sakura");
    expect(updated?.updatedAt).not.toBe(oldUpdatedAt);
  });
});

describe("invite link operations", () => {
  it("should create an invite link", () => {
    const memorial = useMemorialStore.getState().createMemorial({
      name: "测试用户",
      gender: "male",
      birthDate: "1950-01-01",
      deathDate: "2020-01-01",
    });

    const invite = useMemorialStore.getState().createInviteLink(
      memorial.id,
      "creator-id",
      5,
      7
    );

    expect(invite).toBeDefined();
    expect(invite.memorialId).toBe(memorial.id);
    expect(invite.maxUses).toBe(5);
    expect(invite.isActive).toBe(true);
    expect(invite.usedCount).toBe(0);

    const updated = useMemorialStore.getState().getMemorial(memorial.id);
    expect(updated?.inviteLinks.length).toBe(1);
  });

  it("should create an invite link with default values", () => {
    const memorial = useMemorialStore.getState().createMemorial({
      name: "测试用户",
      gender: "male",
      birthDate: "1950-01-01",
      deathDate: "2020-01-01",
    });

    const invite = useMemorialStore.getState().createInviteLink(
      memorial.id,
      "creator-id"
    );

    expect(invite.maxUses).toBe(10);
    expect(new Date(invite.expiresAt).getTime() - new Date(invite.createdAt).getTime()).toBe(
      30 * 24 * 60 * 60 * 1000
    );
  });

  it("should get invite link by token", () => {
    const memorial = useMemorialStore.getState().createMemorial({
      name: "测试用户",
      gender: "male",
      birthDate: "1950-01-01",
      deathDate: "2020-01-01",
    });

    const invite = useMemorialStore.getState().createInviteLink(
      memorial.id,
      "creator-id"
    );

    const found = useMemorialStore.getState().getInviteLinkByToken(invite.token);
    expect(found).toBeDefined();
    expect(found?.token).toBe(invite.token);
    expect(found?.id).toBe(invite.id);

    const notFound = useMemorialStore.getState().getInviteLinkByToken("invalid-token");
    expect(notFound).toBeNull();
  });

  it("should join memorial by invite", () => {
    const memorial = useMemorialStore.getState().createMemorial({
      name: "测试用户",
      gender: "male",
      birthDate: "1950-01-01",
      deathDate: "2020-01-01",
    });

    const invite = useMemorialStore.getState().createInviteLink(
      memorial.id,
      "creator-id",
      5,
      30
    );

    const result = useMemorialStore.getState().joinMemorialByInvite(
      invite.token,
      "新协作者",
      "孙子"
    );

    expect(result.success).toBe(true);
    expect(result.message).toBe("成功加入纪念页协作");
    expect(result.collaborator).toBeDefined();
    expect(result.memorial).toBeDefined();
    expect(useMemorialStore.getState().currentCollaboratorId).toBe(result.collaborator?.id);

    const updatedInvite = useMemorialStore.getState().getInviteLinkByToken(invite.token);
    expect(updatedInvite?.usedCount).toBe(1);
  });

  it("should fail to join with invalid token", () => {
    const result = useMemorialStore.getState().joinMemorialByInvite(
      "invalid-token",
      "新协作者",
      "孙子"
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe("邀请链接无效");
  });

  it("should fail to join with inactive invite", () => {
    const memorial = useMemorialStore.getState().createMemorial({
      name: "测试用户",
      gender: "male",
      birthDate: "1950-01-01",
      deathDate: "2020-01-01",
    });

    const invite = useMemorialStore.getState().createInviteLink(
      memorial.id,
      "creator-id"
    );

    const currentMemorial = useMemorialStore.getState().getMemorial(memorial.id)!;
    const updatedMemorial = { ...currentMemorial };
    updatedMemorial.inviteLinks = updatedMemorial.inviteLinks.map((i) =>
      i.id === invite.id ? { ...i, isActive: false } : i
    );
    useMemorialStore.setState({
      memorials: useMemorialStore.getState().memorials.map((m) =>
        m.id === memorial.id ? updatedMemorial : m
      ),
    });

    const result = useMemorialStore.getState().joinMemorialByInvite(
      invite.token,
      "新协作者",
      "孙子"
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe("邀请链接已失效");
  });

  it("should fail to join with expired invite", () => {
    const memorial = useMemorialStore.getState().createMemorial({
      name: "测试用户",
      gender: "male",
      birthDate: "1950-01-01",
      deathDate: "2020-01-01",
    });

    const invite = useMemorialStore.getState().createInviteLink(
      memorial.id,
      "creator-id",
      10,
      -1
    );

    const result = useMemorialStore.getState().joinMemorialByInvite(
      invite.token,
      "新协作者",
      "孙子"
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe("邀请链接已过期");
  });

  it("should fail to join with max uses reached", () => {
    const memorial = useMemorialStore.getState().createMemorial({
      name: "测试用户",
      gender: "male",
      birthDate: "1950-01-01",
      deathDate: "2020-01-01",
    });

    const invite = useMemorialStore.getState().createInviteLink(
      memorial.id,
      "creator-id",
      1,
      30
    );

    useMemorialStore.getState().joinMemorialByInvite(
      invite.token,
      "协作者1",
      "孙子"
    );

    const result = useMemorialStore.getState().joinMemorialByInvite(
      invite.token,
      "协作者2",
      "孙女"
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe("邀请链接已达使用上限");
  });

  it("should fail to join when memorial not found", () => {
    const memorial = useMemorialStore.getState().createMemorial({
      name: "测试用户",
      gender: "male",
      birthDate: "1950-01-01",
      deathDate: "2020-01-01",
    });

    const invite = useMemorialStore.getState().createInviteLink(
      memorial.id,
      "creator-id"
    );

    const storedInvite = useMemorialStore.getState().getInviteLinkByToken(invite.token);
    expect(storedInvite).not.toBeNull();

    useMemorialStore.getState().deleteMemorial(memorial.id);

    const result = useMemorialStore.getState().joinMemorialByInvite(
      invite.token,
      "新协作者",
      "孙子"
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe("邀请链接无效");
  });
});

describe("collaborator operations", () => {
  it("should add a collaborator", () => {
    const memorial = useMemorialStore.getState().createMemorial({
      name: "测试用户",
      gender: "male",
      birthDate: "1950-01-01",
      deathDate: "2020-01-01",
    });

    const collaborator = useMemorialStore.getState().addCollaborator(
      memorial.id,
      "张小明",
      "孙子"
    );

    expect(collaborator).not.toBeNull();
    expect(collaborator?.name).toBe("张小明");
    expect(collaborator?.relation).toBe("孙子");

    const updated = useMemorialStore.getState().getMemorial(memorial.id);
    expect(updated?.collaborators.length).toBe(1);
  });

  it("should remove a collaborator", () => {
    const memorial = useMemorialStore.getState().createMemorial({
      name: "测试用户",
      gender: "male",
      birthDate: "1950-01-01",
      deathDate: "2020-01-01",
    });

    const collaborator = useMemorialStore.getState().addCollaborator(
      memorial.id,
      "张小明",
      "孙子"
    );

    expect(useMemorialStore.getState().getCollaborators(memorial.id).length).toBe(1);

    useMemorialStore.getState().removeCollaborator(memorial.id, collaborator!.id);

    expect(useMemorialStore.getState().getCollaborators(memorial.id).length).toBe(0);
  });

  it("should get collaborators", () => {
    const memorial = useMemorialStore.getState().createMemorial({
      name: "测试用户",
      gender: "male",
      birthDate: "1950-01-01",
      deathDate: "2020-01-01",
    });

    expect(useMemorialStore.getState().getCollaborators(memorial.id)).toEqual([]);

    useMemorialStore.getState().addCollaborator(memorial.id, "张小明", "孙子");

    expect(useMemorialStore.getState().getCollaborators(memorial.id).length).toBe(1);
  });

  it("should set current collaborator", () => {
    useMemorialStore.getState().setCurrentCollaborator("collab-1");
    expect(useMemorialStore.getState().currentCollaboratorId).toBe("collab-1");
    expect(localStorage.getItem("memorial_current_collaborator")).toBe("collab-1");

    useMemorialStore.getState().setCurrentCollaborator(null);
    expect(useMemorialStore.getState().currentCollaboratorId).toBeNull();
    expect(localStorage.getItem("memorial_current_collaborator")).toBeNull();
  });

  it("should update collaborator last active", () => {
    const memorial = useMemorialStore.getState().createMemorial({
      name: "测试用户",
      gender: "male",
      birthDate: "1950-01-01",
      deathDate: "2020-01-01",
    });

    const collaborator = useMemorialStore.getState().addCollaborator(
      memorial.id,
      "张小明",
      "孙子"
    );

    const oldLastActive = collaborator!.lastActiveAt;
    vi.advanceTimersByTime(1000);

    useMemorialStore.getState().updateCollaboratorLastActive(
      memorial.id,
      collaborator!.id
    );

    const updated = useMemorialStore.getState().getCollaborators(memorial.id)[0];
    expect(updated.lastActiveAt).not.toBe(oldLastActive);
  });
});

describe("contribution operations", () => {
  it("should add a contribution", () => {
    const memorial = useMemorialStore.getState().createMemorial({
      name: "测试用户",
      gender: "male",
      birthDate: "1950-01-01",
      deathDate: "2020-01-01",
    });

    const collaborator = useMemorialStore.getState().addCollaborator(
      memorial.id,
      "张小明",
      "孙子"
    );

    const oldLastActive = collaborator!.lastActiveAt;
    vi.advanceTimersByTime(1000);

    useMemorialStore.getState().addContribution(
      memorial.id,
      collaborator!.id,
      collaborator!.name,
      "biography",
      "更新了生平介绍",
      "详细内容"
    );

    const contributions = useMemorialStore.getState().getContributions(memorial.id);
    expect(contributions.length).toBe(1);
    expect(contributions[0].type).toBe("biography");
    expect(contributions[0].summary).toBe("更新了生平介绍");

    const updatedCollaborator = useMemorialStore.getState().getCollaborators(memorial.id)[0];
    expect(updatedCollaborator.lastActiveAt).not.toBe(oldLastActive);
  });

  it("should add a contribution to front", () => {
    const memorial = useMemorialStore.getState().createMemorial({
      name: "测试用户",
      gender: "male",
      birthDate: "1950-01-01",
      deathDate: "2020-01-01",
    });

    const collaborator = useMemorialStore.getState().addCollaborator(
      memorial.id,
      "张小明",
      "孙子"
    );

    useMemorialStore.getState().addContribution(
      memorial.id,
      collaborator!.id,
      collaborator!.name,
      "biography",
      "第一次贡献"
    );

    useMemorialStore.getState().addContribution(
      memorial.id,
      collaborator!.id,
      collaborator!.name,
      "photo",
      "第二次贡献"
    );

    const contributions = useMemorialStore.getState().getContributions(memorial.id);
    expect(contributions[0].summary).toBe("第二次贡献");
    expect(contributions[1].summary).toBe("第一次贡献");
  });

  it("should get contributions for non-existent memorial", () => {
    const contributions = useMemorialStore.getState().getContributions("non-existent");
    expect(contributions).toEqual([]);
  });
});

describe("drift bottle operations", () => {
  it("should send a drift bottle", () => {
    const fromMemorial = useMemorialStore.getState().createMemorial({
      name: "发送者",
      gender: "male",
      birthDate: "1950-01-01",
      deathDate: "2020-01-01",
      isPrivate: false,
    });

    const toMemorial = useMemorialStore.getState().createMemorial({
      name: "接收者",
      gender: "female",
      birthDate: "1955-01-01",
      deathDate: "2021-01-01",
      isPrivate: false,
    });

    const bottle = useMemorialStore.getState().sendDriftBottle(
      fromMemorial.id,
      "这是一条漂流瓶消息"
    );

    expect(bottle).not.toBeNull();
    expect(bottle?.content).toBe("这是一条漂流瓶消息");
    expect(bottle?.fromMemorialId).toBe(fromMemorial.id);
    expect(bottle?.toMemorialId).toBe(toMemorial.id);
    expect(bottle?.isRead).toBe(false);
    expect(useMemorialStore.getState().driftBottles.length).toBe(1);
  });

  it("should not send drift bottle when from memorial not found", () => {
    const bottle = useMemorialStore.getState().sendDriftBottle(
      "non-existent",
      "消息"
    );
    expect(bottle).toBeNull();
  });

  it("should not send drift bottle when no public memorials available", () => {
    const fromMemorial = useMemorialStore.getState().createMemorial({
      name: "发送者",
      gender: "male",
      birthDate: "1950-01-01",
      deathDate: "2020-01-01",
      isPrivate: false,
    });

    const bottle = useMemorialStore.getState().sendDriftBottle(
      fromMemorial.id,
      "消息"
    );
    expect(bottle).toBeNull();
  });

  it("should not send drift bottle to private memorials", () => {
    const fromMemorial = useMemorialStore.getState().createMemorial({
      name: "发送者",
      gender: "male",
      birthDate: "1950-01-01",
      deathDate: "2020-01-01",
      isPrivate: false,
    });

    useMemorialStore.getState().createMemorial({
      name: "私密接收者",
      gender: "female",
      birthDate: "1955-01-01",
      deathDate: "2021-01-01",
      isPrivate: true,
    });

    const bottle = useMemorialStore.getState().sendDriftBottle(
      fromMemorial.id,
      "消息"
    );
    expect(bottle).toBeNull();
  });

  it("should get drift bottles for memorial", () => {
    const memorial1 = useMemorialStore.getState().createMemorial({
      name: "用户1",
      gender: "male",
      birthDate: "1950-01-01",
      deathDate: "2020-01-01",
      isPrivate: false,
    });

    const memorial2 = useMemorialStore.getState().createMemorial({
      name: "用户2",
      gender: "female",
      birthDate: "1955-01-01",
      deathDate: "2021-01-01",
      isPrivate: false,
    });

    useMemorialStore.getState().sendDriftBottle(memorial1.id, "消息1");
    useMemorialStore.getState().sendDriftBottle(memorial2.id, "消息2");

    const bottles = useMemorialStore.getState().getDriftBottlesForMemorial(
      memorial1.id
    );
    expect(bottles.length).toBe(1);
    expect(bottles[0].content).toBe("消息2");
  });

  it("should mark drift bottle as read", () => {
    const memorial1 = useMemorialStore.getState().createMemorial({
      name: "用户1",
      gender: "male",
      birthDate: "1950-01-01",
      deathDate: "2020-01-01",
      isPrivate: false,
    });

    const memorial2 = useMemorialStore.getState().createMemorial({
      name: "用户2",
      gender: "female",
      birthDate: "1955-01-01",
      deathDate: "2021-01-01",
      isPrivate: false,
    });

    const bottle = useMemorialStore.getState().sendDriftBottle(
      memorial1.id,
      "消息"
    );

    expect(bottle?.isRead).toBe(false);

    useMemorialStore.getState().markDriftBottleRead(bottle!.id);

    const updated = useMemorialStore.getState().driftBottles.find(
      (b) => b.id === bottle!.id
    );
    expect(updated?.isRead).toBe(true);
  });

  it("should get unread drift bottle count", () => {
    const memorial1 = useMemorialStore.getState().createMemorial({
      name: "用户1",
      gender: "male",
      birthDate: "1950-01-01",
      deathDate: "2020-01-01",
      isPrivate: false,
    });

    const memorial2 = useMemorialStore.getState().createMemorial({
      name: "用户2",
      gender: "female",
      birthDate: "1955-01-01",
      deathDate: "2021-01-01",
      isPrivate: false,
    });

    useMemorialStore.getState().sendDriftBottle(memorial1.id, "消息1");
    useMemorialStore.getState().sendDriftBottle(memorial1.id, "消息2");

    expect(useMemorialStore.getState().getUnreadDriftBottleCount(memorial2.id)).toBe(2);

    const bottleId = useMemorialStore.getState().driftBottles[0].id;
    useMemorialStore.getState().markDriftBottleRead(bottleId);

    expect(useMemorialStore.getState().getUnreadDriftBottleCount(memorial2.id)).toBe(1);
  });
});

describe("load and save operations", () => {
  it("should load memorials from storage", async () => {
    const sampleData: Memorial[] = [
      {
        id: "stored-1",
        name: "存储测试",
        gender: "male",
        birthDate: "1950-01-01",
        deathDate: "2020-01-01",
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
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      },
    ];

    localStorage.setItem("memorial_memorials", JSON.stringify(sampleData));

    useMemorialStore.getState().loadMemorials();

    await vi.runAllTimersAsync();

    expect(useMemorialStore.getState().isLoaded).toBe(true);
    expect(useMemorialStore.getState().memorials.length).toBe(1);
  });

  it("should load sample data when no stored data", async () => {
    useMemorialStore.getState().loadMemorials();

    await vi.runAllTimersAsync();

    expect(useMemorialStore.getState().isLoaded).toBe(true);
    expect(useMemorialStore.getState().memorials.length).toBeGreaterThan(0);
    expect(localStorage.getItem("memorial_memorials")).toBeDefined();
  });

  it("should save memorials to storage", () => {
    const memorial = useMemorialStore.getState().createMemorial({
      name: "测试用户",
      gender: "male",
      birthDate: "1950-01-01",
      deathDate: "2020-01-01",
    });

    useMemorialStore.getState().saveMemorials();

    const stored = localStorage.getItem("memorial_memorials");
    expect(stored).toBeDefined();

    const parsed = JSON.parse(stored!);
    expect(parsed.length).toBe(1);
    expect(parsed[0].id).toBe(memorial.id);
  });

  it("should load family relations from storage", () => {
    const storedRelations = [
      {
        id: "rel-1",
        fromMemorialId: "from-1",
        toMemorialId: "to-1",
        relation: "spouse" as RelationType,
        createdAt: "2024-01-01T00:00:00.000Z",
      },
    ];

    localStorage.setItem(
      "memorial_family_relations",
      JSON.stringify(storedRelations)
    );

    useMemorialStore.getState().loadFamilyRelations();

    expect(useMemorialStore.getState().familyRelations.length).toBe(1);
  });

  it("should load sample family relations when no stored data", () => {
    useMemorialStore.getState().loadFamilyRelations();

    expect(useMemorialStore.getState().familyRelations.length).toBeGreaterThan(0);
    expect(localStorage.getItem("memorial_family_relations")).toBeDefined();
  });

  it("should save family relations to storage", () => {
    const memorial1 = useMemorialStore.getState().createMemorial({
      name: "测试用户1",
      gender: "male",
      birthDate: "1950-01-01",
      deathDate: "2020-01-01",
    });

    const memorial2 = useMemorialStore.getState().createMemorial({
      name: "测试用户2",
      gender: "female",
      birthDate: "1955-01-01",
      deathDate: "2021-01-01",
    });

    useMemorialStore.getState().addFamilyRelation(
      memorial1.id,
      memorial2.id,
      "spouse"
    );

    useMemorialStore.getState().saveFamilyRelations();

    const stored = localStorage.getItem("memorial_family_relations");
    expect(stored).toBeDefined();
    const parsed = JSON.parse(stored!);
    expect(parsed.length).toBe(1);
  });

  it("should load drift bottles from storage", () => {
    const storedBottles = [
      {
        id: "bottle-1",
        content: "测试消息",
        fromMemorialId: "from-1",
        fromMemorialName: "发送者",
        toMemorialId: "to-1",
        createdAt: "2024-01-01T00:00:00.000Z",
        isRead: false,
      },
    ];

    localStorage.setItem(
      "memorial_drift_bottles",
      JSON.stringify(storedBottles)
    );

    useMemorialStore.getState().loadDriftBottles();

    expect(useMemorialStore.getState().driftBottles.length).toBe(1);
  });

  it("should save drift bottles to storage", () => {
    const memorial1 = useMemorialStore.getState().createMemorial({
      name: "用户1",
      gender: "male",
      birthDate: "1950-01-01",
      deathDate: "2020-01-01",
      isPrivate: false,
    });

    const memorial2 = useMemorialStore.getState().createMemorial({
      name: "用户2",
      gender: "female",
      birthDate: "1955-01-01",
      deathDate: "2021-01-01",
      isPrivate: false,
    });

    useMemorialStore.getState().sendDriftBottle(memorial1.id, "测试消息");

    useMemorialStore.getState().saveDriftBottles();

    const stored = localStorage.getItem("memorial_drift_bottles");
    expect(stored).toBeDefined();
    const parsed = JSON.parse(stored!);
    expect(parsed.length).toBe(1);
  });

  it("should handle loadFamilyRelations error", () => {
    const originalGetItem = localStorage.getItem;
    localStorage.getItem = vi.fn().mockImplementation(() => {
      throw new Error("storage error");
    });

    useMemorialStore.getState().loadFamilyRelations();

    expect(localStorage.getItem).toHaveBeenCalled();

    localStorage.getItem = originalGetItem;
  });

  it("should handle loadDriftBottles error", () => {
    const originalGetItem = localStorage.getItem;
    localStorage.getItem = vi.fn().mockImplementation(() => {
      throw new Error("storage error");
    });

    useMemorialStore.getState().loadDriftBottles();

    expect(localStorage.getItem).toHaveBeenCalled();

    localStorage.getItem = originalGetItem;
  });

  it("should handle loadMemorials error", async () => {
    const originalGetItem = localStorage.getItem;
    localStorage.getItem = vi.fn().mockImplementation(() => {
      throw new Error("storage error");
    });

    useMemorialStore.getState().loadMemorials();

    await vi.runAllTimersAsync();

    expect(useMemorialStore.getState().isLoaded).toBe(true);

    localStorage.getItem = originalGetItem;
  });

  it("should handle migrateMemorials error", async () => {
    localStorage.setItem("memorial_memorials", JSON.stringify([{ id: "test" }]));
    mockMigrateMemorials.mockRejectedValueOnce(new Error("migrate error"));

    useMemorialStore.getState().loadMemorials();
    await vi.runAllTimersAsync();

    expect(useMemorialStore.getState().isLoaded).toBe(true);
  });

  it("should handle getSampleMemorials error", async () => {
    localStorage.setItem("memorial_memorials", "");
    mockGetSampleMemorials.mockRejectedValueOnce(new Error("sample error"));

    useMemorialStore.getState().loadMemorials();
    await vi.runAllTimersAsync();

    expect(useMemorialStore.getState().isLoaded).toBe(true);
  });

  it("should handle getSampleFamilyRelations error", () => {
    localStorage.setItem("memorial_family_relations", "");
    mockGetSampleFamilyRelations.mockImplementationOnce(() => {
      throw new Error("sample error");
    });

    useMemorialStore.getState().loadFamilyRelations();

    expect(useMemorialStore.getState().familyRelations).toEqual([]);
  });

  it("should handle loadDriftBottles JSON parse error", () => {
    localStorage.setItem("memorial_drift_bottles", "invalid json");

    useMemorialStore.getState().loadDriftBottles();

    expect(useMemorialStore.getState().driftBottles).toEqual([]);
  });
});

describe("reset to sample data", () => {
  it("should reset to sample data", async () => {
    useMemorialStore.getState().createMemorial({
      name: "自定义用户",
      gender: "male",
      birthDate: "1950-01-01",
      deathDate: "2020-01-01",
    });

    expect(useMemorialStore.getState().memorials.length).toBe(1);

    await useMemorialStore.getState().resetToSampleData();

    expect(useMemorialStore.getState().memorials.length).toBeGreaterThan(0);
    expect(useMemorialStore.getState().isLoaded).toBe(true);
    expect(useMemorialStore.getState().driftBottles.length).toBe(0);
  });
});

describe("migrateMemorials integration", () => {
  it("should migrate old memorial data when loading", async () => {
    const oldData: Partial<Memorial>[] = [
      {
        id: "old-1",
        name: "旧数据",
        gender: "male",
        birthDate: "1950-01-01",
        deathDate: "2020-01-01",
        avatar: "",
        epitaph: "",
        biography: "",
        biographyDisplayMode: "text",
        photos: [],
        messages: [],
        flowers: [],
        candles: [{ id: "c1", message: "test", isEternal: true, createdAt: "2024-01-01" }],
        isPrivate: false,
        password: "",
        theme: "default",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      },
    ];

    localStorage.setItem("memorial_memorials", JSON.stringify(oldData));

    useMemorialStore.getState().loadMemorials();

    await vi.runAllTimersAsync();

    const migrated = useMemorialStore.getState().memorials[0];
    expect(migrated.adminPassword).toBe("");
    expect(migrated.collaborators).toEqual([]);
    expect(migrated.contributions).toEqual([]);
    expect(migrated.inviteLinks).toEqual([]);
    expect(migrated.candles[0].name).toBe("");
  });

  it("should save migrated data back to storage", async () => {
    const oldData: Partial<Memorial>[] = [
      {
        id: "old-1",
        name: "旧数据",
        gender: "male",
        birthDate: "1950-01-01",
        deathDate: "2020-01-01",
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
        theme: "default",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      },
    ];

    localStorage.setItem("memorial_memorials", JSON.stringify(oldData));

    useMemorialStore.getState().loadMemorials();

    await vi.runAllTimersAsync();

    const stored = JSON.parse(localStorage.getItem("memorial_memorials")!);
    expect(stored[0].adminPassword).toBe("");
    expect(stored[0].collaborators).toEqual([]);
  });
});

describe("getRelationsForMemorial edge cases", () => {
  it("should handle relation where fromMemorial is not found", () => {
    const memorial = useMemorialStore.getState().createMemorial({
      name: "测试用户",
      gender: "male",
      birthDate: "1950-01-01",
      deathDate: "2020-01-01",
    });

    useMemorialStore.setState({
      familyRelations: [
        {
          id: "rel-1",
          fromMemorialId: "non-existent",
          toMemorialId: memorial.id,
          relation: "spouse",
          createdAt: mockNow.toISOString(),
        },
      ],
    });

    const relations = useMemorialStore.getState().getRelationsForMemorial(memorial.id);
    expect(relations.length).toBe(0);
  });
});
