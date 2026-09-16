"use client";

import { useState, SubmitEvent } from "react";
import { z } from "zod";
import { FaGoogle } from "react-icons/fa";
import { LuEye, LuEyeOff } from "react-icons/lu";

type SignupData = {
  name: string;
  email: string;
  password: string;
};

type SignupFormProps = {
  onSubmit?: (data: SignupData) => Promise<void> | void;
  onGoogleSignup?: () => Promise<void> | void;
};

const signupSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.email("Enter a valid email").trim().min(1, "Email is required"),
  password: z
		.string()
		.min(8, { message: "Password must be at least 8 characters long" })
		.max(100, { message: "Password cannot exceed 100 characters" })
		.regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
		.regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
		.regex(/[0-9]/, { message: "Password must contain at least one number" })
		.regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character" })
});

type FieldErrors = Partial<Record<keyof SignupData, string>>;

const inputClass = `
  h-11 w-full rounded-lg border-0 bg-white px-3.5 text-sm
  text-neutral-900 shadow-sm ring-1 ring-inset ring-neutral-200
  outline-none transition
  placeholder:text-neutral-400
  focus:ring-2 focus:ring-neutral-400
  dark:bg-neutral-950 dark:text-white
  dark:ring-neutral-800 dark:placeholder:text-neutral-600
  dark:focus:ring-neutral-600
  disabled:cursor-not-allowed disabled:opacity-60
`;

const inputErrorClass = `ring-red-400 focus:ring-red-400 dark:ring-red-500 dark:focus:ring-red-500`;

const dividerLineClass = `
  h-px flex-1
  bg-[repeating-linear-gradient(to_right,var(--color-neutral-300)_0,var(--color-neutral-300)_6px,transparent_6px,transparent_12px)]
  dark:bg-[repeating-linear-gradient(to_right,var(--color-neutral-800)_0,var(--color-neutral-800)_6px,transparent_6px,transparent_12px)]
`;

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-xs text-red-500">
      {message}
    </p>
  );
}

