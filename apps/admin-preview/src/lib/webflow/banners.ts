import type { BannerFieldSlugs } from "@/lib/webflow/field-slugs";
import {
  defaultExpiresAtIso,
  defaultUrgentUntilIso,
  isPastRetentionArchive,
  parseIsoMs,
  slugifyBase,
  validateUrgentWindow,
} from "@/lib/webflow/banner-helpers";
import { webflowJson, WebflowRequestError } from "@/lib/webflow/client";
import {
  publishCollectionItemIds,
  type PublishCollectionItemsOptions,
} from "@/lib/webflow/publishItems";
import { getBannerLocaleContext } from "@/lib/webflow/siteLocales";

export type WebflowCollectionItem = {
  id: string;
  isArchived?: boolean;
  isDraft?: boolean;
  fieldData?: Record<string, unknown>;
};

type ListItemsResponse = {
  items: WebflowCollectionItem[];
  pagination: { total: number; limit: number; offset: number };
};

function readStr(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object" && v !== null && "url" in v) {
    const u = (v as { url?: unknown }).url;
    return typeof u === "string" ? u : "";
  }
  return String(v);
}

function readBool(v: unknown): boolean {
  return v === true || v === "true" || v === 1;
}

function readDateIso(v: unknown): string | null {
  if (v == null) return null;
  if (typeof v === "string") return v;
  return null;
}

export type BannerView = {
  id: string;
  name: string;
  slug: string;
  message: string;
  linkUrl: string;
  active: boolean;
  expiresAt: string | null;
  urgent: boolean;
  urgentUntil: string | null;
  editorNotes: string;
  isArchived: boolean;
  isDraft: boolean;
  derived: {
    isExpired: boolean;
    inUrgentWindow: boolean;
    hiddenByRetention: boolean;
  };
};

export function mapItemToBanner(
  item: WebflowCollectionItem,
  slugs: BannerFieldSlugs,
  nowMs: number
): BannerView {
  const fd = item.fieldData ?? {};
  const expiresAt = readDateIso(fd[slugs.expiresAt]);
  const urgentUntil = readDateIso(fd[slugs.urgentUntil]);
  const expMs = parseIsoMs(expiresAt);
  const isExpired = expMs !== null && nowMs > expMs;
  const uMs = parseIsoMs(urgentUntil);
  const urgent = readBool(fd[slugs.urgent]);
  const inUrgentWindow =
    urgent &&
    uMs !== null &&
    nowMs <= uMs &&
    (expMs === null || nowMs <= expMs);
  const hiddenByRetention = isPastRetentionArchive(expiresAt, nowMs);

  return {
    id: item.id,
    name: readStr(fd.name),
    slug: readStr(fd.slug),
    message: readStr(fd[slugs.message]),
    linkUrl: readStr(fd[slugs.linkUrl]),
    active: readBool(fd[slugs.active]),
    expiresAt,
    urgent,
    urgentUntil,
    editorNotes: readStr(fd[slugs.editorNotes]),
    isArchived: item.isArchived === true,
    isDraft: item.isDraft === true,
    derived: { isExpired, inUrgentWindow, hiddenByRetention },
  };
}

export async function listAllItems(
  token: string,
  collectionId: string
): Promise<WebflowCollectionItem[]> {
  const all: WebflowCollectionItem[] = [];
  let offset = 0;
  const limit = 100;
  for (;;) {
    const q = new URLSearchParams({
      offset: String(offset),
      limit: String(limit),
    });
    const res = await webflowJson<ListItemsResponse>(
      token,
      `/collections/${collectionId}/items?${q.toString()}`,
      { method: "GET" }
    );
    all.push(...(res.items ?? []));
    const total = res.pagination?.total ?? all.length;
    if (all.length >= total || (res.items?.length ?? 0) < limit) break;
    offset += limit;
  }
  return all;
}

export async function publishItemIds(
  token: string,
  collectionId: string,
  itemIds: string[],
  options?: PublishCollectionItemsOptions
): Promise<void> {
  await publishCollectionItemIds(token, collectionId, itemIds, options);
}

function buildFieldData(
  slugs: BannerFieldSlugs,
  input: {
    name: string;
    slug: string;
    message: string;
    linkUrl: string;
    active: boolean;
    expiresAt: string | null;
    urgent: boolean;
    urgentUntil: string | null;
    editorNotes: string;
  }
): Record<string, unknown> {
  const fd: Record<string, unknown> = {
    name: input.name,
    slug: input.slug,
    [slugs.message]: input.message,
    [slugs.linkUrl]: input.linkUrl || "",
    [slugs.active]: input.active,
    [slugs.expiresAt]: input.expiresAt ?? "",
    [slugs.urgent]: input.urgent,
    [slugs.urgentUntil]: input.urgentUntil ?? "",
    [slugs.editorNotes]: input.editorNotes || "",
  };
  return fd;
}

