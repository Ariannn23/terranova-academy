import type { PaymentLike } from "@/services/payment.service";

export type OverduePaymentRow = Omit<PaymentLike, "dueDate"> & {
  id: string;
  dueDate: Date | string;
  concept: {
    name: string;
  };
  enrollment: {
    student: {
      dni: string;
      firstName: string;
      lastName: string;
    };
    section: {
      name: string;
      gradeLevel: {
        level: string;
        name: string;
      };
    };
  };
};

export type PendingPaymentRow = PaymentLike & {
  id: string;
  concept?: {
    name?: string;
  };
};
