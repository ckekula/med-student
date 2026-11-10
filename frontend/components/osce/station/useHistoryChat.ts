"use client"

import * as React from "react"
import { useAuth } from "@clerk/nextjs"

import { ApiError } from "@/lib/api/client" // adjust import path
import { sendChatMessage } from "@/lib/api/longCaseAttempt"
import { ChatMessage, toChatMessage } from "@/types/osce/historyChat"

function toErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 401:
        return "Your session has expired. Please sign in again."
      case 409:
        return "This attempt is no longer accepting messages."
      case 422:
        return "Your message is invalid. Please shorten it and try again."
      case 502:
      case 504:
        return "The patient couldn't respond. Please try again."
    }
  }
  return "Something went wrong. Please try again."
}

const isAbortError = (error: unknown) =>
  error instanceof DOMException && error.name === "AbortError"

interface UseHistoryChatOptions {
  attemptId: string | null
  initialMessages: readonly ChatMessage[]
}

export function useHistoryChat({ attemptId, initialMessages }: UseHistoryChatOptions) {
  const { getToken } = useAuth()
  const [messages, setMessages] = React.useState<ChatMessage[]>([...initialMessages])
  const [isPending, setIsPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const controllerRef = React.useRef<AbortController | null>(null)
  const pendingRef = React.useRef(false) // sync guard against double submits

  React.useEffect(() => () => controllerRef.current?.abort(), [])

  /** Resolves true when the patient replied; on failure the optimistic message is rolled back. */
  const send = React.useCallback(
    async (content: string): Promise<boolean> => {
      if (!attemptId || pendingRef.current) return false
      pendingRef.current = true

      const optimistic = toChatMessage({ id: crypto.randomUUID(), sender: "user", content })
      const controller = new AbortController()
      controllerRef.current = controller

      setMessages((prev) => [...prev, optimistic])
      setIsPending(true)
      setError(null)

      try {
        const reply = await sendChatMessage(getToken, attemptId, content, {
          signal: controller.signal,
        })
        setMessages((prev) => [...prev, toChatMessage(reply)])
        return true
      } catch (err) {
        console.log("sendChatMessage: ", err)
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
        if (!isAbortError(err)) setError(toErrorMessage(err))
        return false
      } finally {
        pendingRef.current = false
        setIsPending(false)
      }
    },
    [attemptId, getToken],
  )

  return { messages, isPending, error, send }
}
