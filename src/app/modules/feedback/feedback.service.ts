import prisma from "../../lib/prisma";
import AppError from "../../errors/AppError";
import { IFeedback } from "./feedback.interface";

const createFeedback = async (citizenId: string, payload: IFeedback) => {
  const { requestId, rating, comment } = payload;

  const wasteRequest = await prisma.wasteRequest.findUnique({
    where: { id: requestId },
    include: { feedback: true },
  });

  if (!wasteRequest) {
    throw new AppError(404, "Waste Request not found");
  }

  if (wasteRequest.citizenId !== citizenId) {
    throw new AppError(403, "You can only leave feedback for your own requests");
  }

  if (wasteRequest.status !== "COMPLETED" && wasteRequest.status !== "PAID") {
    throw new AppError(400, "Feedback can only be left for completed or paid requests");
  }

  if (wasteRequest.feedback) {
    throw new AppError(400, "Feedback has already been submitted for this request");
  }

  const result = await prisma.$transaction(async (tx) => {
    const feedback = await tx.feedback.create({
      data: {
        citizenId,
        requestId,
        rating,
        comment,
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: citizenId,
        action: "SUBMIT_FEEDBACK",
        entity: "Feedback",
        entityId: feedback.id,
        newValue: { rating, comment },
      },
    });

    return feedback;
  });

  return result;
};

const getAllFeedback = async () => {
  const result = await prisma.feedback.findMany({
    include: {
      citizen: {
        select: {
          id: true,
          email: true,
        },
      },
      request: {
        select: {
          id: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return result;
};

const getMyFeedback = async (citizenId: string) => {
  const result = await prisma.feedback.findMany({
    where: { citizenId },
    include: {
      request: {
        select: {
          id: true,
          status: true,
          address: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return result;
};

export const FeedbackService = {
  createFeedback,
  getAllFeedback,
  getMyFeedback,
};
