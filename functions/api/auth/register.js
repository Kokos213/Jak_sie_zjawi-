import { authCookies, errorMessage, json, publicUser, readPayload, supabase } from "../_auth.js";

export async function onRequestPost(context) {
  const payload = await readPayload(context.request);
  const email = String(payload?.email || "").trim().toLowerCase();
  const username = String(payload?.username || "").trim();
  const password = String(payload?.password || "");
  const confirmation = String(payload?.confirmPassword || "");
  const fields = {};
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 254) fields.email = "Podaj poprawny adres e-mail.";
  if (!/^[A-Za-z0-9_.-]{3,32}$/.test(username)) fields.username = "Nazwa użytkownika musi mieć 3–32 znaki.";
  if (password.length < 10 || password.length > 128) fields.password = "Hasło musi mieć od 10 do 128 znaków.";
  if (password !== confirmation) fields.confirmPassword = "Hasła muszą być identyczne.";
  if (Object.keys(fields).length) return json({ error: "Sprawdź formularz.", fields }, 422);
  try {
    const { response, body } = await supabase(context, "/auth/v1/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, data: { username } })
    });
    if (!response.ok || !body.user) return json({ error: errorMessage(response.status, body) }, response.status === 422 ? 422 : 409);
    if (!body.access_token) return json({ error: "Konto utworzone. Sprawdź e-mail, aby je aktywować, a następnie zaloguj się." }, 201);
    const headers = authCookies(body);
    return json({ user: publicUser(body.user) }, 200, headers);
  } catch {
    return json({ error: "Usługa kont jest chwilowo niedostępna. Spróbuj ponownie." }, 503);
  }
}
