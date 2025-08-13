import type { PagedData, User } from "@server/models";

const API_BASE = "http://localhost:3002";
const USER_ENDPOINT = "/users";

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export const apiClient = {
  getUsers: (params?: { search?: string; page?: number }) => {
    const url = new URL(USER_ENDPOINT, API_BASE);
    if (params?.search) url.searchParams.set("search", params.search);
    if (params?.page) url.searchParams.set("page", params.page.toString());

    return request<PagedData<User>>(USER_ENDPOINT);
  },
};
