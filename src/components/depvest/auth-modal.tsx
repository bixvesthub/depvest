import { useEffect, useState, type FormEvent } from "react";
import { LoaderCircle, Mail, ShieldCheck, WalletCards } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { UserProfile } from "./types";

type AuthModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialIsSignUp?: boolean;
  profile: UserProfile;
  onSignIn: (email: string, password: string, isSignUp: boolean) => Promise<void>;
  onGoogleSignIn: () => Promise<void>;
  onPasswordReset: (email: string) => Promise<void>;
  onLinkWallet: () => void;
};

export function AuthModal({
  open,
  onOpenChange,
  initialIsSignUp = false,
  profile,
  onSignIn,
  onGoogleSignIn,
  onPasswordReset,
  onLinkWallet,
}: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(initialIsSignUp);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("account");
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [recoverySent, setRecoverySent] = useState(false);

  useEffect(() => {
    if (open) {
      setIsSignUp(initialIsSignUp);
      setError("");
      setActiveTab("account");
      setRecoveryMode(false);
      setRecoverySent(false);
    }
  }, [initialIsSignUp, open]);

  const submitEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await onSignIn(trimmedEmail, password, isSignUp);
    } catch (submitError) {
      setError(getAuthErrorMessage(submitError, isSignUp));
    } finally {
      setSubmitting(false);
    }
  };

  const submitGoogle = async () => {
    setError("");
    setSubmitting(true);
    try {
      await onGoogleSignIn();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Google sign-in is unavailable. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const submitPasswordReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Enter a valid email address.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await onPasswordReset(trimmedEmail);
      setRecoverySent(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to send recovery instructions. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto border-border bg-popover">
        <DialogHeader className="text-center sm:text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl border border-success/30 bg-success/10 text-success">
            <ShieldCheck className="size-6" />
          </span>
          <DialogTitle className="mt-2">Access Your Account</DialogTitle>
          <DialogDescription>
            Manage your multi-asset portfolio, earn DVT, and link your hardware wallets.
          </DialogDescription>
        </DialogHeader>
        <p className="rounded-md border border-warning/25 bg-warning/5 p-3 text-center text-[10px] leading-relaxed text-muted-foreground">
          Your account, profile and linked wallets are saved securely. Use a password you don't use
          elsewhere.
        </p>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList
            className={`grid w-full ${profile.isAuthenticated ? "grid-cols-2" : "grid-cols-1"}`}
          >
            <TabsTrigger value="account">
              {profile.isAuthenticated ? "Account" : "Email"}
            </TabsTrigger>
            {profile.isAuthenticated && <TabsTrigger value="wallets">Linked Wallets</TabsTrigger>}
          </TabsList>
          <TabsContent value="account" className="mt-4">
            {profile.isAuthenticated ? (
              <div className="rounded-md border border-success/25 bg-success/5 p-4">
                <p className="text-sm font-medium">
                  {profile.displayName ?? profile.email ?? "Your DepVest account"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{profile.email ?? "Signed in"}</p>
              </div>
            ) : (
              <>
                {recoveryMode ? (
                  <form onSubmit={submitPasswordReset} className="space-y-3">
                    <p className="text-sm font-medium">Reset your password</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Enter your account email to request password recovery.
                    </p>
                    <label className="grid gap-1.5 text-xs font-medium">
                      Email
                      <span className="relative">
                        <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                          autoComplete="email"
                          type="email"
                          value={email}
                          onChange={(event) => {
                            setEmail(event.target.value);
                            setRecoverySent(false);
                          }}
                          className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          placeholder="you@example.com"
                          required
                        />
                      </span>
                    </label>
                    {error && (
                      <p role="alert" className="text-xs text-destructive">
                        {error}
                      </p>
                    )}
                    {recoverySent && (
                      <p role="status" className="text-xs text-success">
                        Recovery instructions requested for {email.trim()}.
                      </p>
                    )}
                    <Button type="submit" className="w-full rounded-full" disabled={submitting}>
                      {submitting && <LoaderCircle className="animate-spin" />}
                      {submitting ? "Please wait…" : "Request recovery"}
                    </Button>
                    <button
                      type="button"
                      className="w-full text-center text-xs text-success hover:underline"
                      onClick={() => {
                        setRecoveryMode(false);
                        setError("");
                        setRecoverySent(false);
                      }}
                    >
                      Back to sign in
                    </button>
                  </form>
                ) : (
                  <>
                    <div className="mb-4 flex items-center justify-center gap-2 text-xs">
                      <span
                        className={
                          !isSignUp ? "font-semibold text-success" : "text-muted-foreground"
                        }
                      >
                        Sign In
                      </span>
                      <button
                        type="button"
                        className="relative h-6 w-11 rounded-full border border-border bg-secondary p-0.5"
                        role="switch"
                        aria-checked={isSignUp}
                        aria-label="Toggle create account"
                        onClick={() => {
                          setIsSignUp((value) => !value);
                          setError("");
                          setRecoverySent(false);
                        }}
                      >
                        <span
                          className={`block size-4 rounded-full bg-success transition-transform ${isSignUp ? "translate-x-5" : ""}`}
                        />
                      </button>
                      <span
                        className={
                          isSignUp ? "font-semibold text-success" : "text-muted-foreground"
                        }
                      >
                        Create Account
                      </span>
                    </div>
                    <form onSubmit={submitEmail} className="space-y-3">
                      <label className="grid gap-1.5 text-xs font-medium">
                        Email
                        <span className="relative">
                          <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                          <input
                            autoComplete="email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            placeholder="you@example.com"
                            required
                          />
                        </span>
                      </label>
                      <label className="grid gap-1.5 text-xs font-medium">
                        Password
                        <input
                          autoComplete={isSignUp ? "new-password" : "current-password"}
                          type="password"
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          placeholder="At least 8 characters"
                          minLength={8}
                          required
                        />
                      </label>
                      {error && (
                        <p role="alert" className="text-xs text-destructive">
                          {error}
                        </p>
                      )}
                      <Button type="submit" className="w-full rounded-full" disabled={submitting}>
                        {submitting && <LoaderCircle className="animate-spin" />}
                        {submitting ? "Please wait…" : isSignUp ? "Create Account" : "Sign In"}
                      </Button>
                    </form>
                    {!isSignUp && (
                      <button
                        type="button"
                        className="mt-3 w-full text-center text-xs text-success hover:underline"
                        onClick={() => {
                          setRecoveryMode(true);
                          setError("");
                          setRecoverySent(false);
                        }}
                      >
                        Forgot Password?
                      </button>
                    )}
                    <div className="my-4 flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span className="h-px flex-1 bg-border" />
                      or
                      <span className="h-px flex-1 bg-border" />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full rounded-full"
                      onClick={() => void submitGoogle()}
                      disabled={submitting}
                    >
                      {submitting && <LoaderCircle className="animate-spin" />}
                      <GoogleMark />
                      Continue with Google
                    </Button>
                  </>
                )}
              </>
            )}
          </TabsContent>
          {profile.isAuthenticated && (
            <TabsContent value="wallets" className="mt-4 space-y-3">
              {profile.linkedWallets.length ? (
                profile.linkedWallets.map((wallet) => (
                  <div
                    key={`${wallet.provider}:${wallet.address}`}
                    className="flex items-center gap-3 rounded-md border border-border bg-background/40 p-3"
                  >
                    <span className="grid size-9 place-items-center rounded-md bg-secondary">
                      <WalletCards className="size-4 text-success" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium">{wallet.provider}</p>
                      <p className="truncate font-mono text-[10px] text-muted-foreground">
                        {wallet.address}
                      </p>
                    </div>
                    {wallet.isPrimary && (
                      <span className="rounded-full border border-success/30 bg-success/10 px-2 py-1 text-[9px] text-success">
                        Primary
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <p className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                  No wallets linked to this account.
                </p>
              )}
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-full"
                onClick={onLinkWallet}
              >
                <WalletCards />
                Link New Wallet
              </Button>
              <p className="flex items-start gap-2 text-[10px] leading-relaxed text-muted-foreground">
                <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-success" />
                Sign challenge to verify ownership. Never enter your private key or seed phrase.
              </p>
            </TabsContent>
          )}
        </Tabs>
        <p className="mt-2 border-t border-border pt-3 text-center text-[10px] leading-relaxed text-muted-foreground">
          DepVest uses non-custodial cryptographic verification. We will never ask for your private
          keys or seed phrase.
        </p>
      </DialogContent>
    </Dialog>
  );
}

function getAuthErrorMessage(error: unknown, isSignUp: boolean) {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  if (/weak|short|password.*(8|length)/.test(message))
    return "Password must be at least 8 characters.";
  if (/already|exists|registered|duplicate/.test(message))
    return "An account with this email already exists. Sign in instead.";
  if (/invalid|credential|unauthorized|password/.test(message))
    return "Email or password is incorrect.";
  if (isSignUp && message)
    return error instanceof Error
      ? error.message
      : "Unable to create your account. Please try again.";
  return error instanceof Error ? error.message : "Unable to continue. Please try again.";
}

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="size-4">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
        transform="translate(0 4)"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94a11.05 11.05 0 0 1-4.8 7.24l7.73 5.99c4.51-4.18 7.11-10.34 7.11-17.7Z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59a14.39 14.39 0 0 1 0-9.18l-7.98-6.19a23.95 23.95 0 0 0 0 21.56l7.98-6.19Z"
        transform="translate(0 4)"
      />
      <path
        fill="#34A853"
        d="M24 48c6.47 0 11.91-2.13 15.87-5.76l-7.73-5.99c-2.14 1.44-4.88 2.3-8.14 2.3-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
        transform="translate(0 -4)"
      />
    </svg>
  );
}
