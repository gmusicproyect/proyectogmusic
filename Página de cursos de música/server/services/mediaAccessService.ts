import type { User } from "@prisma/client";
import { ApiError } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";
import { resolveStudentAccess } from "../lib/studentAccess.js";
import {
  createSignedStorageUrl,
  isPilotFreeMaterialUrl,
  isPrivateSupabaseStorageUrl,
} from "../lib/supabaseStorage.js";

export async function assertActiveSubscription(student: User): Promise<void> {
  const subscriptions = await prisma.subscription.findMany({
    where: { userId: student.id },
    select: {
      id: true,
      status: true,
      planId: true,
      endsAt: true,
    },
  });

  const access = resolveStudentAccess(subscriptions);
  if (!access.canAccessStudentZone) {
    throw new ApiError(
      403,
      "SUBSCRIPTION_REQUIRED",
      "Necesitas una suscripción activa para acceder a este material."
    );
  }
}

export async function resolveSignedMaterialUrlForStudent(
  student: User,
  materialUrl: string
) {
  if (!isPrivateSupabaseStorageUrl(materialUrl)) {
    throw new ApiError(
      400,
      "INVALID_STORAGE_URL",
      "Solo se pueden firmar materiales almacenados en buckets privados."
    );
  }

  if (!isPilotFreeMaterialUrl(materialUrl)) {
    await assertActiveSubscription(student);
  }
  return createSignedStorageUrl(materialUrl);
}
