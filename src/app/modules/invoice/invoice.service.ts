import prisma from "../../lib/prisma";

const getMyInvoices = async (citizenId: string, query: Record<string, unknown>) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const where: any = {
    citizenId,
  };

  if (query.status) {
    where.status = query.status;
  }

  const result = await prisma.invoice.findMany({
    where,
    skip,
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      request: true,
    },
  });

  const total = await prisma.invoice.count({ where });

  return {
    meta: { page, limit, total },
    data: result,
  };
};

export const InvoiceService = {
  getMyInvoices,
};
