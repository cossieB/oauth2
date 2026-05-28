import type { PropsWithChildren } from "hono/jsx";

type Props = {
    action: string
    method?: "get" | "post" 
    id: string
}

export function Form({action, method = "post", children, id}: PropsWithChildren<Props>) {
    return (
        <form id={id} class="flex flex-col gap-1 bg-slate-700 p-2" action={action} method={method}>
            {children}
            <button class="py-1 px-2 bg-amber-800 justify-self-center mt-1 disabled:bg-gray-400" type="submit">Submit</button>
        </form>
    )
}