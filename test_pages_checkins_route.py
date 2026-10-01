from pathlib import Path
import unittest


class PagesCheckinsRouteTests(unittest.TestCase):
    def test_frontend_route_has_a_pages_function_handler(self):
        route = Path("functions/api/checkins/today.js")
        source = route.read_text()
        self.assertIn("export { onRequestGet, onRequestPost }", source)
        self.assertTrue(Path("functions/api/checkins.js").is_file())


if __name__ == "__main__":
    unittest.main()
