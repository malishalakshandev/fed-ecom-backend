import "dotenv/config";
import { connectDB } from "./index";
import Category from "./entities/Category";
import Product from "./entities/Product";
import stripe from "../stripe";
import slugify from "slugify";
import Color from "./entities/Color";

const CATEGORY_NAMES = ["Socks", "Pants", "T-shirts", "Shoes", "Shorts"];

const ADJECTIVES = [
  "Classic", "Sporty", "Elegant", "Comfy", "Trendy", "Cool", "Premium", "Casual", "Bold", "Vivid",
  "Soft", "Durable", "Lightweight", "Cozy", "Modern", "Vintage", "Chic", "Sleek", "Eco", "Urban"
];
const NOUNS = [
  "Runner", "Style", "Fit", "Wear", "Edition", "Line", "Collection", "Piece", "Design", "Model",
  "Comfort", "Edge", "Wave", "Touch", "Look", "Trend", "Vibe", "Aura", "Motion", "Essence"
];

function getRandomName(categoryName: string) {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adj} ${categoryName} ${noun}`;
}

const createProductsForCategory = async (categoryId: any, categoryName: string, colors: any[]) => {
  const products = [];
  for (let i = 0; i < 5; i++) {

    const name = getRandomName(categoryName);
    const description = `This is a ${categoryName} that is ${name}`;
    const price = Math.floor(Math.random() * 100) + 10;

    const stripeProduct = await stripe.products.create({
      name: name,
      description: description,
      default_price_data: {
        currency: "usd",
        unit_amount: price * 100,
      },
    });

  // Pick a random color from the seeded colors
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    products.push({
      categoryId,
      colorId: randomColor._id,
      name: name,
      price: price,
      description: description,
      image: `https://pub-6a4fe8b5826245939f051dab2178da60.r2.dev/1b1b655e-cc4d-41e0-8a22-c2d10231cdc5?text=${encodeURIComponent(categoryName)}`,
      stock: Math.floor(Math.random() * 50) + 1,
      reviews: [],
      stripePriceId: stripeProduct.default_price
    });
  }
  await Product.insertMany(products);
};

const seedColors = async () => {
  
  const colorsData = [
    { colorName: "Green", colorHexCode: "#00FF00" },
    { colorName: "Red", colorHexCode: "#FF0000" },
    { colorName: "Blue", colorHexCode: "#0000FF" },
    { colorName: "Black", colorHexCode: "#000000" },
  ];

  const insertedColors = await Color.insertMany(colorsData);

  // Return the inserted color documents
  return insertedColors; // each item has _id
};

const seed = async () => {
  await connectDB();
  await Category.deleteMany({});
  await Product.deleteMany({});
  await Color.deleteMany({});

  // Seed colors first and get inserted colors
  const colors = await seedColors();

  for (const name of CATEGORY_NAMES) {
    const slug = slugify(name, { lower: true, strict: true });
    const category = await Category.create({ name, slug });
    await createProductsForCategory(category._id, name, colors);
    console.log(`Seeded category: ${name}`);
  }

  console.log("Seeding complete.");
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});