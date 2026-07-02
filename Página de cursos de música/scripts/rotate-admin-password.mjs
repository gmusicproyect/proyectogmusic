/**
 * Rota la contraseña de admin@gmusic.academy usando ADMIN_SEED_PASSWORD del entorno.
 *
 * Uso (nueva contraseña solo en .env local, nunca en git):
 *   ADMIN_SEED_PASSWORD='nueva-contraseña-segura' node --env-file=.env scripts/rotate-admin-password.mjs
 */
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const ADMIN_EMAIL = "admin@gmusic.academy";
const password = process.env.ADMIN_SEED_PASSWORD?.trim();

if (!password) {
  console.error("❌ Define ADMIN_SEED_PASSWORD en el entorno antes de rotar.");
  process.exit(1);
}

const prisma = new PrismaClient();

try {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.update({
    where: { email: ADMIN_EMAIL },
    data: { passwordHash },
    select: { id: true, email: true, role: true },
  });
  console.log(`✅ Contraseña rotada para ${user.email} (${user.role}).`);
} catch (error) {
  if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
    console.error(`❌ No existe ${ADMIN_EMAIL} en la base de datos.`);
  } else {
    console.error("❌ Error al rotar contraseña:", error);
  }
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
