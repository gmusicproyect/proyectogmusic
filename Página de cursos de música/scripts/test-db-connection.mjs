import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  await prisma.$queryRaw`SELECT 1 AS ok`;
  const count = await prisma.onboardingAnalytics.count();
  console.log(`db:test-connection OK — onboarding_analytics rows: ${count}`);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error("db:test-connection FAIL");
  console.error(message);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
