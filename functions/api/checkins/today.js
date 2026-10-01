// Pages Functions route: /api/checkins/today
// Keep the implementation in the shared parent handler so auth/date/RLS logic
// cannot diverge between the check-in endpoints.
export { onRequestGet, onRequestPost } from "../checkins.js";
