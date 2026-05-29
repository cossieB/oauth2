import { useRequestContext } from "hono/jsx-renderer";
import { Form } from "../components/Form";
import { FormInput } from "../components/FormInput";
import type { MyEnv } from "../../utils/types";

export function ProfilePage() {
    const c = useRequestContext<MyEnv>()
    const {name, surname, image} = c.var.user!

    return (
        <div class="w-full mx-auto">
            <h1 class="text-2xl text-center">Profile</h1>
            <Form action="/profile" id="profile-form">
                <div class="flex gap-2">
                    <FormInput
                        id="name"
                        value={name}
                        
                    />
                    <FormInput
                        id="surname"
                        value={surname}
                    />
                </div>
                <FormInput
                    id="image"
                    type="file"
                    accept="image/*"
                />
                {image && (
                    <img src={c.env.STORAGE_DOMAIN + image} class="h-10 w-10 object-cover" alt="" />
                )}
            </Form>
            <pre></pre>
        </div>
    )
}