const ACCESS_COOKIE = "skm_access_token";
const REFRESH_COOKIE = "skm_refresh_token";

function json(data, status = 200, headers = {}) {
  const responseHeaders = new Headers({
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  if (headers instanceof Headers) {
    headers.forEach((value, key) => responseHeaders.append(key, value));
  } else {
    Object.entries(headers).forEach(([key, value]) => responseHeaders.set(key, value));
  }
  return new Response(JSON.stringify(data), {
    status,
    headers: responseHeaders
  });
}

function env(context) {
  const values = context.env || {};
  if (!values.SUPABASE_URL || !values.SUPABASE_ANON_KEY) {
    throw new Error("Supabase environment is not configured");
  }
  return values;
}

async function readPayload(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

async function supabase(context, path, options = {}) {
  const values = env(context);
  const headers = new Headers(options.headers || {});
  headers.set("apikey", values.SUPABASE_ANON_KEY);
  headers.set("content-type", "application/json");
  const response = await fetch(`${values.SUPABASE_URL.replace(/\/$/, "")}${path}`, {
    ...options,
    headers,
    signal: options.signal || AbortSignal.timeout(15000)
  });
  const body = await response.json().catch(() => ({}));
  return { response, body };
}

function cookieHeader(name, value, maxAge = 60 * 60 * 24 * 30) {
  const secure = " Secure;";
  return `${name}=${value}; Max-Age=${maxAge}; Path=/; HttpOnly; SameSite=None;${secure}`;
}

function authCookies(body) {
  const headers = new Headers();
  if (body.access_token) headers.append("set-cookie", cookieHeader(ACCESS_COOKIE, body.access_token, body.expires_in || 3600));
  if (body.refresh_token) headers.append("set-cookie", cookieHeader(REFRESH_COOKIE, body.refresh_token));
  return headers;
}

function clearCookies() {
  const headers = new Headers();
  headers.append("set-cookie", cookieHeader(ACCESS_COOKIE, "", 0));
  headers.append("set-cookie", cookieHeader(REFRESH_COOKIE, "", 0));
  return headers;
}

function cookie(request, name) {
  const source = request.headers.get("cookie") || "";
  return source.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1) || "";
}

function publicUser(user) {
  return user ? { id: user.id, email: user.email, username: user.user_metadata?.username || user.email?.split("@")[0] || "użytkownik" } : null;
}

function errorMessage(status, body) {
  if (status === 409 || /already registered|already exists|duplicate/i.test(body?.msg || body?.message || "")) {
    return "Nie można utworzyć konta. E-mail lub nazwa użytkownika mogą być już zajęte.";
  }
  return "Nie udało się przetworzyć żądania. Sprawdź dane i spróbuj ponownie.";
}

export { ACCESS_COOKIE, REFRESH_COOKIE, authCookies, clearCookies, cookie, env, errorMessage, json, publicUser, readPayload, supabase };
