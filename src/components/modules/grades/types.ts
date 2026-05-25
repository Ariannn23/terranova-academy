import { GradePeriod } from "@prisma/client";

export interface GradeRecord {
  id?: string;
  courseId: string;
  period: GradePeriod;
  score: number | null;
  course: {
    id?: string;
    name: string;
  };
}

export interface EnrollmentForGrades {
  id?: string;
  student: {
    firstName: string;
    lastName: string;
    photoUrl?: string | null;
    code?: string | null;
    dni: string;
  };
  section: {
    name: string;
    gradeLevel: {
      name: string;
      level: string;
    };
  };
  academicYear: {
    year: string | number;
  };
}

export interface CourseGradeSummary {
  name: string;
  records: Record<GradePeriod, number | null>;
}
