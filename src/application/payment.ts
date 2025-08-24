import { Request, Response } from "express";
import util from "util";
import Order from "../infrastructure/db/entities/Order";
import stripe from "../infrastructure/stripe";
import Product from "../infrastructure/db/entities/Product";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
const FRONTEND_URL = process.env.FRONTEND_URL as string;

interface Product {
  _id: string;
  stock: number;
  stripePriceId: string;
  name: string;
}

async function fulfillCheckout(sessionId: string) {
  console.log("Fulfilling Checkout Session " + sessionId);

  // Retrieve the Checkout Session from the API with line_items expanded
  const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items"],
  });
  console.log(
    util.inspect(checkoutSession, false, null, true /* enable colors */)
  );

  const order = await Order.findById(
    checkoutSession.metadata?.orderId
  ).populate<{
    items: { productId: Product; quantity: number }[];
  }>("items.productId");

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.paymentStatus !== "PENDING") {
    throw new Error("Payment is not pending");
  }

  if (order.orderStatus !== "PENDING") {
    throw new Error("Order is not pending");
  }

  console.log('fullfillcheckout order:', order);

  // Check the Checkout Session's payment_status property
  if (checkoutSession.payment_status !== "unpaid") {
    // Perform fulfillment of the line items
    order.items.forEach(async (item) => {
      const product = item.productId;
      await Product.findByIdAndUpdate(product._id, {
        $inc: { stock: -item.quantity },
      });
    });

    await Order.findByIdAndUpdate(order._id, {
      paymentStatus: "PAID",
      orderStatus: "FULFILLED",
    });
  }
}

export const handleWebhook = async (req: Request, res: Response) => {
  const payload = req.body;
  const sig = req.headers["stripe-signature"] as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      await fulfillCheckout(event.data.object.id);
      res.status(200).send();
      return;
    }
  } catch (err) {
    // @ts-ignore
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }
};

export const createCheckoutSession = async (req: Request, res: Response) => {
  const orderId = req.body.orderId;
  console.log("body", req.body);
  // const order = await Order.findById(orderId).populate("items.productId");
  const order = await Order.findById(orderId).populate<{ items: { productId: Product; quantity: number }[]; }>("items.productId");

  if (!order) {
    throw new Error("Order not found");
  }

  console.log('fetched order:', order);

  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    line_items: order.items.map((item) => ({
      price: item.productId.stripePriceId,
      quantity: item.quantity,
    })),
    mode: "payment",
    return_url: `${FRONTEND_URL}/shop/complete?session_id={CHECKOUT_SESSION_ID}`,
    metadata: {
      orderId: req.body.orderId,
    },
  });

  res.send({ clientSecret: session.client_secret });
};

export const retrieveSessionStatus = async (req: Request, res: Response) => {
  const checkoutSession = await stripe.checkout.sessions.retrieve(
    req.query.session_id as string
  );

  const order = await Order.findById(checkoutSession.metadata?.orderId);
  if (!order) {
    throw new Error("Order not found");
  }

  res.status(200).json({
    orderId: order._id,
    status: checkoutSession.status,
    customer_email: checkoutSession.customer_details?.email,
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
  });
};