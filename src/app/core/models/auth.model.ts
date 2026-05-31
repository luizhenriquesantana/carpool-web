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

export interface UserProfile {
  email: string;
  displayName: string;
  provider: string;
  memberSince: string;
  lastLogin: string;
  loginCount: number;
  lastLoginProvider: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

export interface PasswordResetResponse {
  message: string;
  token?: string;
  email?: string;
  isOAuthSetup?: string;
}
