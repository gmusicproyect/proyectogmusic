import type { User } from "@prisma/client";
import { resolveStudentAccess } from "../lib/studentAccess.js";
import { prisma } from "../lib/prisma.js";

export async function buildAccessResponse(student: User) {
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

  return {
    user: {
      id: student.id,
      name: student.name,
      email: student.email,
    },
    access: {
      canAccessStudentZone: access.canAccessStudentZone,
      reason: access.reason,
    },
    subscription: access.subscription,
  };
}
