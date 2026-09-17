import {
  Stepper,
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper"
import { LuCheck, LuLoaderCircle } from "react-icons/lu"
import HistoryChat from "./history-chat"

const steps = [
  { title: "History", description: "Take the medical history", component: <HistoryChat /> },
  { title: "Examinations", description: "Perform examinations", component: "Examinations" },
  { title: "Summary", description: "Present your summary", component: "Summary" },
]

export function OSCEStepper() {
  return (
    <div className="w-full p-12 mb-20">
      <Stepper
        className="w-full flex flex-row items-start justify-between gap-12"
        defaultValue={2}
        orientation="vertical"
        indicators={{
          completed: <LuCheck className="size-3.5" />,
          loading: <LuLoaderCircle className="size-3.5 animate-spin" />,
        }}
      >
        <StepperNav className="p-8 border rounded-lg">
          {steps.map((step, index) => (
            <StepperItem
              key={index}
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

        <StepperPanel className="p-4 border rounded-lg">
          {steps.map((step, index) => (
            <StepperContent key={index} value={index + 1}>
              {step.component}
            </StepperContent>
          ))}
        </StepperPanel>
      </Stepper>
    </div>
  )
}