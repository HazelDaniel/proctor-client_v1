import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { API_BASE_URL } from "~/utils/config";

export const action = async ({ request }: ActionFunctionArgs) => {
  return proxyRequest(request);
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return proxyRequest(request);
};

async function proxyRequest(request: Request) {
  const url = new URL(request.url);
  const targetUrl = `${API_BASE_URL}/graphql${url.search}`;

  const headers = new Headers(request.headers);
  // Remove host and connection headers to avoid fetch conflicts with the upstream server
  headers.delete("host");
  headers.delete("connection");

  try {
    const body = request.method !== "GET" && request.method !== "HEAD" 
      ? await request.arrayBuffer() 
      : undefined;

    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      redirect: "manual",
    });

    const responseHeaders = new Headers(response.headers);

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error("GraphQL Proxy Error:", error);
    // GraphQL clients typically expect a 200 OK with an errors array
    return new Response(JSON.stringify({ errors: [{ message: "Proxy Error: " + (error.message || "Unknown error") }] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}
