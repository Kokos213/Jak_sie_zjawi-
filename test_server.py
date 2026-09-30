import json
import os
import tempfile
import unittest
from http.client import HTTPConnection
from threading import Thread
import server


class RegistrationTests(unittest.TestCase):
    def test_validation_and_hashing(self):
        errors, _, _, _ = server.validate_registration({"email": "bad", "username": "x", "password": "short", "confirmPassword": "no"})
        self.assertIn("email", errors)
        self.assertIn("username", errors)
        self.assertIn("password", errors)
        self.assertIn("confirmPassword", errors)
        encoded = server.hash_password("correct horse battery staple")
        self.assertNotIn("correct horse", encoded)
        self.assertTrue(server.verify_password("correct horse battery staple", encoded))
        self.assertFalse(server.verify_password("wrong password", encoded))

    def test_registration_login_and_duplicate_email(self):
        with tempfile.TemporaryDirectory() as directory:
            server.DB_PATH = server.Path(directory) / "test.sqlite3"
            server.init_db()
            http_server = server.ThreadingHTTPServer(("127.0.0.1", 0), server.AppHandler)
            thread = Thread(target=http_server.serve_forever, daemon=True)
            thread.start()
            try:
                port = http_server.server_address[1]
                body = json.dumps({"email": "ola@example.com", "username": "ola", "password": "strong-password", "confirmPassword": "strong-password"})
                connection = HTTPConnection("127.0.0.1", port)
                connection.request("POST", "/api/auth/register", body, {"Content-Type": "application/json"})
                response = connection.getresponse()
                self.assertEqual(response.status, 200)
                cookie = response.getheader("Set-Cookie").split(";", 1)[0]
                self.assertIn("user", json.loads(response.read()))
                connection.request("GET", "/api/auth/me", headers={"Cookie": cookie})
                self.assertEqual(connection.getresponse().status, 200)
                connection.request("POST", "/api/auth/register", body, {"Content-Type": "application/json"})
                self.assertEqual(connection.getresponse().status, 409)
                login = json.dumps({"email": "ola@example.com", "password": "wrong"})
                connection.request("POST", "/api/auth/login", login, {"Content-Type": "application/json"})
                self.assertEqual(connection.getresponse().status, 401)
            finally:
                http_server.shutdown()
                thread.join()


if __name__ == "__main__":
    unittest.main()
