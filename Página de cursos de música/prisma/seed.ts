import {
  PrismaClient,
  Role,
  PublishStatus,
  ExerciseType,
  type Prisma,
} from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const DEV_ADMIN_PASSWORD = "GmusicAdmin2026!";

const USERS = {
  admin: {
    email: "admin@gmusic.academy",
    name: "Admin Gmusic",
    role: Role.ADMIN,
  },
  guardian: {
    email: "apoderado@gmusic.academy",
    name: "María Apoderado",
    role: Role.GUARDIAN,
  },
  student: {
    email: "carlos@gmusic.academy",
    name: "Carlos",
    role: Role.STUDENT,
  },
} as const;

const COURSE = {
  slug: "ruta-guitarra-12-meses",
  title: "Ruta de Guitarra de 12 Meses",
  description:
    "Ruta pedagógica anual de guitarra: fundamentos, acordes abiertos, ritmo y repertorio progresivo.",
} as const;

const MODULES = [
  {
    order: 1,
    title: "Fundamentos",
    nodes: [
      {
        order: 1,
        title: "Tu guitarra y postura",
        exercises: [
          {
            order: 1,
            type: ExerciseType.IDENTIFY_NOTE,
            difficulty: 1,
            instruction:
              "Observa la imagen e identifica la parte de la guitarra señalada.",
            contentPayload: {
              imageUrl: null,
              options: [
                { id: "a", text: "Cejilla" },
                { id: "b", text: "Cuerdas" },
                { id: "c", text: "Mástil" },
                { id: "d", text: "Puente" },
              ],
            },
            secureAnswer: { correctOptionId: "c" },
          },
          {
            order: 2,
            type: ExerciseType.CHORD_SHAPE,
            difficulty: 1,
            instruction: "Selecciona la postura correcta para sentarse con la guitarra.",
            contentPayload: {
              options: [
                { id: "a", text: "Guitarra muy baja, espalda curvada" },
                { id: "b", text: "Espalda recta, guitarra estable sobre muslo" },
                { id: "c", text: "Cuello de guitarra paralelo al suelo" },
              ],
            },
            secureAnswer: { correctOptionId: "b" },
          },
        ],
      },
      {
        order: 2,
        title: "Primer acorde Am",
        exercises: [
          {
            order: 1,
            type: ExerciseType.CHORD_SHAPE,
            difficulty: 1,
            instruction: "Elige la digitación correcta para La menor (Am) en posición abierta.",
            contentPayload: {
              diagramLabel: "Am abierto",
              options: [
                { id: "a", text: "2-2-1-0-0-0 (desde 6a cuerda)" },
                { id: "b", text: "0-1-2-2-0-0" },
                { id: "c", text: "1-3-2-0-1-0" },
              ],
            },
            secureAnswer: { correctOptionId: "b" },
          },
          {
            order: 2,
            type: ExerciseType.EAR_TRAINING,
            difficulty: 1,
            instruction: "Escucha el acorde y elige si corresponde a La menor.",
            contentPayload: {
              audioUrl: "https://cdn.gmusic.academy/audio/samples/chord-am-open.mp3",
              options: [
                { id: "a", text: "Sí, es La menor" },
                { id: "b", text: "No, es otro acorde" },
              ],
            },
            secureAnswer: { correctOptionId: "a" },
          },
        ],
      },
      {
        order: 3,
        title: "Escucha el pulso",
        exercises: [
          {
            order: 1,
            type: ExerciseType.RHYTHM_TAP,
            difficulty: 1,
            instruction: "Marca el pulso tocando la cuerda 6 al aire, a tu ritmo.",
            contentPayload: {
              tapHeadline: "Pulso en cuerda 6",
              tapDescription:
                "Toca la cuerda 6 al aire en cada TAP. Ve a tu ritmo — no hay metrónomo.",
              tapSequence: Array.from({ length: 8 }, () => ({
                stringNumber: 6,
                label: "6",
                stringName: "Mi grave",
              })),
              submissionOptionId: "tap-complete",
            },
            secureAnswer: { correctOptionId: "tap-complete" },
          },
          {
            order: 2,
            type: ExerciseType.RHYTHM_TAP,
            difficulty: 2,
            instruction: "Selecciona el patrón de rasgueo down-down-up-down-up-down-up.",
            contentPayload: {
              options: [
                { id: "a", text: "D D U D U D U" },
                { id: "b", text: "D U D U D U D U" },
                { id: "c", text: "D D D D" },
              ],
            },
            secureAnswer: { correctOptionId: "a" },
          },
        ],
      },
    ],
  },
  {
    order: 2,
    title: "Acordes abiertos",
    nodes: [
      {
        order: 1,
        title: "Acorde G mayor",
        exercises: [
          {
            order: 1,
            type: ExerciseType.CHORD_SHAPE,
            difficulty: 2,
            instruction: "Elige la forma estándar de Sol mayor (G) en posición abierta.",
            contentPayload: {
              diagramLabel: "G mayor",
              options: [
                { id: "a", text: "3-2-0-0-0-3" },
                { id: "b", text: "3-2-0-0-3-3" },
                { id: "c", text: "0-2-3-0-1-0" },
              ],
            },
            secureAnswer: { correctOptionId: "b" },
          },
          {
            order: 2,
            type: ExerciseType.EAR_TRAINING,
            difficulty: 2,
            instruction:
              "Escucha el acorde en posición abierta e identifica cuál es.",
            contentPayload: {
              audioUrl: "https://cdn.gmusic.academy/audio/samples/chord-g-open.mp3",
              options: [
                { id: "a", text: "Sol mayor (G)" },
                { id: "b", text: "Do mayor (C)" },
                { id: "c", text: "Re mayor (D)" },
              ],
            },
            secureAnswer: { correctOptionId: "a" },
          },
        ],
      },
      {
        order: 2,
        title: "Progresión Am–Em",
        exercises: [
          {
            order: 1,
            type: ExerciseType.CHORD_SHAPE,
            difficulty: 2,
            instruction: "Ordena el cambio más limpio entre Am y Em en posición abierta.",
            contentPayload: {
              options: [
                { id: "a", text: "Levantar todos los dedos y reposicionar desde cero" },
                { id: "b", text: "Mantener dedo ancla en 2a cuerda, mover solo dedos necesarios" },
                { id: "c", text: "Deslizar cejilla en todo el mástil" },
              ],
            },
            secureAnswer: { correctOptionId: "b" },
          },
          {
            order: 2,
            type: ExerciseType.EAR_TRAINING,
            difficulty: 2,
            instruction: "Escucha la progresión y elige la secuencia correcta.",
            contentPayload: {
              audioUrl: "https://cdn.gmusic.academy/audio/samples/progression-am-em.mp3",
              options: [
                { id: "a", text: "Am → Em → Am → Em" },
                { id: "b", text: "G → C → D → G" },
                { id: "c", text: "Em → Am → Em → Am" },
              ],
            },
            secureAnswer: { correctOptionId: "a" },
          },
        ],
      },
    ],
  },
] as const;

