const WEATHER_URL = "https://api.open-meteo.com/v1/forecast?latitude=54.352&longitude=18.646&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability,weather_code&forecast_days=1&timezone=Europe%2FWarsaw";
const DEFAULT_CITY_ID = "gdansk";

const DEMO_WEATHER = {
  current: { temperature_2m: 12, apparent_temperature: 11, relative_humidity_2m: 76, precipitation: 0, weather_code: 2, wind_speed_10m: 14 },
  hourly: { time: [], temperature_2m: [12, 12, 13, 13, 14, 14], precipitation_probability: [10, 8, 12, 15, 18, 20], weather_code: [2, 2, 3, 2, 1, 1] }
};

const SKM_NETWORK = {
  gdansk: {
    name: "Gdańsk",
    stations: [
      { id: "gdansk-glowny", name: "Gdańsk Główny" },
      { id: "gdansk-wrzeszcz", name: "Gdańsk Wrzeszcz" },
      { id: "gdansk-oliwa", name: "Gdańsk Oliwa" },
      { id: "gdansk-przymorze-uniwersytet", name: "Gdańsk Przymorze-Uniwersytet" },
      { id: "gdansk-zabianka-awfis", name: "Gdańsk Żabianka-AWFiS" },
      { id: "gdansk-zaspa", name: "Gdańsk Zaspa" }
    ]
  },
  sopot: {
    name: "Sopot",
    stations: [
      { id: "sopot", name: "Sopot" },
      { id: "sopot-kamienny-potok", name: "Sopot Kamienny Potok" },
      { id: "sopot-wyscigi", name: "Sopot Wyścigi" }
    ]
  },
  gdynia: {
    name: "Gdynia",
    stations: [
      { id: "gdynia-glowna", name: "Gdynia Główna" },
      { id: "gdynia-stocznia", name: "Gdynia Stocznia" },
      { id: "gdynia-grabowek", name: "Gdynia Grabówek" },
      { id: "gdynia-leszczynki", name: "Gdynia Leszczynki" },
      { id: "gdynia-chylonia", name: "Gdynia Chylonia" },
      { id: "gdynia-cisowa", name: "Gdynia Cisowa" }
    ]
  },
  rumia: {
    name: "Rumia",
    stations: [
      { id: "rumia", name: "Rumia" },
      { id: "rumia-janowo", name: "Rumia Janowo" }
    ]
  },
  reda: {
    name: "Reda",
    stations: [
      { id: "reda", name: "Reda" },
      { id: "reda-pieleszewo", name: "Reda Pieleszewo" }
    ]
  },
  wejherowo: {
    name: "Wejherowo",
    stations: [
      { id: "wejherowo", name: "Wejherowo" },
      { id: "wejherowo-nanice", name: "Wejherowo Nanice" },
      { id: "wejherowo-smiechowo", name: "Wejherowo Śmiechowo" }
    ]
  },
  luzino: {
    name: "Luzino",
    stations: [{ id: "luzino", name: "Luzino" }]
  }
};

const CITY_COORDINATES = {
  gdansk: [54.352, 18.646],
  sopot: [54.4418, 18.5600],
  gdynia: [54.5189, 18.5305],
  rumia: [54.5708, 18.3880],
  reda: [54.6050, 18.3470],
  wejherowo: [54.6050, 18.2356],
  luzino: [54.5667, 18.1167]
};

