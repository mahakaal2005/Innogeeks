import { Router, type IRouter } from "express";
import healthRouter from "./health";
import paymentsRouter from "./payments";
import quizRouter from "./quiz";
import recruitmentRouter from "./recruitment";
import cloudinaryRouter from "./cloudinary";

const router: IRouter = Router();

router.use(healthRouter);
router.use(paymentsRouter);
router.use(quizRouter);
router.use(recruitmentRouter);
router.use(cloudinaryRouter);

export default router;
