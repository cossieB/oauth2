import { useRequestContext } from "hono/jsx-renderer"
import { type getConsentedApps } from "../../repositories/consentRepository"
import type { MyEnv } from "../../utils/types"

type Props = {
    consent: Awaited<ReturnType<typeof getConsentedApps>>
}

export function ApprovedApps({ consent }: Props) {
    return (
        <div>
            {consent.length == 0 ? <span>You haven't approved any app yet.</span> : ""}
            {consent.map(c => <App app={c} key={c.clients.clientId} /> )}
        </div>
    )
}

function App({ app }: { app: Props['consent'][number] }) {
    const c = useRequestContext<MyEnv>()
    const imgSrc = app.clients.logo ? `${c.env.STORAGE_DOMAIN}/${app.clients.logo}` : "/q.png"    
    return (
        <div
            key={app.clients.clientId}
            class="grid grid-rows-[2rem_2rem] grid-cols-[auto_1fr_auto] w-full py-1"
        >
            <img class="row-span-2 h-full" src={imgSrc} alt="" />
            <span class="col-span-1 font-bold self-end"> {app.clients.name} </span>
            <span class="col-span-1"> {app.clients.clientId} </span>
            <button data-client-id={app.clients.clientId} data-client-name={app.clients.name} class="row-start-1 row-end-3 col-start-3 col-end-4 place-self-center text-red-600 p-1 client-revoke-btns">Revoke</button>
        </div>
    )
}