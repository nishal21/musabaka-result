import { customAlphabet } from "nanoid";
import { siteUrl } from "@/lib/site";

const tokenAlphabet = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  32,
);

export function newPrivateToken() {
  return tokenAlphabet();
}

export function normalizeGrade(value: string) {
  return value.trim().toUpperCase();
}

export function clampMark(value: number) {
  if (Number.isNaN(value)) return null;
  return Math.min(100, Math.max(0, value));
}

export { siteUrl };

export function judgeLink(privateToken: string) {
  return `${siteUrl()}/judge/${privateToken}`;
}

export function placementLabel(n: number) {
  if (n === 1) return "1st";
  if (n === 2) return "2nd";
  if (n === 3) return "3rd";
  return `${n}th`;
}
