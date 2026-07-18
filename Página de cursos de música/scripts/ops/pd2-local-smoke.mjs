#!/usr/bin/env node
/**
 * PD-2 local validation smoke — Prisma Client against Docker Postgres only.
 * Refuses non-localhost DATABASE_URL. Read-only counts; no writes; no prod.
 */
import { PrismaClient } from "@prisma/client";

const url = process.env.DATABASE_URL ?? "";
const host = url.match(/@([^:/]+)/)?.[1] ?? "";
if (host !== "localhost" && host !== "127.0.0.1") {
  console.error(`REFUSING non-local host: ${host || "(missing)"}`);
  process.exit(1);
}

const prisma = new PrismaClient();

try {
  const [
    practiceEvents,
    ftcProjections,
    learnerProjections,
    libraryResources,
    libraryLinks,
  ] = await Promise.all([
    prisma.practiceEvent.count(),
    prisma.ftcProgressProjection.count(),
    prisma.learnerProjectionH1.count(),
    prisma.libraryResource.count(),
    prisma.libraryResourceLink.count(),
  ]);

  const sessionSample = await prisma.lessonSession.findFirst({
    select: { id: true, contentSnapshot: true, contentVersion: true },
  });

  console.log(
    JSON.stringify(
      {
        host,
        counts: {
          practiceEvents,
          ftcProjections,
          learnerProjections,
          libraryResources,
          libraryLinks,
        },
        lessonSessionSnapshotFields: {
          selectOk: true,
          sampleFound: Boolean(sessionSample),
          fieldsPresent: sessionSample
            ? ["contentSnapshot", "contentVersion"].every((k) =>
                Object.prototype.hasOwnProperty.call(sessionSample, k)
              )
            : null,
        },
        clientModelsPresent: [
          "practiceEvent",
          "ftcProgressProjection",
          "learnerProjectionH1",
          "libraryResource",
          "libraryResourceLink",
        ].every((k) => k in prisma),
      },
      null,
      2
    )
  );
} finally {
  await prisma.$disconnect();
}
