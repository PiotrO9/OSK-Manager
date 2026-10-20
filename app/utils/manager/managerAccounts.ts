import { z } from 'zod';
import type {
    ManagerAccount,
    ManagerAccountsPage,
} from '~/types/manager/account';

const summarySchema = z.object({
    id: z.string().uuid(),
    role: z.enum(['STUDENT', 'INSTRUCTOR']),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    isActive: z.boolean(),
    deletedAt: z.string().datetime().nullable(),
});
const pageSchema = z
    .object({
        items: z.array(summarySchema),
        total: z.number().int().nonnegative(),
        page: z.number().int().min(1).max(1_000_000),
        limit: z.number().int().min(1).max(100),
    })
    .refine(
        (page) =>
            page.items.length <= page.limit && page.items.length <= page.total,
    );
const detailSchema = summarySchema.extend({
    schoolId: z.string().uuid(),
    phone: z.string().nullable(),
    studentProfile: z.object({ id: z.string().uuid() }).nullable().optional(),
    instructorProfile: z
        .object({ id: z.string().uuid() })
        .nullable()
        .optional(),
    accountActionsFor: z.array(z.object({ status: z.string() })).optional(),
});

export function parseManagerAccountsPage(value: unknown): ManagerAccountsPage {
    const result = pageSchema.safeParse(value);

    if (!result.success) throw new Error('Nieprawidłowa odpowiedź listy kont.');

    return result.data;
}

export function parseManagerAccount(value: unknown): ManagerAccount {
    const result = detailSchema.safeParse(value);

    if (!result.success)
        throw new Error('Nieprawidłowa odpowiedź szczegółów konta.');

    return result.data;
}
