import { describe, expect, it } from "vitest";
import {
  generateTrustedDeviceToken,
  getTrustedDeviceExpiresAt,
  hashTrustedDeviceToken,
} from "@/lib/auth/trusted-device";

describe("trusted device helpers", () => {
  it("genera token opaco y hash estable", () => {
    const token = generateTrustedDeviceToken();
    const tokenHash = hashTrustedDeviceToken(token);

    expect(token).toHaveLength(43);
    expect(tokenHash).toHaveLength(64);
    expect(tokenHash).not.toBe(token);
  });

  it("expira en 30 dias", () => {
    const now = new Date("2026-05-28T00:00:00.000Z");

    expect(getTrustedDeviceExpiresAt(now)).toEqual(
      new Date("2026-06-27T00:00:00.000Z"),
    );
  });
});
