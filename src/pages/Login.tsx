import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api, ApiClientError } from "@/config/client";
import { API_ENDPOINTS } from "@/config/config";
import { useAuthStore } from "@/store/useAuthStore";
import type { LoginResponse } from "@/types/auth";
import authIllustration from "@/assets/auth-illustration.png";

type ExtendedLoginResponse = LoginResponse & {
  statusCode?: number;
  canChangePassword?: boolean;
  resetToken?: string;
};

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, setCredentials } = useAuthStore();
  const from =
    (location.state as { from?: string } | null)?.from || "/admin/dashboard";

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [from, isAuthenticated, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const data = await api.post<ExtendedLoginResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        { email, password },
        { requiresAuth: false }
      );

      if (data.statusCode === 201 && data.canChangePassword) {
        navigate("/reset-password", {
          replace: true,
          state: { email, resetToken: data.resetToken },
        });
        return;
      }

      setCredentials({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken ?? null,
      });
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Unable to log in. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-accent to-primary/5 items-center justify-center p-8 xl:p-12">
        <div className="w-full max-w-lg animate-fade-in">
          <img
            src={authIllustration}
            alt="Admin Dashboard Illustration"
            className="w-full max-h-[70vh] xl:max-h-[75vh] object-contain rounded-2xl shadow-2xl"
          />
          <div className="mt-8 text-center">
            <h2 className="text-2xl font-bold text-foreground">
              Moments Admin
            </h2>
            <p className="mt-2 text-muted-foreground">
              Manage your application with ease and efficiency
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md animate-slide-up">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
              <LockKeyhole className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
            <p className="mt-2 text-muted-foreground">
              Login to your admin account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-3 bg-input rounded-lg text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <LockKeyhole className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-12 pr-12 py-3 bg-input rounded-lg text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Login"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
