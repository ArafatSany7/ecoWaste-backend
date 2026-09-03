import cors from "cors";
import express, { type Application, type Request, type Response } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import config from "./app/config";

const app: Application = express();

// Security and middleware
app.use(helmet());
app.use(
  cors({
    origin: config.frontend_url,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// Health check endpoint
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "City Waste Management Field Service System API is running",
  });
});

// Not Found Handler (Basic for now, will be expanded in Phase 10)
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "API Not Found",
  });
});

export default app;
