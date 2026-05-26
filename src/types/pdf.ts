export type PdfStudent = {
  firstName: string;
  lastName: string;
  dni?: string | null;
  code?: string | null;
  status?: string | null;
  birthDate?: Date | string | null;
  gender?: string | null;
  address?: string | null;
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

export type PdfGuardian = {
  firstName: string;
  lastName: string;
  dni?: string | null;
  relation?: string | null;
  phone?: string | null;
  email?: string | null;
  isPrimary?: boolean;
};

export type PdfStudentInfo = PdfStudent & {
  guardians?: PdfGuardian[];
  enrollments?: Array<{
    section: PdfSection;
    academicYear: PdfAcademicYear;
  }>;
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
  type?: string | null;
  actionTaken?: string | null;
  action?: string | null;
};

export type PdfDisabilityRecord = {
  id?: string;
  startDate: Date | string;
  endDate?: Date | string | null;
  reason: string;
  details?: string | null;
  active?: boolean;
  status?: string | null;
  resolution?: string | null;
  resolvedNote?: string | null;
};

export type PdfDisabilityEnrollment = PdfEnrollment & {
  disabilities: PdfDisabilityRecord[];
};

export type PdfIncidentReport = PdfIncidentRecord & {
  enrollment: PdfEnrollment;
};

export type PdfPaymentReceipt = {
  id: string;
  reference?: string | null;
  paidAt?: Date | string | null;
  method?: string | null;
  amount?: number | null;
  concept?: {
    name?: string | null;
  } | null;
  enrollment?: {
    student?: PdfStudent | null;
    section?: PdfSection | null;
  } | null;
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
