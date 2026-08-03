/**
 * GAP-FIX F-ADITIVA — fixtures mínimos para api:test:local.
 * No modifica prisma/seed.ts. Credenciales triviales / datos de test only.
 * Expects DATABASE_URL already pointing at the ephemeral test DB.
 */
import { PrismaClient, SubscriptionStatus } from "@prisma/client";

const email = process.env.GMUSIC_DEV_USER_EMAIL?.trim() || "carlos@gmusic.academy";
const prisma = new PrismaClient();

const endsAt = new Date();
endsAt.setFullYear(endsAt.getFullYear() + 1);

try {
  const student = await prisma.user.findUniqueOrThrow({ where: { email } });
  const existing = await prisma.subscription.findFirst({
    where: { userId: student.id, status: SubscriptionStatus.ACTIVE },
  });
  if (existing) {
    await prisma.subscription.update({
      where: { id: existing.id },
      data: { endsAt, planId: existing.planId || "gmusic-open" },
    });
  } else {
    await prisma.subscription.create({
      data: {
        userId: student.id,
        status: SubscriptionStatus.ACTIVE,
        planId: "gmusic-open",
        endsAt,
      },
    });
  }
  console.log(`api-test fixtures: ACTIVE subscription for ${email}`);
} finally {
  await prisma.$disconnect();
}
