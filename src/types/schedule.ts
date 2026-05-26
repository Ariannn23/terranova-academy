export type ScheduleCourseOption = {
  id: string;
  name: string;
};

export type ScheduleTeacherOption = {
  id: string;
  firstName: string;
  lastName: string;
  specialty?: string | null;
};

export type ScheduleBlock = {
  startTime: string;
  endTime: string;
  label: string;
  isBreak?: boolean;
};

export type ScheduleRecord = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime?: string;
  course: ScheduleCourseOption;
  teacher: ScheduleTeacherOption | null;
};

export type ScheduleSection = {
  id: string;
  name: string;
  gradeLevel: {
    name: string;
    level: string;
  };
};

export type ScheduleCellData = {
  sectionId: string;
  dayOfWeek: number;
  block: ScheduleBlock;
  schedule?: ScheduleRecord | null;
} | null;
