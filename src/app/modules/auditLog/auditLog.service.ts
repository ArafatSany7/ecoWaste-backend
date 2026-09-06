import prisma from "../../lib/prisma";
import AppError from "../../errors/AppError";

type IAuditLogFilter = {
  actorId?: string;
  action?: string;
  entity?: string;
  entityId?: string;
  startDate?: string;
  endDate?: string;
};

const getAllAuditLogs = async (filters: IAuditLogFilter, page = 1, limit = 10) => {
  const where: any = {};

  if (filters.actorId) where.actorId = filters.actorId;
  if (filters.action) where.action = filters.action;
  if (filters.entity) where.entity = filters.entity;
  if (filters.entityId) where.entityId = filters.entityId;

  if (filters.startDate || filters.endDate) {
    where.createdAt = {};
    if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
    if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
  }

  const skip = (page - 1) * limit;

  const logs = await prisma.auditLog.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      actor: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
    },
  });

  const total = await prisma.auditLog.count({ where });

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: logs,
  };
};

const getAuditLogById = async (id: string) => {
  const log = await prisma.auditLog.findUnique({
    where: { id },
    include: {
      actor: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
    },
  });

  if (!log) {
    throw new AppError(404, "Audit Log not found");
  }

  return log;
};

export const AuditLogService = {
  getAllAuditLogs,
  getAuditLogById,
};
