import { Request, Response, NextFunction } from "express";
import Address from "../infrastructure/db/entities/Address";
import Order from "../infrastructure/db/entities/Order";
import NotFoundError from "../domain/errors/not-found-error";
import UnauthorizedError from "../domain/errors/unauthorized-error";
import { clerkClient, getAuth } from "@clerk/express";

const createOrder = async (req: Request, res: Response, next: NextFunction) => {
    
    try {
    
        const data = req.body;
        const { userId } = getAuth(req);

        const address = await Address.create(data.shippingAddress);

        const result = await Order.create({
            addressID: address._id,
            items: data.orderItems,
            userId: userId,
        });

        const orderId = result._id;

        res.status(201).send({ 'orderId': orderId });

    } catch (error) {
        next(error);
    }
}

const getOrder = async (req: Request, res: Response, next: NextFunction) => {
    
    try {
        
        const userId = "123";

        const orderId = req.params.id;

        const order = await Order.findById(orderId);
        if (!order) {
            throw new NotFoundError("Order not found");
        }

        if(order.userId !== userId) { // check if logged user access only their created orders only
            throw new UnauthorizedError("Unauthorized");
        }

        res.status(200).json(order);

    } catch (error) {
        next(error);
    }
  
}

const getOrders = async (req: Request, res: Response, next: NextFunction) => {

    try {

        const orders = await Order.find()
        .populate({
            path: "items.productId",        // populate product inside items
            populate: [
                { path: "categoryId" },     // populate category inside product
                { path: "colorId" }         // populate color inside product
            ]
        })
        .populate("addressID")

        // Fetch user info from Clerk for each order
        const ordersWithUser = await Promise.all(
            orders.map(async (order) => {
                const user = await clerkClient.users.getUser(order.userId);
                return {
                    ...order.toObject(),
                    userName: `${user.firstName || ""} ${user.lastName || ""}`,
                    userEmail: user.emailAddresses[0]?.emailAddress || ""
                };
            })
        );

        res.status(200).json(ordersWithUser);
        
    } catch (error) {
        next(error)
    }

}

const getOrdersByLoggedUserId = async (req: Request, res: Response, next: NextFunction) => {

    try {

        const { userId } = getAuth(req);

        if(!userId) {
            throw new UnauthorizedError('Unauthorized: No userId');
        }

        const orders = await Order.find({ userId })
        .populate({
            path: "items.productId",        // populate product inside items
            populate: [
                { path: "categoryId" },     // populate category inside product
                { path: "colorId" }         // populate color inside product
            ]
        })
        .populate("addressID")

        res.status(200).json(orders);
        
    } catch (error) {
        next(error)
    }

}

export {
    createOrder,
    getOrder,
    getOrders,
    getOrdersByLoggedUserId,
}