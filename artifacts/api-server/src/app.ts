import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { generalLimiter } from "./middleware/rateLimiter";

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const app: Express = express();

app.use(helmet());

app.use(
  cors({
    origin:
      ALLOWED_ORIGINS.length > 0
        ? (origin, cb) => {
            if (!origin || ALLOWED_ORIGINS.includes(origin)) {
              cb(null, true);
            } else {
              cb(new Error("Not allowed by CORS"));
            }
          }
        : true,
    credentials: true,
  }),
);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

app.use(
  express.json({
    limit: "256kb",
    verify: (req: express.Request & { rawBody?: Buffer }, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);
app.use(express.urlencoded({ extended: true, limit: "256kb" }));

app.use(generalLimiter);

app.use("/api", router);

export default app;
