import z from 'zod';
import type { $ZodError } from 'zod/v4/core';
import type { Context } from 'hono';

export function validatorHook(res: Param, c: Context) {
    if (res.success == false) return c.json({errors: z.flattenError(res.error)}, 400)
}

type Param = ({
    success: true;
    data: unknown;
} | {
    success: false;
    error: $ZodError;
    data: unknown;
})