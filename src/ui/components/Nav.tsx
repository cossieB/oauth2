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
                        className="auth-link"
                    />
                    <NavLink
                        href="/signup"
                        label="Sign Up"
                        className="auth-link"
                    />
                </>
            )}
        </ul>
    )
}

function NavLink({ href, label, className }: { href: string, label: string, className?: string }) {
    
    return (
        <li>
            <A href={href} class={className}> {label} </A>
        </li>
    )
}