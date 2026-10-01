from pathlib import Path
import unittest


class PagesLoginContractTests(unittest.TestCase):
    def test_login_reads_request_json_and_sends_only_auth_fields(self):
        source = Path("functions/api/auth/login.js").read_text()
        self.assertIn("readPayload(context.request)", source)
        self.assertIn("typeof payload?.email === \"string\"", source)
        self.assertIn("typeof payload?.password === \"string\"", source)
        self.assertIn('body: JSON.stringify({ email, password })', source)
        self.assertNotIn("readPayload(context);", source)


if __name__ == "__main__":
    unittest.main()
