export type AcademicSectionOption = {
  id?: string;
  name?: string;
  available?: number;
  capacity?: number;
  occupied?: number;
  grade?: string;
  level?: string;
};

export type AcademicGradeOption = {
  id?: string;
  name?: string;
  sections?: AcademicSectionOption[];
};

export type AcademicLevelOption = {
  name?: string;
  grades?: AcademicGradeOption[];
};

export type AcademicCourseOption = {
  id: string;
  name: string;
};

export type AcademicStructure = {
  year?: number | string;
  levels?: AcademicLevelOption[];
};
