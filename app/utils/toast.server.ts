import { createCookieSessionStorage } from "@remix-run/node";

const toastSessionStorage = createCookieSessionStorage({
  cookie: {
    name: "toast_session",
    sameSite: "lax",
    path: "/",
    httpOnly: false,
    secrets: ["my-super-secret-toast-key"], // In production, use an environment variable
    secure: process.env.NODE_ENV === "production",
  },
});

export const { getSession, commitSession, destroySession } = toastSessionStorage;

export type ToastMessage = {
  message: string;
  type?: "success" | "error" | "info" | "warning";
};

export async function setToastMessage(request: Request, toastMessage: ToastMessage) {
  const session = await getSession(request.headers.get("Cookie"));
  session.flash("toast", toastMessage);
  return commitSession(session);
}

export async function getToastSession(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  const toast = session.get("toast") as ToastMessage | undefined;
  
  return {
    toast,
    headers: toast
      ? new Headers({ "Set-Cookie": await commitSession(session) })
      : null,
  };
}
