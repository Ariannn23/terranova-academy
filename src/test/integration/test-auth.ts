import { vi } from "vitest";
import { type AppRole } from "@/lib/rbac";

export function createMockUser(role: AppRole = "ADMIN") {
  return {
    id: `user_${role.toLowerCase()}`,
    email: `${role.toLowerCase()}@test.local`,
    name: `Usuario ${role}`,
    role,
  };
}

export function allowRole(requireRoleMock: ReturnType<typeof vi.fn>, role: AppRole) {
  const user = createMockUser(role);
  requireRoleMock.mockResolvedValue(user);
  return user;
}

export function denyRole(requireRoleMock: ReturnType<typeof vi.fn>) {
  requireRoleMock.mockRejectedValue(new Error("No autorizado"));
}
