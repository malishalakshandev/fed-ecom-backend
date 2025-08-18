import mongoose from "mongoose";
import { required } from "zod/v4/core/util.cjs";

const productSchema = new mongoose.Schema({
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    colorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Color",
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    stripePriceId: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    stock: {
        type: Number,
        required: true,
    },
    reviews: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Review",
        default: [],
    }
});

const Product = mongoose.model("Product", productSchema);

export default Product;