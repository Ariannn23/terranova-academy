export interface PaymentItem {
  id?: string;
  concept: { name: string };
  amount: number;
  dueDate: Date | string;
  status: string;
  paidAt?: Date | string | null;
}

export interface EnrollmentData {
  id: string;
  enrollDate: Date | string;
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
    startDate: Date | string;
    endDate: Date | string;
  };
  payments: PaymentItem[];
}
