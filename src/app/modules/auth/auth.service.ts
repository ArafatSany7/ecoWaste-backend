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
        role: "CITIZEN",
      },
    });

    const profile = await tx.citizenProfile.create({
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

  const accessToken = jwt.sign(jwtPayload, config.jwt.access_secret as any, {
    expiresIn: config.jwt.access_expires_in,
  });

  const refreshToken = jwt.sign(jwtPayload, config.jwt.refresh_secret as any, {
    expiresIn: config.jwt.refresh_expires_in,
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };
};

const refreshToken = async (token: string) => {
  const decoded = jwt.verify(token, config.jwt.refresh_secret as any) as jwt.JwtPayload;

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  if (user.isDeleted || user.status === "BLOCKED") {
    throw new Error("This user account is blocked or deleted");
  }

  const jwtPayload = {
    userId: user.id,
    role: user.role,
  };

  const accessToken = jwt.sign(jwtPayload, config.jwt.access_secret as any, {
    expiresIn: config.jwt.access_expires_in,
  });

  return {
    accessToken,
  };
};

const googleLogin = async (payload: { email: string; firstName: string; lastName?: string }) => {
  const { email, firstName, lastName } = payload;

  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {

    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash: "GOOGLE_OAUTH_LOGIN",
          role: "CITIZEN",
        },
      });

      await tx.citizenProfile.create({
        data: {
          userId: newUser.id,
          firstName,
          lastName: lastName || "",
          phone: "00000000000",
          defaultAddress: "Google User Address",
        },
      });

      return newUser;
    });
    user = result;
  }

  if (user.isDeleted || user.status === "BLOCKED") {
    throw new Error("This user account is blocked or deleted");
  }

  const jwtPayload = {
    userId: user.id,
    role: user.role,
  };

  const accessToken = jwt.sign(jwtPayload, config.jwt.access_secret as any, {
    expiresIn: config.jwt.access_expires_in as any,
  });

  const refreshToken = jwt.sign(jwtPayload, config.jwt.refresh_secret as any, {
    expiresIn: config.jwt.refresh_expires_in as any,
  });

  return {
    accessToken,
    refreshToken,
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
  refreshToken,
  googleLogin,
};
