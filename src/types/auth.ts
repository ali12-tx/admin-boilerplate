export type UserProfile = {
  fullName?: string;
  profilePicture?: string;
  coverImage?: string;
  bio?: string;
};

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
  role?: string;
  isVerified?: boolean;
  profile?: UserProfile;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken?: string | null;
};

export type LoginResponse = {
  user: AuthUser;
  accessToken: string;
  refreshToken?: string | null;
};
