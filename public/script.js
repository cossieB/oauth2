/**@param {SubmitEvent} e */
const handleSubmit = async e => {
    e.preventDefault();
    const submitBtn = e.currentTarget.querySelector("button")
    submitBtn.disabled = true;
    const fd = new FormData(e.currentTarget)
    const res = await fetch(e.currentTarget.action, {
        method: "POST",
        body: new URLSearchParams(fd)
    })
    submitBtn.disabled = false;
    if (res.ok) return location.replace("/");
    const errorsDiv = document.querySelector("pre")
    if (res.headers.get("Content-Type") == "application/json") {
        const data = await res.json();
        errorsDiv.textContent = JSON.stringify(data.errors, null, 4);
        return;
    }    
    errorsDiv.textContent = "Something went wrong. Please try again later"    
}

/**
 * @type {HTMLFormElement | null}
 */

const signupForm = document.getElementById("signup-form")
const signinForm = document.getElementById("signin-form")
signupForm?.addEventListener("submit", handleSubmit)
signinForm?.addEventListener("submit", handleSubmit)

const authLink = document.querySelectorAll("small>a").forEach(link => {
    link.addEventListener("click", e => {
        e.preventDefault();
        location.replace(link.href)
    })
})
