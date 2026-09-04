import prisma from "../../lib/prisma";
import AppError from "../../errors/AppError";
import bcrypt from "bcrypt";
import config from "../../config";
import { AuditLogService } from "../auditLog/auditLog.service";

const approveWasteRequest = async (requestId: string, adminId: string, ipAddress?: string) => {
  const request = await prisma.wasteRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new AppError(404, "Waste Request not found");
  }

  if (request.status !== "PENDING") {
    throw new AppError(400, "Only PENDING requests can be approved");
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedRequest = await tx.wasteRequest.update({
      where: { id: requestId },
      data: { status: "APPROVED" },
    });

    await tx.auditLog.create({
      data: {
        actorId: adminId,
        action: "APPROVE_REQUEST",
        entity: "WasteRequest",
        entityId: requestId,
        previousValue: { status: "PENDING" },
        newValue: { status: "APPROVED" },
        ipAddress: ipAddress || null,
      },
    });

    return updatedRequest;
  });

  return result;
};

const rejectWasteRequest = async (requestId: string, adminId: string, ipAddress?: string) => {
  const request = await prisma.wasteRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new AppError(404, "Waste Request not found");
  }

  if (request.status !== "PENDING") {
    throw new AppError(400, "Only PENDING requests can be rejected");
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedRequest = await tx.wasteRequest.update({
      where: { id: requestId },
      data: { status: "REJECTED" },
    });

    await tx.auditLog.create({
      data: {
        actorId: adminId,
        action: "REJECT_REQUEST",
        entity: "WasteRequest",
        entityId: requestId,
        previousValue: { status: "PENDING" },
        newValue: { status: "REJECTED" },
        ipAddress: ipAddress || null,
      },
    });

    return updatedRequest;
  });

  return result;
};

const createCollector = async (payload: any) => {
  const { email, password, firstName, lastName, phone, zoneId } = payload;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError(400, "User with this email already exists");
  }

  const saltRounds = Number(config.bcrypt_salt_rounds) || 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        role: "COLLECTOR",
      },
    });

    const profile = await tx.collectorProfile.create({
      data: {
        userId: user.id,
        firstName,
        lastName,
        phone,
        zoneId,
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

const assignCollector = async (requestId: string, payload: { collectorId: string }, adminId: string, ipAddress?: string) => {
  const { collectorId } = payload;

  const request = await prisma.wasteRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new AppError(404, "Waste Request not found");
  }

  if (request.status !== "APPROVED") {
    throw new AppError(400, "Only APPROVED requests can be assigned to a collector");
  }

  const collector = await prisma.collectorProfile.findUnique({
    where: { userId: collectorId },
  });

  if (!collector) {
    throw new AppError(404, "Collector not found");
  }

  if (!collector.isAvailable) {
    throw new AppError(400, "Collector is currently not available");
  }

  if (collector.zoneId !== request.zoneId) {
    throw new AppError(400, "Collector does not serve the zone of this request");
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedRequest = await tx.wasteRequest.update({
      where: { id: requestId },
      data: {
        status: "ASSIGNED",
        assignedCollectorId: collectorId,
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: adminId,
        action: "ASSIGN_COLLECTOR",
        entity: "WasteRequest",
        entityId: requestId,
        previousValue: { status: "APPROVED", assignedCollectorId: null },
        newValue: { status: "ASSIGNED", assignedCollectorId: collectorId },
        ipAddress: ipAddress || null,
      },
    });

    return updatedRequest;
  });

  return result;
};

export const AdminService = {
  approveWasteRequest,
  rejectWasteRequest,
  createCollector,
  assignCollector,
};
