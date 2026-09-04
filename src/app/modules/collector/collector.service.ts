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

export const CollectorService = {
  getAllCollectors,
  getCollectorById,
  toggleAvailability,
};
