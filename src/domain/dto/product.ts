import { z } from "zod";

const CreateProductDTO = z.object({
    categoryId: z.string().min(1),
    colorId: z.string().min(1),
    name: z.string().min(1),
    description: z.string().min(5).max(100),
    image: z.string().min(1),
    stock: z.number(),
    price: z.number().nonnegative(),
});

export {
    CreateProductDTO
}