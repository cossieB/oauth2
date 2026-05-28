import type { ContentfulStatusCode } from "hono/utils/http-status";

export class AppError extends Error {
    constructor(public readonly message: string, public readonly status?: ContentfulStatusCode) {
        super(message);
        this.name = "AppError"
    }
}