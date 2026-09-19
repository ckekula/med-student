"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const TICK_MS = 250;

/**
 * Countdown based on a fixed deadline (Date.now()), so it stays accurate
 * even when the browser throttles timers in background tabs.
 * Call start() to begin; repeated calls are ignored.
 */
export function useCountdown(durationSeconds: number) {
  const deadlineRef = useRef<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  const start = useCallback(() => {
    if (deadlineRef.current !== null) return;

    deadlineRef.current = Date.now() + durationSeconds * 1000;
    setIsRunning(true);
  }, [durationSeconds]);

  useEffect(() => {
    const deadline = deadlineRef.current;
    if (!isRunning || deadline === null) return;

    const tick = () => {
      const remaining = Math.max(
        0,
        Math.ceil((deadline - Date.now()) / 1000)
      );
      setRemainingSeconds(remaining);

      if (remaining === 0) window.clearInterval(intervalId);
    };

    const intervalId = window.setInterval(tick, TICK_MS);
    return () => window.clearInterval(intervalId);
  }, [isRunning]);

  const timeLeft = remainingSeconds ?? durationSeconds;

  return { timeLeft, isRunning, isExpired: isRunning && timeLeft === 0, start };
}