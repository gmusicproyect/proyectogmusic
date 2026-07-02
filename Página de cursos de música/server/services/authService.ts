import bcrypt from "bcrypt";
import { AccountTier, Role } from "@prisma/client";
import { ApiError } from "../lib/errors.js";
import { parseLoginBody, parseRegisterBody, toPublicAuthUser, type RegisterInput } from "../lib/parseAuthBody.js";
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
