import prisma from "../../lib/prisma";
import AppError from "../../errors/AppError";
import { NotificationService } from "../notification/notification.service";
import { UploadService } from "../upload/upload.service";

const getAllCollectors = async () => {
  const result = await prisma.collectorProfile.findMany({
    include: {
      user: {
        select: {
          email: true,
          status: true,
          isDeleted: true,
        },
      },
      serviceZone: true,
    },
  });
  return result;
};

const getCollectorById = async (id: string) => {
  const result = await prisma.collectorProfile.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          email: true,
          status: true,
        },
      },
      serviceZone: true,
    },
  });

  if (!result) {
    throw new AppError(404, "Collector not found");
  }

  return result;
};

const toggleAvailability = async (userId: string, isAvailable: boolean) => {
  const collector = await prisma.collectorProfile.findUnique({
    where: { userId },
  });

  if (!collector) {
    throw new AppError(404, "Collector profile not found");
  }

  const result = await prisma.collectorProfile.update({
    where: { userId },
    data: { isAvailable },
  });

  return result;
};

const getMyJobs = async (userId: string, query: Record<string, unknown>) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const where: any = {
    assignedCollectorId: userId,
  };

  if (query.status) {
    where.status = query.status;
  }

  if (query.date) {
    // If a date is provided, filter by CollectionSchedule's scheduledDate
    where.collectionSchedule = {
      scheduledDate: {
        gte: new Date(`${query.date}T00:00:00.000Z`),
        lte: new Date(`${query.date}T23:59:59.999Z`),
      },
    };
  }

  const result = await prisma.wasteRequest.findMany({
    where,
    skip,
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      citizen: true,
      category: true,
      zone: true,
      collectionSchedule: true,
    },
  });

  const total = await prisma.wasteRequest.count({ where });

  return {
    meta: { page, limit, total },
    data: result,
  };
};

const arriveAtLocation = async (requestId: string, collectorId: string, ipAddress?: string) => {
  const request = await prisma.wasteRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new AppError(404, "Waste Request not found");
  }

  if (request.assignedCollectorId !== collectorId) {
    throw new AppError(403, "You are not authorized to update this request");
  }

  if (!["ASSIGNED", "SCHEDULED", "EN_ROUTE"].includes(request.status)) {
    throw new AppError(400, "Only ASSIGNED, SCHEDULED or EN_ROUTE requests can be marked as ARRIVED");
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedRequest = await tx.wasteRequest.update({
      where: { id: requestId },
      data: {
        status: "COLLECTOR_ARRIVED",
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: collectorId,
        action: "COLLECTOR_ARRIVED",
        entity: "WasteRequest",
        entityId: requestId,
        previousValue: { status: request.status },
        newValue: { status: "COLLECTOR_ARRIVED" },
        ipAddress: ipAddress || null,
      },
    });

    await NotificationService.notify(tx, [request.citizenId], {
      title: "Collector has arrived",
      body: "Please have your waste ready at the pickup point.",
      link: `/dashboard/requests/${requestId}/track`,
    });

    return updatedRequest;
  });

  return result;
};

const departForPickup = async (requestId: string, collectorId: string, ipAddress?: string) => {
  const request = await prisma.wasteRequest.findUnique({
    where: { id: requestId },
  });

  if (!request || request.isDeleted) {
    throw new AppError(404, "Waste Request not found");
  }

  if (request.assignedCollectorId !== collectorId) {
    throw new AppError(403, "You are not authorized to update this request");
  }

  if (request.status !== "ASSIGNED" && request.status !== "SCHEDULED") {
    throw new AppError(400, "Only ASSIGNED or SCHEDULED requests can be started");
  }

  const otherTrip = await prisma.wasteRequest.findFirst({
    where: {
      assignedCollectorId: collectorId,
      status: { in: ["EN_ROUTE", "COLLECTOR_ARRIVED"] },
      id: { not: requestId },
      isDeleted: false,
    },
    select: { id: true },
  });

  if (otherTrip) {
    throw new AppError(409, "Finish your current trip before starting another one");
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedRequest = await tx.wasteRequest.update({
      where: { id: requestId },
      data: {
        status: "EN_ROUTE",
        tripStartedAt: new Date(),
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: collectorId,
        action: "COLLECTOR_EN_ROUTE",
        entity: "WasteRequest",
        entityId: requestId,
        previousValue: { status: request.status },
        newValue: { status: "EN_ROUTE" },
        ipAddress: ipAddress || null,
      },
    });

    await NotificationService.notify(tx, [request.citizenId], {
      title: "Collector is on the way",
      body: "Track the truck live on the map.",
      link: `/dashboard/requests/${requestId}/track`,
    });

    return updatedRequest;
  });

  return result;
};

