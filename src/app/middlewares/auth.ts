import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";
import catchAsync from "../utils/catchAsync";
import prisma from "../lib/prisma";

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload;
    }
  }
}

const auth = (...requiredRoles: string[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("You are not authorized!");
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, config.jwt.access_secret as string) as JwtPayload;
    const { userId, role } = decoded;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found!");
    }

    if (user.isDeleted || user.status === "BLOCKED") {
      throw new Error("This user account is blocked or deleted");
    }

    if (requiredRoles.length > 0 && !requiredRoles.includes(role)) {
      throw new Error("You have no access to this route");
    }

    req.user = decoded;
    next();
  });
};

export default auth;
