import Razorpay from "razorpay";
import { logger } from "./logger";

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
  logger.warn("RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET not set — payment endpoints will return 503");
}

export const razorpay =
  keyId && keySecret
    ? new Razorpay({ key_id: keyId, key_secret: keySecret })
    : null;
