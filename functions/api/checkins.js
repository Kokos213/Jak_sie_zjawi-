import { ACCESS_COOKIE, cookie, env, json, supabase } from "./_auth.js";

function todayWarsaw() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Warsaw", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

async function currentUser(context) {
  const token = cookie(context.request, ACCESS_COOKIE);
  if (!token) return null;
  const { response, body } = await supabase(context, "/auth/v1/user", { headers: { authorization: `Bearer ${token}` } });
  return response.ok ? { user: body, token } : null;
}

async function query(context, token, path, options = {}) {
  const values = env(context);
  const headers = new Headers(options.headers || {});
  headers.set("apikey", values.SUPABASE_ANON_KEY);
  headers.set("authorization", `Bearer ${token}`);
  headers.set("content-type", "application/json");
  const response = await fetch(`${values.SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${path}`, { ...options, headers });
  return { response, body: await response.json().catch(() => []) };
}

export async function onRequestGet(context) {
  const session = await currentUser(context);
  if (!session) return json({ error: "Zaloguj się, aby zobaczyć ranking." }, 401);
  const user = session.user;
  const date = todayWarsaw();
  const { body: rows } = await query(context, session.token, `daily_checkins?select=user_id,streak,profiles(username)&checkin_date=eq.${date}&order=streak.desc,created_at.asc&limit=10`);
  const { body: mine } = await query(context, session.token, `daily_checkins?select=streak&user_id=eq.${encodeURIComponent(user.id)}&checkin_date=eq.${date}&limit=1`);
  return json({ checkedIn: mine.length > 0, streak: mine[0]?.streak || 0, top: rows.map((row) => ({ username: row.profiles?.username || "użytkownik", streak: row.streak })) });
}

export async function onRequestPost(context) {
  const session = await currentUser(context);
  if (!session) return json({ error: "Zaloguj się, aby zgłosić obecność." }, 401);
  const user = session.user;
  const date = todayWarsaw();
  const previousDate = new Date(`${date}T12:00:00+01:00`);
  previousDate.setDate(previousDate.getDate() - 1);
  const previous = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Warsaw" }).format(previousDate);
  const { body: prior } = await query(context, session.token, `daily_checkins?select=streak&user_id=eq.${encodeURIComponent(user.id)}&checkin_date=eq.${previous}&limit=1`);
  const streak = (prior[0]?.streak || 0) + 1;
  const { response } = await query(context, session.token, "daily_checkins", {
    method: "POST",
    headers: { Prefer: "return=representation,resolution=ignore-duplicates" },
    body: JSON.stringify({ user_id: user.id, checkin_date: date, streak })
  });
  const inserted = await response.clone().json().catch(() => []);
  if (response.status === 409 || !inserted.length) return json({ error: "Obecność na dziś jest już zgłoszona." }, 409);
  if (!response.ok) return json({ error: "Nie udało się zapisać obecności. Spróbuj ponownie." }, 503);
  return json({ message: `Obecność zgłoszona. Pass: ${streak} dni.`, streak }, 201);
}
