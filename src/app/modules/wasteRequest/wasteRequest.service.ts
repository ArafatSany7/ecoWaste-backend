import { Prisma } from "@prisma/client";
import prisma from "../../lib/prisma";
import AppError from "../../errors/AppError";

const createWasteRequest = async (userId: string, payload: { categoryId: string; zoneId: string; address: string; weight?: number }) => {
  const result = await prisma.wasteRequest.create({
    data: {
      ...payload,
      citizenId: userId,
    },
    include: {
      citizen: true,
      category: true,
      zone: true,
    }
  });
  return result;
};

const calculatePagination = (query: Record<string, unknown>) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;
  const sortBy = (query.sortBy as string) || "createdAt";
  const sortOrder = (query.sortOrder as string) || "desc";

  return { page, limit, skip, sortBy, sortOrder };
};

const buildQueryConditions = (query: Record<string, unknown>, extraConditions: Prisma.WasteRequestWhereInput = {}) => {
  const { searchTerm, status, categoryId, zoneId } = query;
  const andConditions: Prisma.WasteRequestWhereInput[] = [];

  if (Object.keys(extraConditions).length > 0) {
    andConditions.push(extraConditions);
  }

  if (searchTerm) {
    andConditions.push({
      OR: [
        { address: { contains: searchTerm as string, mode: "insensitive" } },
        { citizen: { firstName: { contains: searchTerm as string, mode: "insensitive" } } },
        { citizen: { lastName: { contains: searchTerm as string, mode: "insensitive" } } },
        { citizen: { phone: { contains: searchTerm as string, mode: "insensitive" } } },
      ],
    });
  }

  if (status) {
    andConditions.push({ status: status as any });
  }

  if (categoryId) {
    andConditions.push({ categoryId: categoryId as string });
  }

  if (zoneId) {
    andConditions.push({ zoneId: zoneId as string });
  }

  return andConditions.length > 0 ? { AND: andConditions } : {};
};

const getAllWasteRequests = async (query: Record<string, unknown>) => {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(query);
  const where = buildQueryConditions(query);

  const result = await prisma.wasteRequest.findMany({
    where,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      citizen: true,
      category: true,
      zone: true,
    }
  });

  const total = await prisma.wasteRequest.count({ where });

  return {
    meta: { page, limit, total },
    data: result,
  };
};

const getMyWasteRequests = async (userId: string, query: Record<string, unknown>) => {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(query);
  const where = buildQueryConditions(query, { citizenId: userId });

  const result = await prisma.wasteRequest.findMany({
    where,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      category: true,
      zone: true,
    }
  });

  const total = await prisma.wasteRequest.count({ where });

  return {
    meta: { page, limit, total },
    data: result,
  };
};

const getWasteRequestById = async (id: string, user: { userId: string, role: string }) => {
  const result = await prisma.wasteRequest.findUnique({
    where: { id },
    include: {
      citizen: true,
      category: true,
      zone: true,
    }
  });

  if (!result) {
    throw new AppError(404, "Waste Request not found");
  }


  if (user.role === "CITIZEN" && result.citizenId !== user.userId) {
    throw new AppError(403, "You do not have permission to view this request");
  }

  return result;
};

export const WasteRequestService = {
  createWasteRequest,
  getAllWasteRequests,
  getMyWasteRequests,
  getWasteRequestById,
};
