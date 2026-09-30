import { authCookies, errorMessage, json, publicUser, rateLimitResponse, readPayload, statusForAuthError, supabase } from "../_auth.js";

export async function onRequestPost(context) {
  const payload = await readPayload(context);
  const email = String(payload?.email || "").trim().toLowerCase();
  const password = String(payload?.password || "");
  if (!email || !password) return json({ error: "Podaj e-mail i hasło." }, 422);
  try {
    const { response, body } = await supabase(context, "/auth/v1/token?grant_type=password", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    if (response.status === 429) return rateLimitResponse(response);
    if (!response.ok || !body.user || !body.access_token) {
      return json({ error: errorMessage("login", response.status, body) }, statusForAuthError("login", response.status));
    }
    return json({ user: publicUser(body.user) }, 200, authCookies(body));
  } catch {
    return json({ error: "Usługa kont jest chwilowo niedostępna. Spróbuj ponownie." }, 503);
  }
}
