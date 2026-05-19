export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface SocialLoginRequest {
  provider: 'google' | 'github';
  token: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  token: string;
}
