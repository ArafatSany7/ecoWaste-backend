import { Prisma } from "@prisma/client";

const handlePrismaError = (err: Prisma.PrismaClientKnownRequestError | Prisma.PrismaClientValidationError) => {
  let statusCode = 400;
  let message = "Database Error";
  let errorSources = [
    {
      path: "",
      message: err.message,
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
    }
  }

  return {
    statusCode,
    message,
    errorSources,
  };
};

export default handlePrismaError;