const DEMO_DEPARTURES = {
  "gdansk-glowny": [["Gdynia Główna", "2", 4, 0], ["Gdańsk Wrzeszcz", "1", 9, 3], ["Wejherowo", "2", 17, 0], ["Gdynia Chylonia", "1", 29, 0]],
  "gdansk-wrzeszcz": [["Gdynia Główna", "3", 3, 0], ["Gdańsk Śródmieście", "2", 8, 0], ["Wejherowo", "3", 14, 4], ["Gdańsk Główny", "4", 22, 0]],
  sopot: [["Gdańsk Główny", "1", 5, 0], ["Gdynia Główna", "2", 7, 3], ["Wejherowo", "2", 19, 0], ["Gdańsk Śródmieście", "1", 31, 0]],
  "gdynia-glowna": [["Gdańsk Główny", "5", 2, 0], ["Wejherowo", "4", 11, 0], ["Gdańsk Śródmieście", "5", 18, 5], ["Gdańsk Wrzeszcz", "4", 26, 0]],
  "gdynia-chylonia": [["Gdańsk Główny", "2", 5, 0], ["Wejherowo", "1", 9, 1], ["Sopot", "2", 17, 0], ["Gdynia Główna", "3", 24, 0]],
  wejherowo: [["Gdańsk Główny", "1", 6, 0], ["Gdynia Główna", "2", 13, 2], ["Luzino", "1", 20, 0], ["Sopot", "2", 34, 0]],
  rumia: [["Gdańsk Główny", "2", 4, 0], ["Wejherowo", "1", 9, 0], ["Gdynia Główna", "2", 16, 2], ["Reda", "1", 25, 0]],
  reda: [["Gdańsk Główny", "1", 7, 0], ["Gdynia Główna", "2", 14, 3], ["Wejherowo", "1", 19, 0], ["Rumia", "2", 27, 0]],
  luzino: [["Gdańsk Główny", "2", 9, 0], ["Gdynia Główna", "1", 18, 3], ["Wejherowo", "2", 24, 0], ["Reda", "1", 32, 0]]
};
const BUS_NETWORK = {
  gdansk: { name: "Gdańsk", stations: [{ id: "gdansk-dworzec", name: "Dworzec Główny" }, { id: "gdansk-wrzeszcz-przystanek", name: "Wrzeszcz PKP" }, { id: "gdansk-oliwa-przystanek", name: "Oliwa PKP" }] },
  sopot: { name: "Sopot", stations: [{ id: "sopot-centrum", name: "Sopot Centrum" }, { id: "sopot-kamienny", name: "Kamienny Potok" }] },
  gdynia: { name: "Gdynia", stations: [{ id: "gdynia-dworzec", name: "Dworzec Główny" }, { id: "gdynia-chylonia-przystanek", name: "Chylonia Centrum" }] },
  rumia: { name: "Rumia", stations: [{ id: "rumia-dworzec", name: "Rumia Dworzec" }, { id: "rumia-janowo-przystanek", name: "Janowo" }] },
  reda: { name: "Reda", stations: [{ id: "reda-dworzec", name: "Reda Dworzec" }] },
  wejherowo: { name: "Wejherowo", stations: [{ id: "wejherowo-dworzec", name: "Wejherowo Dworzec" }, { id: "wejherowo-nanice-przystanek", name: "Nanice" }] },
  luzino: { name: "Luzino", stations: [{ id: "luzino-dworzec", name: "Luzino Dworzec" }] },
  keblowo: { name: "Kębłowo", stations: [{ id: "keblowo-centrum", name: "Kębłowo Centrum" }, { id: "keblowo-szkola", name: "Kębłowo Szkoła" }, { id: "keblowo-dworzec", name: "Kębłowo Dworzec" }] }
};

const weatherLabels = { 0: ["Bezchmurnie", "☀️"], 1: ["Przeważnie pogodnie", "🌤️"], 2: ["Częściowe zachmurzenie", "⛅"], 3: ["Pochmurno", "☁️"], 45: ["Mgła", "🌫️"], 51: ["Mżawka", "🌦️"], 61: ["Deszcz", "🌧️"], 71: ["Śnieg", "🌨️"], 80: ["Przelotny deszcz", "🌦️"], 95: ["Burza", "⛈️"] };
const $ = (selector) => document.querySelector(selector);
const API_BASE = window.__SKM_API_BASE__ || (window.location.port === "4173" ? "http://127.0.0.1:8000" : "");
const THEME_STORAGE_KEY = "skm-pogoda-theme";
const THEMES = ["blue-black", "red-white", "white", "charcoal"];

function applyTheme(theme) {
  const nextTheme = THEMES.includes(theme) ? theme : "blue-black";
  const root = document.documentElement;
  root.setAttribute("data-theme", nextTheme);
  document.body?.setAttribute("data-theme", nextTheme);
  document.body?.classList.remove(...THEMES.map((item) => `theme-${item}`));
  document.body?.classList.add(`theme-${nextTheme}`);
  const themeSelect = $("#theme-select");
  if (themeSelect) themeSelect.value = nextTheme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  } catch {
    // Motyw pozostaje aktywny także bez dostępu do localStorage.
  }
}

function initTheme() {
  let savedTheme = "blue-black";
  try {
    savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || savedTheme;
  } catch {
    // Ustawienie domyślnego motywu nie wymaga localStorage.
  }
  applyTheme(savedTheme);
  const themeSelect = $("#theme-select");
  themeSelect.addEventListener("change", (event) => applyTheme(event.target.value));
  themeSelect.addEventListener("input", (event) => applyTheme(event.target.value));
}

let authMode = "register";
let authUser = null;
let authRequestInFlight = false;
let authCooldownTimer = null;
const AUTH_COOLDOWN_KEY = "skm-auth-rate-limit-until";

