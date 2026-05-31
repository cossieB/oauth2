import titleCase from "../../utils/titleCase"

type Props = {
    label?: string
    id: string,
    type?: string
} & Record<string, unknown>

export function FormInput({ label, id, type = "text", ...rest }: Props) {
    return (
        <div class="flex flex-col flex-1">
            <label htmlFor={id}> {label ?? titleCase(id)}{rest.required && "*"} </label>
            <input {...rest} class="bg-gray-500 w-full" id={id} type={type} name={id}  />
        </div>
    )
}