import prisma from "../../lib/prisma";

const createLog = async (payload: {
  actorId: string;
  action: string;
  entity: string;
  entityId: string;
  previousValue?: any;
  newValue?: any;
  ipAddress?: string;
}) => {
  const result = await prisma.auditLog.create({
    data: payload,
  });
  return result;
};

export const AuditLogService = {
  createLog,
};
