import { Form } from "../components/Form";
import { FormInput } from "../components/FormInput";

export function AddApplication() {

    return (
        <div>
            <h1>Create OAuth Application</h1>
            <Form action="/applications"method="post" id="add-app-form">
                <FormInput
                    id="name"
                    required
                    maxLength={50}
                />
                <FormInput
                    id="redirectUri"
                    required     
                    type="url"               
                />
                <FormInput
                    id="logo"
                    type="file"
                    accept="image/*"
                />
                <FormInput
                    id="homepage"
                />
                <FormInput
                    id="privacyPolicyLink"
                />
                <FormInput
                    id="tosLink"
                />
            </Form>
            <pre id="crete-app-errors"></pre>
        </div>
    )
}