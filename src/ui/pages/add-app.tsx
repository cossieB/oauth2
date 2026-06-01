import type { Application } from "../../utils/models";
import { Form } from "../components/Form";
import { FormInput } from "../components/FormInput";

export function AddApplication({app}: {app?: Application}) {

    return (
        <div>
            <h1 class="font-bold">{app ? "Edit" : "Create"} OAuth Application</h1>
            <Form action={"/applications/" + (app?.clientId ?? "")} method="post" id="add-app-form">
                {app && 
                    <FormInput
                        id="clientId"
                        class="bg-zinc-800!"
                        value={app.clientId}
                        readonly
                        disabled
                    />
                }            
                <FormInput
                    id="name"
                    required
                    value={app?.name}
                    maxLength={50}
                />
                <FormInput
                    id="redirectUri"
                    required     
                    value={app?.redirectUri}
                    type="url"         
                    pattern="(^https:\/\/.+|http:\/\/localhost.+)"      
                />
                <FormInput
                    id="logo"
                    type="file"
                    accept="image/*"
                    value={app?.logo}
                />
                <FormInput
                    id="homepage"
                    value={app?.homepage}
                />
                <FormInput
                    id="privacyPolicyLink"
                    value={app?.privacyPolicyLink}
                />
                <FormInput
                    id="tosLink"
                    value={app?.tosLink}
                />

            </Form>
            <pre id="crete-app-errors"></pre>
        </div>
    )
}