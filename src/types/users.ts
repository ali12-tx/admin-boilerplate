export type RemoteUserOwner = {
  _id: string;
  email: string;
  isVerified: boolean;
  role: string;
  isDeleted: boolean;
  isProfileCompleted: boolean;
  hasAdminBlocked?: boolean;
};

export type RemoteUser = {
  _id: string;
  user: RemoteUserOwner;
  fullName?: string;
  profilePicture?: string;
  username?: string;
  followers?: string[];
  following?: string[];
  bio?: string;
  isFollowing?: boolean;
  isMuted?: boolean;
};

export type UsersApiResponse = {
  success: boolean;
  page: number;
  limit: number;
  total: number;
  items: RemoteUser[];
  message?: string;
};

export type ToggleAdminBlockResponse = {
  success: boolean;
  hasAdminBlocked: boolean;
  message?: string;
};

export type NormalizedUserStatus = "active" | "blocked" | "pending";

export type NormalizedUser = {
  id: string;
  name: string;
  email: string;
  username?: string;
  avatar?: string;
  bio?: string;
  role?: string;
  followersCount: number;
  followingCount: number;
  isVerified: boolean;
  isProfileCompleted: boolean;
  hasAdminBlocked: boolean;
  isDeleted: boolean;
  isMuted?: boolean;
  isFollowing?: boolean;
  status: NormalizedUserStatus;
};
