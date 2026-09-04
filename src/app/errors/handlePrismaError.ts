import { Prisma } from "@prisma/client";

const handlePrismaError = (err: Prisma.PrismaClientKnownRequestError | Prisma.PrismaClientValidationError) => {
  const cleanMessage = err.message.split("\n").filter(Boolean).pop()?.trim() || "Database Error";

  let statusCode = 400;
  let message = "Database Error";
  let errorSources = [
    {
      path: "",
      message: cleanMessage,
    },
  ];

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = 409;
      message = "Duplicate Entry";
      errorSources = [
        {
          path: "",
          message: `${err.meta?.target} already exists`,
        },
      ];
    } else if (err.code === "P2025") {
      statusCode = 404;
      message = "Not Found";
      errorSources = [
        {
          path: "",
          message: "Record not found",
        },
      ];
    } else if (err.code === "P2003") {
      statusCode = 400;
      message = "Invalid Reference";
      errorSources = [
        {
          path: "",
          message: `The referenced record does not exist (${err.meta?.field_name})`,
        },
      ];
    }
  }

  return {
    statusCode,
    message,
    errorSources,
  };
};

export default handlePrismaError;
