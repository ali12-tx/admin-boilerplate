import { useState } from "react";
import { ShieldCheck, Lock, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/useAuthStore";
import { api, ApiClientError } from "@/config/client";
import { API_ENDPOINTS } from "@/config/config";

const AdminProfile = () => {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const displayName = user?.profile?.fullName || "Admin User";
  const displayEmail = user?.email || "admin@example.com";
  const displayRole = user?.role || "Administrator";
  const displayPicture = user?.profile?.profilePicture || "";
  const initials = displayName.charAt(0).toUpperCase();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Missing information",
        description: "Please fill in all password fields before continuing.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Weak password",
        description: "New password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword === oldPassword) {
      toast({
        title: "Use a new password",
        description: "New password cannot be the same as your current one.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Double-check your confirmation password.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post(
        API_ENDPOINTS.AUTH.UPDATE_PASSWORD,
        { oldPassword, newPassword },
        { requiresAuth: true }
      );
      setIsSubmitting(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
    } catch (error) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Unable to update password. Please try again.";
      toast({
        title: "Update failed",
        description: message,
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="admin-card p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="w-14 h-14 rounded-full  flex items-center justify-center text-primary text-xl font-semibold">
          {displayPicture ? (
            <img
              src={displayPicture}
              alt="Profile"
              className="w-14 h-14 rounded-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">{displayRole}</p>
          <h2 className="text-2xl font-bold text-foreground">{displayName}</h2>
          <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Mail className="w-4 h-4" /> {displayEmail}
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Role: {displayRole}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-success/10 text-success text-sm font-medium">
            Active
          </span>
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            Secure Login
          </span>
        </div>
      </div>

      <div className="admin-card p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Lock className="w-4 h-4" /> Change Password
            </h3>
            <p className="text-sm text-muted-foreground">
              Update your password by confirming the current one.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-muted/60 px-3 py-2 rounded-md">
            <ShieldCheck className="w-4 h-4" />
            Security best practice: use 12+ characters with symbols.
          </div>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium text-foreground">
                Current password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(event) => setOldPassword(event.target.value)}
                  placeholder="Enter your current password"
                  className="w-full pl-11 pr-4 py-3 bg-input rounded-lg text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                New password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="Create a strong password"
                  className="w-full pl-11 pr-4 py-3 bg-input rounded-lg text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Confirm new password
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Re-enter your new password"
                  className="w-full pl-11 pr-4 py-3 bg-input rounded-lg text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Password changes are applied to your admin account immediately.
            </p>
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update password"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProfile;
