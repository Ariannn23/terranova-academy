import { AttendanceStatus } from "@prisma/client";

export interface AttendanceRecord {
  id: string;
  enrollmentId: string;
  date: string | Date;
  status: AttendanceStatus;
  justification?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface AttendanceStats {
  percentage: string;
  totalDays: number;
  present: number;
  late: number;
  justifiedAbsences: number;
  unjustifiedAbsences: number;
}

export interface CalendarHandlers {
  prevMonth: () => void;
  nextMonth: () => void;
}
