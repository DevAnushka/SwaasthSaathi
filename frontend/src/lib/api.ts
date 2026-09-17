// Dynamically point to the backend worker
export const API_BASE = 'https://careconnect-api.careconnect-api.workers.dev';

export async function fetchFromAPI(endpoint: string, options?: RequestInit) {
  const url = `${API_BASE}${endpoint}`;
  
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    return await res.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}
