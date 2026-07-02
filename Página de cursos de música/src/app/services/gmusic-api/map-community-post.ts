import type {
  CommunityPostType,
  ExternalLinkProvider,
} from "../../data/community-post-types";
import type { CommunityPostCreateContext } from "../../utils/community-access";

export interface CommunityPostApiRecord {
  id: string;
  author: string;
  author_image: string;
  instrument: string;
  time_ago: string;
  content: string;
  post_type: CommunityPostType;
  level: "BASIC" | "INTERMEDIATE" | "ADVANCED";
  lesson_number: number | null;
  topic_label: string | null;
  external_url: string | null;
  external_provider: ExternalLinkProvider | null;
  likes: number;
  comments: number;
  is_liked: boolean;
  created_at: string;
}

export interface CreateCommunityPostRequest {
  post_type: CommunityPostType;
  content: string;
  topic_label?: string | null;
  external_url?: string | null;
  external_provider?: ExternalLinkProvider | null;
}

export function mapCommunityPostApiRecord(record: CommunityPostApiRecord) {
  return {
    id: record.id,
    author: record.author,
    authorImage: record.author_image,
    instrument: record.instrument,
    timeAgo: record.time_ago,
    content: record.content,
    postType: record.post_type,
    level: record.level,
    lessonNumber: record.lesson_number ?? undefined,
    topicLabel: record.topic_label ?? undefined,
    externalUrl: record.external_url ?? undefined,
    externalProvider: record.external_provider ?? undefined,
    likes: record.likes,
    comments: record.comments,
    isLiked: record.is_liked,
  };
}

export function buildCreateCommunityPostBody(
  input: {
    postType: CommunityPostType;
    content: string;
    topicLabel?: string;
    externalUrl?: string;
    externalProvider?: ExternalLinkProvider;
  },
  _context: CommunityPostCreateContext
): CreateCommunityPostRequest {
  return {
    post_type: input.postType,
    content: input.content.trim(),
    topic_label: input.topicLabel?.trim() || null,
    external_url: input.externalUrl?.trim() || null,
    external_provider: input.externalProvider ?? null,
  };
}
