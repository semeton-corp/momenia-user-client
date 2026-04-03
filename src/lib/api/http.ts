const BASE_URL = process.env.NEXT_PUBLIC_API_URL
const API_KEY = process.env.NEXT_PUBLIC_API_KEY

export async function http<T>(
    endpoint: string,
    options?: RequestInit
): Promise<T> {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
            "Content-Type": "application/json",
            "X-API-Key": API_KEY!,
            ...(options?.headers || {}),
        },
        ...options,
    })

    if (!res.ok) {
        const error = await res.text()
        throw new Error(error || "API Error")
    }

    return res.json()
}