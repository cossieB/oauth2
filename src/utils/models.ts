import type { InferSelectModel } from "drizzle-orm";
import type { clients, users } from "../drizzle/schema";

export type User = InferSelectModel<typeof users>
export type Application = InferSelectModel<typeof clients>