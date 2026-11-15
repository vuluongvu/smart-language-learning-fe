export interface UserProfile {
  id: number;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  timezone: string;
  isLeaderboardVisible: boolean;
  role: string;
  hasPassword: boolean;
  linkedProviders: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

export interface LanguageItem {
  id: number;
  code: string;
  name: string;
  isActive: boolean;
}

export interface RegisterRequest {
  email: string;
  displayName: string;
  password: string;
  timezone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  displayName?: string;
  avatarUrl?: string | null;
  timezone?: string;
  isLeaderboardVisible?: boolean;
}

export interface ChangePasswordRequest {
  currentPassword?: string;
  newPassword: string;
  confirmPassword: string;
}

export interface DeleteAccountRequest {
  confirm: boolean;
  currentPassword?: string;
}
