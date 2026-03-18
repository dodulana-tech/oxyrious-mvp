import "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
    hospitalId?: number | null;
  }

  interface Session {
    user: User & {
      id: string;
      email: string;
      name: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    hospitalId?: number | null;
  }
}
