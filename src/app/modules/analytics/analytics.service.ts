import prisma from "../../lib/prisma";

const getAdminDashboardMetrics = async () => {

  const totalCitizens = await prisma.user.count({ where: { role: "CITIZEN" } });
  const totalCollectors = await prisma.user.count({ where: { role: "COLLECTOR" } });
  const totalAdmins = await prisma.user.count({ where: { role: "ADMIN" } });


  const totalRequests = await prisma.wasteRequest.count();


  const requestsByStatusRaw = await prisma.wasteRequest.groupBy({
    by: ['status'],
    _count: {
      status: true
    }
  });

  const requestsByStatus = requestsByStatusRaw.reduce((acc, curr) => {
    acc[curr.status] = curr._count.status;
    return acc;
  }, {} as Record<string, number>);


  const paidInvoices = await prisma.invoice.aggregate({
    where: { status: "PAID" },
    _sum: { amount: true },
    _count: { id: true }
  });


  const pendingInvoices = await prisma.invoice.aggregate({
    where: { status: "PENDING" },
    _sum: { amount: true },
    _count: { id: true }
  });

  return {
    users: {
      totalCitizens,
      totalCollectors,
      totalAdmins,
      total: totalCitizens + totalCollectors + totalAdmins
    },
    wasteRequests: {
      total: totalRequests,
      breakdown: requestsByStatus
    },
    financials: {
      totalRevenue: paidInvoices._sum.amount || 0,
      paidInvoicesCount: paidInvoices._count.id,
      totalOutstanding: pendingInvoices._sum.amount || 0,
      pendingInvoicesCount: pendingInvoices._count.id
    }
  };
};

export const AnalyticsService = {
  getAdminDashboardMetrics,
};
