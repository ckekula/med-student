import { LuMinus, LuPlus } from "react-icons/lu"

function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

interface AdjustButtonProps {
  label: string
  disabled: boolean
  onClick: () => void
  children: React.ReactNode
}

function AdjustButton({ label, disabled, onClick, children }: AdjustButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="shrink-0 rounded-full p-2 text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  )
}

interface TimerProps {
  timeLeft: number
  isExpired: boolean
  canDecrease: boolean
  canIncrease: boolean
  onDecrease: () => void
  onIncrease: () => void
}

export default function Timer({
  timeLeft,
  isExpired,
  canDecrease,
  canIncrease,
  onDecrease,
  onIncrease,
}: TimerProps) {
  return (
    <div className="w-full p-6 border rounded-lg bg-black">
      <div className="flex items-center justify-center gap-4 text-white">
        <AdjustButton
          label="Decrease time limit"
          disabled={!canDecrease}
          onClick={onDecrease}
        >
          <LuMinus className="size-4" />
        </AdjustButton>

        <div className="text-center">
          <div
            role="timer"
            className={`text-4xl font-mono font-semibold ${
              isExpired ? "text-red-500" : ""
            }`}
          >
            {formatClock(timeLeft)}
          </div>
          {isExpired && (
            <p role="status" className="mt-2 text-sm text-red-500">
              Time&apos;s up
            </p>
          )}
        </div>

        <AdjustButton
          label="Increase time limit"
          disabled={!canIncrease}
          onClick={onIncrease}
        >
          <LuPlus className="size-4" />
        </AdjustButton>
      </div>
    </div>
  )
}
