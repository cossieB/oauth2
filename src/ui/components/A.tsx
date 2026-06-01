import { useRequestContext } from "hono/jsx-renderer"
import type { MyEnv } from "../../utils/types"
import type { PropsWithChildren } from "hono/jsx"

type Props = {
    href: string
    class?: string
} & Record<string, unknown>

export function A(props: PropsWithChildren<Props>) {
    const c = useRequestContext<MyEnv>()
    const pathMatches = c.req.path === props.href    
    return <a {...props} class={(props.class ?? "") + ` hover:underline underline-offset-2 ${pathMatches ? "text-orange-600" : ""}`}> {props.children} </a>
}