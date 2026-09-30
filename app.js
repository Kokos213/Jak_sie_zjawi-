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

const weatherLabels = { 0: ["Bezchmurnie", "☀️"], 1: ["Przeważnie pogodnie", "🌤️"], 2: ["Częściowe zachmurzenie", "⛅"], 3: ["Pochmurno", "☁️"], 45: ["Mgła", "🌫️"], 51: ["Mżawka", "🌦️"], 61: ["Deszcz", "🌧️"], 71: ["Śnieg", "🌨️"], 80: ["Przelotny deszcz", "🌦️"], 95: ["Burza", "⛈️"] };
const $ = (selector) => document.querySelector(selector);
const API_BASE = window.location.port === "4173" ? "http://127.0.0.1:8000" : "";
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

function setAuthError(message) {
  $("#auth-error").textContent = message || "";
  $("#auth-error").classList.toggle("hidden", !message);
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
  $("#register-tab").classList.toggle("active", registering);
  $("#login-tab").classList.toggle("active", !registering);
  setAuthError("");
}

function openAuth() {
  $("#auth-backdrop").classList.remove("hidden");
  $("#auth-email").focus();
}

function closeAuth() {
  $("#auth-backdrop").classList.add("hidden");
  setAuthError("");
}

function updateAccountButton() {
  $("#account-button").textContent = authUser ? `Wyloguj (${authUser.username})` : "Zaloguj się";
  $("#account-button").setAttribute("aria-label", authUser ? `Wyloguj użytkownika ${authUser.username}` : "Zaloguj się");
}

async function checkAuth() {
  try {
    const response = await fetch(`${API_BASE}/api/auth/me`, { credentials: "include" });
    if (!response.ok) return;
    const payload = await response.json();
    authUser = payload.user;
    updateAccountButton();
  } catch {
    // Statyczny podgląd bez backendu pozostaje użyteczny.
  }
}

async function submitAuth(event) {
  event.preventDefault();
  setAuthError("");
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const password = $("#auth-password").value;
  if (authMode === "register" && password !== $("#auth-confirm").value) {
    return setAuthError("Hasła muszą być identyczne.");
  }
  const payload = {
    email: $("#auth-email").value.trim(),
    password,
    ...(authMode === "register" ? { username: $("#auth-username").value.trim(), confirmPassword: $("#auth-confirm").value } : {})
  };
  const submit = $("#auth-submit");
  submit.disabled = true;
  submit.textContent = "Przetwarzam…";
  try {
    const response = await fetch(`${API_BASE}/api/auth/${authMode}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      return setAuthError(result.error || "Nie udało się przetworzyć formularza.");
    }
    authUser = result.user;
    updateAccountButton();
    closeAuth();
    form.reset();
  } catch {
    setAuthError("Backend konta jest niedostępny. Uruchom `./start_server.sh`, otwórz http://127.0.0.1:8000 i spróbuj ponownie.");
  } finally {
    submit.disabled = false;
    submit.textContent = authMode === "register" ? "Utwórz konto" : "Zaloguj się";
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
  checkAuth();
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
    return baseRows.map(([, platform, minutes, delayMinutes]) => [destination, platform, minutes, delayMinutes]);
  }
};

const state = {
  originCityId: DEFAULT_CITY_ID,
  originStationId: null,
  destinationCityId: "gdynia",
  destinationStationId: "gdynia-glowna",
  weatherRequestId: 0
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
  $("#departures-body").innerHTML = rows.map(([destination, platform, minutes, delayMinutes]) => {
    const isDelayed = delayMinutes > 0;
    const departureTime = formatTime(new Date(Date.now() + minutes * 60000));
    return `<tr><td><div class="train-destination"><span class="route-icon" aria-hidden="true">→</span>${destination}</div></td><td class="platform">${platform}</td><td><span class="departure-time">${departureTime}</span></td><td><span class="status ${isDelayed ? "delayed" : "on-time"}">${isDelayed ? `+${delayMinutes} min` : "Na czas"}</span></td></tr>`;
  }).join("");
}

function populateCityOptions(selector, selectedCityId) {
  $(selector).innerHTML = Object.entries(SKM_NETWORK).map(([cityId, city]) => `<option value="${cityId}">${city.name}</option>`).join("");
  $(selector).value = selectedCityId;
}

function populateStationOptions(selector, cityId, selectedStationId) {
  const city = SKM_NETWORK[cityId];
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
    return { data: DEMO_WEATHER, demo: true, error: "Nie udało się pobrać aktualnej pogody — pokazuję dane demonstracyjne." };
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
  $("#weather-source").textContent = demo ? "tryb demonstracyjny" : "Open-Meteo";
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
    renderDeparturesRows(rows);
    updateNextTrainCard(origin.stationName, destination.stationName, rows[0]);
    setDeparturesState("ready");
  } catch {
    setDeparturesState("error");
    updateNextTrainCard(origin.stationName, destination.stationName, null);
  }
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
}

initTheme();
initAuth();
initFilters();
bindEvents();
loadData();
