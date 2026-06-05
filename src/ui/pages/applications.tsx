import { useRequestContext } from "hono/jsx-renderer"
import type { Application } from "../../utils/models"
import type { MyEnv } from "../../utils/types"
import { A } from "../components/A"

type Props = {
    apps: Application[]
}

export function YourApplications({ apps }: Props) {
    return (
        <div>
            <A href="/applications/create" >Create New OAuth Application</A>
            {apps.map(app => <App key={app.clientId} app={app} />)}
        </div>
    )
}

function App({ app }: { app: Props['apps'][number] }) {
    const c = useRequestContext<MyEnv>()
    const imgSrc = app.logo ? `${c.env.STORAGE_DOMAIN}/${app.logo}` : "/q.png"

    return (
        <div
            key={app.clientId}
            class="grid grid-rows-[2rem_2rem] grid-cols-[auto_1fr_auto_auto] w-full py-1"
        >
            <img class="row-span-2 h-full" src={imgSrc} alt="" />
            <span class="col-span-1 font-bold self-end"> {app.name} </span>
            <span class="col-span-1"> {app.clientId} </span>
            <button data-client-id={app.clientId} data-client-name={app.name} class="row-start-1 row-end-3 col-start-3 col-end-4 place-self-center text-red-600 p-1 client-delete-btns">Delete</button>
            <A class="row-start-1 row-end-3 col-start-4 col-end-5 place-self-center pl-2" href={`/applications/${app.clientId}`}>Edit</A>
        </div>
    )
}