function setAuthError(message) {
  $("#auth-error").textContent = message || "";
  $("#auth-error").classList.toggle("hidden", !message);
}

function setAuthProgress(message) {
  $("#auth-progress").textContent = message || "";
  $("#auth-progress").classList.toggle("hidden", !message);
}

function setAuthMode(mode) {
  authMode = mode;
  const registering = mode === "register";
  $("#auth-title").textContent = registering ? "Zarejestruj się" : "Zaloguj się";
  $("#auth-intro").textContent = registering ? "Zapisz ulubioną trasę i szybciej sprawdzaj odjazdy." : "Wróć do swoich ustawień i ulubionych tras.";
  $("#auth-submit").textContent = registering ? "Utwórz konto" : "Zaloguj się";
  $("#username-field").classList.toggle("hidden", !registering);
  $("#confirm-field").classList.toggle("hidden", !registering);
  $("#auth-username").required = registering;
  $("#auth-confirm").required = registering;
  $("#loginEmail").autocomplete = "email";
  $("#loginPassword").autocomplete = registering ? "new-password" : "current-password";
  $("#register-tab").classList.toggle("active", registering);
  $("#login-tab").classList.toggle("active", !registering);
  setAuthProgress("");
  const remaining = getAuthCooldownRemaining();
  if (remaining > 0) {
    setAuthError(`Zbyt wiele prób w całym projekcie Supabase. Odczekaj ${remaining} s przed kolejną próbą.`);
  } else {
    setAuthError("");
  }
}

function openAuth() {
  $("#auth-backdrop").classList.remove("hidden");
  $("#loginEmail").focus();
}

function closeAuth() {
  $("#auth-backdrop").classList.add("hidden");
  setAuthProgress("");
  setAuthError("");
}

function updateAccountButton() {
  $("#account-button").textContent = authUser ? `Wyloguj (${authUser.username})` : "Zaloguj się";
  $("#account-button").setAttribute("aria-label", authUser ? `Wyloguj użytkownika ${authUser.username}` : "Zaloguj się");
}

async function checkAuth() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(`${API_BASE}/api/auth/me`, { credentials: "include", signal: controller.signal });
    if (!response.ok) return;
    const payload = await response.json();
    authUser = payload.user;
    updateAccountButton();
    loadLeaderboard();
  } catch {
    // Statyczny podgląd bez backendu pozostaje użyteczny.
  } finally {
    clearTimeout(timeoutId);
  }
}

async function submitAuth(event) {
  event.preventDefault();
  const cooldownRemaining = getAuthCooldownRemaining();
  if (cooldownRemaining > 0) {
    startAuthCooldown(cooldownRemaining);
    return;
  }
  if (authRequestInFlight || $("#auth-submit").disabled) return;
  setAuthError("");
  setAuthProgress("");
  const form = event.currentTarget;
  const email = $("#loginEmail").value.trim();
  const password = $("#loginPassword").value;
  if (!email) {
    return setAuthError("Podaj adres e-mail.");
  }
  if (!password) {
    return setAuthError("Podaj hasło.");
  }
  if (!form.reportValidity()) return;
  if (authMode === "register" && password !== $("#auth-confirm").value) {
    return setAuthError("Hasła muszą być identyczne.");
  }
  const payload = {
    email,
    password,
    ...(authMode === "register" ? { username: $("#auth-username").value.trim(), confirmPassword: $("#auth-confirm").value } : {})
  };
  const endpoint = `${API_BASE || window.location.origin}/api/auth/${authMode}`;
  setAuthProgress(`Diagnostyka: e-mail odczytany (${email.length} znaków), hasło odczytane (${password.length} znaków), endpoint ${endpoint}.`);
  const submit = $("#auth-submit");
  authRequestInFlight = true;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);
  const coldStartId = setTimeout(() => {
    setAuthProgress("Backend się wybudza — to może potrwać do minuty.");
  }, 2500);
  submit.disabled = true;
  submit.textContent = "Przetwarzam…";
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    const result = await response.json().catch(() => ({}));
    setAuthProgress(`Diagnostyka: odpowiedź HTTP ${response.status} z ${endpoint}.`);
    if (!response.ok || !result.user) {
      if (response.status === 404) {
        return setAuthError("Endpoint logowania nie istnieje. W Cloudflare Pages włącz Pages Functions i wdroż katalog `functions/`, nie tylko statyczny output.");
      }
      if (response.status === 429) {
        startAuthCooldown(Number(result.retryAfterSeconds) || Number(response.headers.get("retry-after")) || 60);
        return;
      }
      const fieldError = result.fields && Object.values(result.fields)[0];
      return setAuthError(fieldError || result.error || "Nie udało się przetworzyć formularza.");
    }
    authUser = result.user;
    updateAccountButton();
    loadLeaderboard();
    closeAuth();
    form.reset();
  } catch {
    setAuthError(controller.signal.aborted
      ? "Backend nie odpowiedział w ciągu 20 sekund. Render może się wybudzać — spróbuj ponownie za chwilę."
      : `Backend konta jest niedostępny (${API_BASE || "ten sam origin"}). Sprawdź /api/health i konfigurację Functions/Supabase.`);
  } finally {
    clearTimeout(timeoutId);
    clearTimeout(coldStartId);
    authRequestInFlight = false;
    if (!authCooldownTimer) submit.disabled = false;
    submit.textContent = authMode === "register" ? "Utwórz konto" : "Zaloguj się";
  }
}

