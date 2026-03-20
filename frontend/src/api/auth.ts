import client from "./client";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserResponse {
  id: string;
  email: string;
  full_name: string;
  role: string;
  organization_id: string | null;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
}

export const authApi = {
  login: (data: LoginRequest) =>
    client.post<TokenResponse>("/auth/login", data),

  refresh: (refreshToken: string) =>
    client.post<TokenResponse>("/auth/refresh", { refresh_token: refreshToken }),

  me: () => client.get<UserResponse>("/auth/me"),
};
