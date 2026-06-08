import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { PublishStatus } from "@prisma/client";
import request from "supertest";
import { createApp } from "../app.js";
import { deriveNodeStatuses } from "../lib/nodeStatus.js";
import { requirePublishedCourse } from "../services/coursePath.js";
import { buildNextPractice, resolveModuleProgress } from "../services/dashboardAssembly.js";
import { ApiError } from "../lib/errors.js";

describe("deriveNodeStatuses", () => {
  const nodes = [{ id: "n1" }, { id: "n2" }, { id: "n3" }];

  it("marca el primer nodo como active en camino inicial", () => {
    const statuses = deriveNodeStatuses(nodes, new Map());
    assert.equal(statuses.get("n1"), "active");
    assert.equal(statuses.get("n2"), "locked");
    assert.equal(statuses.get("n3"), "locked");
  });

  it("marca progreso parcial con un active y completed previo", () => {
    const progress = new Map([
      ["n1", { isCompleted: true }],
    ]);
    const statuses = deriveNodeStatuses(nodes, progress);
    assert.equal(statuses.get("n1"), "completed");
    assert.equal(statuses.get("n2"), "active");
    assert.equal(statuses.get("n3"), "locked");
  });

  it("marca todos los nodos completed cuando el camino está completo", () => {
    const progress = new Map([
      ["n1", { isCompleted: true }],
      ["n2", { isCompleted: true }],
      ["n3", { isCompleted: true }],
    ]);
    const statuses = deriveNodeStatuses(nodes, progress);
    assert.equal(statuses.get("n1"), "completed");
    assert.equal(statuses.get("n2"), "completed");
    assert.equal(statuses.get("n3"), "completed");
    assert.equal([...statuses.values()].includes("active"), false);
  });
});

describe("requirePublishedCourse", () => {
  it("rechaza curso DRAFT", () => {
    assert.throws(
      () =>
        requirePublishedCourse(
          { status: PublishStatus.DRAFT } as { status: PublishStatus },
          "draft-course"
        ),
      (error: unknown) =>
        error instanceof ApiError &&
        error.code === "COURSE_NOT_FOUND" &&
        error.status === 404
    );
  });

  it("rechaza curso ARCHIVED", () => {
    assert.throws(
      () =>
        requirePublishedCourse(
          { status: PublishStatus.ARCHIVED } as { status: PublishStatus },
          "archived-course"
        ),
      (error: unknown) => error instanceof ApiError && error.code === "COURSE_NOT_FOUND"
    );
  });

  it("acepta curso PUBLISHED", () => {
    const course = requirePublishedCourse(
      { status: PublishStatus.PUBLISHED, id: "c1" } as { status: PublishStatus; id: string },
      "published-course"
    );
    assert.equal(course.id, "c1");
  });
});

describe("dashboard assembly", () => {
  const modules = [
    {
      id: "m1",
      title: "Fundamentos",
      nodes: [
        { id: "n1", title: "Nodo 1", exercises: [] },
        { id: "n2", title: "Nodo 2", exercises: [] },
      ],
    },
  ];

  it("devuelve nextPractice null cuando no hay nodo active", () => {
    const progress = new Map([
      ["n1", { isCompleted: true }],
      ["n2", { isCompleted: true }],
    ]);
    const statuses = deriveNodeStatuses(
      modules[0].nodes.map((node) => ({ id: node.id })),
      progress
    );

    const moduleProgress = resolveModuleProgress(modules, statuses, null);
    const nextPractice = buildNextPractice(null, null);

    assert.equal(nextPractice, null);
    assert.equal(moduleProgress?.completedNodes, 2);
    assert.equal(moduleProgress?.totalNodes, 2);
    assert.match(moduleProgress?.pathLabel ?? "", /Camino completado/);
  });
});

describe("devStudentAuth in production", () => {
  const previousNodeEnv = process.env.NODE_ENV;

  before(() => {
    process.env.NODE_ENV = "production";
  });

  after(() => {
    process.env.NODE_ENV = previousNodeEnv;
  });

  it("rechaza /api/v1/me/dashboard con 401 UNAUTHORIZED", async () => {
    const response = await request(createApp()).get("/api/v1/me/dashboard");
    assert.equal(response.status, 401);
    assert.equal(response.body.error.code, "UNAUTHORIZED");
  });
});
