"use client";

import { useRouter } from "next/navigation";
import SignupForm from "@/components/auth/signup-form";
import { authClient } from "@/lib/auth-client";

export default function SignupPage() {
  const router = useRouter();

  async function handleSubmit(data: { name: string; email: string; password: string }) {
    const { error } = await authClient.signUp.email({
      name: data.name,
      email: data.email,
      password: data.password,
    });

    if (error) {
      throw new Error(error.message ?? "Signup failed");
    }

    router.push("/dashboard");
  }

  async function handleGoogleSignup() {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
  }

  return <SignupForm onSubmit={handleSubmit} onGoogleSignup={handleGoogleSignup} />;
}