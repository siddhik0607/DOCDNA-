import { z } from "zod";

export const historyQuerySchema = z.object({
  page: z.coerce.number().min(1).optional(),
  pageSize: z.coerce.number().min(1).max(100).optional(),
  search: z.string().optional(),
  eventType: z.string().optional(),
  sort: z.enum(["asc", "desc"]).optional(),
});
