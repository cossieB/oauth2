import { Form } from "../components/Form"
import { FormInput } from "../components/FormInput"

export function Signup() {
    return (
        <div class="w-full mx-auto">
            <h1 class="text-2xl text-center">Register</h1>
            <Form id="signup-form" action="/signup" method="post">
                <FormInput
                    id="username"
                    required
                    minLength={3}
                    maxLength={15}
                />
                <FormInput
                    id="email"
                    type="email"
                    required
                />
                <FormInput
                    id="password"
                    type="password"
                    required
                />
                <FormInput
                    id="confirmPassword"
                    type="password"
                    required
                />
            </Form>
            <small class="block text-center">
                <a href="/signin">
                    Already have an account?
                </a>
            </small>
            <pre id="signup-errors"></pre>
        </div>
    )
}

