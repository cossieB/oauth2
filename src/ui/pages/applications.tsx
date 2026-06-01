import type { Application } from "../../utils/models"
import { A } from "../components/A"

type Props = {
    apps: Application[]
}

export function YourApplications({ apps }: Props) {
    return (
        <div>  
            <A href="/applications/create" >Create New OAuth Application</A>
            {apps.map(app =>
                <div
                    key={app.clientId}
                    class="grid grid-cols-[auto_1fr_auto_auto] w-full py-1"
                >
                    <img class="row-span-2" src={app.logo ?? "/favicon.ico"} alt="" />
                    <span class="col-span-1 font-bold"> {app.name} </span>
                    <span class="col-span-1"> {app.clientId} </span>
                    <button data-client-id={app.clientId} data-client-name={app.name} class="row-start-1 row-end-3 col-start-3 col-end-4 place-self-center text-red-600 p-1 client-delete-btns">Delete</button>
                    <A class="row-start-1 row-end-3 col-start-4 col-end-5 place-self-center pl-2" href={`/applications/${app.clientId}`}>Edit</A>
                </div>
            )}
        </div>
    )
}

