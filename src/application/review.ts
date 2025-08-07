import NotFoundError from "../domain/errors/not-found-error";
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

        const product = await Product.findById(data.productId);

        if (!product) {
            throw new NotFoundError("Product not found");
        }

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