function PasswordRules({ password }: { password: string }) {
  const rules = [
    {
      label: "At least 8 characters",
      valid: password.length >= 8,
    },
    {
      label: "At least one uppercase letter",
      valid: /[A-Z]/.test(password),
    },
    {
      label: "At least one lowercase letter",
      valid: /[a-z]/.test(password),
    },
    {
      label: "At least one number",
      valid: /[0-9]/.test(password),
    },
    {
      label: "At least one special character",
      valid: /[^A-Za-z0-9]/.test(password),
    },
  ];

  return (
    <ul className="mt-2 space-y-1.5 text-xs">
      {rules.map((rule) => (
        <li
          key={rule.label}
          className={`flex items-center gap-2 ${
            rule.valid
              ? "text-green-600 dark:text-green-400"
              : "text-neutral-400 dark:text-neutral-500"
          }`}
        >
          <span
            className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${
              rule.valid
                ? "bg-green-100 dark:bg-green-950"
                : "bg-neutral-100 dark:bg-neutral-900"
            }`}
          >
            {rule.valid ? "✓" : "•"}
          </span>

          {rule.label}
        </li>
      ))}
    </ul>
  );
}

export default function SignupForm({ onSubmit, onGoogleSignup }: SignupFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
	const [password, setPassword] = useState("");

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const form = new FormData(event.currentTarget);
    const raw = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    };

    const result = signupSchema.safeParse(raw);

    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof SignupData;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      await onSubmit?.(result.data);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleClick() {
    setFormError(null);
    setIsGoogleSubmitting(true);
    try {
      await onGoogleSignup?.();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Google sign-up failed. Please try again.");
    } finally {
      setIsGoogleSubmitting(false);
    }
  }

  const busy = isSubmitting || isGoogleSubmitting;

  return (
    <main className="min-h-screen bg-white px-6 text-neutral-950 antialiased dark:bg-neutral-950 dark:text-white">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-md items-center justify-center">
        <section className="w-full">
          {/* Heading */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
            <p className="mt-2 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
              Join a community of <span className="font-semibold">1000+</span> Medical Students.
            </p>
          </div>

          {formError && (
            <div
              role="alert"
              className="mb-5 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600 ring-1 ring-inset ring-red-200 dark:bg-red-950/40 dark:text-red-400 dark:ring-red-900"
            >
              {formError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Name */}
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="John Doe"
                disabled={busy}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
                className={`${inputClass} ${errors.name ? inputErrorClass : ""}`}
              />
              <FieldError id="name-error" message={errors.name} />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                disabled={busy}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                className={`${inputClass} ${errors.email ? inputErrorClass : ""}`}
              />
              <FieldError id="email-error" message={errors.email} />
            </div>

            {/* Password */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  Password
                </label>
              </div>

              <div className="relative">
								<input
									id="password"
									name="password"
									type={showPassword ? "text" : "password"}
									autoComplete="new-password"
									placeholder="••••••••"
									value={password}
									onChange={(event) => {
											setPassword(event.target.value);

											// Clear the submit-time password error while typing
											if (errors.password) {
													setErrors((current) => ({
															...current,
															password: undefined,
													}));
											}
									}}
									disabled={busy}
									aria-invalid={!!errors.password}
									aria-describedby={errors.password ? "password-error" : undefined}
									className={`${inputClass} pr-20 ${errors.password ? inputErrorClass : ""}`}
								/>

								<button
									type="button"
									onClick={() => setShowPassword((value) => !value)}
									disabled={busy}
									aria-pressed={showPassword}
									aria-label={showPassword ? "Hide password" : "Show password"}
									className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-neutral-500 transition hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-60 dark:text-neutral-400 dark:hover:text-white"
								>
									{showPassword ? <LuEyeOff size={18} /> : <LuEye size={18} />}
								</button>
							</div>

							{password.length > 0 && <PasswordRules password={password} />}
							<FieldError id="password-error" message={errors.password} />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={busy}
              className="
                group relative flex h-11 w-full items-center justify-center
                overflow-hidden rounded-lg bg-neutral-950 px-4 text-sm
                font-medium text-white shadow-sm transition
                hover:bg-neutral-800
                focus:outline-none focus:ring-2 focus:ring-neutral-400
                focus:ring-offset-2 focus:ring-offset-white
                disabled:cursor-not-allowed disabled:opacity-70
                dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200
                dark:focus:ring-neutral-600 dark:focus:ring-offset-neutral-950
              "
            >
              {isSubmitting ? "Creating account…" : "Create account"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-7 flex items-center gap-4">
            <div className={dividerLineClass} />
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">or</span>
            <div className={dividerLineClass} />
          </div>

          {/* Social */}
          <div className="grid grid-cols-1 gap-3">
            <button
              type="button"
              onClick={handleGoogleClick}
              disabled={busy}
              className="
                flex h-11 items-center justify-center gap-2 rounded-lg
                bg-white text-sm font-medium text-neutral-700
                shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)]
                transition hover:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.16),0_2px_6px_rgba(0,0,0,0.06)]
                disabled:cursor-not-allowed disabled:opacity-60
                dark:bg-neutral-950 dark:text-neutral-200
                dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12),0_1px_2px_rgba(0,0,0,0.2)]
                dark:hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2),0_2px_6px_rgba(0,0,0,0.25)]
              "
            >
              <FaGoogle />
              {isGoogleSubmitting ? "Connecting…" : "Google"}
            </button>
          </div>

          {/* Footer */}
          <p className="mt-7 text-center text-sm text-neutral-500 dark:text-neutral-400">
            Already have an account?{" "}
            <a
              href="/login"
              className="font-medium text-neutral-950 underline underline-offset-4 transition hover:text-neutral-600 dark:text-white dark:hover:text-neutral-300"
            >
              Sign in
            </a>
          </p>

          {/* Terms */}
          <p className="mt-6 text-center text-xs leading-5 text-neutral-400 dark:text-neutral-500">
            By creating an account, you agree to our{" "}
            <a href="/terms" className="underline underline-offset-2">
              Terms
            </a>{" "}
            and{" "}
            <a href="/privacy" className="underline underline-offset-2">
              Privacy Policy
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
