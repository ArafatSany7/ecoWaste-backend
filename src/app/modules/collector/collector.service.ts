import prisma from "../../lib/prisma";
import AppError from "../../errors/AppError";

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

  if (request.status !== "SCHEDULED") {
    throw new AppError(400, "Only SCHEDULED requests can be marked as ARRIVED");
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
        previousValue: { status: "SCHEDULED" },
        newValue: { status: "COLLECTOR_ARRIVED" },
        ipAddress: ipAddress || null,
      },
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

const completeCollection = async (requestId: string, collectorId: string, payload: { actualWeight: number; notes?: string }, ipAddress?: string) => {
  const { actualWeight, notes } = payload;

  const request = await prisma.wasteRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new AppError(404, "Waste Request not found");
  }

  if (request.assignedCollectorId !== collectorId) {
    throw new AppError(403, "You are not authorized to update this request");
  }

  if (request.status !== "IN_PROGRESS") {
    throw new AppError(400, "Only IN_PROGRESS requests can be completed");
  }

  const result = await prisma.$transaction(async (tx) => {
    // 1. Update the WasteRequest
    const updatedRequest = await tx.wasteRequest.update({
      where: { id: requestId },
      data: {
        status: "COMPLETED",
        weight: actualWeight, // Update the weight on the request itself based on actual measurement
      },
    });

    // 2. Create the ServiceReport
    const serviceReport = await tx.serviceReport.create({
      data: {
        requestId,
        actualWeight,
        notes,
      },
    });

    // 3. Create the AuditLog
    await tx.auditLog.create({
      data: {
        actorId: collectorId,
        action: "COMPLETE_COLLECTION",
        entity: "WasteRequest",
        entityId: requestId,
        previousValue: { status: "IN_PROGRESS" },
        newValue: { status: "COMPLETED", serviceReportId: serviceReport.id },
        ipAddress: ipAddress || null,
      },
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
  arriveAtLocation,
  startCollection,
  completeCollection,
};
