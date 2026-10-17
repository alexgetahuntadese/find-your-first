import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, LockKeyhole, Rocket } from "lucide-react";
import { toast } from "sonner";
import { getSession, signIn, signUp } from "@/lib/auth";

export const Route = createFileRoute("/auth")({ component: AuthPage });

function AuthPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  useEffect(() => {
    if (getSession()) navigate({ to: "/post" });
  }, [navigate]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (password.length < 6) {
      toast.error("Use at least 6 characters for your password");
      return;
    }
    try {
      if (mode === "signup") {
        const result = await signUp(name, email, password);
        if (result.requiresEmailConfirmation) { toast.success("Check your email to confirm your account, then sign in"); setMode("signin"); return; }
      } else await signIn(email, password);
      toast.success(mode === "signup" ? "Account created" : "Welcome back");
      navigate({ to: "/post" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to jobs</Link>
        <div className="rounded-2xl border bg-card p-6 shadow-glow sm:p-8">
          <div className="mb-6 flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary"><Rocket className="h-5 w-5 text-primary-foreground" /></span><span className="font-semibold">SERATEGNA</span></div>
          <h1 className="text-2xl font-semibold">{mode === "signin" ? "Welcome back" : "Create your account"}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{mode === "signin" ? "Sign in to post and manage opportunities." : "Create an account to share your next opportunity."}</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "signup" && <label className="block text-sm">Name<input required value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-ring" placeholder="Alex Johnson" /></label>}
            <label className="block text-sm">Email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-ring" placeholder="you@example.com" /></label>
            <label className="block text-sm">Password<input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-ring" placeholder="6+ characters" /></label>
            <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-primary py-2.5 text-sm font-medium text-primary-foreground"><LockKeyhole className="h-4 w-4" /> {mode === "signin" ? "Sign in" : "Create account"}</button>
          </form>
          <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="mt-5 w-full text-center text-sm text-muted-foreground hover:text-foreground">{mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}</button>
        </div>
      </div>
    </main>
  );
}

