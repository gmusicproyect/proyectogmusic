import { Role, SubscriptionStatus } from "@prisma/client";
import { addCalendarMonths } from "../../prisma/add-calendar-months.js";
import { acquireDevActivationAdvisoryLock } from "../lib/advisoryLock.js";
import { ApiError } from "../lib/errors.js";
import { SEMESTRAL_PLAN_ID, type ActivateSemestralInput } from "../lib/parseActivateSemestralBody.js";
import { prisma } from "../lib/prisma.js";

const SUBSCRIPTION_MONTHS = 6;

export interface ActivateSemestralResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
  subscription: {
    status: "ACTIVE";
    planId: string;
    endsAt: string;
  };
  access: {
    canAccessStudentZone: true;
    reason: "ACTIVE_SUBSCRIPTION";
  };
}

export type ActivateSemestralResult =
  | { kind: "created"; payload: ActivateSemestralResponse }
  | { kind: "reactivated"; payload: ActivateSemestralResponse };

export async function activateSemestralSubscription(
  input: ActivateSemestralInput
): Promise<ActivateSemestralResult> {
  return prisma.$transaction(async (tx) => {
    await acquireDevActivationAdvisoryLock(tx, input.email);

    const existingUser = await tx.user.findUnique({
      where: { email: input.email },
      select: { id: true, role: true },
    });

    if (existingUser && existingUser.role !== Role.STUDENT) {
      throw new ApiError(
        403,
        "FORBIDDEN",
        "No se puede activar suscripción semestral para este usuario."
      );
    }

    const isNewUser = !existingUser;

    const user = await tx.user.upsert({
      where: { email: input.email },
      create: {
        email: input.email,
        name: input.name,
        role: Role.STUDENT,
      },
      update: {
        name: input.name,
      },
    });

    await tx.subscription.deleteMany({
      where: { userId: user.id },
    });

    const endsAt = addCalendarMonths(new Date(), SUBSCRIPTION_MONTHS);
    const subscription = await tx.subscription.create({
      data: {
        userId: user.id,
        status: SubscriptionStatus.ACTIVE,
        planId: SEMESTRAL_PLAN_ID,
        endsAt,
      },
    });

    const payload: ActivateSemestralResponse = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      subscription: {
        status: "ACTIVE",
        planId: subscription.planId,
        endsAt: subscription.endsAt!.toISOString(),
      },
      access: {
        canAccessStudentZone: true,
        reason: "ACTIVE_SUBSCRIPTION",
      },
    };

    return {
      kind: isNewUser ? "created" : "reactivated",
      payload,
    };
  });
}