function startAuthCooldown(seconds) {
  clearInterval(authCooldownTimer);
  let remaining = Math.max(1, Math.ceil(seconds));
  try {
    sessionStorage.setItem(AUTH_COOLDOWN_KEY, String(Date.now() + remaining * 1000));
  } catch {
    // In-memory cooldown still protects the current page.
  }
  const submit = $("#auth-submit");
  submit.disabled = true;
  const tick = () => {
    setAuthError(`Zbyt wiele prób. Odczekaj ${remaining} s przed kolejną próbą. Nie ponawiam automatycznie.`);
    if (remaining <= 0) {
      clearInterval(authCooldownTimer);
      authCooldownTimer = null;
      try {
        sessionStorage.removeItem(AUTH_COOLDOWN_KEY);
      } catch {
        // Ignore unavailable storage.
      }
      submit.disabled = false;
      setAuthError("Możesz spróbować ponownie. Jeśli limit wraca, sprawdź limity e-mail w Supabase.");
      return;
    }
    remaining -= 1;
  };
  tick();
  authCooldownTimer = setInterval(tick, 1000);
}

function getAuthCooldownRemaining() {
  try {
    const until = Number(sessionStorage.getItem(AUTH_COOLDOWN_KEY));
    return Number.isFinite(until) ? Math.max(0, Math.ceil((until - Date.now()) / 1000)) : 0;
  } catch {
    return 0;
  }
}

function initAuth() {
  $("#account-button").addEventListener("click", async () => {
    if (!authUser) return openAuth();
    await fetch(`${API_BASE}/api/auth/logout`, { method: "POST", credentials: "include" }).catch(() => {});
    authUser = null;
    updateAccountButton();
  });
  $("#auth-close").addEventListener("click", closeAuth);
  $("#auth-backdrop").addEventListener("click", (event) => {
    if (event.target === event.currentTarget) closeAuth();
  });
  $("#register-tab").addEventListener("click", () => setAuthMode("register"));
  $("#login-tab").addEventListener("click", () => setAuthMode("login"));
  $("#auth-form").addEventListener("submit", submitAuth);
  setAuthMode("register");
  const remaining = getAuthCooldownRemaining();
  if (remaining > 0) startAuthCooldown(remaining);
  checkAuth();
  $("#checkin-button").addEventListener("click", checkIn);
}

function getStationById(stationId) {
  for (const city of Object.values(SKM_NETWORK)) {
    const station = city.stations.find((candidate) => candidate.id === stationId);
    if (station) return { cityName: city.name, stationName: station.name };
  }
  return null;
}

function buildGeneratedDepartures(stationId) {
  const stationData = getStationById(stationId);
  if (!stationData) return [];
  const routePool = ["Gdańsk Główny", "Gdynia Główna", "Wejherowo", "Rumia", "Reda", "Sopot", "Luzino"];
  const seed = [...stationId].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return Array.from({ length: 4 }, (_, index) => {
    const destination = routePool[(seed + index * 2) % routePool.length];
    const platform = String(((seed + index) % 4) + 1);
    const minutes = 3 + index * 8 + (seed % 3);
    const delayMinutes = index % 3 === 1 ? ((seed + index) % 4) : 0;
    return [destination, platform, minutes, delayMinutes];
  });
}

const skmService = {
  async getDepartures(originCityId, originStationId, destinationStationId) {
    await new Promise((resolve) => setTimeout(resolve, 160));
    const city = SKM_NETWORK[originCityId];
    if (!city) throw new Error("Nieznane miasto.");
    if (!city.stations.some((station) => station.id === originStationId)) throw new Error("Stacja początkowa nie należy do wybranego miasta.");
    if (!getStationById(destinationStationId)) throw new Error("Nieznana stacja końcowa.");
    const baseRows = DEMO_DEPARTURES[originStationId] ?? buildGeneratedDepartures(originStationId);
    const destination = getStationById(destinationStationId).stationName;
    const rows = baseRows.map(([, platform, minutes, delayMinutes]) => [destination, platform, minutes, delayMinutes]);
    return rows.concat(generatedTransportRows(originStationId, destination, 8));
  }
};

