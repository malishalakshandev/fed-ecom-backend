import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./infrastructure/db/index";

import productRouter from "./api/product";
import categoryRouter from "./api/category";
import reviewRouter from "./api/review";

import globalErrorHandlingMiddleware from "./api/middleware/global-error-handling-middleware";
import { orderRouter } from "./api/order";
import { clerkMiddleware } from '@clerk/express'

const app = express(); // express() is a function provided by the Express module.

app.use(express.json()); // It converts the incoming json payload of a request into a javascript object found in req.body
app.use(clerkMiddleware());
app.use(cors({ origin: process.env.FRONTEND_URL }));

// app.use((req, res, next) => {
//     console.log("Hello from pre-middleware from all routes");
//     next();
// });

app.use('/api/products', productRouter); // product router
app.use('/api/categories', categoryRouter); // category router
app.use('/api/reviews', reviewRouter); // category router
app.use('/api/orders', orderRouter); // category router


app.use(globalErrorHandlingMiddleware);

connectDB();

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});