export interface ChatComposerProps {
  isTimeUp: boolean
  onSend: (content: string) => void
}

export type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  avatarSrc: string
  avatarFallback: string
}

export type HistoryChatProps = {
  /** Owned by the parent so the conversation survives step changes. */
  messages: readonly ChatMessage[]
  onSendMessage: (message: ChatMessage) => void
  isTimeUp: boolean
}