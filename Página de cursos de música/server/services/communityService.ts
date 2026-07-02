import type { CommunityEnrollment, CommunityPost, User } from "@prisma/client";
import {
  CommunityAccessDeniedError,
  assertAuthorizedCommunityLevel,
  buildCommunityRequestScope,
} from "../lib/communityAccess.js";
import { ApiError } from "../lib/errors.js";
import {
  buildProgramLabelFromEnrollment,
  type UpsertCommunityEnrollmentInput,
} from "../lib/parseUpsertCommunityEnrollmentBody.js";
import { resolveStudentAccess } from "../lib/studentAccess.js";
import { prisma } from "../lib/prisma.js";
import type { CreateCommunityPostInput } from "../lib/parseCreateCommunityPostBody.js";

const TIER_TO_COMMUNITY_LEVEL: Record<string, string> = {
  basico: "BASIC",
  intermedio: "INTERMEDIATE",
  avanzado: "ADVANCED",
};

export async function assertCommunitySubscriber(student: User): Promise<void> {
  const subscriptions = await prisma.subscription.findMany({
    where: { userId: student.id },
    select: {
      id: true,
      status: true,
      planId: true,
      endsAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const access = resolveStudentAccess(subscriptions);
  if (!access.canAccessStudentZone) {
    throw new ApiError(
      403,
      "FORBIDDEN",
      "Comunidad requiere suscripción activa."
    );
  }
}

export interface CommunityPostApiRecord {
  id: string;
  author: string;
  author_image: string;
  instrument: string;
  time_ago: string;
  content: string;
  post_type: string;
  level: string;
  lesson_number: number | null;
  topic_label: string | null;
  external_url: string | null;
  external_provider: string | null;
  likes: number;
  comments: number;
  is_liked: boolean;
  created_at: string;
}

function formatTimeAgoEs(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "Hace un momento";
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `Hace ${days} d`;
}

export function mapCommunityPostToApi(
  post: CommunityPost,
  authorName: string
): CommunityPostApiRecord {
  return {
    id: post.id,
    author: authorName,
    author_image: "",
    instrument: post.instrument,
    time_ago: formatTimeAgoEs(post.createdAt),
    content: post.content,
    post_type: post.postType,
    level: post.level,
    lesson_number: post.lessonNumber,
    topic_label: post.topicLabel,
    external_url: post.externalUrl,
    external_provider: post.externalProvider,
    likes: 0,
    comments: 0,
    is_liked: false,
    created_at: post.createdAt.toISOString(),
  };
}

export async function listCommunityPostsForStudent(
  student: User
): Promise<CommunityPostApiRecord[]> {
  await assertCommunitySubscriber(student);
  const enrollment = await getCommunityEnrollmentForUser(student.id);
  const scope = buildCommunityRequestScope({
    programLabel: enrollment.programLabel,
    instrument: enrollment.instrument,
    lessonNumber: enrollment.currentLessonNumber,
  });

  const posts = await prisma.communityPost.findMany({
    where: { level: scope.level },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return posts.map((post) => mapCommunityPostToApi(post, post.user.name));
}

export async function createCommunityPostForStudent(
  student: User,
  input: CreateCommunityPostInput
): Promise<CommunityPostApiRecord> {
  await assertCommunitySubscriber(student);
  const enrollment = await getCommunityEnrollmentForUser(student.id);

  let scope;
  try {
    scope = buildCommunityRequestScope({
      programLabel: enrollment.programLabel,
      instrument: enrollment.instrument,
      lessonNumber: enrollment.currentLessonNumber,
      clientRequestedLevel: input.clientRequestedLevel,
    });
    assertAuthorizedCommunityLevel(scope.level, input.clientRequestedLevel);
  } catch (error) {
    if (error instanceof CommunityAccessDeniedError) {
      throw new ApiError(403, "FORBIDDEN", error.message);
    }
    throw error;
  }

  const created = await prisma.communityPost.create({
    data: {
      userId: student.id,
      postType: input.postType,
      level: scope.level,
      instrument: scope.instrument,
      lessonNumber: scope.lessonNumber,
      content: input.content,
      topicLabel: input.topicLabel,
      externalUrl: input.externalUrl,
      externalProvider: input.externalProvider,
    },
  });

  return mapCommunityPostToApi(created, student.name);
}

export interface CommunityEnrollmentApiRecord {
  instrument: string;
  academic_tier_id: string;
  community_level: string;
  program_label: string;
  current_lesson_number: number | null;
  current_lesson_title: string | null;
}

export function mapCommunityEnrollmentToApi(
  enrollment: CommunityEnrollment
): CommunityEnrollmentApiRecord {
  return {
    instrument: enrollment.instrument,
    academic_tier_id: enrollment.academicTierId,
    community_level:
      TIER_TO_COMMUNITY_LEVEL[enrollment.academicTierId] ?? "BASIC",
    program_label: enrollment.programLabel,
    current_lesson_number: enrollment.currentLessonNumber,
    current_lesson_title: enrollment.currentLessonTitle,
  };
}

export async function getCommunityEnrollmentForUser(
  userId: string
): Promise<CommunityEnrollment> {
  const enrollment = await prisma.communityEnrollment.findUnique({
    where: { userId },
  });

  if (!enrollment) {
    throw new ApiError(
      403,
      "FORBIDDEN",
      "Sin inscripción de comunidad. Elige tu nivel en Academia."
    );
  }

  return enrollment;
}

export async function getCommunityEnrollmentForStudent(
  student: User
): Promise<CommunityEnrollmentApiRecord> {
  await assertCommunitySubscriber(student);
  const enrollment = await getCommunityEnrollmentForUser(student.id);
  return mapCommunityEnrollmentToApi(enrollment);
}

export async function upsertCommunityEnrollmentForStudent(
  student: User,
  input: UpsertCommunityEnrollmentInput
): Promise<CommunityEnrollmentApiRecord> {
  await assertCommunitySubscriber(student);

  const programLabel =
    input.programLabel ??
    buildProgramLabelFromEnrollment({
      instrument: input.instrument,
      academicTierId: input.academicTierId,
    });

  const enrollment = await prisma.communityEnrollment.upsert({
    where: { userId: student.id },
    update: {
      instrument: input.instrument,
      academicTierId: input.academicTierId,
      programLabel,
      currentLessonNumber: input.currentLessonNumber,
      currentLessonTitle: input.currentLessonTitle,
    },
    create: {
      userId: student.id,
      instrument: input.instrument,
      academicTierId: input.academicTierId,
      programLabel,
      currentLessonNumber: input.currentLessonNumber,
      currentLessonTitle: input.currentLessonTitle,
    },
  });

  return mapCommunityEnrollmentToApi(enrollment);
}
