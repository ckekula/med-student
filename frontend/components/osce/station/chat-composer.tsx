import { useState } from "react"
import { SignUpButton, useAuth } from "@clerk/nextjs"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { EXAMINATION_OPTIONS } from "@/lib/osce/longCaseOptions"

const COMPOSER_MODES = ["history", "examinations"] as const
type ComposerMode = (typeof COMPOSER_MODES)[number]

const MODE_LABELS: Record<ComposerMode, string> = {
  history: "History",
  examinations: "Examinations",
}

const isComposerMode = (value: string): value is ComposerMode =>
  (COMPOSER_MODES as readonly string[]).includes(value)

interface ChatComposerProps {
  isTimeUp: boolean
  isPending: boolean
  isReadOnly: boolean
  onSend: (content: string) => Promise<boolean>
}

export function ChatComposer({ isTimeUp, onSend, isPending, isReadOnly }: ChatComposerProps) {
  const { isLoaded, isSignedIn } = useAuth()
  const [mode, setMode] = useState<ComposerMode>("history")
  const [draft, setDraft] = useState("")
  const [examinationId, setExaminationId] = useState("")

  const selectedExamination = EXAMINATION_OPTIONS.find(
    (examination) => examination.value === examinationId,
  )
  const content = mode === "history" ? draft.trim() : (selectedExamination?.label ?? "")

  const isLocked = isTimeUp || isReadOnly
  const canSend = isLoaded && !isLocked && !isPending && mode === "history" && content.length > 0

  const handleSubmit = async () => {
    if (!canSend || !isSignedIn) return
    const sent = await onSend(content)
    if (!sent) return // keep the draft so the user can retry
    setDraft((current) => (current.trim() === content ? "" : current))
  }

  return (
    <form
      className="flex flex-col gap-3 border-t p-4"
      onSubmit={(event) => {
        event.preventDefault()
        handleSubmit()
      }}
    >
      <Tabs
        value={mode}
        onValueChange={(value) => isComposerMode(value) && setMode(value)}
      >
        <TabsList className="w-fit">
          {COMPOSER_MODES.map((value) => (
            <TabsTrigger key={value} value={value} disabled={isTimeUp} className="cursor-pointer">
              {MODE_LABELS[value]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex items-end gap-2">
        {mode === "history" ? (
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey &&
                !event.nativeEvent.isComposing
              ) {
                event.preventDefault()
                event.currentTarget.form?.requestSubmit()
              }
            }}
            placeholder={isTimeUp ? "Time's up" : "Type a message..."}
            className="field-sizing-content max-h-40 min-h-11 flex-1 resize-none"
            aria-label="Message"
            disabled={isTimeUp}
          />
        ) : (
          <Select
            value={examinationId}
            onValueChange={(value) => {
              if (value !== null) {setExaminationId(value)}
            }}
            disabled={isTimeUp}
          >
            <SelectTrigger className="h-11 flex-1" aria-label="Examination">
              <SelectValue
                placeholder={isTimeUp ? "Time's up" : "Select an examination"}
              />
            </SelectTrigger>
            <SelectContent>
              {EXAMINATION_OPTIONS.map((exam) => (
                <SelectItem key={exam.value} value={exam.value}>
                  {exam.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {isSignedIn ? (
          <Button type="submit" disabled={!canSend}>
            Send
          </Button>
        ) : (
          <SignUpButton mode="modal">
            <Button type="submit" disabled={!canSend}>
              Send
            </Button>
          </SignUpButton>
        )}
      </div>
    </form>
  )
}
