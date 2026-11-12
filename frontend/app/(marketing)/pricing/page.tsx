// app/pricing/page.tsx
import Link from "next/link"
import { LuCheck } from "react-icons/lu"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const PRICING = {
  fullPrice: 3500,
  launchPrice: 2450,
  discountLabel: "30% off",
  discountedSpots: 50,
  spotsTaken: 0,
  accessMonths: 12,
  checkoutHref: "/", // TODO: point to checkout once the gateway is chosen
} as const

const FEATURES = [
  "Access to all long/short cases",
  "AI-simulated patient for history taking",
  "Examination and investigation practice",
  "Summary and discussion with an AI consultant",
  "Automated marking and feedback",
] as const

const formatLkr = (amount: number) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(amount)

export default function PricingPage() {
  const spotsLeft = Math.max(PRICING.discountedSpots - PRICING.spotsTaken, 0)
  const isDiscountActive = spotsLeft > 0
  const price = isDiscountActive ? PRICING.launchPrice : PRICING.fullPrice

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-8 px-4 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-bold">One plan. No monthly subscription</h1>
        <p className="mt-2 text-gray-700">
          For students who want complete exam preparation.
        </p>
      </div>

      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-xl">Full Access</CardTitle>
            {isDiscountActive && (
              <Badge className="bg-success text-green-700">
                {PRICING.discountLabel}
              </Badge>
            )}
          </div>
          <CardDescription>
            {isDiscountActive ? (
              <>
                Launch offer for the first {PRICING.discountedSpots} students.{" "}
                <span className="font-bold">
                  {spotsLeft} spots left.
                </span>
              </>
            ) : (
              "Complete access for an entire year."
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{formatLkr(price)}</span>
            {isDiscountActive && (
              <span className="text-lg text-muted-foreground line-through">
                {formatLkr(PRICING.fullPrice)}
              </span>
            )}
          </div>

          <Separator />

          <ul className="flex flex-col gap-3">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm">
                <LuCheck
                  className="mt-0.5 size-4 shrink-0 text-success"
                  aria-hidden
                />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>

        <CardFooter>
          <Button
            size="lg"
            className="w-full"
            nativeButton={false}
            render={<Link href={PRICING.checkoutHref} />}
          >
            Get access
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