export type BannerWriteInput = {
  name: string;
  message: string;
  linkUrl?: string;
  active: boolean;
  expiresAt: string | null;
  urgent: boolean;
  urgentUntil?: string | null;
  editorNotes?: string;
  confirmReplaceUrgent?: boolean;
};

export function findOtherUrgentId(
  items: WebflowCollectionItem[],
  slugs: BannerFieldSlugs,
  excludeId?: string
): { id: string; name: string } | null {
  for (const it of items) {
    if (excludeId && it.id === excludeId) continue;
    const fd = it.fieldData ?? {};
    if (readBool(fd[slugs.urgent])) {
      return { id: it.id, name: readStr(fd.name) || it.id };
    }
  }
  return null;
}

export async function archiveRetentionExpired(
  token: string,
  collectionId: string,
  slugs: BannerFieldSlugs,
  nowMs: number
): Promise<number> {
  const items = await listAllItems(token, collectionId);
  const publishedIds: string[] = [];
  let n = 0;
  for (const it of items) {
    if (it.isArchived) continue;
    const fd = it.fieldData ?? {};
    const expiresAt = readDateIso(fd[slugs.expiresAt]);
    if (!isPastRetentionArchive(expiresAt, nowMs)) continue;
    try {
      await webflowJson<unknown>(
        token,
        `/collections/${collectionId}/items/${it.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({ isArchived: true }),
        }
      );
      publishedIds.push(it.id);
      n += 1;
    } catch {
      // best-effort sweep
    }
  }
  if (publishedIds.length) {
    try {
      await publishItemIds(token, collectionId, publishedIds);
    } catch {
      // publish is best-effort after archive
    }
  }
  return n;
}

export async function createBannerItem(
  token: string,
  collectionId: string,
  slugs: BannerFieldSlugs,
  input: BannerWriteInput,
  nowMs: number
): Promise<{ item: WebflowCollectionItem }> {
  const localeCtx = await getBannerLocaleContext(token);
  const publishOpts: PublishCollectionItemsOptions | undefined =
    localeCtx.cmsLocaleIds.length > 0
      ? { cmsLocaleIds: localeCtx.cmsLocaleIds }
      : undefined;

  const resolvedExpires =
    input.expiresAt?.trim()
      ? input.expiresAt.trim()
      : defaultExpiresAtIso(nowMs);

  const urgentUntil =
    input.urgent && resolvedExpires
      ? input.urgentUntil?.trim()
        ? input.urgentUntil
        : defaultUrgentUntilIso(resolvedExpires, nowMs)
      : input.urgentUntil ?? null;

  const v = validateUrgentWindow(
    input.urgent,
    urgentUntil,
    resolvedExpires
  );
  if (!v.ok) throw new Error(v.error);

  const items = await listAllItems(token, collectionId);
  const other = findOtherUrgentId(items, slugs);
  if (input.urgent && other && !input.confirmReplaceUrgent) {
    const err = new Error("Another banner is already urgent.");
    (err as Error & { code: string; conflict: typeof other }).code =
      "URGENT_CONFLICT";
    (err as Error & { conflict: typeof other }).conflict = other;
    throw err;
  }

  if (input.urgent && other && input.confirmReplaceUrgent) {
    const otherRow = items.find((i) => i.id === other.id);
    const otherFd = {
      ...((otherRow?.fieldData ?? {}) as Record<string, unknown>),
    };
    otherFd[slugs.urgent] = false;
    otherFd[slugs.urgentUntil] = "";
    const clearUrgentBody: Record<string, unknown> = {
      isDraft: false,
      fieldData: otherFd,
    };
    if (localeCtx.cmsLocaleId) {
      clearUrgentBody.cmsLocaleId = localeCtx.cmsLocaleId;
    }
    await webflowJson<unknown>(
      token,
      `/collections/${collectionId}/items/${other.id}`,
      {
        method: "PATCH",
        body: JSON.stringify(clearUrgentBody),
      }
    );
    await publishItemIds(token, collectionId, [other.id], publishOpts);
  }

  const slugBase = slugifyBase(input.name);
  const slug = `${slugBase}-${Math.random().toString(36).slice(2, 8)}`;

  const fieldData = buildFieldData(slugs, {
    name: input.name.trim(),
    slug,
    message: input.message.trim(),
    linkUrl: (input.linkUrl ?? "").trim(),
    active: input.active,
    expiresAt: resolvedExpires,
    urgent: input.urgent,
    urgentUntil,
    editorNotes: (input.editorNotes ?? "").trim(),
  });

  const createBody: Record<string, unknown> = {
    isDraft: false,
    isArchived: false,
    fieldData,
  };
  if (localeCtx.cmsLocaleId) {
    createBody.cmsLocaleId = localeCtx.cmsLocaleId;
  }

  const created = await webflowJson<WebflowCollectionItem>(
    token,
    `/collections/${collectionId}/items`,
    {
      method: "POST",
      body: JSON.stringify(createBody),
    }
  );

  await publishItemIds(token, collectionId, [created.id], publishOpts);
  await archiveRetentionExpired(token, collectionId, slugs, nowMs);
  return { item: created };
}

export async function updateBannerItem(
  token: string,
  collectionId: string,
  slugs: BannerFieldSlugs,
  itemId: string,
  input: BannerWriteInput,
  nowMs: number
): Promise<{ item: WebflowCollectionItem }> {
  const localeCtx = await getBannerLocaleContext(token);
  const publishOpts: PublishCollectionItemsOptions | undefined =
    localeCtx.cmsLocaleIds.length > 0
      ? { cmsLocaleIds: localeCtx.cmsLocaleIds }
      : undefined;

  const existing = await webflowJson<WebflowCollectionItem>(
    token,
    `/collections/${collectionId}/items/${itemId}`,
    { method: "GET" }
  );

  const fdPrev = { ...(existing.fieldData as Record<string, unknown>) };

  const existingExpires = readDateIso(fdPrev[slugs.expiresAt]);
  const resolvedExpires =
    input.expiresAt?.trim()
      ? input.expiresAt.trim()
      : existingExpires ?? defaultExpiresAtIso(nowMs);

  const urgentUntil =
    input.urgent && resolvedExpires
      ? input.urgentUntil?.trim()
        ? input.urgentUntil
        : defaultUrgentUntilIso(resolvedExpires, nowMs)
      : input.urgentUntil ?? null;

  const v = validateUrgentWindow(
    input.urgent,
    urgentUntil,
    resolvedExpires
  );
  if (!v.ok) throw new Error(v.error);

  const items = await listAllItems(token, collectionId);
  const other = findOtherUrgentId(items, slugs, itemId);
  if (input.urgent && other && !input.confirmReplaceUrgent) {
    const err = new Error("Another banner is already urgent.");
    (err as Error & { code: string; conflict: typeof other }).code =
      "URGENT_CONFLICT";
    (err as Error & { conflict: typeof other }).conflict = other;
    throw err;
  }

  const name = input.name.trim() || readStr(fdPrev.name);
  const slug = readStr(fdPrev.slug) || slugifyBase(name);

  const fieldData = buildFieldData(slugs, {
    name,
    slug,
    message: input.message.trim(),
    linkUrl: (input.linkUrl ?? "").trim(),
    active: input.active,
    expiresAt: resolvedExpires,
    urgent: input.urgent,
    urgentUntil,
    editorNotes: (input.editorNotes ?? "").trim(),
  });

  if (input.urgent && other && input.confirmReplaceUrgent) {
    const otherRow = items.find((i) => i.id === other.id);
    const otherFd = {
      ...((otherRow?.fieldData ?? {}) as Record<string, unknown>),
    };
    otherFd[slugs.urgent] = false;
    otherFd[slugs.urgentUntil] = "";
    const clearUrgentBody: Record<string, unknown> = {
      isDraft: false,
      fieldData: otherFd,
    };
    if (localeCtx.cmsLocaleId) {
      clearUrgentBody.cmsLocaleId = localeCtx.cmsLocaleId;
    }
    await webflowJson<unknown>(
      token,
      `/collections/${collectionId}/items/${other.id}`,
      {
        method: "PATCH",
        body: JSON.stringify(clearUrgentBody),
      }
    );
    await publishItemIds(token, collectionId, [other.id], publishOpts);
  }

  const patchBody: Record<string, unknown> = {
    isDraft: false,
    fieldData,
  };
  if (localeCtx.cmsLocaleId) {
    patchBody.cmsLocaleId = localeCtx.cmsLocaleId;
  }

  const updated = await webflowJson<WebflowCollectionItem>(
    token,
    `/collections/${collectionId}/items/${itemId}`,
    {
      method: "PATCH",
      body: JSON.stringify(patchBody),
    }
  );

  await publishItemIds(token, collectionId, [updated.id], publishOpts);
  await archiveRetentionExpired(token, collectionId, slugs, nowMs);
  return { item: updated };
}

export function isWebflowError(err: unknown): err is WebflowRequestError {
  return err instanceof WebflowRequestError;
}
