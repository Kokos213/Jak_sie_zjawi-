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
   - **Build command:** `./build_pages.sh`
   - **Build output directory:** `.`
4. Dodaj zmienną środowiskową builda `API_BASE`:
   - `https://YOUR-SERVICE.onrender.com` — zamień `YOUR-SERVICE` na faktyczny adres usługi Render.
5. Po pierwszym deployu skopiuj dokładny adres Pages, np. `https://jak-sie-zjawie.pages.dev`, do zmiennej Render `SKM_ALLOWED_ORIGINS`. Jeśli używasz własnej domeny, wpisz również jej pełny origin, rozdzielając origins przecinkami.
6. Sprawdź:
   - `https://YOUR-SERVICE.onrender.com/api/health`
   - `https://jak-sie-zjawie.pages.dev`

`build_pages.sh` generuje ignorowany plik `config.js`, więc `API_BASE` jest wstrzyknięty w statyczny frontend bez sekretów. Na wdrożeniu Pages `app.js` używa tej wartości i wysyła `/api/auth/*` do Render z `credentials: include`. Render dla żądań z innej domeny ustawia cookie `SameSite=None; Secure`; CORS dopuszcza tylko origins z `SKM_ALLOWED_ORIGINS`. Lokalnie można skopiować `config.example.js` do `config.js`, ale do zwykłego podglądu 4173 działa automatyczny fallback na `http://127.0.0.1:8000`.

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
