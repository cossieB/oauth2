import type { InferSelectModel } from "drizzle-orm";
import type { users } from "./drizzle/schema";

export type User = InferSelectModel<typeof users>