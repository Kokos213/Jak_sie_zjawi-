# Jak się zjawię

## Uruchomienie lokalne

Projekt nie wymaga pakietów zewnętrznych. Uruchom z katalogu projektu:

```bash
./start_server.sh
```

Skrypt przechodzi do właściwego katalogu i wybiera działający interpreter Python, również macOS Python z Command Line Tools, gdy `python3` jest stubem `xcode-select`. Otwórz `http://127.0.0.1:8000`.

## Deploy na Render

1. Umieść ten folder w repozytorium GitHub i wypchnij wszystkie pliki, w szczególności `render.yaml` oraz wykonywalny `start_server.sh`.
2. W Render wybierz **New → Blueprint** i wskaż repozytorium GitHub. Render odczyta `render.yaml` i utworzy Web Service `jak-sie-zjawie`.
3. Jeśli tworzysz usługę ręcznie, ustaw:
   - **Runtime:** Python
   - **Build Command:** `true`
   - **Start Command:** `./start_server.sh`
   - **Health Check Path:** `/api/health`
4. W zakładce Environment ustaw sekrety jako zmienne Render (nie zapisuj ich w repo):
   - `SKM_SESSION_SECRET` — długi losowy sekret, np. wygenerowany przez `openssl rand -hex 48`
   - `SKM_PASSWORD_PEPPER` — drugi, niezależny sekret wygenerowany tak samo
   - `SKM_DB_PATH` — `./skm.sqlite3` dla prototypu albo `/var/data/skm.sqlite3` po dodaniu persistent disk
5. Uruchom deploy. Render ustawi `PORT` automatycznie; `server.py` nasłuchuje na `0.0.0.0` i używa `PORT`, więc nie trzeba ustawiać własnego portu.
6. Sprawdź `https://TWOJ-SLUG.onrender.com/api/health` — odpowiedź powinna być `{"status":"ok"}` — a następnie otwórz publiczny URL aplikacji.

Frontend używa pustego `API_BASE` na wdrożonym originie, więc `/api/*` trafia do tej samej usługi. Cookies sesji są `HttpOnly`, `SameSite=Lax`, a za HTTPS Render backend dodaje `Secure` na podstawie `X-Forwarded-Proto`. Nie ma potrzeby dodawania publicznego CORS dla wdrożonej aplikacji; ograniczony CORS pozostaje tylko dla lokalnego podglądu na porcie `4173`.

## Frontend na Cloudflare Pages

Frontend jest statyczny i korzysta z katalogu głównego repozytorium. Przygotowanie do Pages:

1. Wypchnij repozytorium na GitHub (gałąź `main`).
2. W Cloudflare wybierz **Workers & Pages → Create application → Pages → Connect to Git** i wskaż repozytorium.
3. Ustaw:
   - **Production branch:** `main`
   - **Root directory:** `/` (root repozytorium projektu)
   - **Build command:** `sh ./build_pages.sh`
   - **Build output directory:** `dist`
4. Dodaj zmienną środowiskową builda `API_BASE`:
   - `https://YOUR-SERVICE.onrender.com` — zamień `YOUR-SERVICE` na faktyczny adres usługi Render.
5. Po pierwszym deployu skopiuj dokładny adres Pages, np. `https://jak-sie-zjawie.pages.dev`, do zmiennej Render `SKM_ALLOWED_ORIGINS`. Jeśli używasz własnej domeny, wpisz również jej pełny origin, rozdzielając origins przecinkami.
6. Sprawdź:
   - `https://YOUR-SERVICE.onrender.com/api/health`
   - `https://jak-sie-zjawie.pages.dev`

### Automatyczne wdrażanie po zmianach

Po połączeniu repozytorium z Cloudflare Pages każdy push do skonfigurowanej gałęzi produkcyjnej `main` uruchamia automatyczny build `./build_pages.sh` i nowy deploy Pages. Pull requesty mogą tworzyć preview deployments, zależnie od ustawień projektu.

