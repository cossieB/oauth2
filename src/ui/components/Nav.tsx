import { useRequestContext } from "hono/jsx-renderer"
import { type MyEnv } from "../../utils/types"
import { A } from "./A"

export function Nav() {
    const c = useRequestContext<MyEnv>()
    return (
        <ul class="flex justify-center gap-5">
            {c.var.user ? (
                <>
                    <NavLink
                        href="/profile"
                        label="Profile"
                    />
                    <NavLink
                        href="/applications/owned"
                        label="Your Apps"
                    />
                    <NavLink
                        href="/applications/approved"
                        label="Approved Apps"
                    />
                </>
            ) : (
                <>
                    <NavLink
                        href="/signin"
                        label="Sign In"
                    />
                    <NavLink
                        href="/signup"
                        label="Sign Up"
                    />
                </>
            )}
        </ul>
    )
}

function NavLink({ href, label }: { href: string, label: string }) {
    
    return (
        <li>
            <A href={href}> {label} </A>
        </li>
    )
}