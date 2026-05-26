import type { JSX } from "hono/jsx/jsx-runtime";
import "hono"

declare module 'hono' {
  export interface ContextRenderer {
    (
      content: JSX.Element | Promise<JSX.Element>,
      head: { title: string }
    ): Response | Promise<Response>
  }
}