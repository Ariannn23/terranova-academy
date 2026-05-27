export type CalendarEventView = {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  date: Date | string;
  endDate?: Date | string | null;
  academicYearId?: string;
};

export type CalendarEventsByMonth = Record<string, CalendarEventView[]>;
