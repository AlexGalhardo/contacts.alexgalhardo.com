import { z } from "zod";

export const contactSchema = z.object({
	userName: z
		.string()
		.min(4, { message: "Username must be at least 4 characters long" })
		.max(16, { message: "Username must be at most 16 characters long" })
		.regex(/^[A-Za-z]+$/, { message: "Username must contain at least 4 letters" }),

	displayName: z
		.string()
		.min(4, { message: "Display name must be at least 4 characters long" })
		.max(16, { message: "Display name must be at most 16 characters long" })
		.regex(/^[A-Za-z]+$/, { message: "Display name must contain at least 4 letters" }),

	cep: z
		.string()
		.regex(/^\d{8}$/, { message: "CEP must contain exactly 8 numbers" })
		.transform((val) => Number.parseInt(val, 10)),

	street: z.string().optional(),
	neighborhood: z.string().optional(),
	city: z.string().optional(),
	state: z.string().optional(),
});
