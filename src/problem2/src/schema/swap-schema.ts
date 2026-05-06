import { z } from 'zod';

export const swapSchema = z.object({
  fromAmount: z
    .string()
    .min(1, 'Enter an amount')
    .refine(
      (input) => !isNaN(Number(input)) && Number(input) > 0,
      { message: 'Amount must be greater than zero' },
    ),
  toAmount: z.string(),
});

export type SwapFormValues = z.infer<typeof swapSchema>;
