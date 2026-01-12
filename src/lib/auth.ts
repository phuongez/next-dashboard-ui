import { auth } from "@clerk/nextjs/server";

export async function getAuthContext() {
  const { userId, sessionClaims } = await auth();

  const role = (
    sessionClaims as {
      publicMetadata?: { role?: "admin" | "teacher" | "student" | "parent" };
    }
  )?.publicMetadata?.role;

  return {
    userId,
    role,
  };
}
