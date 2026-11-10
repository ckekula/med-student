"use client";

import { useEffect, useRef } from "react";
import { useClerk } from "@clerk/nextjs";

export function SignupModal() {
  const { loaded, user, openSignUp } = useClerk();
  const hasOpened = useRef(false);

  useEffect(() => {
    if (loaded && user === null && !hasOpened.current) {
      hasOpened.current = true;
      openSignUp();
    }
  }, [loaded, user, openSignUp]);

  return null;
}