import { AttendanceStatus } from "@prisma/client";

export interface AttendanceRecord {
  id: string;
  enrollmentId: string;
  date: string | Date;
  status: AttendanceStatus;
  justification?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface AttendanceStats {
  percentage: string | number;
  totalDays: number;
  present?: number;
  presente?: number;
  late?: number;
  tardanza?: number;
  justifiedAbsences?: number;
  justificada?: number;
  unjustifiedAbsences?: number;
  injustificada?: number;
}

export interface CalendarHandlers {
  prevMonth: () => void;
  nextMonth: () => void;
}
