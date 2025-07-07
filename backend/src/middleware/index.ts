import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const validate = (schema: z.ZodTypeAny) =>
    (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req);
        if (!result.success) {
            res.status(400).json({
                errors: result.error.format(),
            });
            return
        }
        next();
    };


