import cors from "cors";
import cookieParser from "cookie-parser";
import express, { type Application, type Request, type Response } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import router from "./app/routes";
import config from "./app/config";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";

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

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

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
  });
});

app.use(globalErrorHandler);

export default app;
