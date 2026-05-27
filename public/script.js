/**
 * @type HTMLFormElement | null
 */
const signupForm = document.getElementById("signup-form")
const signupErrorsDiv = document.getElementById("signup-errors")
signupForm?.addEventListener("submit", async e => {
    e.preventDefault();
    const submitBtn = signupForm.querySelector("button")
    submitBtn.disabled = true;
    const fd = new FormData(signupForm)
    const res = await fetch("/signup", {
        method: "POST",
        body: new URLSearchParams(fd)
    })
    submitBtn.disabled = false;
    if (!res.ok && res.headers.get("Content-Type") == "application/json") {
        const data = await res.json();
        signupErrorsDiv.textContent = JSON.stringify(data.errors, null, 4)

    }
})