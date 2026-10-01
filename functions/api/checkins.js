import { ACCESS_COOKIE, cookie, env, json, supabase } from "./_auth.js";

const WARSAW = "Europe/Warsaw";

function dateInWarsaw(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: WARSAW, year: "numeric", month: "2-digit", day: "2-digit"
  }).format(date);
}

async function currentUser(context) {
  const authorization = context.request.headers.get("authorization") || "";
  const bearer = authorization.match(/^Bearer\s+(\S+)$/i)?.[1] || "";
  const token = bearer || cookie(context.request, ACCESS_COOKIE);
  if (!token) return null;
  const { response, body } = await supabase(context, "/auth/v1/user", {
    headers: { authorization: `Bearer ${token}` }
  });
  return response.ok ? { user: body, token } : null;
}

function rankingUsername(row) {
  const username = typeof row.username === "string" ? row.username.trim() : "";
  // Never use an email address as a public ranking label.
  return username && !username.includes("@") ? username : "użytkownik";
}

async function query(context, token, path, options = {}) {
  const values = env(context);
  const headers = new Headers(options.headers || {});
  headers.set("apikey", values.SUPABASE_ANON_KEY);
  headers.set("authorization", `Bearer ${token}`);
  headers.set("content-type", "application/json");
  const response = await fetch(`${values.SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${path}`, {
    ...options, headers, signal: options.signal || AbortSignal.timeout(10000)
  });
  return { response, body: await response.json().catch(() => []) };
}

function previousWarsawDate() {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - 1);
  return dateInWarsaw(date);
}

export async function onRequestGet(context) {
  try {
    const session = await currentUser(context);
    if (!session) {
      return json({
        error: "Zaloguj się, aby zobaczyć ranking.",
        checkedIn: false,
        streak: 0,
        top: [],
        leaderboard: []
      }, 401);
    }
    const date = dateInWarsaw();
    const { response: rowsResponse, body: rows } = await query(context, session.token,
      `daily_checkins?select=user_id,streak&checkin_date=eq.${date}&order=streak.desc,created_at.asc&limit=10`);
    const { body: mine } = await query(context, session.token,
      `daily_checkins?select=streak&user_id=eq.${encodeURIComponent(session.user.id)}&checkin_date=eq.${date}&limit=1`);
    if (!rowsResponse.ok || !Array.isArray(rows) || !Array.isArray(mine)) {
      return json({ error: "Nie udało się pobrać rankingu. Sprawdź, czy migracja check-inów została wykonana w Supabase." }, 503);
    }
    const userIds = rows.map((row) => row.user_id).filter(Boolean);
    const profileQuery = userIds.length
      ? `profiles?select=id,username&id=in.(${userIds.join(",")})`
      : "profiles?select=id,username&id=eq.__empty__";
    const { response: profilesResponse, body: profiles } = await query(context, session.token, profileQuery);
    if (!profilesResponse.ok || !Array.isArray(profiles)) {
      return json({ error: "Nie udało się pobrać nazw rankingu. Sprawdź tabelę profiles w Supabase." }, 503);
    }
    const usernames = new Map(profiles.map((profile) => [profile.id, profile.username]));
    const leaderboard = rows.slice(0, 10).map((row) => ({
      username: rankingUsername({ username: usernames.get(row.user_id) }),
      streak: Number.isFinite(Number(row.streak)) ? Number(row.streak) : 0
    }));
    return json({
      checkedIn: mine.length > 0,
      streak: mine[0]?.streak || 0,
      top: leaderboard,
      leaderboard
    });
  } catch {
    return json({ error: "Nie udało się pobrać rankingu. Spróbuj ponownie." }, 503);
  }
}

export async function onRequestPost(context) {
  try {
    const session = await currentUser(context);
    if (!session) return json({ error: "Zaloguj się, aby zgłosić obecność." }, 401);
    const date = dateInWarsaw();
    const { body: prior } = await query(context, session.token,
      `daily_checkins?select=streak&user_id=eq.${encodeURIComponent(session.user.id)}&checkin_date=eq.${previousWarsawDate()}&limit=1`);
    if (!Array.isArray(prior)) return json({ error: "Nie udało się ustalić passu." }, 503);
    const streak = (prior[0]?.streak || 0) + 1;
    const { response, body } = await query(context, session.token, "daily_checkins", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ user_id: session.user.id, checkin_date: date, streak })
    });
    if (response.status === 409 || response.status === 23505 || (Array.isArray(body) && body.length === 0)) {
      return json({ error: "Obecność na dziś jest już zgłoszona." }, 409);
    }
    if (!response.ok) return json({ error: "Nie udało się zapisać obecności. Spróbuj ponownie." }, response.status === 429 ? 429 : 503);
    return json({ message: `Obecność zgłoszona. Pass: ${streak} dni.`, streak }, 201);
  } catch {
    return json({ error: "Nie udało się zapisać obecności. Spróbuj ponownie." }, 503);
  }
}
