from pathlib import Path
import unittest


class PagesCheckinsRouteTests(unittest.TestCase):
    def test_frontend_route_has_a_pages_function_handler(self):
        route = Path("functions/api/checkins/today.js")
        source = route.read_text()
        self.assertIn("export { onRequestGet, onRequestPost }", source)
        self.assertTrue(Path("functions/api/checkins.js").is_file())

    def test_ranking_does_not_require_missing_postgrest_profile_embed(self):
        source = Path("functions/api/checkins.js").read_text()
        self.assertIn("daily_checkins?select=user_id,streak", source)
        self.assertIn("profiles?select=id,username", source)
        self.assertNotIn("profiles(username)", source)


if __name__ == "__main__":
    unittest.main()
