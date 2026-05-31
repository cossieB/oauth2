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
                >
                    <img src={app.logo ?? "/favicon.ico"} alt="" />
                    <span> {app.name} </span>
                    <span> {app.homepage} </span>
                    <a href={`/applications/${app.clientId}`}>Edit</a>
                </div>
            )}
        </div>
    )
}

