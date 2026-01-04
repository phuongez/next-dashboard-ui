import { auth } from "@clerk/nextjs/server";

export async function getAuthContext() {
  const { userId, sessionClaims } = await auth();

  const role = sessionClaims?.publicMetadata?.role as
    | "admin"
    | "teacher"
    | "student"
    | "parent"
    | undefined;

  return {
    userId,
    role,
  };
}
