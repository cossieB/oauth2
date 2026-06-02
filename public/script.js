function submitForm(hasBinaryData = false) {
    /**@param {SubmitEvent} e */
    return async e => {
        e.preventDefault();
        const submitBtn = e.currentTarget.querySelector("button")
        submitBtn.disabled = true;
        const fd = new FormData(e.currentTarget);
        const body = hasBinaryData ? fd : new URLSearchParams(fd);
        const url = new URL(e.currentTarget.action)
        url.search = location.search

        const res = await fetch(url, {
            method: "POST",
            body,
        })
        submitBtn.disabled = false;
        if (res.ok) {
            const data = await res.json();
            return location.replace((data.navigateTo ?? "/profile") + location.search)
        }
        const errorsDiv = document.querySelector("pre")
        if (res.headers.get("Content-Type") == "application/json") {
            const data = await res.json();
            errorsDiv.textContent = JSON.stringify(data.errors, null, 4);
            return;
        }
        errorsDiv.textContent = "Something went wrong. Please try again later"
    }
}

document.getElementById("signup-form")?.addEventListener("submit", submitForm())
document.getElementById("signin-form")?.addEventListener("submit", submitForm())
document.getElementById("profile-form")?.addEventListener("submit", submitForm(true))
document.getElementById("add-app-form")?.addEventListener("submit", submitForm(true))

const authLink = document.querySelectorAll("small>a").forEach(link => {
    link.addEventListener("click", e => {
        e.preventDefault();
        const url = new URL(link.href, location.origin)
        url.search = location.search
        location.replace(url)
    })
})

document.querySelectorAll(".client-delete-btns").forEach(btn => {
    btn.addEventListener("click", async e => {
        const {clientName, clientId} = e.currentTarget.dataset
        const confirmed = confirm(`Are you sure you want to delete ${clientName} and all related data?`)
        if (!confirmed) return;
        const res = await fetch(`/applications/${clientId}`, {
            method: "DELETE"
        })
        const text = await res.text();
        if (res.ok) return location.reload()
        alert(text)
    })
})

document.getElementById("approval-btn")?.addEventListener("click", async e => {
    e.preventDefault();
    const res = await fetch("/authorize/approve", {
        method: "POST"
    })
    if (res.ok) location.reload()
})