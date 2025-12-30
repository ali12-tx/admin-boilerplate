import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api, ApiClientError } from "@/config/client";
import { API_ENDPOINTS } from "@/config/config";
import { useToast } from "@/hooks/use-toast";

const OTPVerification = () => {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const searchEmail = new URLSearchParams(location.search).get("email") || "";
  const stateEmail =
    (location.state as { email?: string } | null)?.email || "";
  const email = stateEmail || searchEmail;

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    const newOtp = [...otp];
    pastedData.split("").forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtp(newOtp);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("Email is missing. Please request a new OTP.");
      return;
    }

    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setError("Please enter the 6-digit code.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post<{ resetToken?: string }>(
        API_ENDPOINTS.AUTH.VERIFY_OTP,
        { email, otp: otpValue },
        { requiresAuth: false }
      );

      toast({
        title: "OTP verified",
        description: "Your code was verified successfully. Set a new password.",
      });

      navigate("/reset-password", {
        replace: true,
        state: {
          email,
          otp: otpValue,
          resetToken: response?.resetToken,
        },
      });
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : "Unable to verify OTP. Please try again.";
      setError(message);
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError(null);

    if (!email) {
      setError("Email is missing. Please return to request a new OTP.");
      return;
    }

    setIsResending(true);
    try {
      await api.post(
        API_ENDPOINTS.AUTH.RESEND_OTP,
        { email },
        { requiresAuth: false }
      );

      toast({
        title: "OTP resent",
        description: `A new code has been sent to ${email}.`,
      });
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : "Unable to resend OTP. Please try again.";
      setError(message);
      toast({
        variant: "destructive",
        title: "Resend failed",
        description: message,
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="admin-card p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Verify OTP</h1>
            <p className="mt-2 text-muted-foreground">
              {email
                ? `Enter the 6-digit code sent to ${email}`
                : "Enter the 6-digit code sent to your email"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center gap-3" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value.replace(/[^0-9]/g, ""))}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="otp-input"
                />
              ))}
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
              {isSubmitting ? "Verifying..." : "Verify OTP"}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {isResending ? (
                  "Resending..."
                ) : (
                  <>
                    Didn't receive code?{" "}
                    <span className="font-medium text-primary">Resend OTP</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