const state = {
  originCityId: DEFAULT_CITY_ID,
  originStationId: null,
  destinationCityId: "gdynia",
  destinationStationId: "gdynia-glowna",
  weatherRequestId: 0,
  transportMode: "train",
  departureLimit: 4
};

const getWeatherLabel = (code) => weatherLabels[code] || ["Zmiennie", "🌥️"];
const formatTime = (date) => date.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
const formatDayDate = (date) => date.toLocaleDateString("pl-PL", { day: "numeric", month: "long" });

function setDate() {
  const now = new Date();
  $("#current-day").textContent = now.toLocaleDateString("pl-PL", { weekday: "long" });
  $("#current-date").textContent = formatDayDate(now);
  $("#last-updated").textContent = `Zaktualizowano ${formatTime(now)}`;
}

function setDeparturesState(mode) {
  $("#departures-loading").classList.toggle("hidden", mode !== "loading");
  $("#departures-error").classList.toggle("hidden", mode !== "error");
  $("#departures-empty").classList.toggle("hidden", mode !== "empty");
  $(".departures-table").classList.toggle("hidden", mode !== "ready");
}

function updateRouteSummary() {
  const origin = getStationById(state.originStationId);
  const destination = getStationById(state.destinationStationId);
  const valid = origin && destination && state.originStationId !== state.destinationStationId;
  $("#route-summary").innerHTML = valid
    ? `<strong>${origin.stationName}</strong> → <strong>${destination.stationName}</strong>`
    : "";
  $("#route-error").classList.toggle("hidden", valid);
  return valid;
}

function updateNextTrainCard(originName, destinationName, firstDeparture) {
  $("#next-train-subtitle").textContent = `Najbliższy odjazd · ${originName}`;
  if (!firstDeparture) {
    $("#next-train-content").innerHTML = `<div class="empty-state">Brak zaplanowanych odjazdów dla tej stacji.</div>`;
    return;
  }
  const [destination, platform, minutes, delayMinutes] = firstDeparture;
  const departureTime = formatTime(new Date(Date.now() + minutes * 60000));
  const isDelayed = delayMinutes > 0;
  $("#next-train-content").innerHTML = `<div><div class="next-time">${departureTime}</div><div class="next-time-label">za ${minutes} min · peron ${platform}</div></div><div class="next-direction"><span class="direction-arrow">→</span><span>${destinationName || destination}</span>${isDelayed ? `<span class="delay-pill">+${delayMinutes} min</span>` : ""}</div>`;
}

function renderDeparturesRows(rows) {
  const busMode = state.transportMode === "bus";
  $("#line-column").classList.toggle("hidden", !busMode);
  $("#departures-body").innerHTML = rows.map((row) => {
    const [line, destination, platform, minutes, delayMinutes] = busMode ? row : [null, ...row];
    const isDelayed = delayMinutes > 0;
    const departureTime = formatTime(new Date(Date.now() + minutes * 60000));
    return `<tr>${busMode ? `<td class="line-number">${line}</td>` : ""}<td><div class="train-destination"><span class="route-icon" aria-hidden="true">→</span>${destination}</div></td><td class="platform">${platform}</td><td><span class="departure-time">${departureTime}</span></td><td><span class="status ${isDelayed ? "delayed" : "on-time"}">${isDelayed ? `+${delayMinutes} min` : "Na czas"}</span></td></tr>`;
  }).join("");
}

function generatedBusRows(originId, destinationName, count = 12) {
  const seed = [...originId].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const lines = ["127", "N1", "171", "K", "R"];
  return Array.from({ length: count }, (_, index) => [lines[(seed + index) % lines.length], destinationName, String((seed + index) % 5 + 1), 3 + index * 6 + seed % 3, index % 5 === 2 ? 2 : 0]);
}

