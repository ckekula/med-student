import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { HISTORY_ITEM_CATEGORY_LABELS } from "@/lib/osce/longCaseOptions";
import { HISTORY_ITEM_CATEGORY } from "@medstudent/api-types/enums";
import type { LongCaseDetail, PatientProfile } from "@/types/osce/longCase";

const formatPoints = (points: number) => `${points} ${points === 1 ? "pt" : "pts"}`;

function DetailSection({ title, count, children }: { title: string; count?: number; children: ReactNode }) {
  return (
    <section className="grid content-start gap-3">
      <h4 className="text-sm font-semibold">
        {title}
        {count !== undefined && <span className="text-muted-foreground ml-1.5 font-normal">({count})</span>}
      </h4>
      {children}
    </section>
  );
}

const Empty = ({ children }: { children: ReactNode }) => <p className="text-muted-foreground text-sm">{children}</p>;

function ProfileList({ profile }: { profile: PatientProfile }) {
  const rows: [string, string | number | null][] = [
    ["Name", profile.name],
    ["Age", profile.age],
    ["Sex", profile.sex],
    ["Marital status", profile.marital_status],
    ["Occupation", profile.occupation],
    ["Location", profile.location],
    ["Height", profile.height_cm === null ? null : `${profile.height_cm} cm`],
    ["Weight", profile.weight_kg === null ? null : `${profile.weight_kg} kg`],
  ];

  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt className="text-muted-foreground text-xs">{label}</dt>
          <dd className="font-medium">{value ?? "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

export function LongCaseDetails({ details }: { details: LongCaseDetail }) {
  const historyGroups = HISTORY_ITEM_CATEGORY.map((category) => ({
    category,
    items: details.history_items.filter((item) => item.category === category),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="grid gap-8">
      {details.description && <p className="max-w-prose text-sm whitespace-pre-wrap">{details.description}</p>}

      <DetailSection title="Patient profile">
        {details.patient_profile ? <ProfileList profile={details.patient_profile} /> : <Empty>No patient profile.</Empty>}
      </DetailSection>

      <DetailSection title="History" count={details.history_items.length}>
        {historyGroups.length === 0 ? (
          <Empty>No history items.</Empty>
        ) : (
          <div className="grid gap-4">
            {historyGroups.map(({ category, items }) => (
              <div key={category} className="grid gap-2">
                <h5 className="text-muted-foreground text-xs font-medium">{HISTORY_ITEM_CATEGORY_LABELS[category]}</h5>
                <ul className="grid gap-2">
                  {items.map((item) => (
                    <li key={item.id} className="flex items-start justify-between gap-3 text-sm">
                      <span className="whitespace-pre-wrap">{item.description}</span>
                      <span className="flex shrink-0 items-center gap-1.5">
                        <Badge variant="secondary">{formatPoints(item.points)}</Badge>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </DetailSection>

      <div className="grid gap-8 lg:grid-cols-2">
        <DetailSection title="Examinations" count={details.examinations.length}>
          {details.examinations.length === 0 ? (
            <Empty>No examinations.</Empty>
          ) : (
            <ul className="grid gap-3">
              {details.examinations.map((item) => (
                <li key={item.id} className="grid gap-1 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium">{item.name}</span>
                    <Badge variant="secondary">{formatPoints(item.points)}</Badge>
                  </div>
                  <p className="text-muted-foreground whitespace-pre-wrap">{item.findings}</p>
                </li>
              ))}
            </ul>
          )}
        </DetailSection>

        <DetailSection title="Investigations" count={details.investigations.length}>
          {details.investigations.length === 0 ? (
            <Empty>No investigations.</Empty>
          ) : (
            <ul className="grid gap-3">
              {details.investigations.map((item) => (
                <li key={item.id} className="grid gap-1 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium">{item.name}</span>
                    <Badge variant="secondary">{formatPoints(item.points)}</Badge>
                  </div>
                  <p className="text-muted-foreground whitespace-pre-wrap">{item.findings}</p>
                </li>
              ))}
            </ul>
          )}
        </DetailSection>
      </div>

      <DetailSection title="Differential diagnosis">
        {!details.differential_diagnosis ? (
          <Empty>No differential diagnosis.</Empty>
        ) : (
          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            {Object.entries(details.differential_diagnosis).filter(([key]) => !["id", "long_case_id", "created_at", "updated_at"].includes(key)).map(([key, value]) => (
              <div key={key}>
                <dt className="text-muted-foreground text-xs capitalize">{key.replaceAll("_", " ")}</dt>
                <dd className="whitespace-pre-wrap">{value ?? "—"}</dd>
              </div>
            ))}
          </dl>
        )}
      </DetailSection>
    </div>
  );
}
