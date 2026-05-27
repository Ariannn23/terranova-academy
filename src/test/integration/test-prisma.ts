import { vi } from "vitest";

export function createPrismaMock() {
  return {
    academicYear: {
      findUnique: vi.fn(),
    },
    section: {
      findUnique: vi.fn(),
    },
    paymentConcept: {
      findMany: vi.fn(),
    },
    enrollment: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    student: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    payment: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      createMany: vi.fn(),
    },
    paymentTransaction: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    teacher: {
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  };
}
