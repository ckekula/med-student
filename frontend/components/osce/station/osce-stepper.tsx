"use client"

import * as React from "react"
import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
  StepperContent,
} from "@/components/ui/stepper"
import { LuCheck, LuLoaderCircle } from "react-icons/lu"
import { useCountdown } from "@/hooks/use-countdown"
import HistoryChat, { type ChatMessage } from "./history-chat"
import SummaryChat from "./summary-chat"
import Timer from "./timer"

const DEFAULT_TIME_LIMIT_SECONDS = 15 * 60
const MIN_TIME_LIMIT_SECONDS = 60
const MAX_TIME_LIMIT_SECONDS = 60 * 60
const TIME_STEP_SECONDS = 60

export function OSCEStepper() {
  const [durationSeconds, setDurationSeconds] = React.useState(
    DEFAULT_TIME_LIMIT_SECONDS
  )
  const { timeLeft, isRunning, isExpired, start } =
    useCountdown(durationSeconds)

  const adjustDuration = React.useCallback((deltaSeconds: number) => {
    setDurationSeconds((current) =>
      Math.min(
        MAX_TIME_LIMIT_SECONDS,
        Math.max(MIN_TIME_LIMIT_SECONDS, current + deltaSeconds)
      )
    )
  }, [])

  // The time limit can only be changed before the timer starts.
  const canDecrease = !isRunning && durationSeconds > MIN_TIME_LIMIT_SECONDS
  const canIncrease = !isRunning && durationSeconds < MAX_TIME_LIMIT_SECONDS

  // Chat state lives here so it survives switching steps
  const [messages, setMessages] = React.useState<ChatMessage[]>([])

  // The timer starts when the first message is sent
  const handleSendMessage = React.useCallback(
    (message: ChatMessage) => {
      start()
      setMessages((previous) => [...previous, message])
    },
    [start]
  )

  const steps = [
    {
      title: "History and examinations",
      description: "Take the patient history and perform examinations",
      component: (
        <HistoryChat
          messages={messages}
          onSendMessage={handleSendMessage}
          isTimeUp={isExpired}
        />
      ),
    },
    {
      title: "Summary",
      description: "Present your summary",
      component: <SummaryChat />,
    },
  ]

  return (
    <div className="w-full p-12 mb-20">
      <Stepper
        className="w-full flex flex-row items-stretch justify-between gap-12"
        defaultValue={1}
        orientation="vertical"
        indicators={{
          completed: <LuCheck className="size-3.5" />,
          loading: <LuLoaderCircle className="size-3.5 animate-spin" />,
        }}
      >
        {/* Left column */}
        <div className="w-[320px] shrink-0 flex flex-col gap-4 h-full">
          <Timer
            timeLeft={timeLeft}
            isExpired={isExpired}
            canDecrease={canDecrease}
            canIncrease={canIncrease}
            onDecrease={() => adjustDuration(-TIME_STEP_SECONDS)}
            onIncrease={() => adjustDuration(TIME_STEP_SECONDS)}
          />

          {/* Stepper navigation */}
          <StepperNav className="w-full flex-1 p-8 border rounded-lg">
            {steps.map((step, index) => (
              <StepperItem
                key={step.title}
                step={index + 1}
                className="relative items-start not-last:flex-1"
              >
                <StepperTrigger className="items-start gap-2.5 pb-12 last:pb-0">
                  <StepperIndicator className="data-[state=completed]:bg-success data-[state=completed]:text-white">
                    {index + 1}
                  </StepperIndicator>

                  <div className="mt-0.5 text-left">
                    <StepperTitle>{step.title}</StepperTitle>
                    <StepperDescription>
                      {step.description}
                    </StepperDescription>
                  </div>
                </StepperTrigger>

                {index < steps.length - 1 && (
                  <StepperSeparator className="group-data-[state=completed]/step:bg-success absolute inset-y-0 top-7 left-3 -order-1 m-0 -translate-x-1/2 group-data-[orientation=vertical]/stepper-nav:h-[calc(100%-2rem)]" />
                )}
              </StepperItem>
            ))}
          </StepperNav>
        </div>

        {/* Chat */}
        <StepperPanel className="flex-1 min-w-0 p-4 border rounded-lg">
          {steps.map((step, index) => (
            <StepperContent key={step.title} value={index + 1}>
              {step.component}
            </StepperContent>
          ))}
        </StepperPanel>
      </Stepper>
    </div>
  )
}
