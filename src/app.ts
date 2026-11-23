import cors from "cors";
import cookieParser from "cookie-parser";
import express, { type Application, type Request, type Response } from "express";
import helmet from "helmet";
import router from "./app/routes";
import config from "./app/config";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import { generalLimiter } from "./app/middlewares/rateLimiters";

const app: Application = express();

app.use(helmet());
app.use(
  cors({
    origin: config.frontend_url,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Live-tracking routes are excluded here and use their own limiter (see rateLimiters.ts).
app.use(generalLimiter);

app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "City Waste Management Field Service System API is running",
  });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "API Not Found",
    errors: [
      {
        path: req.originalUrl,
        message: "API Not Found",
      },
    ],
  });
});

app.use(globalErrorHandler);

export default app;
