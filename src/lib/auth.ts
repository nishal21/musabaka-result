import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getSessionSecret } from "@/lib/secrets";

const ADMIN_COOKIE = "musabaka_admin";
const JUDGE_COOKIE = "musabaka_judge";

function secretKey() {
  return new TextEncoder().encode(getSessionSecret());
}

export type AdminSession = { role: "admin" };
export type JudgeSession = {
  role: "judge";
  judgeId: string;
  itemId: string;
  judgeName: string;
};

export async function createAdminSession() {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey());
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: (process.env.NEXT_PUBLIC_SITE_URL ?? "").startsWith("https://"),
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAdminSession() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (payload.role === "admin") return { role: "admin" };
    return null;
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}

export async function createJudgeSession(data: Omit<JudgeSession, "role">) {
  const token = await new SignJWT({ role: "judge", ...data })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(secretKey());
  const jar = await cookies();
  jar.set(JUDGE_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: (process.env.NEXT_PUBLIC_SITE_URL ?? "").startsWith("https://"),
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearJudgeSession() {
  const jar = await cookies();
  jar.delete(JUDGE_COOKIE);
}

export async function getJudgeSession(): Promise<JudgeSession | null> {
  const jar = await cookies();
  const token = jar.get(JUDGE_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (
      payload.role === "judge" &&
      typeof payload.judgeId === "string" &&
      typeof payload.itemId === "string" &&
      typeof payload.judgeName === "string"
    ) {
      return {
        role: "judge",
        judgeId: payload.judgeId,
        itemId: payload.itemId,
        judgeName: payload.judgeName,
      };
    }
    return null;
  } catch {
    return null;
  }
}
