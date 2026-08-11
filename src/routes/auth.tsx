import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  Eye,
  EyeOff,
  HeartPulse,
  Info,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Phone,
  Shield,
  ShieldCheck,
  Stethoscope,
  User,
  UserCheck,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useStore } from "@/lib/store";
import type { Role } from "@/lib/data/types";
import { cn } from "@/lib/utils";

interface AuthSearch {
  mode?: "login" | "signup" | undefined;
  redirect?: string | undefined;
  role?: Role | undefined;
}

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({
    mode: search["mode"] === "signup" ? "signup" : search["mode"] === "login" ? "login" : undefined,
    redirect: typeof search["redirect"] === "string" ? search["redirect"] : undefined,
    role: ["patient", "doctor", "admin"].includes(search["role"] as string)
      ? (search["role"] as Role)
      : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in or create your account — MediBook" },
      {
        name: "description",
        content:
          "Access your MediBook patient, doctor or admin portal to manage appointments, prescriptions and medical records securely.",
      },
      { property: "og:title", content: "Sign in to MediBook" },
      {
        property: "og:description",
        content: "One secure account for patients, doctors and clinic administrators.",
      },
    ],
  }),
  component: AuthPage,
});

const COUNTRY_CODES = [
  { code: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "+971", flag: "🇦🇪", name: "UAE" },
  { code: "+965", flag: "🇰🇼", name: "Kuwait" },
  { code: "+974", flag: "🇶🇦", name: "Qatar" },
  { code: "+973", flag: "🇧🇭", name: "Bahrain" },
  { code: "+968", flag: "🇴🇲", name: "Oman" },
  { code: "+1", flag: "🇺🇸", name: "USA" },
  { code: "+44", flag: "🇬🇧", name: "UK" },
];

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { login, loginAs, signup } = useStore();

  const [mode, setMode] = useState<"login" | "signup">(search.mode ?? "login");
  const [role, setRole] = useState<Role>(
    search.role && search.role !== "admin" ? search.role : "patient",
  );

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneCountry, setPhoneCountry] = useState("+966");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);

  // Field Touched / Validation States
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Role Redirection
  function go(userRole: Role) {
    const dest =
      search.redirect ??
      (userRole === "admin" ? "/admin" : userRole === "doctor" ? "/doctor" : "/app");
    void navigate({ to: dest });
  }

  // Password Requirements Checker
  const passwordRequirements = useMemo(() => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };
  }, [password]);

  const isPasswordValid = Object.values(passwordRequirements).every(Boolean);

  // Real-time Field Errors
  const emailError = useMemo(() => {
    if (!emailTouched || !email) return "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      return "Please enter a valid email address.";
    }
    return "";
  }, [email, emailTouched]);

  const passwordError = useMemo(() => {
    if (!passwordTouched || !password) return "";
    if (mode === "login" && password.length < 6) {
      return "Please enter your password.";
    }
    if (mode === "signup" && !isPasswordValid) {
      return "Password does not meet all security requirements.";
    }
    return "";
  }, [password, passwordTouched, mode, isPasswordValid]);

  const confirmError = useMemo(() => {
    if (!confirmTouched || !confirmPassword) return "";
    if (confirmPassword !== password) {
      return "Passwords do not match.";
    }
    return "";
  }, [confirmPassword, password, confirmTouched]);

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEmailTouched(true);
    setPasswordTouched(true);
    if (mode === "signup") setConfirmTouched(true);

    const cleanEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (mode === "login") {
      if (!password) {
        toast.error("Please enter your password.");
        return;
      }

      setBusy(true);
      setTimeout(() => {
        setBusy(false);
        const account = login(cleanEmail, password);
        if (!account) {
          toast.error("Email or password is incorrect.");
          return;
        }
        toast.success(`Welcome back, ${account.name.split(" ")[0]}!`);
        go(account.role);
      }, 700);
    } else {
      // Signup Mode
      if (name.trim().length < 3) {
        toast.error("Please enter your full name.");
        return;
      }
      if (!isPasswordValid) {
        toast.error("Password must satisfy all security requirements.");
        return;
      }
      if (confirmPassword !== password) {
        toast.error("Passwords do not match.");
        return;
      }
      if (!agree) {
        toast.error("Please accept the Terms of Service and Privacy Policy.");
        return;
      }

      setBusy(true);
      setTimeout(() => {
        setBusy(false);
        const account = signup({
          name: name.trim(),
          email: cleanEmail,
          password,
          role,
        });
        toast.success("Account created successfully — Welcome to MediBook!");
        go(account.role);
      }, 700);
    }
  }

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(forgotEmail.trim())) {
      setForgotSubmitted(true);
    } else {
      toast.error("Please enter a valid email address.");
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <div className="grid w-full grid-cols-1 lg:grid-cols-12 min-h-screen">
        {/* LEFT BRAND PANEL (45% Width on Desktop) */}
        <div className="relative hidden lg:col-span-5 lg:flex flex-col justify-between p-10 xl:p-14 bg-gradient-to-br from-teal-950 via-slate-900 to-slate-950 text-white overflow-hidden">
          {/* Subtle Abstract Waveform Accent Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 400 600" fill="none">
              <path
                d="M0 200 C 150 150, 250 250, 400 200 L 400 600 L 0 600 Z"
                fill="currentColor"
              />
              <circle
                cx="200"
                cy="150"
                r="120"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <circle cx="300" cy="350" r="80" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>

          {/* Top Logo */}
          <div className="relative z-10">
            <Logo className="[&>span:last-child]:text-white" />
          </div>

          {/* Main Hero Branding Text */}
          <div className="relative z-10 space-y-6 my-auto max-w-md">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Healthcare Platform</span>
            </div>

            <h1 className="text-3xl xl:text-4xl font-bold tracking-tight text-white leading-tight">
              Your healthcare, all in one place.
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              Find trusted doctors, manage appointments and keep your healthcare journey organized
              with MediBook.
            </p>

            {/* 3 Benefit Bullets */}
            <div className="space-y-3 pt-2">
              {[
                "Find and book verified doctors",
                "Manage your appointments seamlessly",
                "Access your healthcare records securely",
              ].map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-center gap-3 text-xs font-semibold text-slate-200"
                >
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    <Check className="h-3 w-3" />
                  </div>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Footer Slogan */}
          <div className="relative z-10 border-t border-slate-800/80 pt-6 text-xs text-slate-400 flex items-center justify-between">
            <span>Trusted healthcare, made simple.</span>
            <span>© {new Date().getFullYear()} MediBook</span>
          </div>
        </div>

        {/* RIGHT AUTHENTICATION PANEL (55% Width on Desktop) */}
        <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-12 lg:p-14 overflow-y-auto">
          {/* Top Header / Mobile Logo */}
          <div className="flex items-center justify-between">
            <div className="lg:hidden">
              <Logo />
            </div>
            <Link
              to="/"
              className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to MediBook</span>
            </Link>
          </div>

          {/* Main Auth Form Box (Max 480px) */}
          <div className="mx-auto w-full max-w-[480px] my-auto py-8 space-y-7">
            {/* Header Titles */}
            <div className="space-y-1.5">
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {mode === "login" ? "Welcome back" : "Create your account"}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {mode === "login"
                  ? "Sign in to continue to your MediBook account."
                  : "Join MediBook to book appointments and manage your health."}
              </p>
            </div>

            {/* Segmented Control Switch: [ Sign in ] [ Create account ] */}
            <div className="rounded-2xl bg-secondary/70 p-1 flex items-center border border-border">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={cn(
                  "flex-1 rounded-xl py-2.5 text-xs font-bold transition-all duration-200 text-center",
                  mode === "login"
                    ? "bg-card text-primary shadow-xs ring-1 ring-border"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={cn(
                  "flex-1 rounded-xl py-2.5 text-xs font-bold transition-all duration-200 text-center",
                  mode === "signup"
                    ? "bg-card text-primary shadow-xs ring-1 ring-border"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Create account
              </button>
            </div>

            {/* Account Role Selector (Sign up Mode) */}
            {mode === "signup" && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                  I am registering as:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      r: "patient" as Role,
                      title: "Patient",
                      desc: "Book & manage care",
                      icon: UserRound,
                    },
                    {
                      r: "doctor" as Role,
                      title: "Doctor / Clinic",
                      desc: "Manage your practice",
                      icon: Stethoscope,
                    },
                  ].map((item) => {
                    const RoleIcon = item.icon;
                    const isSelected = role === item.r;
                    return (
                      <button
                        key={item.r}
                        type="button"
                        onClick={() => setRole(item.r)}
                        className={cn(
                          "flex flex-col items-start p-3.5 rounded-2xl border text-left transition-all",
                          isSelected
                            ? "border-primary bg-primary-soft/30 ring-1 ring-primary shadow-xs"
                            : "border-border bg-card hover:bg-secondary/50",
                        )}
                      >
                        <RoleIcon
                          className={cn(
                            "h-4 w-4 mb-2",
                            isSelected ? "text-primary" : "text-muted-foreground",
                          )}
                        />
                        <h4 className="font-bold text-xs text-foreground">{item.title}</h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{item.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Full Name (Signup Only) */}
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-bold text-foreground">
                    Full name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sara Al-Harbi"
                    className="h-12 rounded-2xl border-border bg-card text-xs font-medium focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
              )}

              {/* Email Address */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-bold text-foreground">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setEmailTouched(true)}
                  placeholder="you@example.com"
                  className={cn(
                    "h-12 rounded-2xl border-border bg-card text-xs font-medium focus-visible:ring-2 focus-visible:ring-primary",
                    emailError && "border-red-500 focus-visible:ring-red-500",
                  )}
                />
                {emailError && (
                  <p className="text-[11px] font-semibold text-red-500">{emailError}</p>
                )}
              </div>

              {/* Phone Number (Signup Only) */}
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-bold text-foreground">
                    Phone number
                  </Label>
                  <div className="flex gap-2">
                    <select
                      value={phoneCountry}
                      onChange={(e) => setPhoneCountry(e.target.value)}
                      className="h-12 rounded-2xl border border-border bg-card px-3 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shrink-0"
                      aria-label="Country Code"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.code}
                        </option>
                      ))}
                    </select>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="50 123 4567"
                      className="h-12 rounded-2xl border-border bg-card text-xs font-medium flex-1 focus-visible:ring-2 focus-visible:ring-primary"
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-bold text-foreground">
                    Password
                  </Label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>

                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setPasswordTouched(true)}
                    placeholder="Enter your password"
                    className={cn(
                      "h-12 rounded-2xl border-border bg-card text-xs font-medium pr-10 focus-visible:ring-2 focus-visible:ring-primary",
                      passwordError && "border-red-500 focus-visible:ring-red-500",
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-[11px] font-semibold text-red-500">{passwordError}</p>
                )}
              </div>

              {/* Dynamic Password Strength Indicators (Signup Only) */}
              {mode === "signup" && password && (
                <div className="rounded-2xl bg-secondary/50 p-3 space-y-1.5 text-[11px] border border-border">
                  <span className="font-bold text-foreground block">Password requirements:</span>
                  <div className="grid grid-cols-2 gap-1 font-medium">
                    <span
                      className={cn(
                        "flex items-center gap-1",
                        passwordRequirements.length
                          ? "text-emerald-600 dark:text-emerald-400 font-bold"
                          : "text-muted-foreground",
                      )}
                    >
                      {passwordRequirements.length ? "✓" : "○"} At least 8 characters
                    </span>
                    <span
                      className={cn(
                        "flex items-center gap-1",
                        passwordRequirements.uppercase
                          ? "text-emerald-600 dark:text-emerald-400 font-bold"
                          : "text-muted-foreground",
                      )}
                    >
                      {passwordRequirements.uppercase ? "✓" : "○"} One uppercase letter
                    </span>
                    <span
                      className={cn(
                        "flex items-center gap-1",
                        passwordRequirements.lowercase
                          ? "text-emerald-600 dark:text-emerald-400 font-bold"
                          : "text-muted-foreground",
                      )}
                    >
                      {passwordRequirements.lowercase ? "✓" : "○"} One lowercase letter
                    </span>
                    <span
                      className={cn(
                        "flex items-center gap-1",
                        passwordRequirements.number
                          ? "text-emerald-600 dark:text-emerald-400 font-bold"
                          : "text-muted-foreground",
                      )}
                    >
                      {passwordRequirements.number ? "✓" : "○"} One number
                    </span>
                    <span
                      className={cn(
                        "flex items-center gap-1 col-span-2",
                        passwordRequirements.special
                          ? "text-emerald-600 dark:text-emerald-400 font-bold"
                          : "text-muted-foreground",
                      )}
                    >
                      {passwordRequirements.special ? "✓" : "○"} One special character
                    </span>
                  </div>
                </div>
              )}

              {/* Confirm Password (Signup Only) */}
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-xs font-bold text-foreground">
                    Confirm password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onBlur={() => setConfirmTouched(true)}
                      placeholder="Re-enter your password"
                      className={cn(
                        "h-12 rounded-2xl border-border bg-card text-xs font-medium pr-10 focus-visible:ring-2 focus-visible:ring-primary",
                        confirmError && "border-red-500 focus-visible:ring-red-500",
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {confirmError && (
                    <p className="text-[11px] font-semibold text-red-500">{confirmError}</p>
                  )}
                </div>
              )}

              {/* Terms Checkbox (Signup Only) */}
              {mode === "signup" && (
                <div className="flex items-start gap-2.5 pt-1">
                  <Checkbox
                    id="agree"
                    checked={agree}
                    onCheckedChange={(v) => setAgree(v === true)}
                    className="mt-0.5"
                  />
                  <label htmlFor="agree" className="text-xs text-muted-foreground leading-relaxed">
                    I agree to the{" "}
                    <a
                      href="#"
                      className="font-semibold text-primary underline"
                      onClick={(e) => e.preventDefault()}
                    >
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a
                      href="#"
                      className="font-semibold text-primary underline"
                      onClick={(e) => e.preventDefault()}
                    >
                      Privacy Policy
                    </a>
                    .
                  </label>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={busy}
                className="h-12 w-full rounded-2xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-xs"
              >
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {busy
                  ? mode === "login"
                    ? "Signing in..."
                    : "Creating account..."
                  : mode === "login"
                    ? "Sign in"
                    : "Create account"}
              </Button>
            </form>

            {/* Try MediBook Instantly (Demo Accounts Section) */}
            <div className="space-y-3 border-t border-border pt-6">
              <div>
                <h3 className="font-bold text-xs text-foreground uppercase tracking-wider">
                  Try MediBook instantly
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Explore the platform using a pre-configured demo account.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    r: "patient" as Role,
                    title: "Patient Demo",
                    desc: "Explore patient experience",
                    icon: UserRound,
                  },
                  {
                    r: "doctor" as Role,
                    title: "Doctor Demo",
                    desc: "Explore doctor portal",
                    icon: Stethoscope,
                  },
                  {
                    r: "admin" as Role,
                    title: "Admin Demo",
                    desc: "Explore platform admin",
                    icon: ShieldCheck,
                  },
                ].map((demo) => {
                  const DemoIcon = demo.icon;
                  return (
                    <Button
                      key={demo.r}
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const account = loginAs(demo.r);
                        toast.success(`Signed in as ${account.name}`);
                        go(demo.r);
                      }}
                      className="flex flex-col items-center justify-center p-3 h-auto rounded-2xl border-border hover:border-primary/50 hover:bg-primary-soft/20 text-center transition-all"
                    >
                      <DemoIcon className="h-4 w-4 text-primary mb-1" />
                      <span className="font-bold text-xs text-foreground">{demo.title}</span>
                      <span className="text-[10px] text-muted-foreground font-normal line-clamp-1">
                        {demo.desc}
                      </span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Security Trust Note */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground font-medium pt-2">
              <Shield className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>Your information is protected with secure authentication.</span>
            </div>
          </div>

          {/* Bottom Link for Mobile */}
          <div className="text-center pt-4 lg:hidden">
            <Link to="/" className="text-xs font-semibold text-primary hover:underline">
              ← Back to MediBook home
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Recovery Modal */}
      {showForgotModal && (
        <Dialog open={showForgotModal} onOpenChange={() => setShowForgotModal(false)}>
          <DialogContent className="rounded-3xl max-w-md p-6 sm:p-8">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-foreground">
                Reset Password
              </DialogTitle>
            </DialogHeader>

            {forgotSubmitted ? (
              <div className="space-y-4 text-center py-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">Reset Link Sent</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    We have sent a password reset link to{" "}
                    <span className="font-bold text-foreground">{forgotEmail}</span>. Please check
                    your inbox.
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotSubmitted(false);
                    setForgotEmail("");
                  }}
                  className="w-full rounded-2xl py-2.5 text-xs font-bold"
                >
                  Back to Sign In
                </Button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 pt-2">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Enter your email address and we'll send you instructions to reset your password.
                </p>
                <div className="space-y-1.5">
                  <Label htmlFor="forgotEmail" className="text-xs font-bold text-foreground">
                    Email address
                  </Label>
                  <Input
                    id="forgotEmail"
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="h-12 rounded-2xl border-border bg-card text-xs font-medium focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForgotModal(false)}
                    className="w-1/2 rounded-2xl text-xs font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="w-1/2 rounded-2xl text-xs font-bold bg-primary text-primary-foreground"
                  >
                    Send Reset Link
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
