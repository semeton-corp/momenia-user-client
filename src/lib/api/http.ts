const BASE_URL = typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_API_URL
const API_KEY = process.env.NEXT_PUBLIC_API_KEY

export async function http<T>(
    endpoint: string,
    options?: RequestInit
): Promise<T> {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            "x-api-key": API_KEY!,
            ...(options?.headers || {}),
        },
    })

    if (!res.ok) {
        const message = await res.text()
        const error = new Error(message || "API Error") as Error & { status?: number }
        error.status = res.status
        throw error
    }

    return res.json()
}