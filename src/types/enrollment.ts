export type EnrollmentStudentOption = {
  id: string;
  firstName: string;
  lastName: string;
  dni: string;
  photoUrl?: string | null;
};

export type EnrollmentSectionOption = {
  id: string;
  name: string;
  grade: string;
  level: string;
  capacity: number;
  occupied: number;
  available: number;
};

export type EnrollmentAcademicYearOption = {
  id: string;
  year: number | string;
};

export type EnrollmentWizardInitialData = {
  students: EnrollmentStudentOption[];
  sections: EnrollmentSectionOption[];
  academicYears: EnrollmentAcademicYearOption[];
};

export type EnrollmentDetailsData = {
  id: string;
  status?: string;
  createdAt?: Date | string;
  student?: EnrollmentStudentOption;
  section?: EnrollmentSectionOption;
  academicYear?: EnrollmentAcademicYearOption;
};
