import { useRequestContext } from "hono/jsx-renderer"
import { type MyEnv } from "../../utils/types"

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
                        href="/my-apps"
                        label="Your Apps"
                    />
                    <NavLink
                        href="/approved-apps"
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
    const c = useRequestContext<MyEnv>()
    const pathMatches = c.req.path === href
    return (
        <li>
            <a class={`hover:underline underline-offset-2 ${pathMatches ? "text-orange-600" : ""}`} href={href}> {label} </a>
        </li>
    )
}