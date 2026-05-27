import titleCase from "../../utils/titleCase"

export function Signup() {
    return (
        <div class="w-full mx-auto">
            <h1 class="text-2xl text-center">Register</h1>
            <form id="signup-form" class="flex flex-col gap-1" action="/signup" method="post">
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
                <button class="py-1 px-2 bg-amber-800 justify-self-center mt-1 disabled:bg-gray-400" type="submit">Submit</button>
            </form>
            <pre id="signup-errors"></pre>
        </div>
    )
}

type Props = {
    label?: string
    id: string,
    type?: string
} & Record<string, unknown>

function FormInput({ label, id, type = "text", ...rest }: Props) {
    return (
        <div class="flex flex-col flex-1">
            <label htmlFor={id}> {label ?? titleCase(id)} </label>
            <input {...rest} class="bg-gray-500 w-full" id={id} type={type} name={id}  />
        </div>
    )
}