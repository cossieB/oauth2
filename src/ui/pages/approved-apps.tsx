import { type getConsentedApps } from "../../repositories/consentRepository"
import { A } from "../components/A"

type Props = {
    consent: Awaited<ReturnType<typeof getConsentedApps>>
}

export function ApprovedApps({ consent }: Props) {
    return (
        <div>  
            {consent.length == 0 ? <span>You haven't approved any app yet.</span> : ""}
            {consent.map(c =>
                <div
                    key={c.clients.clientId}
                    class="grid grid-cols-[auto_1fr_auto] w-full py-1"
                >
                    <img class="row-span-2" src={c.clients.logo ?? "/favicon.ico"} alt="" />
                    <span class="col-span-1 font-bold"> {c.clients.name} </span>
                    <span class="col-span-1"> {c.clients.clientId} </span>
                    <button data-client-id={c.clients.clientId} data-client-name={c.clients.name} class="row-start-1 row-end-3 col-start-3 col-end-4 place-self-center text-red-600 p-1 client-revoke-btns">Revoke</button>
                </div>
            )}
        </div>
    )
}