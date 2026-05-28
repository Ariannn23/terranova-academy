import { describe, expect, it } from "vitest";
import {
  generatePasswordResetToken,
  getPasswordResetExpiresAt,
  hashPasswordResetToken,
} from "@/lib/auth/password-reset";

describe("password reset helpers", () => {
  it("genera tokens opacos y hasheables", () => {
    const token = generatePasswordResetToken();
    const tokenHash = hashPasswordResetToken(token);

    expect(token).toHaveLength(43);
    expect(tokenHash).toHaveLength(64);
    expect(tokenHash).not.toBe(token);
  });

  it("calcula expiracion a 30 minutos", () => {
    const now = new Date("2026-05-28T10:00:00.000Z");

    expect(getPasswordResetExpiresAt(now)).toEqual(
      new Date("2026-05-28T10:30:00.000Z"),
    );
  });
});
