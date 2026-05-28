import type { JSX } from "hono/jsx/jsx-runtime";
import "hono"

declare module 'hono' {

  export interface ContextRenderer {
    (
      content: string | Promise<string>,
      props: { title: string }
    ): Response
  }
}
