#!/usr/bin/env python3
"""Small local backend for registration, login and weather dashboard static files."""
import hashlib
import hmac
import json
import os
import re
import secrets
import sqlite3
import time
from http import HTTPStatus
from http.cookies import SimpleCookie
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent
DB_PATH = Path(os.getenv("SKM_DB_PATH", ROOT / "skm.sqlite3"))
SESSION_SECRET = os.getenv("SKM_SESSION_SECRET", "local-development-secret-change-me").encode()
PASSWORD_PEPPER = os.getenv("SKM_PASSWORD_PEPPER", "local-development-pepper-change-me").encode()
ALLOWED_ORIGINS = {
    origin.strip().rstrip("/")
    for origin in os.getenv(
        "SKM_ALLOWED_ORIGINS",
        "http://127.0.0.1:4173,http://localhost:4173",
    ).split(",")
    if origin.strip()
}
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
USERNAME_RE = re.compile(r"^[A-Za-z0-9_.-]{3,32}$")
SESSION_MAX_AGE = 60 * 60 * 24 * 30


def db_connection():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def init_db():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with db_connection() as db:
        db.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY,
                email TEXT NOT NULL UNIQUE COLLATE NOCASE,
                username TEXT NOT NULL UNIQUE COLLATE NOCASE,
                password_hash TEXT NOT NULL,
                created_at INTEGER NOT NULL
            );
            CREATE TABLE IF NOT EXISTS sessions (
                token_hash TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                expires_at INTEGER NOT NULL,
                created_at INTEGER NOT NULL
            );
            CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions(expires_at);
            """
        )


def validate_registration(payload):
    email = str(payload.get("email", "")).strip().lower()
    username = str(payload.get("username", "")).strip()
    password = str(payload.get("password", ""))
    confirmation = str(payload.get("confirmPassword", ""))
    errors = {}
    if not EMAIL_RE.fullmatch(email) or len(email) > 254:
        errors["email"] = "Podaj poprawny adres e-mail."
    if not USERNAME_RE.fullmatch(username):
        errors["username"] = "Nazwa użytkownika musi mieć 3–32 znaki: litery, cyfry, ., _ lub -."
    if len(password) < 10 or len(password) > 128:
        errors["password"] = "Hasło musi mieć od 10 do 128 znaków."
    if password != confirmation:
        errors["confirmPassword"] = "Hasła muszą być identyczne."
    return errors, email, username, password


def hash_password(password):
    salt = secrets.token_bytes(16)
    effective_salt = salt + PASSWORD_PEPPER[:16]
    if hasattr(hashlib, "scrypt"):
        digest = hashlib.scrypt(password.encode(), salt=effective_salt, n=16384, r=8, p=1, dklen=32)
        return f"scrypt$16384$8$1${salt.hex()}${digest.hex()}"
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), effective_salt, 310_000, dklen=32)
    return f"pbkdf2-sha256$310000${salt.hex()}${digest.hex()}"


def verify_password(password, encoded):
    try:
        parts = encoded.split("$")
        algorithm = parts[0]
        if algorithm == "scrypt":
            _, n, r, p, salt_hex, digest_hex = parts
            salt = bytes.fromhex(salt_hex)
            expected = hashlib.scrypt(
                password.encode(), salt=salt + PASSWORD_PEPPER[:16],
                n=int(n), r=int(r), p=int(p), dklen=len(bytes.fromhex(digest_hex))
            )
        elif algorithm == "pbkdf2-sha256":
            _, iterations, salt_hex, digest_hex = parts
            salt = bytes.fromhex(salt_hex)
            expected = hashlib.pbkdf2_hmac(
                "sha256", password.encode(), salt + PASSWORD_PEPPER[:16],
                int(iterations), dklen=len(bytes.fromhex(digest_hex))
            )
        else:
            return False
        return hmac.compare_digest(expected, bytes.fromhex(digest_hex))
    except (ValueError, TypeError):
        return False


def public_user(row):
    return {"id": row["id"], "email": row["email"], "username": row["username"]}


class AppHandler(SimpleHTTPRequestHandler):
    server_version = "SKMWeather/1.0"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, fmt, *args):
        # Never log request bodies or credentials.
        super().log_message(fmt, *args)

    def send_json(self, status, payload, cookies=()):
        body = json.dumps(payload, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        origin = self.headers.get("Origin")
        if origin in ALLOWED_ORIGINS:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Access-Control-Allow-Credentials", "true")
            self.send_header("Vary", "Origin")
        for cookie in cookies:
            self.send_header("Set-Cookie", cookie)
        self.end_headers()
        self.wfile.write(body)

    def read_json(self):
        length = int(self.headers.get("Content-Length", "0"))
        if length > 16_384:
            raise ValueError("payload too large")
        return json.loads(self.rfile.read(length).decode("utf-8"))

    def session_token(self):
        cookies = SimpleCookie(self.headers.get("Cookie", ""))
        return cookies.get("skm_session").value if cookies.get("skm_session") else None

    def current_user(self):
        token = self.session_token()
        if not token:
            return None
        token_hash = hmac.new(SESSION_SECRET, token.encode(), hashlib.sha256).hexdigest()
        now = int(time.time())
        with db_connection() as db:
            db.execute("DELETE FROM sessions WHERE expires_at < ?", (now,))
            row = db.execute(
                "SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at >= ?",
                (token_hash, now),
            ).fetchone()
        return row

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/health":
            return self.send_json(HTTPStatus.OK, {"status": "ok"})
        if parsed.path == "/api/auth/me":
            user = self.current_user()
            return self.send_json(HTTPStatus.OK, {"user": public_user(user) if user else None})
        return super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path not in {"/api/auth/register", "/api/auth/login", "/api/auth/logout"}:
            return self.send_json(HTTPStatus.NOT_FOUND, {"error": "Nie znaleziono zasobu."})
        if parsed.path == "/api/auth/logout":
            return self.logout()
        try:
            payload = self.read_json()
        except (ValueError, json.JSONDecodeError, UnicodeDecodeError):
            return self.send_json(HTTPStatus.BAD_REQUEST, {"error": "Nieprawidłowe dane żądania."})
        if parsed.path == "/api/auth/register":
            return self.register(payload)
        return self.login(payload)

    def do_OPTIONS(self):
        origin = self.headers.get("Origin")
        if origin not in ALLOWED_ORIGINS:
            return self.send_error(HTTPStatus.FORBIDDEN)
        self.send_response(HTTPStatus.NO_CONTENT)
        self.send_header("Access-Control-Allow-Origin", origin)
        self.send_header("Access-Control-Allow-Credentials", "true")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Vary", "Origin")
        self.end_headers()

    def register(self, payload):
        errors, email, username, password = validate_registration(payload)
        if errors:
            return self.send_json(HTTPStatus.UNPROCESSABLE_ENTITY, {"error": "Sprawdź formularz.", "fields": errors})
        try:
            with db_connection() as db:
                cursor = db.execute(
                    "INSERT INTO users(email, username, password_hash, created_at) VALUES (?, ?, ?, ?)",
                    (email, username, hash_password(password), int(time.time())),
                )
                user = db.execute("SELECT * FROM users WHERE id = ?", (cursor.lastrowid,)).fetchone()
        except sqlite3.IntegrityError:
            return self.send_json(HTTPStatus.CONFLICT, {"error": "Nie można utworzyć konta. E-mail lub nazwa użytkownika mogą być już zajęte."})
        return self.authenticated_response(user)

    def login(self, payload):
        email = str(payload.get("email", "")).strip().lower()
        password = str(payload.get("password", ""))
        with db_connection() as db:
            user = db.execute("SELECT * FROM users WHERE email = ? COLLATE NOCASE", (email,)).fetchone()
        if not user or not verify_password(password, user["password_hash"]):
            return self.send_json(HTTPStatus.UNAUTHORIZED, {"error": "Nieprawidłowy e-mail lub hasło."})
        return self.authenticated_response(user)

    def authenticated_response(self, user):
        raw_token = secrets.token_urlsafe(32)
        token_hash = hmac.new(SESSION_SECRET, raw_token.encode(), hashlib.sha256).hexdigest()
        now = int(time.time())
        with db_connection() as db:
            db.execute("DELETE FROM sessions WHERE expires_at < ?", (now,))
            db.execute("INSERT INTO sessions(token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)", (token_hash, user["id"], now + SESSION_MAX_AGE, now))
        is_https = self.headers.get("X-Forwarded-Proto", "").lower() == "https"
        origin_host = urlparse(self.headers.get("Origin", "")).hostname
        request_host = (self.headers.get("Host", "").split(":", 1)[0]).lower()
        cross_site = self.headers.get("Origin") in ALLOWED_ORIGINS and origin_host and origin_host.lower() != request_host
        same_site = "None" if cross_site else "Lax"
        secure = "; Secure" if is_https or cross_site else ""
        cookie = f"skm_session={raw_token}; Max-Age={SESSION_MAX_AGE}; Path=/; HttpOnly; SameSite={same_site}{secure}"
        return self.send_json(HTTPStatus.OK, {"user": public_user(user)}, [cookie])

    def logout(self):
        token = self.session_token()
        if token:
            token_hash = hmac.new(SESSION_SECRET, token.encode(), hashlib.sha256).hexdigest()
            with db_connection() as db:
                db.execute("DELETE FROM sessions WHERE token_hash = ?", (token_hash,))
        is_https = self.headers.get("X-Forwarded-Proto", "").lower() == "https"
        origin_host = urlparse(self.headers.get("Origin", "")).hostname
        request_host = (self.headers.get("Host", "").split(":", 1)[0]).lower()
        cross_site = self.headers.get("Origin") in ALLOWED_ORIGINS and origin_host and origin_host.lower() != request_host
        same_site = "None" if cross_site else "Lax"
        secure = "; Secure" if is_https or cross_site else ""
        cookie = f"skm_session=; Max-Age=0; Path=/; HttpOnly; SameSite={same_site}{secure}"
        return self.send_json(HTTPStatus.OK, {"user": None}, [cookie])


def run():
    init_db()
    port = int(os.getenv("PORT", os.getenv("SKM_PORT", "8000")))
    host = os.getenv("SKM_HOST", "0.0.0.0")
    server = ThreadingHTTPServer((host, port), AppHandler)
    print(f"SKM backend: http://{host}:{port}")
    server.serve_forever()


if __name__ == "__main__":
    run()
