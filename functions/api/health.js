export async function onRequestGet(context) {
  const values = context.env || {};
  if (!values.SUPABASE_URL || !values.SUPABASE_ANON_KEY) {
    return Response.json(
      { status: "error", code: "supabase_env_missing", message: "Supabase runtime variables are not configured." },
      { status: 503, headers: { "cache-control": "no-store" } }
    );
  }
  try {
    const response = await fetch(`${values.SUPABASE_URL.replace(/\/$/, "")}/auth/v1/settings`, {
      headers: { apikey: values.SUPABASE_ANON_KEY },
      signal: AbortSignal.timeout(5000)
    });
    return Response.json(
      {
        status: response.ok ? "ok" : "error",
        code: response.ok ? "ready" : "supabase_unreachable",
        supabaseStatus: response.status
      },
      { status: response.ok ? 200 : 503, headers: { "cache-control": "no-store" } }
    );
  } catch {
    return Response.json(
      { status: "error", code: "supabase_timeout", message: "Supabase did not respond within 5 seconds." },
      { status: 503, headers: { "cache-control": "no-store" } }
    );
  }
}
