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

export const CollectorService = {
  getAllCollectors,
  getCollectorById,
  toggleAvailability,
  getMyJobs,
};
