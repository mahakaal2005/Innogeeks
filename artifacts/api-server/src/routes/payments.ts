import { Router } from "express";
import crypto from "node:crypto";
import { z } from "zod/v4";
import { requireAuth } from "../middleware/auth";
import { paymentLimiter } from "../middleware/rateLimiter";
import { razorpay } from "../lib/razorpay";
import { supabaseAdmin } from "../lib/supabase";

const router = Router();

const CreateOrderSchema = z.object({
  applicationId: z.uuid(),
  amountPaise: z.number().int().min(100),
  idempotencyKey: z.string().min(1).max(64),
});

router.post(
  "/payments/orders",
  paymentLimiter,
  requireAuth,
  async (req, res) => {
    if (!razorpay) {
      res.status(503).json({ error: "Payment service not configured" });
      return;
    }

    const parsed = CreateOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: "Validation failed", details: parsed.error.flatten() });
      return;
    }
    const { applicationId, amountPaise, idempotencyKey } = parsed.data;

    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from("recruitment_applications")
      .select("razorpay_order_id, payment_status, user_id")
      .eq("id", applicationId)
      .maybeSingle();

    if (fetchErr) {
      req.log.error({ fetchErr }, "DB fetch failed");
      res.status(500).json({ error: "Database error" });
      return;
    }
    if (!existing) {
      res.status(404).json({ error: "Application not found" });
      return;
    }
    if (existing.user_id !== req.user!.id) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    if (existing.razorpay_order_id) {
      res.json({ orderId: existing.razorpay_order_id, idempotent: true });
      return;
    }

    try {
      const order = await (razorpay.orders.create as Function)({
        amount: amountPaise,
        currency: "INR",
        receipt: idempotencyKey.slice(0, 40),
      });

      await supabaseAdmin
        .from("recruitment_applications")
        .update({
          razorpay_order_id: order.id,
          idempotency_key: idempotencyKey,
          payment_method: "upi",
          updated_at: new Date().toISOString(),
        })
        .eq("id", applicationId);

      req.log.info({ orderId: order.id, applicationId }, "Razorpay order created");
      res.status(201).json({ orderId: order.id });
    } catch (err) {
      req.log.error({ err }, "Razorpay order creation failed");
      res.status(502).json({ error: "Payment gateway error" });
    }
  },
);

router.post("/payments/webhook", async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    res.status(500).json({ error: "Webhook secret not configured" });
    return;
  }

  const signature = req.headers["x-razorpay-signature"] as string | undefined;
  const rawBody = req.rawBody;

  if (!signature || !rawBody) {
    res.status(400).json({ error: "Missing signature or body" });
    return;
  }

  const expected = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  const sigBuf = Buffer.from(signature, "utf8");
  const expBuf = Buffer.from(expected, "utf8");

  if (
    sigBuf.length !== expBuf.length ||
    !crypto.timingSafeEqual(sigBuf, expBuf)
  ) {
    res.status(400).json({ error: "Invalid signature" });
    return;
  }

  const event = JSON.parse(rawBody.toString()) as Record<string, unknown>;

  if (event["event"] === "payment.captured") {
    const payload = event["payload"] as Record<string, unknown>;
    const paymentEntity = (
      (payload["payment"] as Record<string, unknown>)["entity"]
    ) as Record<string, string>;

    const orderId = paymentEntity["order_id"];
    const paymentId = paymentEntity["id"];

    const { error } = await supabaseAdmin
      .from("recruitment_applications")
      .update({
        razorpay_payment_id: paymentId,
        payment_status: "approved",
        updated_at: new Date().toISOString(),
      })
      .eq("razorpay_order_id", orderId);

    if (error) {
      req.log.error({ error, orderId }, "Failed to update payment status");
      res.status(500).json({ error: "DB update failed" });
      return;
    }

    req.log.info({ orderId, paymentId }, "Payment captured and recorded");
  }

  res.json({ received: true });
});

export default router;