Render Web Service również może automatycznie wdrażać push do połączonej gałęzi (zwykle `main`), jeśli w ustawieniach usługi jest włączone **Auto-Deploy**. Zmiany w `server.py`, `render.yaml` lub backendowych zmiennych wymagają nowego deployu Render; zmiana samego frontendu wymaga deployu Pages. Po zmianie `SKM_ALLOWED_ORIGINS` wykonaj redeploy/restart Render, aby proces wczytał nową wartość.

`build_pages.sh` tworzy `dist/` i kopiuje do niego wyłącznie `index.html`, `styles.css`, `app.js` oraz wygenerowany `config.js`; sprawdza też obecność `functions/`. `functions/` nie jest publikowany jako statyczny output — Pages Functions wykrywa go jako źródło routingu przy deployu przez Git integration/Wrangler. Na wariancie Pages + Render `app.js` wysyła `/api/auth/*` do Render z `credentials: include`; na wariancie Pages Functions pozostaw `API_BASE` puste.

## Alternatywna migracja auth: Cloudflare Pages Functions + Supabase

Render pozostaje działającą ścieżką i nie jest usuwany. Nowa ścieżka zachowuje ten sam kontrakt frontendowy (`/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`), ale endpointy obsługują Pages Functions, a użytkowników i sesje obsługuje Supabase Auth/Postgres. Hasła nie przechodzą przez własną bazę ani nie są zapisywane w repozytorium.

1. W Supabase utwórz projekt, skopiuj **Project URL** i publiczny **anon key** z ustawień API.
2. W Authentication → URL Configuration dodaj:
   - `https://TWOJ-PROJEKT.pages.dev`
   - lokalnie `http://localhost:8788` (dla `wrangler pages dev`)
3. W Cloudflare Pages ustaw build:
   - **Build command:** `sh ./build_pages.sh`
   - **Output directory:** `dist`
   - **Production branch:** `main`
4. W Pages → Settings → Environment variables dodaj jako **encrypted runtime variables** dla Preview i Production:
   - `SUPABASE_URL=https://YOUR-PROJECT.supabase.co`
   - `SUPABASE_ANON_KEY=...`
   Nie używaj `service_role` key w Functions ani w frontendzie.
   Dla tej ścieżki Supabase pozostaw `API_BASE` puste/nieustawione — wtedy frontend korzysta z Pages Functions na tym samym originie. `API_BASE=https://...onrender.com` dotyczy wyłącznie wariantu Pages + istniejący Render.
5. Wypchnij commit do `main`. Użyj Cloudflare Pages z połączeniem Git lub Wrangler Pages — nie zwykłego uploadu samych plików statycznych. Ustaw **Root directory `/`**, **Build command `sh ./build_pages.sh`**, **Build output directory `dist`**. `dist/` zawiera tylko frontend; `functions/` musi pozostać w root repozytorium jako źródło Pages Functions i nie może być ustawione jako output.
6. Przetestuj:
   - `https://TWOJ-PROJEKT.pages.dev/api/health` — musi zwrócić `status: "ok"`, nie samo 200 z hosta statycznego
   - rejestrację, potwierdzenie e-maila (jeśli włączone w Supabase), logowanie i wylogowanie.

Tryb lokalny wymaga Wrangler (`npm install -g wrangler` lub `npx wrangler`) oraz pliku `.dev.vars` skopiowanego z `.dev.vars.example`. Po buildzie uruchom `npx wrangler pages dev dist --compatibility-date=2026-09-30`; Functions muszą być wykryte z root repozytorium zgodnie z `wrangler.toml`. Przy braku Wrangler nadal działa lokalny Render/Python przez `./start_server.sh`.

Jeżeli `/api/health` zwraca 404, Pages wdrożyło tylko frontend statyczny albo projekt nie korzysta z Pages Functions. Sprawdź root directory `/`, połączenie Git/Pages Functions oraz redeploy po commitcie zawierającym `functions/`. Jeżeli zwraca 503 z `supabase_env_missing`, dodaj `SUPABASE_URL` i `SUPABASE_ANON_KEY` jako **runtime variables** w Production i wykonaj redeploy. Jeżeli zwraca `supabase_timeout`/`supabase_unreachable`, sprawdź Project URL, anon key i status Supabase. To są rozstrzygające diagnostyki — nie trzeba zgadywać po samym spinnerze.

