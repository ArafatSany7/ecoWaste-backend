import prisma from "../../lib/prisma";
import AppError from "../../errors/AppError";

const createWasteCategory = async (payload: { name: string; type: string; description?: string }) => {
  const result = await prisma.wasteCategory.create({
    data: payload,
  });
  return result;
};

const getAllWasteCategories = async () => {
  const result = await prisma.wasteCategory.findMany({
    where: {
      isDeleted: false,
    },
  });
  return result;
};

const getWasteCategoryById = async (id: string) => {
  const result = await prisma.wasteCategory.findUnique({
    where: { id, isDeleted: false },
  });
  if (!result) {
    throw new AppError(404, "Waste Category not found!");
  }
  return result;
};

const updateWasteCategory = async (id: string, payload: Partial<{ name: string; type: string; description: string }>) => {
  await getWasteCategoryById(id);

  const result = await prisma.wasteCategory.update({
    where: { id },
    data: payload,
  });
  return result;
};

const deleteWasteCategory = async (id: string) => {
  await getWasteCategoryById(id);

  const result = await prisma.wasteCategory.update({
    where: { id },
    data: { isDeleted: true },
  });
  return result;
};

export const WasteCategoryService = {
  createWasteCategory,
  getAllWasteCategories,
  getWasteCategoryById,
  updateWasteCategory,
  deleteWasteCategory,
};
