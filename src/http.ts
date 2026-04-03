export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message)
    this.name = "ApiError"
  }
}

export async function request<T>(
  baseUrl: string,
  apiKey: string,
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const url = `${baseUrl.replace(/\/$/, "")}${path}`
  const res = await fetch(url, {
    method,
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (res.status === 204) return undefined as T

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new ApiError(res.status, data.error || "unknown", data.message || `HTTP ${res.status}`)
  }

  return data as T
}
