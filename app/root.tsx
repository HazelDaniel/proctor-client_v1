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
    rel: "icon",
    type: "icon/svg",
    href: "logo.svg",
  },
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
          <symbol id="analytics"></symbol>

          <symbol id="gear">
            <svg
              viewBox="0 0 29 29"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M13.6706 1.25714C12.903 1.25714 12.2377 1.78853 12.068 2.53714L11.6077 4.56746C10.8749 4.78055 10.1759 5.07236 9.52055 5.43294L7.75927 4.32266C7.10992 3.91332 6.2637 4.00804 5.72092 4.55082L4.54915 5.7226C4.00637 6.26537 3.91165 7.1116 4.32099 7.76094L5.43166 9.52286C5.0714 10.1781 4.77985 10.8768 4.56697 11.6093L2.53683 12.0696C1.78823 12.2393 1.25684 12.9046 1.25684 13.6722V15.3294C1.25684 16.097 1.78823 16.7623 2.53683 16.932L4.5672 17.3923C4.78021 18.125 5.07192 18.824 5.43238 19.4793L4.3219 21.2409C3.91256 21.8903 4.00728 22.7365 4.55006 23.2793L5.72183 24.451C6.26461 24.9938 7.11083 25.0885 7.76018 24.6792L9.52191 23.5686C10.1769 23.9289 10.8754 24.2204 11.6077 24.4334L12.068 26.4637C12.2377 27.2123 12.903 27.7437 13.6706 27.7437H15.3278C16.0954 27.7437 16.7607 27.2123 16.9304 26.4637L17.3906 24.4341C18.1234 24.2212 18.8225 23.9295 19.478 23.5691L21.2396 24.6796C21.889 25.0889 22.7352 24.9942 23.278 24.4514L24.4498 23.2797C24.9925 22.7369 25.0873 21.8907 24.6779 21.2413L23.5678 19.4803C23.9286 18.8246 24.2205 18.1253 24.4336 17.3922L26.4634 16.932C27.212 16.7623 27.7434 16.097 27.7434 15.3294V13.6722C27.7434 12.9046 27.212 12.2393 26.4634 12.0696L24.4339 11.6094C24.2209 10.8765 23.9291 10.1774 23.5686 9.52182L24.6788 7.76055C25.0882 7.1112 24.9934 6.26498 24.4507 5.7222L23.2789 4.55043C22.7361 4.00765 21.8899 3.91293 21.2405 4.32227L19.4794 5.43247C18.8235 5.07169 18.1239 4.77977 17.3905 4.56671L16.9304 2.53714C16.7607 1.78853 16.0954 1.25714 15.3278 1.25714H13.6706ZM9.51315 7.37087C10.5314 6.65723 11.7096 6.15621 12.9833 5.93223L13.6706 2.90047H15.3278L16.015 5.93179C17.2893 6.15549 18.4681 6.65652 19.4869 7.37034L22.1169 5.71244L23.2887 6.88421L21.6307 9.51428C22.3443 10.5328 22.8451 11.7112 23.0689 12.985L26.1001 13.6722V15.3294L23.0687 16.0166C22.8448 17.2906 22.3437 18.4692 21.6299 19.4877L23.2877 22.1176L22.116 23.2894L19.4857 21.6313C18.4672 22.3447 17.2888 22.8454 16.015 23.069L15.3278 26.1004H13.6706L12.9833 23.0686C11.7101 22.8447 10.5324 22.344 9.51436 21.6308L6.88384 23.289L5.71207 22.1172L7.37025 19.4868C6.65678 18.4685 6.15591 17.2903 5.93207 16.0167L2.90017 15.3294V13.6722L5.93193 12.9849C6.15562 11.7115 6.65625 10.5334 7.36943 9.5152L5.71116 6.88461L6.88293 5.71283L9.51315 7.37087ZM17.4484 14.5002C17.4484 16.1284 16.1284 17.4483 14.5002 17.4483C12.872 17.4483 11.552 16.1284 11.552 14.5002C11.552 12.8719 12.872 11.552 14.5002 11.552C16.1284 11.552 17.4484 12.8719 17.4484 14.5002ZM19.1884 14.5002C19.1884 17.0894 17.0894 19.1883 14.5002 19.1883C11.911 19.1883 9.81205 17.0894 9.81205 14.5002C9.81205 11.911 11.911 9.812 14.5002 9.812C17.0894 9.812 19.1884 11.911 19.1884 14.5002Z"
                fill="#09090B"
              />
            </svg>
          </symbol>

          <symbol id="double-caret">
            <svg
              viewBox="0 0 7 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M0.131802 3.13188C-0.043934 3.30762 -0.043934 3.59254 0.131802 3.76828C0.307538 3.94401 0.592462 3.94401 0.768198 3.76828L3.45008 1.0864L6.13196 3.76828C6.3077 3.94401 6.59262 3.94401 6.76836 3.76828C6.94409 3.59254 6.94409 3.30762 6.76836 3.13188L3.76828 0.131802C3.68389 0.0474105 3.56943 0 3.45008 0C3.33073 1.49012e-08 3.21627 0.0474105 3.13188 0.131802L0.131802 3.13188ZM6.76836 8.43507C6.94409 8.25933 6.94409 7.97441 6.76836 7.79867C6.59262 7.62293 6.3077 7.62293 6.13196 7.79867L3.45008 10.4806L0.768199 7.79867C0.592463 7.62293 0.307539 7.62293 0.131803 7.79867C-0.0439329 7.97441 -0.0439329 8.25933 0.131803 8.43507L3.13188 11.4351C3.30762 11.6109 3.59254 11.6109 3.76828 11.4351L6.76836 8.43507Z"
                fill="#71717A"
              />
            </svg>
          </symbol>

          <symbol id="search">
            <svg
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10.2617 10.2799L12.3151 12.3334M11.7225 6.72076C11.7225 9.51204 9.46735 11.7748 6.68547 11.7748C3.9036 11.7748 1.64844 9.51204 1.64844 6.72076C1.64844 3.92947 3.9036 1.66669 6.68547 1.66669C9.46735 1.66669 11.7225 3.92947 11.7225 6.72076Z"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                className="stroke-outline1"
              />
            </svg>
          </symbol>

          <symbol id="send"></symbol>

          <symbol id="link"></symbol>

          <symbol id="delete"></symbol>

          <symbol id="add"></symbol>

          <symbol id="arrow-left"></symbol>

          <symbol id="cancel"></symbol>

          <symbol id="course"></symbol>

          <symbol id="flag"></symbol>

          <symbol id="levels"></symbol>

          <symbol id="clock"></symbol>

          <symbol id="login"></symbol>

          <symbol id="return-back"></symbol>

          <symbol id="star-stroked"></symbol>

          <symbol id="caret-right"></symbol>

          <symbol id="dashboard"></symbol>

          <symbol id="github"></symbol>

          <symbol id="info"></symbol>

          <symbol id="logout"></symbol>

          <symbol id="search"></symbol>

          <symbol id="video"></symbol>

          <symbol id="caret-up"></symbol>

          <symbol id="file"></symbol>

          <symbol id="google"></symbol>

          <symbol id="meta"></symbol>

          <symbol id="share"></symbol>

          <symbol id="bell">
            <svg
              viewBox="0 0 35 35"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.6045 26.7861C13.5214 29.0511 14.6875 30.625 17.5003 30.625C20.313 30.625 21.4791 29.0511 22.396 26.7861"
                stroke="#020617"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M27.4619 14.9568C27.4619 9.55883 23.8735 4.375 17.5261 4.375C11.1787 4.375 7.59031 9.55883 7.59031 14.9568C7.59031 17.1465 6.14977 18.8277 4.93967 20.5842C-0.500091 29.2922 35.2828 28.901 30.1125 20.5842C28.9024 18.8277 27.4619 17.1465 27.4619 14.9568Z"
                stroke="#020617"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </symbol>

          <symbol id="check"></symbol>

          <symbol id="filter"></symbol>

          <symbol id="linkedin"></symbol>

          <symbol id="profile"></symbol>

          <symbol id="star-filled"></symbol>
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
