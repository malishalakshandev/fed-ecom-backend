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

const getSalesData = async (days: number) => {

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    const sales = await Order.aggregate([
        {
        $match: {
            createdAt: { $gte: startDate },
            orderStatus: "FULFILLED"
        },
        },
        {
        $unwind: "$items", // break out each item
        },
        {
        $lookup: {
            from: "products", // collection name (check your MongoDB, usually lowercase + plural)
            localField: "items.productId",
            foreignField: "_id",
            as: "product",
        },
        },
        {
        $unwind: "$product", // since lookup returns an array
        },
        {
        $project: {
            createdAt: 1,
            itemTotal: { $multiply: ["$items.quantity", "$product.price"] },
        },
        },
        {
        $group: {
            _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            totalSales: { $sum: "$itemTotal" },
        },
        },
        { $sort: { _id: 1 } },
    ]);

    // Create an array of all days in the range
    const result: { date: string; totalSales: number }[] = [];

    for(let i = 0; i < days; i++){

        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);
        const formatted = d.toISOString().split("T")[0];

        const found = sales.find((s) => s._id === formatted);
        
        result.push({
            date: formatted,
            totalSales: found ? found.totalSales : 0
        });
    }

    return result;

}

const getSalesLast7Days = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sales = await getSalesData(7);
    res.status(200).json(sales);
  } catch (error) {
    next(error);
  }
};

const getSalesLast30Days = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sales = await getSalesData(30);
    res.status(200).json(sales);
  } catch (error) {
    next(error);
  }
};

export {
    createOrder,
    getOrder,
    getOrders,
    getOrdersByLoggedUserId,
    getSalesLast7Days,
    getSalesLast30Days,
}




// const getSalesData = async (days: number) => {

//     const startDate = new Date();
//     startDate.setDate(startDate.getDate() - (days - 1));
//     startDate.setHours(0, 0, 0, 0);

//     const sales = await Order.aggregate([
//     {
//       $match: {
//         createdAt: { $gte: startDate }
//       }
//     },
//     {
//       $group: {
//         _id: {
//           $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
//         },
//         totalSales: { $sum: "$totalAmount" } // assumes you have totalAmount in schema
//       }
//     },
//     { $sort: { _id: 1 } }
//     ]);

//     // Create an array of all days in the range
//     const result: { date: string; totalSales: number }[] = [];

//     for(let i = 0; i < days; i++){

//         const d = new Date(startDate);
//         d.setDate(startDate.getDate() + i);
//         const formatted = d.toISOString().split("T")[0];

//         const found = sales.find((s) => s._id === formatted);
        
//         result.push({
//             date: formatted,
//             totalSales: found ? found.totalSales : 0
//         });
//     }

//     return result;

// }