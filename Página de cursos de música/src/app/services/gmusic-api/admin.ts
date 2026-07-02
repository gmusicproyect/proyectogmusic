import { apiGet, apiPost, apiPut } from "./client";
import { getApiBaseUrl } from "./config";

export type AdminModuleListItem = {
  id: string;
  order: number;
  title: string;
  status: string;
  listStatus: "empty" | "draft" | "published";
  completeSlots: number;
  totalSlots: number;
  percentComplete: number;
};

export type AdminModuleListResponse = {
  course: { id: string; slug: string; title: string };
  modules: AdminModuleListItem[];
};

export type AdminSlotNode = {
  id: string;
  title: string;
  status: string;
  videoUrl: string | null;
  guideText: string | null;
  completionCriteria: string | null;
  ctaLabel: string | null;
  complete: boolean;
};

export type AdminModuleDetailResponse = {
  module: {
    id: string;
    order: number;
    title: string;
    status: string;
    course: { id: string; slug: string; title: string };
  };
  slots: Array<{
    order: number;
    stageType: string;
    stageLabel: string;
    node: AdminSlotNode | null;
  }>;
  canPublish: boolean;
  publishBlockReason: string | null;
  completeSlots: number;
  totalSlots: number;
  percentComplete: number;
};

export type UpdateAdminSlotInput = {
  title: string;
  videoUrl?: string | null;
  guideText?: string | null;
  completionCriteria?: string | null;
  ctaLabel?: string | null;
};

export async function fetchAdminModules(options?: { signal?: AbortSignal }) {
  return apiGet<AdminModuleListResponse>(`${getApiBaseUrl()}/admin/modules`, options);
}

export async function createAdminModule(title: string) {
  const { data } = await apiPost<{ module: { id: string } }>(
    `${getApiBaseUrl()}/admin/modules`,
    { title }
  );
  return data;
}

export async function fetchAdminModuleDetail(moduleId: string, options?: { signal?: AbortSignal }) {
  return apiGet<AdminModuleDetailResponse>(
    `${getApiBaseUrl()}/admin/modules/${moduleId}`,
    options
  );
}

export async function updateAdminSlot(
  moduleId: string,
  slotOrder: number,
  input: UpdateAdminSlotInput
) {
  const { data } = await apiPut<{ node: AdminSlotNode }>(
    `${getApiBaseUrl()}/admin/modules/${moduleId}/slots/${slotOrder}`,
    input
  );
  return data;
}

export async function publishAdminModule(moduleId: string) {
  const { data } = await apiPost<AdminModuleDetailResponse>(
    `${getApiBaseUrl()}/admin/modules/${moduleId}/publish`,
    {}
  );
  return data;
}
