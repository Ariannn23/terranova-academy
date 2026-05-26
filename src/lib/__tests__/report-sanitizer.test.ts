import { describe, expect, it } from "vitest";

import {
  sanitizePaymentForReport,
  sanitizeReportData,
  sanitizeStudentForReport,
  sanitizeUserForReport,
} from "@/lib/report-sanitizer";

describe("sanitizeReportData", () => {
  it("elimina passwordHash, token, cookies y secretos", () => {
    const result = sanitizeReportData({
      id: "user-1",
      email: "admin@terranova.test",
      passwordHash: "hash",
      token: "token",
      cookie: "sid=123",
      secret: "secret",
      nested: {
        accessToken: "access",
        allowed: "visible",
      },
    });

    expect(result).toEqual({
      id: "user-1",
      email: "admin@terranova.test",
      nested: {
        allowed: "visible",
      },
    });
  });

  it("mantiene datos necesarios de estudiante", () => {
    const result = sanitizeStudentForReport({
      id: "student-1",
      dni: "12345678",
      firstName: "Ana",
      lastName: "Rojas",
      status: "ACTIVO",
    });

    expect(result).toEqual({
      id: "student-1",
      dni: "12345678",
      firstName: "Ana",
      lastName: "Rojas",
      status: "ACTIVO",
    });
  });

  it("mantiene datos necesarios de pagos", () => {
    const result = sanitizePaymentForReport({
      id: "payment-1",
      amount: 250,
      balance: 100,
      status: "PENDIENTE",
      token: "hidden",
    });

    expect(result).toEqual({
      id: "payment-1",
      amount: 250,
      balance: 100,
      status: "PENDIENTE",
    });
  });

  it("sanitiza usuarios para reportes administrativos", () => {
    const result = sanitizeUserForReport({
      id: "user-1",
      name: "Directora",
      role: "DIRECTOR",
      password: "hidden",
    });

    expect(result).toEqual({
      id: "user-1",
      name: "Directora",
      role: "DIRECTOR",
    });
  });
});
