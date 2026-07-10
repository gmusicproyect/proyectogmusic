/**
 * Asigna contraseña a un alumno existente (p. ej. creado vía activate-semestral sin passwordHash).
 *
 * Uso (clave solo en .env local, nunca en git):
 *   CARLOS_SEED_PASSWORD='...' node --env-file=.env scripts/ops/set-student-password.mjs
 *
 * Email por defecto: carlos@gmusic.academy (GMUSIC_DEV_USER_EMAIL).
 */
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const email = (process.env.GMUSIC_DEV_USER_EMAIL ?? "carlos@gmusic.academy").trim();
const password = process.env.CARLOS_SEED_PASSWORD?.trim();

if (!password) {
  console.error("❌ Define CARLOS_SEED_PASSWORD en el entorno antes de asignar.");
  process.exit(1);
}

const prisma = new PrismaClient();

try {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.update({
    where: { email },
    data: { passwordHash },
    select: { id: true, email: true, role: true },
  });
  console.log(`✅ Contraseña asignada para ${user.email} (${user.role}).`);
} catch (error) {
  if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
    console.error(`❌ No existe ${email} en la base de datos.`);
  } else {
    console.error("❌ Error al asignar contraseña:", error);
  }
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
