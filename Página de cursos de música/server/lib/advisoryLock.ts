import { Prisma } from "@prisma/client";

/**
 * Bloqueo transaccional por alumno+nodo al crear/reutilizar sesiones.
 */
export async function acquireLessonSessionAdvisoryLock(
  tx: Prisma.TransactionClient,
  userId: string,
  nodeId: string
): Promise<void> {
  await tx.$executeRaw(
    Prisma.sql`SELECT pg_advisory_xact_lock(hashtext(${userId}), hashtext(${nodeId}))`
  );
}

/**
 * Bloqueo transaccional por sessionId al cerrar sesiones.
 * Serializa complete concurrentes para garantizar idempotencia.
 */
export async function acquireSessionCompleteAdvisoryLock(
  tx: Prisma.TransactionClient,
  sessionId: string
): Promise<void> {
  await tx.$executeRaw(
    Prisma.sql`SELECT pg_advisory_xact_lock(hashtext('lesson-session-complete'), hashtext(${sessionId}))`
  );
}

/** Serializa activaciones semestrales de desarrollo por email. */
export async function acquireDevActivationAdvisoryLock(
  tx: Prisma.TransactionClient,
  email: string
): Promise<void> {
  await tx.$executeRaw(
    Prisma.sql`SELECT pg_advisory_xact_lock(hashtext('dev-activate-semestral'), hashtext(${email}))`
  );
}
