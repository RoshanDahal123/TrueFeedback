import { z } from "zod";

export const accepaMessageSchema = z.object({
  acceptMessages: z.boolean(),
});
