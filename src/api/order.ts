import express from "express";
import { createOrder, getOrder, getOrders, getOrdersByLoggedUserId } from "./../application/order";
import isAuthenticated from "./middleware/authentication-middleware";
import { isAdmin } from "./middleware/authorization-middleware";

export const orderRouter = express.Router();

orderRouter.route("/")
    .get(isAuthenticated, isAdmin, getOrders)
    .post(isAuthenticated, createOrder);
    
orderRouter.route("/logged-user-orders").get(isAuthenticated, getOrdersByLoggedUserId);
orderRouter.route("/:id").get(getOrder);
