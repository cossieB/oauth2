import type { Client } from "../../utils/models"
import { A } from "../components/A"

type Props = Client & {
    owner: {
        email: string,
        username: string,
        image?: string | null
    }
    user: {
        email: string,
        username: string
    }
}

export function Consent({ scopes, owner, user, ...client }: { scopes: string[] } & Props) {
    return (
        <div>

            <img class="h-36 w-36 mx-auto" src={client.logo ?? undefined} alt="" />
            <h1 class="font-bold text-2xl text-center">Authorize {client.name} </h1>
            <div class="flex gap-2">
                <img class="row-start-1 col-start-1 row-span-2 col-span-1 h-20" src={owner.image ?? undefined} alt="" />
                <div class="flex flex-col justify-center">
                    <span class=""> {owner.username} </span>
                    <span class="text-gray-500"> {owner.email} </span>
                </div>
            </div>
            <div class="text-center font-medium">
                {scopes.length == 0 ?
                "This 3rd-party application would like to confirm that you have account with us" :
                "This 3rd-party application is requesting access to:"    
            }
            </div>
            <div>
                {scopes.includes("openid") &&
                    <Permissions
                        heading="User ID"
                        detail="Your user ID"
                    />}
                {scopes.includes("email") &&
                    <Permissions
                        heading="Email"
                        detail="Your email address and its verification status"
                    />}
                {scopes.includes("profile") &&
                    <Permissions
                        heading="Profile Information"
                        detail="Your public name, surname and picture"
                    />}
                {scopes.includes("offline_access") &&
                    <Permissions
                        heading="Offline Access"
                        detail={`${client.name} will securely remember your connection so you don't have to log in every time you open the app. This also lets us sync your data and updates in the background even when the app is closed`}
                    />}
            </div>
            <div class={"bg-slate-800 my-5 py-2 px-1 block"}>You are logged in as {user.email} ({user.username})</div>
            <div class="flex gap-5 justify-center">
                <button id="approval-btn" class="bg-neutral-900 p-1" href="/authorize/approve">Approve</button>
                <A class="bg-neutral-900 p-1" href={client.redirectUri + "?error=access_denied&error_description=User%20denied%20the%20request"}>Deny</A>
            </div>
        </div>
    )
}

type P = {
    heading: string,
    detail: string
}

function Permissions({ heading, detail }: P) {
    return (
        <div class="mx-auto">
            <h2 class="font-bold text-lg"> {heading} </h2>
            <div class="block w-full">
                {detail}
            </div>
        </div>
    )
}