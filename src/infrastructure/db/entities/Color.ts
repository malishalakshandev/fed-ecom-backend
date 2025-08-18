import mongoose from "mongoose";

const colorSchema = new mongoose.Schema(
    {
        colorName: { 
            type: String,
            required: true,
        },
        colorHexCode: { 
            type: String,
            required: true, // "#FFFFFF"
        }
    },
    {
        timestamps: true // Adds createdAt and updatedAt automatically
    }
);

export default mongoose.model("Color", colorSchema);