async function seedUsers() {
  const adminPasswordHash = await bcrypt.hash(DEV_ADMIN_PASSWORD, 10);

  const admin = await prisma.user.upsert({
    where: { email: USERS.admin.email },
    update: {
      name: USERS.admin.name,
      role: USERS.admin.role,
      passwordHash: adminPasswordHash,
    },
    create: {
      ...USERS.admin,
      passwordHash: adminPasswordHash,
    },
  });

  const guardian = await prisma.user.upsert({
    where: { email: USERS.guardian.email },
    update: { name: USERS.guardian.name, role: USERS.guardian.role },
    create: USERS.guardian,
  });

  const student = await prisma.user.upsert({
    where: { email: USERS.student.email },
    update: { name: USERS.student.name, role: USERS.student.role },
    create: USERS.student,
  });

  await prisma.guardianLink.upsert({
    where: {
      guardianId_studentId: {
        guardianId: guardian.id,
        studentId: student.id,
      },
    },
    update: {},
    create: {
      guardianId: guardian.id,
      studentId: student.id,
    },
  });

  return { admin, guardian, student };
}

async function seedCurriculum() {
  const course = await prisma.course.upsert({
    where: { slug: COURSE.slug },
    update: {
      title: COURSE.title,
      description: COURSE.description,
      status: PublishStatus.PUBLISHED,
    },
    create: {
      slug: COURSE.slug,
      title: COURSE.title,
      description: COURSE.description,
      status: PublishStatus.PUBLISHED,
    },
  });

  let firstNodeId: string | null = null;

  for (const moduleDef of MODULES) {
    const module = await prisma.module.upsert({
      where: {
        courseId_order: {
          courseId: course.id,
          order: moduleDef.order,
        },
      },
      update: {
        title: moduleDef.title,
        status: PublishStatus.PUBLISHED,
      },
      create: {
        courseId: course.id,
        title: moduleDef.title,
        order: moduleDef.order,
        status: PublishStatus.PUBLISHED,
      },
    });

    for (const nodeDef of moduleDef.nodes) {
      const node = await prisma.pathNode.upsert({
        where: {
          moduleId_order: {
            moduleId: module.id,
            order: nodeDef.order,
          },
        },
        update: {
          title: nodeDef.title,
          status: PublishStatus.PUBLISHED,
        },
        create: {
          moduleId: module.id,
          title: nodeDef.title,
          order: nodeDef.order,
          status: PublishStatus.PUBLISHED,
        },
      });

      if (firstNodeId === null) {
        firstNodeId = node.id;
      }

      for (const exerciseDef of nodeDef.exercises) {
        await prisma.microExercise.upsert({
          where: {
            nodeId_order: {
              nodeId: node.id,
              order: exerciseDef.order,
            },
          },
          update: {
            type: exerciseDef.type,
            difficulty: exerciseDef.difficulty,
            instruction: exerciseDef.instruction,
            contentPayload: exerciseDef.contentPayload as Prisma.InputJsonValue,
            secureAnswer: exerciseDef.secureAnswer as Prisma.InputJsonValue,
          },
          create: {
            nodeId: node.id,
            type: exerciseDef.type,
            difficulty: exerciseDef.difficulty,
            instruction: exerciseDef.instruction,
            contentPayload: exerciseDef.contentPayload as Prisma.InputJsonValue,
            secureAnswer: exerciseDef.secureAnswer as Prisma.InputJsonValue,
            order: exerciseDef.order,
          },
        });
      }
    }
  }

  return { course, firstNodeId };
}

