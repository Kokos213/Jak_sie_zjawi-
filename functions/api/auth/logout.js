import { ACCESS_COOKIE, clearCookies, cookie, json, supabase } from "../_auth.js";

export async function onRequestPost(context) {
  const token = cookie(context.request, ACCESS_COOKIE);
  if (token) {
    try {
      await supabase(context, "/auth/v1/logout", {
        method: "POST",
        headers: { authorization: `Bearer ${token}` }
      });
    } catch {
      // Local cookies are cleared even if the remote session has expired.
    }
  }
  return json({ user: null }, 200, clearCookies());
}
