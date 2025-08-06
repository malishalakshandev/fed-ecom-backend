import Product from "../infrastructure/db/entities/Product";
import Review from "../infrastructure/db/entities/Review";

import { Request, Response, NextFunction } from "express";

const createReview = async (req: Request, res: Response, next: NextFunction) => {
    
    try {
        const data = req.body;
        const newReview = await Review.create({
            review: data.review,
            rating: data.rating,
        });

        // await Product.findByIdAndUpdate(data.productId, {
        //     $push: { reviews: newReview._id }
        // });

        const product = await Product.findById(data.productId);
        product.reviews.push(newReview._id);
        await product.save();

        res.status(201).json(newReview);
    } catch (error) {
        next(error);
    }

}


export {
    createReview,
};