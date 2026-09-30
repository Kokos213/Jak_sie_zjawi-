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

function supabaseErrorText(body) {
  return [
    body?.error_description,
    body?.msg,
    body?.message,
    body?.error
  ].filter(Boolean).join(" ").toLowerCase();
}

function errorMessage(operation, status, body) {
  const details = supabaseErrorText(body);
  if (operation === "login" && /email not confirmed|email_not_confirmed|confirm.*email/i.test(details)) {
    return "E-mail nie został jeszcze potwierdzony. Sprawdź skrzynkę odbiorczą i kliknij link aktywacyjny.";
  }
  if (operation === "login" && /invalid login credentials|invalid.*credential|invalid password/i.test(details)) {
    return "Nieprawidłowy e-mail lub hasło.";
  }
  if (operation === "register" && /already registered|already exists|duplicate|user already/i.test(details)) {
    return "Nie można utworzyć konta. E-mail lub nazwa użytkownika mogą być już zajęte.";
  }
  if (status === 429) return "Zbyt wiele prób. Odczekaj chwilę i spróbuj ponownie.";
  if (status >= 500) return "Usługa kont jest chwilowo niedostępna. Spróbuj ponownie za chwilę.";
  if (status === 400 && /captcha|turnstile|challenge/i.test(details)) {
    return "Rejestracja wymaga dodatkowej weryfikacji. Sprawdź ustawienia CAPTCHA/Turnstile w Supabase Auth.";
  }
  if (status === 400 && /password|weak|short|characters/i.test(details)) {
    return "Hasło nie spełnia wymagań Supabase. Użyj co najmniej 6 znaków (aplikacja zaleca minimum 10).";
  }
  if (status === 400 && /email|address|invalid/i.test(details)) {
    return "Podaj poprawny adres e-mail w formacie nazwa@example.com.";
  }
  if (status === 400) {
    return "Supabase odrzucił dane rejestracji. Sprawdź e-mail, hasło i ustawienia Auth, a następnie spróbuj ponownie.";
  }
  if (operation === "register" && /password.*(weak|short|should contain)|weak password/i.test(details)) {
    return "Hasło jest za słabe. Użyj co najmniej 10 znaków.";
  }
  if (operation === "register" && /invalid.*email|email.*invalid/i.test(details)) {
    return "Podaj poprawny adres e-mail.";
  }
  return "Nie udało się przetworzyć żądania. Sprawdź dane i spróbuj ponownie.";
}

function statusForAuthError(operation, status) {
  if (status === 429) return 429;
  if (status >= 500) return 503;
  return operation === "login" ? 401 : 422;
}

function retryAfterSeconds(response) {
  const value = Number(response.headers.get("retry-after"));
  return Number.isFinite(value) && value > 0 ? Math.min(Math.ceil(value), 3600) : 60;
}

function rateLimitResponse(response) {
  const seconds = retryAfterSeconds(response);
  return json(
    { error: `Zbyt wiele prób. Odczekaj około ${seconds} sekund i spróbuj ponownie.`, retryAfterSeconds: seconds },
    429,
    { "retry-after": String(seconds) }
  );
}

export { ACCESS_COOKIE, REFRESH_COOKIE, authCookies, clearCookies, cookie, env, errorMessage, json, publicUser, readPayload, rateLimitResponse, statusForAuthError, supabase };
