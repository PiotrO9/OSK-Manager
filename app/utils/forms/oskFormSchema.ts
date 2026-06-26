import { z } from 'zod';

export const oskFormSchema = z.object({
    name: z.string().trim().min(1, 'Nazwa jest wymagana'),
    city: z.string().trim().optional(),
    address: z.string().trim().optional(),
});

export type OskFormValues = z.infer<typeof oskFormSchema>;
