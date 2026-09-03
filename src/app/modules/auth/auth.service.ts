import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../../lib/prisma";
import config from "../../config";
import type { Role } from "@prisma/client";

const registerUser = async (payload: any) => {
  const { email, password, firstName, lastName, phone, defaultAddress } = payload;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const saltRounds = Number(config.bcrypt_salt_rounds) || 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        role: "CUSTOMER",
      },
    });

    const profile = await tx.customerProfile.create({
      data: {
        userId: user.id,
        firstName,
        lastName,
        phone,
        defaultAddress,
      },
    });

    return { user, profile };
  });


  const { passwordHash, ...userWithoutPassword } = result.user;

  return {
    ...userWithoutPassword,
    profile: result.profile,
  };
};

const loginUser = async (payload: any) => {
  const { email, password } = payload;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  if (user.isDeleted || user.status === "BLOCKED") {
    throw new Error("This user account is blocked or deleted");
  }

  const isPasswordMatched = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordMatched) {
    throw new Error("Invalid credentials");
  }

  const jwtPayload = {
    userId: user.id,
    role: user.role,
  };

  const accessToken = jwt.sign(jwtPayload, config.jwt.access_secret as string, {
    expiresIn: config.jwt.access_expires_in,
  });

  return {
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };
};

export const AuthService = {
  registerUser,
  loginUser,
};