function populateBusPickers() {
  const root = $("#bus-pickers");
  root.innerHTML = `<div class="route-picker"><span class="route-picker-title">Przystanek początkowy</span><div class="pickers-group"><label class="station-picker"><span class="picker-label">Miasto</span><select id="bus-origin-city"></select><span aria-hidden="true">⌄</span></label><label class="station-picker"><span class="picker-label">Przystanek</span><select id="bus-origin-stop"></select><span aria-hidden="true">⌄</span></label></div></div><span class="route-arrow" aria-hidden="true">→</span><div class="route-picker"><span class="route-picker-title">Przystanek końcowy</span><div class="pickers-group"><label class="station-picker"><span class="picker-label">Miasto</span><select id="bus-destination-city"></select><span aria-hidden="true">⌄</span></label><label class="station-picker"><span class="picker-label">Przystanek</span><select id="bus-destination-stop"></select><span aria-hidden="true">⌄</span></label></div></div>`;
  populateOptionsFromNetwork("#bus-origin-city", BUS_NETWORK, "gdansk");
  populateOptionsFromNetwork("#bus-destination-city", BUS_NETWORK, "gdynia");
  state.busOriginCity = "gdansk"; state.busDestinationCity = "gdynia";
  state.busOriginStop = populateStationOptions("#bus-origin-stop", "gdansk", null, BUS_NETWORK);
  state.busDestinationStop = populateStationOptions("#bus-destination-stop", "gdynia", null, BUS_NETWORK);
  ["bus-origin-city", "bus-destination-city", "bus-origin-stop", "bus-destination-stop"].forEach((id) => $(`#${id}`).addEventListener("change", onBusChange));
}

function populateOptionsFromNetwork(selector, network, selectedCityId) {
  $(selector).innerHTML = Object.entries(network).map(([id, city]) => `<option value="${id}">${city.name}</option>`).join("");
  $(selector).value = selectedCityId;
}

function populateStationOptions(selector, cityId, selectedStationId, network = SKM_NETWORK) {
  const city = network[cityId];
  const options = city ? city.stations : [];
  const next = options.some((item) => item.id === selectedStationId) ? selectedStationId : options[0]?.id ?? null;
  $(selector).innerHTML = options.map((item) => `<option value="${item.id}">${item.name}</option>`).join("");
  if (next) $(selector).value = next;
  return next;
}

function populateCityOptions(selector, selectedCityId) {
  $(selector).innerHTML = Object.entries(SKM_NETWORK).map(([cityId, city]) => `<option value="${cityId}">${city.name}</option>`).join("");
  $(selector).value = selectedCityId;
}

function populateStationOptions(selector, cityId, selectedStationId, network = SKM_NETWORK) {
  const city = network[cityId];
  const stationOptions = city ? city.stations : [];
  const nextStationId = stationOptions.some((station) => station.id === selectedStationId) ? selectedStationId : stationOptions[0]?.id ?? null;
  $(selector).innerHTML = stationOptions.map((station) => `<option value="${station.id}">${station.name}</option>`).join("");
  if (nextStationId) $(selector).value = nextStationId;
  return nextStationId;
}

function setWeatherLoading() {
  $("#weather-content").innerHTML = `<div class="loading-pulse large"></div><div class="loading-lines"><span></span><span></span></div>`;
  $("#weather-details").innerHTML = "";
  $("#weather-error").classList.add("hidden");
  $("#weather-source").textContent = "Ładuję…";
}

