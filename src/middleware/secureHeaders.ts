import { secureHeaders } from "hono/secure-headers";

export const helmet = secureHeaders({
    xFrameOptions: false,
    xXssProtection: false,
    contentSecurityPolicy: {
        upgradeInsecureRequests: [],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        defaultSrc: ["'self'"],
        mediaSrc: ["'self'", "https://*.cossie.dev"],
        imgSrc: ["'self'", "https://*.cossie.dev"],
    },
    referrerPolicy: "strict-origin-when-cross-origin",
    crossOriginOpenerPolicy: "same-origin",
})