import Product from "../infrastructure/db/entities/Product";

import NotFoundError from "../domain/errors/not-found-error";
import ValidationError from "../domain/errors/validation-error";

import { Request, Response, NextFunction } from "express";
import { CreateProductDTO } from "../domain/dto/product";

import { randomUUID } from "crypto";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import S3 from "../infrastructure/s3";
import stripe from "../infrastructure/stripe";
import Category from "../infrastructure/db/entities/Category";

// const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
    
//     try {
        
//         const categorySlug = req.query.categorySlug;
//         let filter: any = {};

//         if (categorySlug) {

//             const categoryDoc = await Category.findOne({ slug: categorySlug });
//             if(!categoryDoc){
//                 throw new NotFoundError("Category not found");
//             }
//             filter.categoryId = categoryDoc._id; // filter products by categoryId

//         }

//         const products = await Product.find(filter)
//         .populate("categoryId", "name slug")
//         .populate("colorId", "colorName colorHexCode");

//         res.status(200).json(products);

//     } catch (error) {
//         next(error);
//     }

// };

const getFilteredProducts = async (req: Request, res: Response, next: NextFunction) => {
    
    try {

        const { categorySlug, colorId, priceSort, page = "1", limit = "12" } = req.query;

        let filter: any = {}; // {categoryId = "25345348254285486", colorId = "547853486486758675967"}

        // Filter by category
        if(categorySlug){
            const categoryDoc = await Category.findOne({ slug: categorySlug }); // need to fecth by categorySlug and get category_id because in product model avaulable only categoryId not the categorySlug for filter products query
            if(!categoryDoc){
                throw new NotFoundError("System Invalid Category");
            }
            filter.categoryId = categoryDoc._id;
        }

        // Filter by color
        if(colorId){
            filter.colorId = colorId; // assuming colorId comes as ObjectId string
        }

        /*
        * Pagination setup
        * Converts string query values to integers.
        * Fallbacks to 1 (page) and 9 (limit) if parsing fails.
        * (pageNumber - 1) --> how many pages need to skipped
        * * limitNumber" --> get how many total records in skiped pages 
        */
        const pageNumber = parseInt(page as string, 10) || 1;
        const limitNumber = parseInt(limit as string, 10) || 12;
        const skip = (pageNumber - 1) * limitNumber; // How many documents/records to skip before fetching for clicked page.

        // Count total documents (for pagination metadata)
        const totalItems = await Product.countDocuments(filter);

        // Build the query. this not execute
        let query = Product.find(filter) 
            .populate("categoryId", "name slug")
            .populate("colorId", "colorName colorHexCode");

        // Sort by price if needed
        if(priceSort){
            const sortOrder = priceSort === "asc" ? 1 : -1;
            query.sort({ price: sortOrder });
        }

        /*
        * await --> Execute the query
        * skip(skip) --> how many records need to skip
        * limit(limit) --> how many records need to have 
        */
        const filteredProducts = await query.skip(skip).limit(limitNumber);

        res.status(200).json({
        data: filteredProducts,
        totalItems,
        totalPages: Math.ceil(totalItems / limitNumber), //  Math.ceil(totalItems / limitNumber) --> rounds up the fractional part (2.22  converts to 3) 
        currentPage: pageNumber,
        });

    } catch (error) {
        next(error);
    }

};

const createProduct = async (req: Request, res: Response, next: NextFunction) => {

    try {
        
        const result = CreateProductDTO.safeParse(req.body);
        if (!result.success) {
            throw new ValidationError(result.error.message);
        }

        const stripeProduct = await stripe.products.create({
            name: result.data.name,
            description: result.data.description,
            default_price_data: {
                currency: "usd",
                unit_amount: result.data.price * 100,
            },
        });

        await Product.create({ ...result.data, stripePriceId: stripeProduct.default_price});
        res.status(201).send({ message: "Product created successfully" });

    } catch (error) {
        next(error);
    }

};

const getProductById = async (req: Request, res: Response, next: NextFunction) => {

    try {
        // const product = await Product.findById(req.params.id).populate("categoryId").populate("reviews");;
        // const product = await Product.findById(req.params.id).populate("categoryId");
        // const product = await Product.findById(req.params.id);
        const product = await Product.findById(req.params.id).populate("reviews");
        if (!product) {
        throw new NotFoundError("Product not found");
        }
        res.json(product);
    } catch (error) {
        next(error);
    }

};

const updateProductById = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        });
        if (!product) {
        throw new NotFoundError("Product not found");
        }
        res.status(200).json(product);
    } catch (error) {
        next(error);
    }

};

const deleteProductById = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
        throw new NotFoundError("Product not found");
        }
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        next(error);
    }

};

const uploadProductImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body;
    const { fileType } = body;

    const id = randomUUID();

    const url = await getSignedUrl(
        S3, new PutObjectCommand({
            Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
            Key: id,
            ContentType: fileType,
      }),
      {
        expiresIn: 60,
      }
    );

    res.status(200).json({
        url,
        publicURL: `${process.env.CLOUDFLARE_PUBLIC_DOMAIN}/${id}`,
      });

  } catch (error) {
    next(error);
  }
};

const getProductsForSearchQuery = async ( req: Request, res: Response, next: NextFunction ) => {
  
    try {
        const { search } = req.query;
        const results = await Product.aggregate([
        {
            $search: {
            index: "default",
            autocomplete: {
                path: "name",
                query: search,
                tokenOrder: "any",
                fuzzy: {
                maxEdits: 1,
                prefixLength: 2,
                maxExpansions: 256,
                },
            },
            highlight: {
                path: "name",
            },
            },
        },
        ]);

        res.json(results);

  } catch (error) {
    next(error);
  }

};

export {
    // getAllProducts,
    getFilteredProducts,
    createProduct,
    getProductById,
    updateProductById,
    deleteProductById,
    uploadProductImage,
    getProductsForSearchQuery
};