import "dotenv/config";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import { connectDB } from "./infrastructure/db/index";

import productRouter from "./api/product";
import categoryRouter from "./api/category";
import reviewRouter from "./api/review";
import { orderRouter } from "./api/order";
import { paymentsRouter } from "./api/payment";

import globalErrorHandlingMiddleware from "./api/middleware/global-error-handling-middleware";
import { clerkMiddleware } from '@clerk/express'
import { handleWebhook } from "./application/payment";

const app = express(); // express() is a function provided by the Express module.

app.use(clerkMiddleware());
app.use(cors({ origin: process.env.FRONTEND_URL }));

// Webhook endpoint must be raw body - Webhook first before to app.use(express.json());
app.post("/api/stripe/webhook", bodyParser.raw({ type: "application/json" }), handleWebhook);

app.use(express.json()); // It converts the incoming json payload of a request into a javascript object found in req.body

// app.use((req, res, next) => {
//     console.log("Hello from pre-middleware from all routes");
//     next();
// });

app.use('/api/products', productRouter); // product router
app.use('/api/categories', categoryRouter); // category router
app.use('/api/reviews', reviewRouter); // category router
app.use('/api/orders', orderRouter); // category router
app.use("/api/payments", paymentsRouter); // payment router


app.use(globalErrorHandlingMiddleware);

connectDB();

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});