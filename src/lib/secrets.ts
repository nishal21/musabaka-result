/** Session / admin secrets — never fall back to values baked into source. */

export function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET?.trim() ?? "";
  if (secret.length < 32) {
    throw new Error(
      "SESSION_SECRET must be set in .env and at least 32 characters. See .env.example.",
    );
  }
  return secret;
}

export function getAdminPasswordForSeed(): string {
  const password = process.env.ADMIN_PASSWORD?.trim() ?? "";
  if (!password) {
    throw new Error("ADMIN_PASSWORD must be set in .env before the first admin seed. See .env.example.");
  }
  const placeholders = new Set(["change-me-admin", "replace-me", "password", "admin"]);
  if (placeholders.has(password.toLowerCase())) {
    throw new Error("ADMIN_PASSWORD is still a placeholder. Set a real password in .env.");
  }
  return password;
}
