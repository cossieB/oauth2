import { Form } from "../components/Form";
import { FormInput } from "../components/FormInput";

export function SigninPage() {
    return (
        <div class="w-full mx-auto">
            <h1 class="text-2xl text-center">Log In</h1>
            <Form action="/signin" id="signin-form">
                <FormInput
                    id="identifier"
                    label="Email or Username"
                    required
                />
                <FormInput
                    id="password"
                    required
                    type="password"
                />
            </Form>
            <small class="block text-center">
                <a class="auth-link" href="/signup" >
                    Make an account
                </a>
            </small>
            <pre id="signin-errors"></pre>
        </div>
    )
}