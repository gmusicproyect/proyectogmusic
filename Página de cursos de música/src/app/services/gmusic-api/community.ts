import { apiGet, apiPost, apiPut } from "./client";
import { getApiBaseUrl } from "./config";
import type {
  CommunityEnrollmentApiRecord,
  UpsertCommunityEnrollmentRequest,
} from "./map-community-enrollment";
import type {
  CommunityPostApiRecord,
  CreateCommunityPostRequest,
} from "./map-community-post";

export async function fetchCommunityEnrollment(options?: {
  signal?: AbortSignal;
}): Promise<CommunityEnrollmentApiRecord> {
  const response = await apiGet<{ enrollment: CommunityEnrollmentApiRecord }>(
    `${getApiBaseUrl()}/community/enrollment`,
    options
  );
  return response.enrollment;
}

export async function upsertCommunityEnrollment(
  body: UpsertCommunityEnrollmentRequest,
  options?: { signal?: AbortSignal }
): Promise<CommunityEnrollmentApiRecord> {
  const { data } = await apiPut<{ enrollment: CommunityEnrollmentApiRecord }>(
    `${getApiBaseUrl()}/community/enrollment`,
    body,
    options
  );
  return data.enrollment;
}

export async function fetchCommunityPosts(options?: {
  signal?: AbortSignal;
}): Promise<CommunityPostApiRecord[]> {
  const response = await apiGet<{ posts: CommunityPostApiRecord[] }>(
    `${getApiBaseUrl()}/community/posts`,
    options
  );
  return response.posts ?? [];
}

export async function createCommunityPost(
  body: CreateCommunityPostRequest,
  options?: { signal?: AbortSignal }
): Promise<CommunityPostApiRecord> {
  const { data } = await apiPost<{ post: CommunityPostApiRecord }>(
    `${getApiBaseUrl()}/community/posts`,
    body,
    options
  );
  return data.post;
}
