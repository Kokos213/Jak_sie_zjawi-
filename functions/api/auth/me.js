import { ACCESS_COOKIE, cookie, json, publicUser, supabase } from "../_auth.js";

export async function onRequestGet(context) {
  const token = cookie(context.request, ACCESS_COOKIE);
  if (!token) return json({ user: null });
  try {
    const { response, body } = await supabase(context, "/auth/v1/user", { headers: { authorization: `Bearer ${token}` } });
    return json({ user: response.ok ? publicUser(body) : null });
  } catch {
    return json({ user: null });
  }
}
