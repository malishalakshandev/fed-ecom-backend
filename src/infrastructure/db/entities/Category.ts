import mongoose from "mongoose";
import slugify from "slugify";

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        required: true,
    }
});

// Middleware to generate slug before saving
categorySchema.pre("save", function (next) {
    // If the name hasn't been modified, skip slug generation
    if (!this.isModified("name")) return next(); 

    this.slug = slugify(this.name, { lower: true, strict: true });
    next();
});

const Category = mongoose.model("Category", categorySchema);

export default Category;