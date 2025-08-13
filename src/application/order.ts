import { Request, Response, NextFunction } from "express";
import Address from "../infrastructure/db/entities/Address";
import Order from "../infrastructure/db/entities/Order";
import NotFoundError from "../domain/errors/not-found-error";
import UnauthorizedError from "../domain/errors/unauthorized-error";
import { getAuth } from "@clerk/express";

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

        res.status(201).json({ 'orderId': orderId });

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

export {
    createOrder,
    getOrder,
}