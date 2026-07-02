import { apiGet, apiPost } from "./client";
import { getApiBaseUrl } from "./config";
import type {
  CommunityPostApiRecord,
  CreateCommunityPostRequest,
} from "./map-community-post";

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
