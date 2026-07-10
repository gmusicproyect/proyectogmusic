import bcrypt from "bcrypt";
import { AccountTier, Role } from "@prisma/client";
import { ApiError } from "../lib/errors.js";
import {
  adminRecoveryKeysMatch,
  getConfiguredAdminPasswordResetKey,
} from "../lib/adminPasswordResetGate.js";
import {
  parseAdminResetPasswordBody,
  parseLoginBody,
  parseRegisterBody,
  toPublicAuthUser,
  type RegisterInput,
} from "../lib/parseAuthBody.js";
import { signSessionToken } from "../lib/jwtSession.js";
import { prisma } from "../lib/prisma.js";

const BCRYPT_ROUNDS = 10;

export async function registerStudent(body: unknown) {
  const input: RegisterInput = parseRegisterBody(body);

  const existing = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  });

  if (existing) {
    throw new ApiError(409, "EMAIL_TAKEN", "Este correo ya está registrado.");
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone,
      passwordHash,
      role: Role.STUDENT,
      accountTier: AccountTier.DEMO,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  const token = await signSessionToken(user.id);

  return {
    user: toPublicAuthUser(user),
    token,
  };
}

export async function loginStudent(body: unknown) {
  const input = parseLoginBody(body);

  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: {
      id: true,
      name: true,
      email: true,
      passwordHash: true,
      role: true,
    },
  });

  if (!user?.passwordHash) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "Correo o contraseña incorrectos.");
  }

  if (user.role !== Role.STUDENT && user.role !== Role.ADMIN) {
    throw new ApiError(403, "FORBIDDEN", "Este correo no puede iniciar sesión aquí.");
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "Correo o contraseña incorrectos.");
  }

  const token = await signSessionToken(user.id);

  return {
    user: toPublicAuthUser(user),
    token,
  };
}

export async function resetAdminPassword(body: unknown) {
  const input = parseAdminResetPasswordBody(body);

  const configuredKey = getConfiguredAdminPasswordResetKey();
  if (!configuredKey) {
    throw new ApiError(
      503,
      "RESET_NOT_CONFIGURED",
      "La recuperación de contraseña admin no está configurada en este entorno."
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true, role: true },
  });

  const keyValid = adminRecoveryKeysMatch(configuredKey, input.recoveryKey);
  if (!user || user.role !== Role.ADMIN || !keyValid) {
    throw new ApiError(
      401,
      "INVALID_RESET",
      "Clave de recuperación o correo inválidos."
    );
  }

  const passwordHash = await bcrypt.hash(input.newPassword, BCRYPT_ROUNDS);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });
}
