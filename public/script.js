function submitForm(hasBinaryData = false) {
    /**@param {SubmitEvent} e */
    return async e => {
        e.preventDefault();
        const submitBtn = e.currentTarget.querySelector("button")
        submitBtn.disabled = true;
        const fd = new FormData(e.currentTarget);
        const body = hasBinaryData ? fd : new URLSearchParams(fd)
        const res = await fetch(e.currentTarget.action, {
            method: "POST",
            body
        })
        submitBtn.disabled = false;
        if (res.ok && !hasBinaryData) return location.replace("/");
        const errorsDiv = document.querySelector("pre")
        if (res.headers.get("Content-Type") == "application/json") {
            const data = await res.json();
            errorsDiv.textContent = JSON.stringify(data.errors, null, 4);
            return;
        }
        errorsDiv.textContent = "Something went wrong. Please try again later"
    }
}

/**
 * @type {HTMLFormElement | null}
 */

document.getElementById("signup-form")?.addEventListener("submit", submitForm())
document.getElementById("signin-form")?.addEventListener("submit", submitForm())
document.getElementById("profile-form")?.addEventListener("submit", submitForm(true))

const authLink = document.querySelectorAll("small>a").forEach(link => {
    link.addEventListener("click", e => {
        e.preventDefault();
        location.replace(link.href)
    })
})
