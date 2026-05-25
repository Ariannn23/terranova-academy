import { z } from "zod";

// ==========================================
// ENUMS (Replicando los de Prisma para Zod)
// ==========================================

export const PaymentTypeEnum = z.enum([
  "MENSUALIDAD",
  "MATRICULA",
  "EXAMEN",
  "UNIFORME",
  "OTRO",
]);

export const PaymentStatusEnum = z.enum([
  "PENDIENTE",
  "PAGADO",
  "VENCIDO",
  "ANULADO",
]);

// ==========================================
// ESQUEMAS PARA PAYMENT CONCEPT
// ==========================================

export const PaymentConceptSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(3, "El nombre del concepto debe tener al menos 3 caracteres"),
  type: PaymentTypeEnum,
  amount: z.coerce.number().min(0, "El monto no puede ser negativo"),
  description: z.string().optional().nullable(),
  active: z.boolean().default(true),
});

export type PaymentConceptSchemaType = z.infer<typeof PaymentConceptSchema>;

// ==========================================
// ESQUEMAS PARA PAYMENT
// ==========================================

// Esquema para registrar/generar un nuevo Pago (deuda)
export const CreatePaymentSchema = z.object({
  enrollmentId: z.string().min(1, "El ID de la matrícula es requerido"),
  conceptId: z.string().min(1, "El ID del concepto es requerido"),
  amount: z.coerce.number().min(0, "El monto no puede ser negativo"),
  dueDate: z.coerce.date({
    required_error: "La fecha de vencimiento es obligatoria",
    invalid_type_error: "Fecha de vencimiento inválida",
  }),
  notes: z.string().optional().nullable(),
});

export type CreatePaymentSchemaType = z.infer<typeof CreatePaymentSchema>;

// Esquema para procesar/registrar el Cobro (cuando el cliente paga)
export const RegisterPaymentReceiptSchema = z.object({
  paymentId: z.string().min(1, "El ID del pago es requerido"),
  amount: z.coerce
    .number()
    .positive("El monto del abono debe ser mayor a 0"),
  method: z
    .string()
    .min(1, "El método de pago es requerido (Ej. EFECTIVO, TRANSFERENCIA)"),
  paidAt: z.coerce.date().default(() => new Date()), // Por defecto la fecha actual, pero se puede sobrescribir
  notes: z.string().optional().nullable(),
});

export type RegisterPaymentReceiptSchemaType = z.infer<
  typeof RegisterPaymentReceiptSchema
>;

// Esquema para edición general de un Pago (solo ADMIN)
export const UpdatePaymentSchema = z.object({
  id: z.string().min(1, "El ID del pago es requerido"),
  amount: z.coerce.number().min(0, "El monto no puede ser negativo").optional(),
  dueDate: z.coerce.date().optional(),
  status: PaymentStatusEnum.optional(),
  notes: z.string().optional().nullable(),
  method: z.string().optional().nullable(),
  reference: z.string().optional().nullable(), // Numero de recibo
});

export type UpdatePaymentSchemaType = z.infer<typeof UpdatePaymentSchema>;

export const PaymentFormSchema = z.object({
  paymentId: z.string().min(1, "Selecciona una cuota a pagar"),
  amount: z.coerce.number().positive("Ingresa un monto mayor a 0"),
  method: z.string().min(1, "Selecciona un método de pago"),
  referenceImage: z.any().optional(),
});
