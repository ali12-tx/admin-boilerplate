import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { TOKEN_KEYS } from "@/config/config";
import type { AuthTokens, AuthUser, UserProfile } from "@/types/auth";

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setCredentials: (
    payload: Partial<AuthTokens> & { user?: AuthUser | null }
  ) => void;
  updateUser: (updates: Partial<AuthUser>) => void;
  logout: () => void;
};

/**
 * Global auth store for user/session data.
 * Persists to localStorage so refreshes keep the session alive.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setCredentials: ({ user, accessToken, refreshToken }) => {
        const normalizedUser = user
          ? { ...user, profile: user.profile ?? ({} as UserProfile) }
          : null;
        set((state) => ({
          user: normalizedUser ?? state.user,
          accessToken: accessToken ?? state.accessToken,
          refreshToken: refreshToken ?? state.refreshToken,
          isAuthenticated: Boolean(accessToken ?? state.accessToken),
        }));

        // Keep token keys in sync for any legacy/localStorage consumers
        if (accessToken) {
          localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
        }
        if (refreshToken) {
          localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
        }
      },
      updateUser: (updates) =>
        set((state) =>
          state.user
            ? {
                user: {
                  ...state.user,
                  ...updates,
                  profile: { ...state.user.profile, ...updates.profile },
                },
              }
            : { user: state.user }
        ),
      logout: () => {
        localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
