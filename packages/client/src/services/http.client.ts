const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "";

async function post<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(`${baseUrl}${url}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok)
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  return response.json() as Promise<T>;
}

export const http = { post };
