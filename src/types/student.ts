import type { ReceiptData } from "@/lib/actions/payment.actions";

export type StudentGuardianView = {
  id?: string;
  firstName: string;
  lastName: string;
  dni?: string;
  relation?: string;
  phone?: string;
  email?: string | null;
  address?: string | null;
  isPrimary?: boolean;
};

export type StudentFormInitialData = {
  id: string;
  firstName?: string;
  lastName?: string;
  dni?: string;
  birthDate?: Date | string | null;
  gender?: string;
  address?: string | null;
  photoUrl?: string | null;
  guardians?: StudentGuardianView[];
};

export type StudentAttendanceView = {
  id: string;
  date: Date | string;
  status: string;
  justification?: string | null;
};

export type StudentPaymentView = {
  id: string;
  amount: number;
  balance?: number | null;
  status: string;
  dueDate: Date | string;
  paidAt?: Date | string | null;
  method?: string | null;
  concept: {
    name: string;
  };
  receipt?: ReceiptData | null;
};

export type StudentIncidentView = {
  id: string;
  date: Date | string;
  description: string;
  severity?: string | null;
  type?: string | null;
  actionTaken?: string | null;
};

export type StudentDisabilityView = {
  id: string;
  reason: string;
  description?: string | null;
  details?: string | null;
  createdAt?: Date | string | null;
  startDate: Date | string;
  endDate?: Date | string | null;
  active?: boolean;
  resolvedNote?: string | null;
};

export type StudentGradeView = {
  period: string;
  score: number | null;
  isConfigured?: boolean;
};

export type StudentCourseGradesView = {
  courseName: string;
  grades: StudentGradeView[];
};
