import type { RequestStatus } from "@prisma/client";
import prisma from "../../lib/prisma";
import AppError from "../../errors/AppError";
import bcrypt from "bcrypt";
import config from "../../config";
import { AuditLogService } from "../auditLog/auditLog.service";
import { NotificationService } from "../notification/notification.service";

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

const rejectWasteRequest = async (requestId: string, adminId: string, ipAddress?: string, reason?: string) => {
  const request = await prisma.wasteRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new AppError(404, "Waste Request not found");
  }

  if (request.status !== "PENDING") {
    throw new AppError(400, "Only PENDING requests can be rejected");
  }

  const rejectionReason = reason?.trim() || null;

  const result = await prisma.$transaction(async (tx) => {
    const updatedRequest = await tx.wasteRequest.update({
      where: { id: requestId },
      data: { status: "REJECTED", rejectionReason },
    });

    await tx.auditLog.create({
      data: {
        actorId: adminId,
        action: "REJECT_REQUEST",
        entity: "WasteRequest",
        entityId: requestId,
        previousValue: { status: "PENDING" },
        newValue: { status: "REJECTED", rejectionReason },
        ipAddress: ipAddress || null,
      },
    });

    await NotificationService.notify(tx, [request.citizenId], {
      title: "Request declined",
      body: rejectionReason ? `Your pickup request was declined: ${rejectionReason}` : "Your pickup request was declined.",
      link: `/dashboard/requests/${requestId}/track`,
    });

    return updatedRequest;
  });

  return result;
};

const OPEN_JOB_STATUSES: RequestStatus[] = ["ASSIGNED", "SCHEDULED", "EN_ROUTE", "COLLECTOR_ARRIVED", "IN_PROGRESS"];

const acceptWasteRequest = async (requestId: string, adminId: string, ipAddress?: string) => {
  const request = await prisma.wasteRequest.findUnique({
    where: { id: requestId },
    include: { zone: true },
  });

  if (!request || request.isDeleted) {
    throw new AppError(404, "Waste Request not found");
  }

  if (request.status !== "PENDING") {
    throw new AppError(400, "Only PENDING requests can be accepted");
  }

  const collectors = await prisma.collectorProfile.findMany({
    where: {
      zoneId: request.zoneId,
      isAvailable: true,
      user: { isDeleted: false, status: "ACTIVE" },
    },
    select: {
      userId: true,
      firstName: true,
      _count: { select: { assignedRequests: { where: { status: { in: OPEN_JOB_STATUSES }, isDeleted: false } } } },
    },
  });

  if (collectors.length === 0) {
    throw new AppError(409, `No available collector in ${request.zone.name} right now. Add or free up a collector, then try again.`);
  }

  const chosen = collectors.reduce((best, c) => (c._count.assignedRequests < best._count.assignedRequests ? c : best));

  const result = await prisma.$transaction(async (tx) => {
    const updatedRequest = await tx.wasteRequest.update({
      where: { id: requestId },
      data: { status: "ASSIGNED", assignedCollectorId: chosen.userId },
      include: { assignedCollector: true },
    });

    await tx.auditLog.create({
      data: {
        actorId: adminId,
        action: "ACCEPT_REQUEST",
        entity: "WasteRequest",
        entityId: requestId,
        previousValue: { status: "PENDING", assignedCollectorId: null },
        newValue: { status: "ASSIGNED", assignedCollectorId: chosen.userId },
        ipAddress: ipAddress || null,
      },
    });

    await NotificationService.notify(tx, [chosen.userId], {
      title: "New pickup assigned",
      body: `Collect waste at ${request.address}.`,
      link: "/dashboard/pickups",
    });

    await NotificationService.notify(tx, [request.citizenId], {
      title: "Request accepted",
      body: `${chosen.firstName} will collect your waste. You can track the truck once they set off.`,
      link: `/dashboard/requests/${requestId}/track`,
    });

    return updatedRequest;
  });

  return result;
};

const verifyCompletion = async (requestId: string, adminId: string, ipAddress?: string) => {
  const request = await prisma.wasteRequest.findUnique({
    where: { id: requestId },
    include: { category: true, serviceReport: true, invoice: true },
  });

  if (!request || request.isDeleted) {
    throw new AppError(404, "Waste Request not found");
  }

  if (request.status !== "COLLECTED") {
    throw new AppError(400, "Only COLLECTED requests can be verified");
  }

  if (!request.serviceReport) {
    throw new AppError(400, "This pickup has no collection proof yet");
  }

  if (request.invoice) {
    throw new AppError(409, "An invoice already exists for this request");
  }

  const baseFee = (request.category as { baseFee?: number }).baseFee || 100;
  const amount = baseFee * request.serviceReport.actualWeight;
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7);

  const result = await prisma.$transaction(async (tx) => {
    const updatedRequest = await tx.wasteRequest.update({
      where: { id: requestId },
      data: { status: "COMPLETED" },
    });

    const invoice = await tx.invoice.create({
      data: {
        requestId,
        citizenId: request.citizenId,
        amount,
        dueDate,
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: adminId,
        action: "VERIFY_COMPLETION",
        entity: "WasteRequest",
        entityId: requestId,
        previousValue: { status: "COLLECTED" },
        newValue: { status: "COMPLETED", invoiceId: invoice.id },
        ipAddress: ipAddress || null,
      },
    });

    await NotificationService.notify(tx, [request.citizenId], {
      title: "Pickup completed",
      body: `Your invoice of ৳${amount.toFixed(2)} is ready.`,
      link: "/dashboard/billing",
    });

    await NotificationService.notify(tx, [request.assignedCollectorId], {
      title: "Pickup verified",
      body: `Your collection at ${request.address} was verified.`,
      link: "/dashboard/pickups",
    });

    return { request: updatedRequest, invoice };
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

const scheduleWasteRequest = async (requestId: string, payload: { scheduledDate: string, timeWindow: string }, adminId: string, ipAddress?: string) => {
  const { scheduledDate, timeWindow } = payload;

  const request = await prisma.wasteRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new AppError(404, "Waste Request not found");
  }

  if (request.status !== "ASSIGNED") {
    throw new AppError(400, "Only ASSIGNED requests can be scheduled");
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedRequest = await tx.wasteRequest.update({
      where: { id: requestId },
      data: {
        status: "SCHEDULED",
      },
    });

    const schedule = await tx.collectionSchedule.create({
      data: {
        requestId,
        scheduledDate: new Date(scheduledDate),
        timeWindow,
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: adminId,
        action: "SCHEDULE_REQUEST",
        entity: "WasteRequest",
        entityId: requestId,
        previousValue: { status: "ASSIGNED" },
        newValue: { status: "SCHEDULED", scheduleId: schedule.id },
        ipAddress: ipAddress || null,
      },
    });

    return { request: updatedRequest, schedule };
  });

  return result;
};

export const AdminService = {
  approveWasteRequest,
  rejectWasteRequest,
  acceptWasteRequest,
  verifyCompletion,
  createCollector,
  assignCollector,
  scheduleWasteRequest,
};
