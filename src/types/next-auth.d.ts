import type { DefaultSession } from "next-auth";
import type { AppRole } from "@/lib/rbac";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: AppRole | string;
    } & DefaultSession["user"];
  }

  interface User {
    role?: AppRole | string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: AppRole | string;
  }
}
