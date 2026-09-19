export interface LongCaseAttempt {
    id: string;
    student_id: string;
    long_case_id: string;
    status: string;
    started_at: string;
    history_completed_at: string | null;
    examination_completed_at: string | null;
    summary_completed_at: string | null;
    evaluated_at: string | null;
    total_score: number | null;
    createdAt: string;
    updatedAt: string;
}

export interface LongCaseAttemptMessage {
    id: string;
    attempt_id: string;
    sender: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}

export interface LongCaseAttemptExaminationSelection {
    id: string;
    attempt_id: string;
    exmination_name: string;
    createdAt: string;
    updatedAt: string;
}
