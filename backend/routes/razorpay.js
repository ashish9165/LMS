import express from "express";
import { createOrder, verifyPayment, getPaymentStatus } from "../controllers/razorpayController.js";

const router = express.Router();

// Razorpay routes initialized



// Create payment order
router.post("/order", createOrder);

// Verify payment
router.post("/verify", verifyPayment);

// Get payment status
router.get("/status/:orderId", getPaymentStatus);

// Razorpay routes configured successfully

export default router;
