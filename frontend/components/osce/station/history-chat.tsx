"use client"

import * as React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bubble, BubbleContent, BubbleGroup } from "@/components/ui/bubble"
import { Button } from "@/components/ui/button"
import { Message, MessageAvatar, MessageContent } from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import { Textarea } from "@/components/ui/textarea"

export type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  avatarSrc: string
  avatarFallback: string
}

type HistoryChatProps = {
  /** Owned by the parent so the conversation survives step changes. */
  messages: readonly ChatMessage[]
  onSendMessage: (message: ChatMessage) => void
  isTimeUp: boolean
}

function groupMessages(messages: readonly ChatMessage[]) {
  const groups: ChatMessage[][] = []

  for (const message of messages) {
    const lastGroup = groups[groups.length - 1]

    if (lastGroup && lastGroup[0].role === message.role) {
      lastGroup.push(message)
    } else {
      groups.push([message])
    }
  }

  return groups
}

export default function HistoryChat({
  messages,
  onSendMessage,
  isTimeUp,
}: HistoryChatProps) {
  const [draft, setDraft] = React.useState("")

  const handleSend = () => {
    const content = draft.trim()

    if (!content || isTimeUp) return

    onSendMessage({
      id: crypto.randomUUID(),
      role: "user",
      content,
      avatarSrc: "/avatars/10.png",
      avatarFallback: "R",
    })
    setDraft("")
  }

  const groups = groupMessages(messages)

  return (
    <div className="flex h-120 w-full flex-col">
      <MessageScrollerProvider autoScroll>
        <MessageScroller className="min-h-0 flex-1">
          <MessageScrollerViewport>
            <MessageScrollerContent className="flex flex-col gap-6 py-12">
              {groups.map((group) => {
                const first = group[0]

                return (
                  <MessageScrollerItem
                    key={first.id}
                    messageId={first.id}
                    scrollAnchor={first.role === "user"}
                  >
                    <Message align={first.role === "user" ? "end" : undefined}>
                      <MessageAvatar>
                        <Avatar>
                          <AvatarImage src={first.avatarSrc} alt="@avatar" />
                          <AvatarFallback>{first.avatarFallback}</AvatarFallback>
                        </Avatar>
                      </MessageAvatar>

                      <MessageContent>
                        {group.length > 1 ? (
                          <BubbleGroup>
                            {group.map((message) => (
                              <Bubble
                                key={message.id}
                                variant={message.role === "assistant" ? "muted" : undefined}
                              >
                                <BubbleContent>{message.content}</BubbleContent>
                              </Bubble>
                            ))}
                          </BubbleGroup>
                        ) : (
                          <Bubble variant={first.role === "assistant" ? "muted" : undefined}>
                            <BubbleContent>{first.content}</BubbleContent>
                          </Bubble>
                        )}
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                )
              })}
            </MessageScrollerContent>
          </MessageScrollerViewport>

          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>

      <div className="flex items-end gap-2 border-t p-4">
        <Textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={isTimeUp ? "Time's up" : "Type a message..."}
          className="min-h-11 flex-1 resize-none"
          aria-label="Message"
          disabled={isTimeUp}
        />

        <Button
          onClick={handleSend}
          disabled={isTimeUp || draft.trim().length === 0}
        >
          Send
        </Button>
      </div>
    </div>
  )
}