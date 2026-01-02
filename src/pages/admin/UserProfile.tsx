import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  BadgeCheck,
  ChevronLeft,
  Mail,
  ShieldAlert,
  ShieldCheck,
  User as UserIcon,
  Users as UsersIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { api, ApiClientError } from "@/config/client";
import { API_ENDPOINTS } from "@/config/config";
import type { RemoteUser } from "@/types/users";
import type { User } from "./Users";

type UserProfileApiResponse =
  | RemoteUser
  | { user?: RemoteUser }
  | { data?: RemoteUser | { user?: RemoteUser } };

type ProfileView = {
  id: string;
  name: string;
  username?: string;
  email: string;
  avatar?: string;
  bio?: string;
  followersCount: number;
  followingCount: number;
  isVerified: boolean;
  isProfileCompleted: boolean;
  isDeleted: boolean;
  isMuted?: boolean;
  isFollowing?: boolean;
};

const extractProfile = (
  payload: UserProfileApiResponse | undefined
): RemoteUser | null => {
  if (!payload || typeof payload !== "object") return null;
  const data = "data" in payload && payload.data ? payload.data : payload;
  if (data && typeof data === "object") {
    if ("followers" in data || "following" in data || "bio" in data) {
      return data as RemoteUser;
    }
    if ("user" in data && (data as { user?: RemoteUser }).user) {
      return (data as { user?: RemoteUser }).user ?? null;
    }
  }
  return null;
};

const normalizeProfile = (
  remote: RemoteUser,
  fallbackId?: string
): ProfileView => {
  const email = remote.user?.email?.trim() || "N/A";
  const name =
    remote.fullName?.trim() ||
    remote.username?.trim() ||
    (email ? email.split("@")[0] : undefined) ||
    "Unknown User";

  return {
    id: remote._id || fallbackId || "unknown",
    name,
    username: remote.username,
    email,
    avatar: remote.profilePicture,
    bio: remote.bio,
    followersCount: remote.followers?.length ?? 0,
    followingCount: remote.following?.length ?? 0,
    isVerified: Boolean(remote.user?.isVerified),
    isProfileCompleted: Boolean(remote.user?.isProfileCompleted),
    isDeleted: Boolean(remote.user?.isDeleted),
    isMuted: remote.isMuted,
    isFollowing: remote.isFollowing,
  };
};

const normalizeFromState = (user?: User): ProfileView | undefined => {
  if (!user) return undefined;
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    bio: user.bio,
    followersCount: user.followersCount,
    followingCount: user.followingCount,
    isVerified: Boolean(user.isVerified),
    isProfileCompleted: Boolean(user.isProfileCompleted),
    isDeleted: Boolean(user.isDeleted),
    isMuted: user.isMuted,
    isFollowing: user.isFollowing,
  };
};

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { state } = useLocation();

  const [profile, setProfile] = useState<ProfileView | undefined>(
    normalizeFromState(state?.user)
  );
  const [isLoading, setIsLoading] = useState(!state?.user);
  const [error, setError] = useState<string | null>(null);

  const initials = useMemo(
    () => (profile?.name ? profile.name.charAt(0).toUpperCase() : "U"),
    [profile?.name]
  );

  useEffect(() => {
    if (!id) return;
    const loadProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get<UserProfileApiResponse>(
          API_ENDPOINTS.USER.GET_USER(id)
        );
        const remoteProfile = extractProfile(response);
        if (!remoteProfile) {
          setProfile(undefined);
          setError("Profile not found.");
          return;
        }
        setProfile(normalizeProfile(remoteProfile, id));
      } catch (err) {
        const message =
          err instanceof ApiClientError
            ? err.message
            : "Unable to load user profile. Please try again.";
        setError(message);
        setProfile(undefined);
        toast({
          variant: "destructive",
          title: "Failed to load profile",
          description: message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [id, toast]);

  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-2xl font-bold text-foreground">
            Loading profile...
          </h2>
        </div>
        <p className="text-muted-foreground">
          Fetching the latest profile details.
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-2xl font-bold text-foreground">
            Profile unavailable
          </h2>
        </div>
        <p className="text-muted-foreground">
          {error ??
            "This profile does not exist or could not be loaded. Please return to the users list."}
        </p>
        <Button onClick={() => navigate("/admin/users")}>Go to Users</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-2xl font-bold text-foreground">User Profile</h2>
      </div>

      <div className="admin-card p-6 flex flex-col md:flex-row gap-6">
        <div className="w-20 h-20 rounded-full bg-primary/10 text-primary text-2xl font-semibold flex items-center justify-center overflow-hidden">
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap gap-2 items-center">
            <h3 className="text-xl font-semibold text-foreground">
              {profile.name}
            </h3>
            {profile.isVerified && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-success/10 text-success text-sm font-medium">
                <BadgeCheck className="w-4 h-4" />
                Verified
              </span>
            )}
            {profile.isProfileCompleted ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <ShieldCheck className="w-4 h-4" />
                Profile Complete
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-sm font-medium">
                <ShieldAlert className="w-4 h-4" />
                Profile Incomplete
              </span>
            )}
            {profile.isDeleted && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-destructive/10 text-destructive text-sm font-medium">
                Deleted
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              Username: {profile.username ?? "N/A"}
            </span>
            <span className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {profile.email}
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {profile.bio || "No bio provided."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="admin-card p-4 flex items-center gap-3">
          <UsersIcon className="w-10 h-10 p-2 rounded-full bg-primary/10 text-primary" />
          <div>
            <p className="text-2xl font-bold text-foreground">
              {profile.followersCount}
            </p>
            <p className="text-sm text-muted-foreground">Followers</p>
          </div>
        </div>
        <div className="admin-card p-4 flex items-center gap-3">
          <UsersIcon className="w-10 h-10 p-2 rounded-full bg-primary/10 text-primary" />
          <div>
            <p className="text-2xl font-bold text-foreground">
              {profile.followingCount}
            </p>
            <p className="text-sm text-muted-foreground">Following</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
