import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";

import "./tailwind.css";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  {
    rel:"icon",
    type: "icon/svg",
    href: "logo.svg"
  }
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <svg style={{ display: "none" }} className="svg-sprite">
          <symbol id="analytics">
          </symbol>

          <symbol id="edit">
          </symbol>

          <symbol id="archive">
          </symbol>

          <symbol id="trash">
          </symbol>

          <symbol id="send">
          </symbol>

          <symbol id="link">
          </symbol>

          <symbol id="delete">
          </symbol>

          <symbol id="add">
          </symbol>

          <symbol id="arrow-left">
          </symbol>

          <symbol id="cancel">
          </symbol>

          <symbol id="course">
          </symbol>

          <symbol id="flag">
          </symbol>

          <symbol id="levels">
          </symbol>

          <symbol id="clock">
          </symbol>

          <symbol id="login">
          </symbol>

          <symbol id="return-back">
          </symbol>

          <symbol id="star-stroked">
          </symbol>

          <symbol id="caret-right">
          </symbol>

          <symbol id="dashboard">
          </symbol>

          <symbol id="github">
          </symbol>

          <symbol id="info">
          </symbol>

          <symbol id="logout">
          </symbol>

          <symbol id="search">
          </symbol>

          <symbol id="video">
          </symbol>

          <symbol id="caret-up">
          </symbol>

          <symbol id="file">
          </symbol>

          <symbol id="google">
          </symbol>

          <symbol id="meta">
          </symbol>

          <symbol id="share">
          </symbol>

          <symbol id="bell">
            <svg viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.6045 26.7861C13.5214 29.0511 14.6875 30.625 17.5003 30.625C20.313 30.625 21.4791 29.0511 22.396 26.7861" stroke="#020617" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M27.4619 14.9568C27.4619 9.55883 23.8735 4.375 17.5261 4.375C11.1787 4.375 7.59031 9.55883 7.59031 14.9568C7.59031 17.1465 6.14977 18.8277 4.93967 20.5842C-0.500091 29.2922 35.2828 28.901 30.1125 20.5842C28.9024 18.8277 27.4619 17.1465 27.4619 14.9568Z" stroke="#020617" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </symbol>

          <symbol id="check">
          </symbol>

          <symbol id="filter">
          </symbol>

          <symbol id="linkedin">
          </symbol>

          <symbol id="profile">
          </symbol>

          <symbol id="star-filled">
          </symbol>
        </svg>

        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