const startCollection = async (requestId: string, collectorId: string, ipAddress?: string) => {
  const request = await prisma.wasteRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new AppError(404, "Waste Request not found");
  }

  if (request.assignedCollectorId !== collectorId) {
    throw new AppError(403, "You are not authorized to update this request");
  }

  if (request.status !== "COLLECTOR_ARRIVED") {
    throw new AppError(400, "Only ARRIVED requests can be marked as IN_PROGRESS");
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedRequest = await tx.wasteRequest.update({
      where: { id: requestId },
      data: {
        status: "IN_PROGRESS",
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: collectorId,
        action: "START_COLLECTION",
        entity: "WasteRequest",
        entityId: requestId,
        previousValue: { status: "COLLECTOR_ARRIVED" },
        newValue: { status: "IN_PROGRESS" },
        ipAddress: ipAddress || null,
      },
    });

    return updatedRequest;
  });

  return result;
};

const markCollected = async (
  requestId: string,
  collectorId: string,
  payload: { actualWeight: number; notes?: string; photoUrls: string[] },
  ipAddress?: string,
) => {
  const { actualWeight, notes } = payload;
  const photoUrls = [...new Set(payload.photoUrls)];

  if (photoUrls.some((url) => !UploadService.isProofPhotoUrl(url))) {
    throw new AppError(400, "Proof photos must be uploaded through the app");
  }

  const request = await prisma.wasteRequest.findUnique({
    where: { id: requestId },
  });

  if (!request || request.isDeleted) {
    throw new AppError(404, "Waste Request not found");
  }

  if (request.assignedCollectorId !== collectorId) {
    throw new AppError(403, "You are not authorized to update this request");
  }

  if (request.status !== "IN_PROGRESS") {
    throw new AppError(400, "Only IN_PROGRESS requests can be marked as collected");
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedRequest = await tx.wasteRequest.update({
      where: { id: requestId },
      data: {
        status: "COLLECTED",
        weight: actualWeight,
      },
    });

    const serviceReport = await tx.serviceReport.upsert({
      where: { requestId },
      create: { requestId, actualWeight, notes, photoUrls },
      update: { actualWeight, notes, photoUrls },
    });

    await tx.collectorProfile.update({
      where: { userId: collectorId },
      data: {
        lastLatitude: null,
        lastLongitude: null,
        lastHeading: null,
        lastSpeed: null,
        lastAccuracy: null,
        lastLocationAt: null,
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: collectorId,
        action: "MARK_COLLECTED",
        entity: "WasteRequest",
        entityId: requestId,
        previousValue: { status: "IN_PROGRESS" },
        newValue: { status: "COLLECTED", serviceReportId: serviceReport.id, photos: photoUrls.length },
        ipAddress: ipAddress || null,
      },
    });

    await NotificationService.notify(tx, [request.citizenId], {
      title: "Waste collected",
      body: "Your pickup is done and awaiting a final check. Your invoice follows shortly.",
      link: `/dashboard/requests/${requestId}/track`,
    });

    await NotificationService.notifyAdmins(tx, {
      title: "Proof submitted",
      body: `Collection at ${request.address} is ready to verify.`,
      link: "/dashboard/admin/requests",
    });

    return { request: updatedRequest, serviceReport };
  });

  return result;
};

export const CollectorService = {
  getAllCollectors,
  getCollectorById,
  toggleAvailability,
  getMyJobs,
  departForPickup,
  arriveAtLocation,
  startCollection,
  markCollected,
};