async function fetchWeather(cityId) {
  const coordinates = CITY_COORDINATES[cityId] ?? CITY_COORDINATES[DEFAULT_CITY_ID];
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${coordinates[0]}&longitude=${coordinates[1]}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability,weather_code&forecast_days=1&timezone=Europe%2FWarsaw`;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(7000) });
    if (!response.ok) throw new Error("Weather request failed");
    return { data: await response.json(), demo: false, error: null };
  } catch {
    return { data: DEMO_WEATHER, demo: true, error: "Brak połączenia z serwisem pogodowym — pokazuję ostatnie dane zastępcze." };
  }
}

function renderForecast(hourly) {
  const now = new Date();
  const start = hourly.time.findIndex((time) => new Date(time) >= now);
  const items = Array.from({ length: 6 }, (_, index) => {
    const position = Math.max(0, start) + index;
    const time = hourly.time[position] ? new Date(hourly.time[position]) : new Date(now.getTime() + index * 3600000);
    return {
      time,
      temp: hourly.temperature_2m[position] ?? DEMO_WEATHER.hourly.temperature_2m[index],
      rain: hourly.precipitation_probability[position] ?? DEMO_WEATHER.hourly.precipitation_probability[index],
      code: hourly.weather_code[position] ?? 2
    };
  });
  $("#forecast-strip").innerHTML = items.map((item, index) => {
    const [, icon] = getWeatherLabel(item.code);
    return `<div class="forecast-item"><div class="forecast-time">${index === 0 ? "TERAZ" : formatTime(item.time)}</div><div class="forecast-icon" aria-hidden="true">${icon}</div><div class="forecast-temp">${Math.round(item.temp)}°</div><div class="forecast-rain">💧 ${item.rain}%</div></div>`;
  }).join("");
}

function renderWeather({ data, demo, error }, locationName) {
  const current = data.current;
  const [label, icon] = getWeatherLabel(current.weather_code);
  const location = getStationById(state.originStationId);
  $("#weather-location").textContent = `Pogoda dla: ${location?.cityName || "wybranej lokalizacji"}`;
  $("#weather-station").textContent = locationName;
  $("#weather-source").textContent = demo ? "dane zastępcze" : "Open-Meteo";
  $("#weather-error").textContent = error || "";
  $("#weather-error").classList.toggle("hidden", !error);
  $("#weather-content").innerHTML = `<span class="weather-icon" aria-hidden="true">${icon}</span><div><div class="temperature">${Math.round(current.temperature_2m)}<sup>°C</sup></div><div class="weather-label">${label}</div></div>`;
  $("#weather-details").innerHTML = `<div class="weather-detail">Odczuwalna<strong>${Math.round(current.apparent_temperature)}°C</strong></div><div class="weather-detail">Wilgotność<strong>${current.relative_humidity_2m}%</strong></div><div class="weather-detail">Wiatr<strong>${Math.round(current.wind_speed_10m)} <span>km/h</span></strong></div>`;
  renderForecast(data.hourly);
}

async function loadWeather() {
  const requestId = ++state.weatherRequestId;
  const location = getStationById(state.originStationId);
  if (!location) return;
  setWeatherLoading();
  const result = await fetchWeather(state.originCityId);
  if (requestId !== state.weatherRequestId) return;
  renderWeather(result, location.stationName);
}

async function loadDepartures() {
  if (state.transportMode === "bus") return loadBusDepartures();
  updateRouteSummary();
  const origin = getStationById(state.originStationId);
  const destination = getStationById(state.destinationStationId);
  if (!origin || !destination || origin.stationName === destination.stationName) {
    setDeparturesState("empty");
    updateNextTrainCard(origin?.stationName || "Stacja początkowa", destination?.stationName, null);
    return;
  }
  setDeparturesState("loading");
  try {
    const rows = await skmService.getDepartures(state.originCityId, state.originStationId, state.destinationStationId);
    if (!rows.length) {
      setDeparturesState("empty");
      updateNextTrainCard(origin.stationName, destination.stationName, null);
      return;
    }
    renderDeparturesRows(rows.slice(0, state.departureLimit));
    updateNextTrainCard(origin.stationName, destination.stationName, rows[0]);
    setDeparturesState("ready");
    $("#show-later-button").classList.toggle("hidden", rows.length <= state.departureLimit);
  } catch {
    setDeparturesState("error");
    updateNextTrainCard(origin.stationName, destination.stationName, null);
  }

}

async function loadBusDepartures() {
    const origin = BUS_NETWORK[state.busOriginCity]?.stations.find((item) => item.id === state.busOriginStop);
    const destination = BUS_NETWORK[state.busDestinationCity]?.stations.find((item) => item.id === state.busDestinationStop);
    const same = !origin || !destination || state.busOriginStop === state.busDestinationStop;
    $("#route-summary").innerHTML = !same ? `<strong>${origin.name}</strong> → <strong>${destination.name}</strong>` : "";
    $("#route-error").classList.toggle("hidden", !same);
    $("#transport-notice").querySelector("span:last-child").textContent = "Brak bezpośredniego połączenia z przewoźnikiem — pokazujemy orientacyjne dane testowe.";
    if (same) { setDeparturesState("empty"); return; }
    setDeparturesState("loading");
    await new Promise((resolve) => setTimeout(resolve, 180));
    renderDeparturesRows(generatedBusRows(state.busOriginStop, destination.name, 10));
    setDeparturesState("ready");
    $("#show-later-button").classList.add("hidden");
}

function onBusChange(event) {
    const id = event.target.id;
    if (id === "bus-origin-city") { state.busOriginCity = event.target.value; state.busOriginStop = populateStationOptions("#bus-origin-stop", state.busOriginCity, null, BUS_NETWORK); }
    if (id === "bus-destination-city") { state.busDestinationCity = event.target.value; state.busDestinationStop = populateStationOptions("#bus-destination-stop", state.busDestinationCity, null, BUS_NETWORK); }
    if (id === "bus-origin-stop") state.busOriginStop = event.target.value;
    if (id === "bus-destination-stop") state.busDestinationStop = event.target.value;
    loadDepartures();
}

function setTransportMode(mode) {
    state.transportMode = mode;
    const bus = mode === "bus";
    $("#trains-tab").classList.toggle("active", !bus);
    $("#buses-tab").classList.toggle("active", bus);
    $("#train-pickers").classList.toggle("hidden", bus);
    $("#bus-pickers").classList.toggle("hidden", !bus);
    $("#bus-pickers").setAttribute("aria-hidden", String(!bus));
    $("#departures-title").textContent = bus ? "Nadjeżdżające autobusy" : "Nadjeżdżające pociągi";
    $("#transport-notice").querySelector("span:last-child").textContent = bus ? "Brak bezpośredniego połączenia z przewoźnikiem — pokazujemy orientacyjne dane testowe." : "Godziny odjazdów są orientacyjne. Po podłączeniu danych przewoźnika pojawią się aktualne informacje.";
    loadDepartures();
}

async function loadLeaderboard() {
    $("#leaderboard-loading").classList.toggle("hidden", !authUser);
    $("#leaderboard-error").classList.add("hidden");
    $("#leaderboard-login").classList.toggle("hidden", !!authUser);
    $("#leaderboard").classList.add("hidden");
    $("#leaderboard-empty").classList.add("hidden");
    if (!authUser) return;
    try {
      const response = await fetch(`${API_BASE}/api/checkins/today`, { credentials: "include" });
      if (!response.ok) throw new Error("leaderboard request failed");
      const data = await response.json();
      $("#checkin-status").textContent = data.checkedIn ? `Obecność zgłoszona. Pass: ${data.streak} dni.` : `Twój pass: ${data.streak} dni.`;
      $("#checkin-button").disabled = data.checkedIn;
      $("#checkin-button").textContent = data.checkedIn ? "Obecność zgłoszona" : "Zgłoś obecność";
      const rows = Array.isArray(data.top) ? data.top : [];
      if (!rows.length) {
        $("#leaderboard-empty").classList.remove("hidden");
      } else {
        $("#leaderboard-body").innerHTML = rows.map((item, index) => `<tr><td>${index + 1}</td><td>${item.username}</td><td>${item.streak} dni</td></tr>`).join("");
        $("#leaderboard").classList.remove("hidden");
      }
    } catch {
      $("#leaderboard-error").classList.remove("hidden");
    } finally {
      $("#leaderboard-loading").classList.add("hidden");
    }
}

async function checkIn() {
    if (!authUser) return $("#checkin-status").textContent = "Zaloguj się, aby zgłosić obecność.";
    const response = await fetch(`${API_BASE}/api/checkins`, { method: "POST", credentials: "include" });
    const data = await response.json().catch(() => ({}));
    $("#checkin-status").textContent = response.status === 409 ? "Obecność na dziś jest już zgłoszona." : (data.message || data.error || "Nie udało się zgłosić obecności.");
    await loadLeaderboard();
}

async function loadData(showToast = false) {
  await Promise.all([loadWeather(), loadDepartures()]);
  setDate();
  if (showToast) {
    $("#toast").textContent = "Dane zostały odświeżone.";
    $("#toast").classList.add("show");
    setTimeout(() => $("#toast").classList.remove("show"), 3200);
  }
}

function bindEvents() {
  $("#trains-tab").addEventListener("click", () => setTransportMode("train"));
  $("#buses-tab").addEventListener("click", () => setTransportMode("bus"));
  $("#show-later-button").addEventListener("click", () => {
    state.departureLimit += 4;
    loadDepartures();
  });
  $("#origin-city-select").addEventListener("change", async (event) => {
    state.originCityId = event.target.value;
    state.originStationId = populateStationOptions("#origin-station-select", state.originCityId, null);
    await Promise.all([loadWeather(), loadDepartures()]);
  });
  $("#origin-station-select").addEventListener("change", async (event) => {
    state.originStationId = event.target.value;
    await Promise.all([loadWeather(), loadDepartures()]);
  });
  $("#destination-city-select").addEventListener("change", async (event) => {
    state.destinationCityId = event.target.value;
    state.destinationStationId = populateStationOptions("#destination-station-select", state.destinationCityId, null);
    await loadDepartures();
  });
  $("#destination-station-select").addEventListener("change", async (event) => {
    state.destinationStationId = event.target.value;
    await loadDepartures();
  });
  $("#refresh-button").addEventListener("click", () => loadData(true));
}

function initFilters() {
  populateCityOptions("#origin-city-select", state.originCityId);
  state.originStationId = populateStationOptions("#origin-station-select", state.originCityId, "gdansk-glowny");
  populateCityOptions("#destination-city-select", state.destinationCityId);
  state.destinationStationId = populateStationOptions("#destination-station-select", state.destinationCityId, state.destinationStationId);
  populateBusPickers();
}

initTheme();
initAuth();
initFilters();
bindEvents();
loadData();
