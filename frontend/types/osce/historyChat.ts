import { LongCaseAttemptMessageRead } from "./longCaseAttempt"

export interface ChatComposerProps {
  isTimeUp: boolean
  onSend: (content: string) => void
}

export type ChatMessage = {
  id: string
  role: "user" | "ai"
  content: string
  avatarSrc: string
  avatarFallback: string
}

const AVATARS = {
  user: { avatarSrc: "/avatars/10.png", avatarFallback: "R" },
  ai: { avatarSrc: "/avatars/patient.png", avatarFallback: "P" }, // TODO: your patient avatar
} as const

export function toChatMessage(
  message: Pick<LongCaseAttemptMessageRead, "id" | "sender" | "content">,
): ChatMessage {
  const role = message.sender === "user" ? "user" : "ai"
  return { id: message.id, role, content: message.content, ...AVATARS[role] }
}

export type HistoryChatProps = {
  messages: readonly ChatMessage[]
  isPending: boolean
  error: string | null
  isTimeUp: boolean
  isReadOnly: boolean
  onSendMessage: (content: string) => Promise<boolean>
}