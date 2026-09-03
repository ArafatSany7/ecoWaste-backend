import prisma from "../../lib/prisma";
import AppError from "../../errors/AppError";

const createZone = async (payload: { name: string; city: string }) => {
  const result = await prisma.serviceZone.create({
    data: payload,
  });
  return result;
};

const getAllZones = async () => {
  const result = await prisma.serviceZone.findMany({
    where: {
      isDeleted: false,
    },
  });
  return result;
};

const getZoneById = async (id: string) => {
  const result = await prisma.serviceZone.findUnique({
    where: { id, isDeleted: false },
  });
  if (!result) {
    throw new AppError(404, "Service Zone not found!");
  }
  return result;
};

const updateZone = async (id: string, payload: Partial<{ name: string; city: string }>) => {
  await getZoneById(id);

  const result = await prisma.serviceZone.update({
    where: { id },
    data: payload,
  });
  return result;
};

const deleteZone = async (id: string) => {
  await getZoneById(id);

  const result = await prisma.serviceZone.update({
    where: { id },
    data: { isDeleted: true },
  });
  return result;
};

export const ZoneService = {
  createZone,
  getAllZones,
  getZoneById,
  updateZone,
  deleteZone,
};