async function seedProgress(studentId: string, firstNodeId: string) {
  await prisma.userProgress.upsert({
    where: {
      userId_nodeId: {
        userId: studentId,
        nodeId: firstNodeId,
      },
    },
    update: {},
    create: {
      userId: studentId,
      nodeId: firstNodeId,
      isCompleted: false,
    },
  });
}

async function reportCounts() {
  const [
    users,
    guardianLinks,
    courses,
    modules,
    pathNodes,
    microExercises,
    userProgress,
    lessonSessions,
    exerciseAttempts,
    xpEvents,
    streakEvents,
    subscriptions,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.guardianLink.count(),
    prisma.course.count(),
    prisma.module.count(),
    prisma.pathNode.count(),
    prisma.microExercise.count(),
    prisma.userProgress.count(),
    prisma.lessonSession.count(),
    prisma.exerciseAttempt.count(),
    prisma.xpEvent.count(),
    prisma.streakEvent.count(),
    prisma.subscription.count(),
  ]);

  console.log("\nConteos finales por modelo:");
  console.log(`  User:             ${users}`);
  console.log(`  GuardianLink:     ${guardianLinks}`);
  console.log(`  Subscription:     ${subscriptions}`);
  console.log(`  Course:           ${courses}`);
  console.log(`  Module:           ${modules}`);
  console.log(`  PathNode:         ${pathNodes}`);
  console.log(`  MicroExercise:    ${microExercises}`);
  console.log(`  UserProgress:     ${userProgress}`);
  console.log(`  LessonSession:    ${lessonSessions}`);
  console.log(`  ExerciseAttempt:  ${exerciseAttempts}`);
  console.log(`  XpEvent:          ${xpEvents}`);
  console.log(`  StreakEvent:      ${streakEvents}`);
}

async function main() {
  console.log("🌱 Seeding Gmusic Learning Engine (idempotente)...");

  const { student } = await seedUsers();
  const { firstNodeId } = await seedCurriculum();

  if (!firstNodeId) {
    throw new Error("No se encontró el primer nodo pedagógico para UserProgress.");
  }

  await seedProgress(student.id, firstNodeId);

  console.log("✅ Seed completado.");
  await reportCounts();
}

main()
  .catch((error) => {
    console.error("❌ Seed falló:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
