import prisma from "../../lib/prisma";
import AppError from "../../errors/AppError";
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

export const AdminService = {
  approveWasteRequest,
  rejectWasteRequest,
};
