"""Regression tests for subscription-only kettle state updates."""

import unittest
from pathlib import Path

ROOT = Path(__file__).parents[1]


class SubscriptionOnlyTests(unittest.TestCase):
    """Ensure neither backend nor frontend reintroduces forced polling."""

    def test_backend_subscribes_without_polling(self) -> None:
        source = (ROOT / "custom_components/xiaomi_kettle/coordinator.py").read_text()

        self.assertIn("async_track_state_change_event", source)
        self.assertIn("new = self._read_data()", source)
        self.assertIn("self.async_set_updated_data", source)
        self.assertNotIn("async_track_time_interval", source)
        self.assertNotIn('"update_entity"', source)

    def test_frontend_uses_hass_updates_without_polling(self) -> None:
        source = (ROOT / "src/dialog-content.ts").read_text()

        self.assertNotIn("setInterval", source)
        self.assertNotIn("update_entity", source)
        self.assertNotIn("pollInterval", source)


if __name__ == "__main__":
    unittest.main()
