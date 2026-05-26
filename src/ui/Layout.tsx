import type { JSX } from "hono/jsx/jsx-runtime";

type Props = {
    children: JSX.ElementChildrenAttribute;
    title?: string;
};

function Document({children, title}: Props) {
    return (
        <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link rel="stylesheet" href="/reset.css" />
                <link rel="stylesheet" href="/style.css" />
                <title> {title} </title>
            </head>
            <body>
                {children}
            </body>
        </html>
    )
}

export function Layout({children, title = "OAuth2.0"}: Props) {
    return (
        <Document title={title}>
            {children}
        </Document>
    )
}