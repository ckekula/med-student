import { useState } from "react"

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

const COMPOSER_MODES = ["history", "examinations"] as const
type ComposerMode = (typeof COMPOSER_MODES)[number]

const MODE_LABELS: Record<ComposerMode, string> = {
  history: "History",
  examinations: "Examinations",
}

// TODO: replace with real data
const EXAMINATIONS = [
  { id: "exam-cbc", name: "Complete Blood Count" },
  { id: "exam-lft", name: "Liver Function Test" },
  { id: "exam-ecg", name: "Electrocardiogram" },
  { id: "exam-cxr", name: "Chest X-Ray" },
] as const

const isComposerMode = (value: string): value is ComposerMode =>
  (COMPOSER_MODES as readonly string[]).includes(value)

interface ChatComposerProps {
  isTimeUp: boolean
  onSend: (content: string) => void
}

export function ChatComposer({ isTimeUp, onSend }: ChatComposerProps) {
  const [mode, setMode] = useState<ComposerMode>("history")
  const [draft, setDraft] = useState("")
  const [examinationId, setExaminationId] = useState("")

  const selectedExamination = EXAMINATIONS.find((e) => e.id === examinationId)
  const content =
    mode === "history" ? draft.trim() : (selectedExamination?.name ?? "")
  const canSend = !isTimeUp && content.length > 0

  const handleSubmit = () => {
    if (!canSend) return
    onSend(content)
    if (mode === "history") setDraft("")
    else setExaminationId("")
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
            onValueChange={setExaminationId}
            disabled={isTimeUp}
          >
            <SelectTrigger className="h-11 flex-1" aria-label="Examination">
              <SelectValue
                placeholder={isTimeUp ? "Time's up" : "Select an examination"}
              />
            </SelectTrigger>
            <SelectContent>
              {EXAMINATIONS.map((exam) => (
                <SelectItem key={exam.id} value={exam.id}>
                  {exam.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Button type="submit" disabled={!canSend}>
          Send
        </Button>
      </div>
    </form>
  )
}
