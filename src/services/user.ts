import { db, users } from "#db";
import { eq } from "drizzle-orm";

export async function userExists(email: string): Promise<boolean> {
  try {
    const u = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return u.length > 0;
  } catch (error) {
    return false;
  }
}
