import { Style } from "hono/css";
import type { Child } from "hono/jsx";
import type { JSX } from "hono/jsx/jsx-runtime";
import { Nav } from "./Nav";

type Props = {
    children: Child;
    title?: string;
};

function Document({ children, title }: Props) {
    return (
        <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link rel="stylesheet" href="/reset.css" />
                <link rel="stylesheet" href="/style.css" />
                <script type="module" src="/script.js"></script>
                <title> {title} </title>
            </head>
            <body>
                <Style  />
                {children}
            </body>
        </html>
    )
}

export function Layout({ children, title = "OAuth2.0" }: Props) {
    return (
        <Document title={title}>
            <Nav />
            <main class="w-[min(90%,800px)] mx-auto">
                {children}
            </main>
        </Document>
    )
}

