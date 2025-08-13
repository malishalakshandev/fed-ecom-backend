import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

async function deleteAllProducts() {
  let hasMore = true;
  let startingAfter = undefined;

  while (hasMore) {
    console.log("📦 Fetching product list...");
    const products: Stripe.ApiList<Stripe.Product> = await stripe.products.list({
      limit: 100,
      starting_after: startingAfter,
    });

    for (const product of products.data) {
      console.log(`\nProcessing: ${product.name} (${product.id})`);

      // 1️⃣ Get all prices for this product
      const prices = await stripe.prices.list({ product: product.id, limit: 100 });

      // 2️⃣ Delete each price
      for (const price of prices.data) {
        try {
          // @ts-ignore
          await stripe.prices.del(price.id);
          console.log(`   🗑️ Price ${price.id} deleted`);
        } catch (err) {
          // @ts-ignore
          console.log(`   ⚠️ Could not delete price ${price.id}: ${err.message}`);
        }
      }

      // 3️⃣ Remove default price (just in case)
          // @ts-ignore
      await stripe.products.update(product.id, { default_price: null });
      console.log(`   🗑️ Default price removed`);

      // 4️⃣ Delete product
      try {
        await stripe.products.del(product.id);
        console.log(`   ✅ Product deleted`);
      } catch (err) {
          // @ts-ignore

        console.log(`   ⚠️ Could not delete product ${product.id}: ${err.message}`);
      }
    }

    hasMore = products.has_more;
    if (hasMore) {
      startingAfter = products.data[products.data.length - 1].id;
    }
  }

  console.log("\n🎯 All products processed!");
}



deleteAllProducts().catch((err) => {
  console.error("Error deleting products:", err);
});