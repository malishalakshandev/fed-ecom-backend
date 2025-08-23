import express from "express";
import { createOrder, getOrder, getOrders, getOrdersByLoggedUserId, getSalesLast30Days, getSalesLast7Days } from "./../application/order";
import isAuthenticated from "./middleware/authentication-middleware";
import { isAdmin } from "./middleware/authorization-middleware";

export const orderRouter = express.Router();

orderRouter.route("/")
    .get(isAuthenticated, isAdmin, getOrders)
    .post(isAuthenticated, createOrder);
    
orderRouter.route("/sales/last-seven-days").get(getSalesLast7Days);
orderRouter.route("/sales/last-thirty-days").get(getSalesLast30Days);
orderRouter.route("/logged-user-orders").get(isAuthenticated, getOrdersByLoggedUserId);
orderRouter.route("/:id").get(getOrder);
