import express from "express";
import {
    // getAllProducts,
    createProduct,
    getProductById,
    updateProductById,
    deleteProductById,
    uploadProductImage,
    getProductsForSearchQuery,
    getFilteredProducts
} from "../application/product";
import isAuthenticated from "./middleware/authentication-middleware";
import { isAdmin } from "./middleware/authorization-middleware";

const productRouter = express.Router();

productRouter.get("/search", getProductsForSearchQuery);
productRouter.get("/filter", getFilteredProducts)

productRouter
    .route("/")
    // .get(getAllProducts)
    .post(isAuthenticated, isAdmin, createProduct);


productRouter
    .route("/:id")
    .get(getProductById)
    .put(updateProductById)
    .delete(deleteProductById);

// productRouter.route("/images").post(isAuthenticated, isAdmin, uploadProductImage);
productRouter.route("/images").post(uploadProductImage);

export default productRouter;