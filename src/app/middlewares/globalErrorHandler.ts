import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import config from "../config";
import AppError from "../errors/AppError";
import handleZodError from "../errors/handleZodError";
import handlePrismaError from "../errors/handlePrismaError";

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = "Something went wrong!";
  let errorSources: { path: string | number; message: string }[] = [
    {
      path: "",
      message: "Something went wrong!",
    },
  ];

  if (err instanceof ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError || err instanceof Prisma.PrismaClientValidationError) {
    const simplifiedError = handlePrismaError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  } else if (err?.name === "TokenExpiredError" || err?.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "You are not authorized!";
    errorSources = [
      {
        path: "",
        message: "You are not authorized!",
      },
    ];
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorSources = [
      {
        path: "",
        message: err.message,
      },
    ];
  } else if (err instanceof Error) {
    message = err.message;
    errorSources = [
      {
        path: "",
        message: err.message,
      },
    ];
    if (message === "User with this email already exists" || message === "Invalid credentials" || message === "This user account is blocked or deleted") {
      statusCode = 400;
    } else if (message === "You are not authorized!" || message === "You have no access to this route") {
      statusCode = 401;
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    stack: config.env === "development" && statusCode === 500 ? err?.stack : undefined,
  });
};

export default globalErrorHandler;
