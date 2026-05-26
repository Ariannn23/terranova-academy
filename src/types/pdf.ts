export type PdfStudent = {
  firstName: string;
  lastName: string;
  dni?: string | null;
  code?: string | null;
  status?: string | null;
};

export type PdfAcademicYear = {
  year: number | string;
};

export type PdfGradeLevel = {
  name: string;
  level: string;
};

export type PdfSection = {
  name: string;
  gradeLevel: PdfGradeLevel;
  academicYear?: PdfAcademicYear;
};

export type PdfEnrollment = {
  student: PdfStudent;
  section: PdfSection;
  academicYear?: PdfAcademicYear;
};

export type PdfAttendanceRecord = {
  date: Date | string;
  status?: string | null;
  justification?: string | null;
};

export type PdfAttendanceStudent = PdfStudent & {
  attendances?: PdfAttendanceRecord[];
};

export type PdfIncidentRecord = {
  date: Date | string;
  createdAt: Date | string;
  description: string;
  severity?: string | null;
  actionTaken?: string | null;
  action?: string | null;
};

export type PdfDisabilityRecord = {
  startDate: Date | string;
  endDate?: Date | string | null;
  reason: string;
  details?: string | null;
  active?: boolean;
  resolvedNote?: string | null;
};

export type PdfScheduleRecord = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  course: {
    name: string;
  };
  teacher: {
    firstName: string;
    lastName: string;
  };
};
