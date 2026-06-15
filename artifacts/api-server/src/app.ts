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

const IS_PROD = process.env.NODE_ENV === "production";

if (IS_PROD && ALLOWED_ORIGINS.length === 0) {
  logger.warn(
    "ALLOWED_ORIGINS is not set in production — all origins will be blocked by CORS. Set ALLOWED_ORIGINS to your quiz site domain.",
  );
}

const app: Express = express();

app.use(helmet());

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) {
        cb(null, true);
        return;
      }
      if (ALLOWED_ORIGINS.length === 0) {
        if (IS_PROD) {
          cb(new Error("CORS: no allowed origins configured"));
        } else {
          cb(null, true);
        }
        return;
      }
      if (ALLOWED_ORIGINS.includes(origin)) {
        cb(null, true);
      } else {
        cb(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
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
    limit: "10mb",
    verify: (req: express.Request & { rawBody?: Buffer }, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(generalLimiter);

app.use("/api", router);

export default app;
