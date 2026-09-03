import cors from "cors";
import express, { type Application, type Request, type Response } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import config from "./app/config";

const app: Application = express();

app.use(helmet());
app.use(
  cors({
    origin: config.frontend_url,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

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

export default app;
