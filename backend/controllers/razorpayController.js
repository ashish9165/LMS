import Razorpay from "razorpay";
import dotenv from "dotenv";
import crypto from 'crypto';

dotenv.config();

// Initialize Razorpay instance
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

// Create payment order
export const createOrder = async (req, res) => {
  try {
    // Creating Razorpay order
    
    const { amount } = req.body;
    
    // Validate input
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount. Amount must be a positive number."
      });
    }

    // Check credentials
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("❌ Razorpay credentials missing!");
      return res.status(500).json({
        success: false,
        message: "Payment service not configured. Please contact administrator."
      });
    }

    // Amount and Key ID check

    // Create order options
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    // Create Razorpay order
    const order = await razorpay.orders.create(options);

    // Order created

    // Return order details
    res.json({
      success: true,
      id: order.id,
      currency: order.currency,
      amount: order.amount,
      key: process.env.RAZORPAY_KEY_ID,
    });

  } catch (error) {
    console.error("❌ Razorpay error:", error);
    
    let message = "Failed to create payment order";
    
    if (error.error && error.error.description) {
      message = error.error.description;
    } else if (error.statusCode === 401) {
      message = "Invalid Razorpay credentials";
    }
    
    res.status(500).json({
      success: false,
      message: message
    });
  }
};

// Verify payment
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification parameters"
      });
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      console.log("✅ Payment verified successfully");
      res.json({
        success: true,
        message: "Payment verified successfully"
      });
    } else {
      console.log("❌ Payment verification failed");
      res.status(400).json({
        success: false,
        message: "Payment verification failed"
      });
    }
  } catch (error) {
    console.error("❌ Payment verification error:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed"
    });
  }
};

// Get payment status
export const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required"
      });
    }

    const order = await razorpay.orders.fetch(orderId);
    
    res.json({
      success: true,
      order: order
    });
  } catch (error) {
    console.error("❌ Error fetching payment status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment status"
    });
  }
};
