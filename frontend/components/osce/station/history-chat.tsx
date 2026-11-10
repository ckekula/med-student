"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bubble, BubbleContent, BubbleGroup } from "@/components/ui/bubble"
import { Message, MessageAvatar, MessageContent } from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import { ChatComposer } from "./chat-composer"
import { ChatMessage } from "@/types/osce/historyChat"

type HistoryChatProps = {
  messages: readonly ChatMessage[]
  isPending: boolean
  error: string | null
  isTimeUp: boolean
  isReadOnly: boolean
  onSendMessage: (content: string) => Promise<boolean>
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
  isPending,
  error,
  isReadOnly,
}: HistoryChatProps) {
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
                          <AvatarImage
                            src={first.avatarSrc}
                            alt="@avatar"
                          />
                          <AvatarFallback>
                            {first.avatarFallback}
                          </AvatarFallback>
                        </Avatar>
                      </MessageAvatar>

                      <MessageContent>
                        {group.length > 1 ? (
                          <BubbleGroup>
                            {group.map((message) => (
                              <Bubble
                                key={message.id}
                                variant={
                                  message.role === "ai" ? "muted" : undefined
                                }
                              >
                                <BubbleContent>
                                  {message.content}
                                </BubbleContent>
                              </Bubble>
                            ))}
                          </BubbleGroup>
                        ) : (
                          <Bubble
                            variant={
                              first.role === "ai" ? "muted" : undefined
                            }
                          >
                            <BubbleContent>
                              {first.content}
                            </BubbleContent>
                          </Bubble>
                        )}
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                )
              })}

              {isPending && (
                <MessageScrollerItem messageId="typing-indicator">
                  <Message>
                    <MessageContent>
                      <Bubble variant="muted">
                        <BubbleContent>
                          Patient is typing…
                        </BubbleContent>
                      </Bubble>
                    </MessageContent>
                  </Message>
                </MessageScrollerItem>
              )}
            </MessageScrollerContent>
          </MessageScrollerViewport>

          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>

      {error && (
        <p role="alert" className="px-4 pb-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <ChatComposer
        isTimeUp={isTimeUp}
        isPending={isPending}
        isReadOnly={isReadOnly}
        onSend={onSendMessage}
      />
    </div>
  )
}
