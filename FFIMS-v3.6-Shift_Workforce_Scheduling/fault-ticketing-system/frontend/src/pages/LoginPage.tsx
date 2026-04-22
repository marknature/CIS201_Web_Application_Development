import { useState } from "react";
<<<<<<< HEAD
import { Link, useNavigate } from "react-router-dom";
=======
import { Link, useLocation, useNavigate } from "react-router-dom";
>>>>>>> 877612de4d8f4b8638124d5d512959a33afc6a29
import { ArrowRight, ShieldCheck, UserRound, Wrench } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldMessage } from "@/components/ffims/FieldMessage";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";

type FormErrors = Record<string, string>;

const DEMO_ACCESS = {
  user: {
    email: import.meta.env.VITE_DEMO_USER_EMAIL || "demo.user@ffims.local",
    password: import.meta.env.VITE_DEMO_USER_PASSWORD || "DemoUser123!",
    label: "User",
  },
  technician: {
    email: import.meta.env.VITE_TECH_EMAIL || "technician@ffims.local",
    password: import.meta.env.VITE_TECH_PASSWORD || "Technician123!",
    label: "Technician",
  },
  admin: {
    email: import.meta.env.VITE_ADMIN_EMAIL || "admin@ffims.local",
    password: import.meta.env.VITE_ADMIN_PASSWORD || "Admin123!",
    label: "Admin",
  },
} as const;

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
<<<<<<< HEAD
  const [mode, setMode] = useState<"login" | "register">("login");
  const [submitting, setSubmitting] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateLogin = () => {
    const nextErrors: FormErrors = {};

    if (!loginForm.email.trim()) nextErrors.loginEmail = "Email is required.";
    if (!loginForm.password.trim()) nextErrors.loginPassword = "Password is required.";

    return nextErrors;
  };

  const validateRegistration = () => {
    const nextErrors: FormErrors = {};

    if (!registerForm.name.trim()) nextErrors.registerName = "Name is required.";
    if (!registerForm.email.trim()) nextErrors.registerEmail = "Email is required.";
    if (!registerForm.password.trim()) nextErrors.registerPassword = "Password is required.";
    if (registerForm.password.trim().length > 0 && registerForm.password.trim().length < 6) {
      nextErrors.registerPassword = "Password must be at least 6 characters.";
    }

    return nextErrors;
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validateLogin();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      return;
    }

    setSubmitting(true);
    try {
      await login(loginForm);
      toast.success("Authenticated successfully");
      navigate("/");
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Login failed.";
      toast.error(message);
      setErrors({ form: message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async (credentials: (typeof DEMO_ACCESS)[keyof typeof DEMO_ACCESS]) => {
=======
  const [submitting, setSubmitting] = useState(false);

  const location = useLocation();
  const from = location.state?.from?.pathname || "/";



  const handleDemoLogin = async (credentials: (typeof DEMO_ACCESS)[keyof typeof DEMO_ACCESS]) => {
    if (submitting) return;
>>>>>>> 877612de4d8f4b8638124d5d512959a33afc6a29
    setErrors({});
    setSubmitting(true);

    try {
      await login({
        email: credentials.email,
        password: credentials.password,
      });

      toast.success(`${credentials.label} signed in successfully.`);
<<<<<<< HEAD
      navigate("/");
=======
      navigate(from, { replace: true });
>>>>>>> 877612de4d8f4b8638124d5d512959a33afc6a29
    } catch (error) {
      const message = error instanceof ApiError ? error.message : `Unable to sign in as ${credentials.label.toLowerCase()}.`;
      toast.error(message);
      setErrors({ form: message });
    } finally {
      setSubmitting(false);
    }
  };

<<<<<<< HEAD
  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validateRegistration();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      return;
    }

    setSubmitting(true);
    try {
      await api.register({
        ...registerForm,
        role: "user",
      });

      await login({
        email: registerForm.email,
        password: registerForm.password,
      });

      toast.success("Account created and signed in.");
      navigate("/");
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Registration failed.";
      toast.error(message);
      setErrors({ form: message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen gap-6 px-4 py-6 md:grid-cols-[1.05fr_0.95fr] md:px-10 md:py-10">
      <section className="relative overflow-hidden rounded-[28px] bg-[#1A1A1A] px-6 py-8 text-white shadow-2xl md:px-10 md:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(204,0,0,0.35),transparent_32%),linear-gradient(160deg,rgba(255,255,255,0.02),transparent)]" />
        <div className="relative z-10">
          <p className="text-[12px] font-semibold uppercase tracking-[0.3em] text-white/70">Group P5 Standard</p>
          <h1 className="mt-6 max-w-xl text-[32px] font-semibold leading-tight">
            Fault Reporting &amp; Ticketing integrated into the FFIMS workspace.
          </h1>
          <p className="mt-4 max-w-xl text-[14px] leading-7 text-white/75">
            Authenticate with JWT, report faults against registered assets, route tickets to technicians, and monitor status directly from the shared FFIMS design language.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <Card className="border-white/10 bg-white/5 text-white shadow-none">
              <CardContent className="space-y-3 p-5">
                <ShieldCheck className="h-8 w-8 text-white" />
                <h2 className="text-[18px] font-semibold">JWT Authentication</h2>
                <p className="text-[13px] leading-6 text-white/70">
                  Sessions persist locally and validate against the backend before opening the dashboard.
                </p>
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-white/5 text-white shadow-none">
              <CardContent className="space-y-3 p-5">
                <Wrench className="h-8 w-8 text-white" />
                <h2 className="text-[18px] font-semibold">Role-Aware Workflow</h2>
                <p className="text-[13px] leading-6 text-white/70">
                  Users submit faults, technicians progress work, and admins manage assignment and oversight.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-white/65">Access Note</p>
            <p className="mt-3 text-[14px] leading-7 text-white/75">
              Public sign-up creates a <strong className="font-semibold text-white">User</strong> account. User, technician, and admin demo accounts are seeded automatically during backend startup for local development.
            </p>
          </div>
        </div>
      </section>

      <section className="flex items-center">
        <Card className="w-full rounded-[28px] border-white/80 bg-white/95 shadow-xl">
          <CardHeader className="space-y-4">
            <div className="inline-flex rounded-full border bg-muted p-1">
              <button
                className={`rounded-full px-4 py-2 text-[13px] font-semibold transition ${mode === "login" ? "bg-primary text-white" : "text-muted-foreground"}`}
                onClick={() => {
                  setMode("login");
                  setErrors({});
                }}
                type="button"
              >
                Sign In
              </button>
              <button
                className={`rounded-full px-4 py-2 text-[13px] font-semibold transition ${mode === "register" ? "bg-primary text-white" : "text-muted-foreground"}`}
                onClick={() => {
                  setMode("register");
                  setErrors({});
                }}
                type="button"
              >
                Register
              </button>
            </div>
            <div>
              <CardTitle className="text-[24px]">{mode === "login" ? "Open FFIMS" : "Create a Reporter Account"}</CardTitle>
              <p className="mt-2 text-[14px] text-muted-foreground">
                {mode === "login"
                  ? "Use your FFIMS credentials to access the integrated ticketing workspace."
                  : "Register a standard user account and begin submitting faults immediately."}
=======


  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/10">
      <div className="w-full max-w-md">
        <Card className="w-full rounded-[28px] border-white/80 bg-white/95 shadow-xl">
          <CardHeader className="space-y-4">
            <div>
              <CardTitle className="text-[24px]">Open FFIMS</CardTitle>
              <p className="mt-2 text-[14px] text-muted-foreground">
                Select your demonstration role to access the integrated ticketing workspace.
>>>>>>> 877612de4d8f4b8638124d5d512959a33afc6a29
              </p>
            </div>
          </CardHeader>

          <CardContent>
<<<<<<< HEAD
            {mode === "login" ? (
              <form className="space-y-5" onSubmit={handleLogin}>
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    value={loginForm.email}
                    onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
                    placeholder="you@example.com"
                    type="email"
                  />
                  <FieldMessage message={errors.loginEmail} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    value={loginForm.password}
                    onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                    placeholder="Enter your password"
                    type="password"
                  />
                  <FieldMessage message={errors.loginPassword} />
                </div>
                <FieldMessage message={errors.form} />
                <Button className="w-full" disabled={submitting} type="submit">
                  {submitting ? "Signing In..." : "Sign In"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <div className="rounded-2xl border border-border bg-muted/40 p-4">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Quick Access
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <Button
                      className="w-full justify-start gap-2"
                      disabled={submitting}
                      onClick={() => handleDemoLogin(DEMO_ACCESS.user)}
                      type="button"
                      variant="outline"
                    >
                      <UserRound className="h-4 w-4" />
                      User login
                    </Button>
                    <Button
                      className="w-full justify-start gap-2"
                      disabled={submitting}
                      onClick={() => handleDemoLogin(DEMO_ACCESS.technician)}
                      type="button"
                      variant="outline"
                    >
                      <Wrench className="h-4 w-4" />
                      Technician login
                    </Button>
                    <Button
                      className="w-full justify-start gap-2"
                      disabled={submitting}
                      onClick={() => handleDemoLogin(DEMO_ACCESS.admin)}
                      type="button"
                      variant="outline"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      Admin login
                    </Button>
                  </div>
                  <p className="mt-3 text-[12px] leading-6 text-muted-foreground">
                    Use these shortcuts to open the user, technician, or admin demo accounts without creating a separate account first.
                  </p>
                </div>
              </form>
            ) : (
              <form className="space-y-5" onSubmit={handleRegister}>
                <div className="space-y-2">
                  <Label htmlFor="register-name">Full Name</Label>
                  <Input
                    id="register-name"
                    value={registerForm.name}
                    onChange={(event) => setRegisterForm((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Name Surname"
                  />
                  <FieldMessage message={errors.registerName} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    value={registerForm.email}
                    onChange={(event) => setRegisterForm((current) => ({ ...current, email: event.target.value }))}
                    placeholder="you@example.com"
                    type="email"
                  />
                  <FieldMessage message={errors.registerEmail} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    value={registerForm.password}
                    onChange={(event) => setRegisterForm((current) => ({ ...current, password: event.target.value }))}
                    placeholder="Minimum 6 characters"
                    type="password"
                  />
                  <FieldMessage message={errors.registerPassword} />
                </div>
                <FieldMessage message={errors.form} />
                <Button className="w-full" disabled={submitting} type="submit">
                  {submitting ? "Creating Account..." : "Register and Continue"}
                </Button>
              </form>
            )}

            <p className="mt-6 text-[13px] text-muted-foreground">
              Need to review the module specification first? Return to the{" "}
              <Link className="font-semibold text-primary hover:text-primary/80" to="/fault-ticketing">
                fault dashboard
              </Link>{" "}
              after authentication.
            </p>
          </CardContent>
        </Card>
      </section>
=======
              <div className="space-y-4 pt-2">
                <Button
                  className="w-full justify-start gap-3 h-14 text-[15px] font-medium"
                  disabled={submitting}
                  onClick={() => handleDemoLogin(DEMO_ACCESS.user)}
                  type="button"
                  variant="outline"
                >
                  <UserRound className="h-5 w-5 text-muted-foreground" />
                  Login as User
                </Button>
                <Button
                  className="w-full justify-start gap-3 h-14 text-[15px] font-medium"
                  disabled={submitting}
                  onClick={() => handleDemoLogin(DEMO_ACCESS.technician)}
                  type="button"
                  variant="outline"
                >
                  <Wrench className="h-5 w-5 text-muted-foreground" />
                  Login as Technician
                </Button>
                <Button
                  className="w-full justify-start gap-3 h-14 text-[15px] font-medium"
                  disabled={submitting}
                  onClick={() => handleDemoLogin(DEMO_ACCESS.admin)}
                  type="button"
                  variant="outline"
                >
                  <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                  Login as Admin
                </Button>
              </div>

          </CardContent>
        </Card>
      </div>
>>>>>>> 877612de4d8f4b8638124d5d512959a33afc6a29
    </div>
  );
}
