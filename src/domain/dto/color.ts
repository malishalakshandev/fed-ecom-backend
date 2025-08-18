import { z } from "zod";

const CreateColorDTO = z.object({
    colorName: z.string().min(1, "Color name is required"),
    colorHexCode: z
        .string()
        .min(1, "Please pick a color")
        .regex(/^#([0-9A-Fa-f]{6})$/, "Invalid color format"), // Only valid hex codes
});

export {
    CreateColorDTO
}