### Test kontraktu auth po wdrożeniu

Po uzyskaniu `status: "ok", code: "ready"` wykonaj z terminala (bez wpisywania prawdziwego hasła do historii shell, jeśli to możliwe):

```bash
curl -i -X POST "https://TWOJ-PROJEKT.pages.dev/api/auth/login" \
  -H "Content-Type: application/json" \
  --data '{"email":"nieistniejacy@example.com","password":"niepoprawne-haslo"}'
```

Oczekiwane zachowanie to szybka odpowiedź JSON `401` z komunikatem `Nieprawidłowy e-mail lub hasło.`. `404` oznacza brak Functions, `503` oznacza problem runtime/env/Supabase, a zawieszenie ponad 20 sekund oznacza problem sieciowy — frontend przerwie je komunikatem timeoutu. Przy rejestracji z włączonym potwierdzeniem e-mail Supabase zwraca `201` z komunikatem o sprawdzeniu skrzynki; to nie jest błąd. Dla `email_not_confirmed` logowanie pokazuje osobny komunikat o aktywacji e-maila.

Jeśli endpoint zwróci `429`, jest to limit Supabase Auth (rejestracja, logowanie lub wysyłka potwierdzenia), a nie mechanizm do obejścia po stronie klienta. Frontend blokuje kolejne wysłanie, pokazuje odliczanie na podstawie `Retry-After` i nie ponawia żądania automatycznie. Odczekaj liczbę sekund z komunikatu (gdy Supabase nie poda wartości, przyjmowane jest 60 s). W Supabase sprawdź **Authentication → Rate Limits** oraz ustawienia dostawcy e-mail/SMTP; limity mogą zależeć od planu i adresu IP. Sprawdź też DevTools → Network, czy dla jednej próby istnieje dokładnie jedno `POST /api/auth/login` lub `/register`.

Cookies Supabase sesji są ustawiane przez Functions jako `HttpOnly; SameSite=None; Secure`, a requesty frontendowe używają `credentials: include`. Ponieważ API i UI są na tym samym originie Pages, nie jest potrzebny publiczny CORS. Nie wkładaj sekretów do `wrangler.toml`, `config.js`, GitHub ani repozytorium.

Cloudflare Pages nie wykonuje deployu z tego środowiska, bo wymaga dostępu do konta Cloudflare/GitHub. Jedyny ręczny krok: podłącz repozytorium w Pages, ustaw powyższe wartości i po poznaniu domeny Pages wpisz ją do `SKM_ALLOWED_ORIGINS` w Render.

## Trwałość bazy

Darmowy Render Web Service ma efemeryczny system plików: SQLite może zostać utracone przy redeployu, restarcie lub migracji instancji. To jest akceptowalne dla demonstratora, ale nie dla prawdziwych kont produkcyjnych.

Przed użyciem produkcyjnym wybierz jedną opcję:

- dodaj Render Persistent Disk i ustaw `SKM_DB_PATH=/var/data/skm.sqlite3` (wymaga planu/usługi obsługującej persistent disk), albo
- przenieś użytkowników i sesje do zewnętrznego PostgreSQL (np. Render Postgres) i zastąp warstwę SQLite migracją SQL.

## API i bezpieczeństwo

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Hasła nigdy nie są przechowywane jako plaintext: backend używa `scrypt`, a na interpreterach bez `hashlib.scrypt` bezpiecznego fallbacku `PBKDF2-HMAC-SHA256` (310 000 iteracji). Token sesji jest przechowywany w bazie jako HMAC. Nie commituj `.env`, sekretów ani `skm.sqlite3`.
# Jak_sie_zjawi-
# Jak_sie_zjawi-
