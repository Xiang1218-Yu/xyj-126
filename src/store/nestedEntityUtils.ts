import type { EntityWithId } from "./createCRUDStore";
import { generateId } from "@/utils";

export type NestedEntityWithId = EntityWithId;

export interface NestedEntityWithCreatedAt extends NestedEntityWithId {
  createdAt: string;
}

export function nowISO(): string {
  return new Date().toISOString();
}

export function addNestedItemRaw<P extends EntityWithId, C extends EntityWithId>(
  parent: P,
  listKey: keyof P,
  newItem: C
): P {
  const currentList = ((parent[listKey] as unknown as C[]) || []) as C[];
  return {
    ...parent,
    [listKey]: [...currentList, newItem],
    updatedAt: nowISO(),
  } as unknown as P;
}

export function addNestedItemRawToFront<P extends EntityWithId, C extends EntityWithId>(
  parent: P,
  listKey: keyof P,
  newItem: C
): P {
  const currentList = ((parent[listKey] as unknown as C[]) || []) as C[];
  return {
    ...parent,
    [listKey]: [newItem, ...currentList],
    updatedAt: nowISO(),
  } as unknown as P;
}

export function addNestedItem<
  P extends EntityWithId,
  C extends NestedEntityWithCreatedAt
>(
  parent: P,
  listKey: keyof P,
  itemData: Omit<C, "id" | "createdAt">,
  extraFields?: Partial<C>
): P {
  const newItem: C = {
    ...(itemData as unknown as C),
    id: generateId(),
    createdAt: nowISO(),
    ...extraFields,
  } as C;

  const currentList = ((parent[listKey] as unknown as C[]) || []) as C[];
  return {
    ...parent,
    [listKey]: [...currentList, newItem],
    updatedAt: nowISO(),
  } as unknown as P;
}

export function addNestedItemToFront<
  P extends EntityWithId,
  C extends NestedEntityWithCreatedAt
>(
  parent: P,
  listKey: keyof P,
  itemData: Omit<C, "id" | "createdAt">,
  extraFields?: Partial<C>
): P {
  const newItem: C = {
    ...(itemData as unknown as C),
    id: generateId(),
    createdAt: nowISO(),
    ...extraFields,
  } as C;

  const currentList = ((parent[listKey] as unknown as C[]) || []) as C[];
  return {
    ...parent,
    [listKey]: [newItem, ...currentList],
    updatedAt: nowISO(),
  } as unknown as P;
}

export function addNestedItemWithOrder<
  P extends EntityWithId,
  C extends NestedEntityWithId & { order: number }
>(
  parent: P,
  listKey: keyof P,
  itemData: Omit<C, "id" | "order">
): P {
  const currentList = ((parent[listKey] as unknown as C[]) || []) as C[];
  const newItem: C = {
    ...(itemData as unknown as C),
    id: generateId(),
    order: currentList.length,
  } as C;

  return {
    ...parent,
    [listKey]: [...currentList, newItem],
    updatedAt: nowISO(),
  } as unknown as P;
}

export function removeNestedItem<P extends EntityWithId>(
  parent: P,
  listKey: keyof P,
  itemId: string
): P {
  const currentList = (parent[listKey] as unknown as EntityWithId[]) || [];
  return {
    ...parent,
    [listKey]: currentList.filter((item) => item.id !== itemId),
    updatedAt: nowISO(),
  } as unknown as P;
}

export function updateNestedItem<
  P extends EntityWithId,
  C extends EntityWithId
>(
  parent: P,
  listKey: keyof P,
  itemId: string,
  updates: Partial<C>
): P {
  const currentList = ((parent[listKey] as unknown as C[]) || []) as C[];
  return {
    ...parent,
    [listKey]: currentList.map((item) =>
      item.id === itemId ? ({ ...item, ...updates } as C) : item
    ),
    updatedAt: nowISO(),
  } as unknown as P;
}

export function findNestedItem<P extends EntityWithId, C extends EntityWithId>(
  parent: P,
  listKey: keyof P,
  itemId: string
): C | undefined {
  const currentList = (parent[listKey] as unknown as C[]) || [];
  return currentList.find((item) => item.id === itemId);
}

export function mapParentById<P extends EntityWithId>(
  items: P[],
  parentId: string,
  mapper: (parent: P) => P
): P[] {
  return items.map((item) => (item.id === parentId ? mapper(item) : item));
}
