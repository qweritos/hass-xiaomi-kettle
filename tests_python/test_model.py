"""Tests for normalized kettle state and cycle transitions."""

import sys
import unittest
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path

MODEL_PATH = (
    Path(__file__).parents[1]
    / "custom_components"
    / "xiaomi_kettle"
    / "model.py"
)
SPEC = spec_from_file_location("xiaomi_kettle_model", MODEL_PATH)
assert SPEC and SPEC.loader
MODEL = module_from_spec(SPEC)
sys.modules[SPEC.name] = MODEL
SPEC.loader.exec_module(MODEL)


class ModelTests(unittest.TestCase):
    def test_presets_are_parsed_from_xiaomi_extended_mode(self) -> None:
        presets = MODEL.parse_presets(
            "Warm water,45,1,45,1440_Wolfberries,70,1,70,1440"
        )
        self.assertEqual([preset.name for preset in presets], ["Warm water", "Wolfberries"])
        self.assertEqual(presets[0].mode, 10)
        self.assertTrue(presets[0].keep_warm)

    def test_status_prefers_fault_and_lifted(self) -> None:
        fault = MODEL.normalize_data(
            {"kettle.status": 1, "kettle.fault": 3}, available=True
        )
        lifted = MODEL.normalize_data(
            {"kettle.status": 0}, available=True, overrides={"lifted": "on"}
        )
        self.assertEqual(fault.status, "fault")
        self.assertEqual(lifted.status, "lifted")

    def test_cycle_events_fire_once_on_transitions(self) -> None:
        ready = MODEL.normalize_data({"kettle.status": 0}, available=True)
        heating = MODEL.normalize_data({"kettle.status": 1}, available=True)
        boiling = MODEL.normalize_data({"kettle.status": 2}, available=True)
        warm = MODEL.normalize_data({"kettle.status": 4}, available=True)

        self.assertEqual(MODEL.transition_events(None, ready), ())
        self.assertEqual(MODEL.transition_events(ready, heating), ("heating_started",))
        self.assertEqual(MODEL.transition_events(heating, boiling), ("boiling",))
        self.assertEqual(MODEL.transition_events(boiling, warm), ("finished",))
        self.assertEqual(MODEL.transition_events(warm, warm), ())

    def test_optimistic_actions_update_expected_state(self) -> None:
        ready = MODEL.normalize_data(
            {
                "kettle.status": 0,
                "kettle.target_temperature": 70,
                "kettle.auto_keep_warm": False,
            },
            available=True,
        )

        heating = MODEL.optimistic_start(
            ready,
            target_temperature=99,
            keep_warm=True,
            keep_temperature=70,
            keep_duration=1440,
            target_mode=12,
        )
        cooling = MODEL.optimistic_stop(heating)

        self.assertEqual((heating.status_code, heating.status), (1, "heating"))
        self.assertEqual(heating.target_temperature, 99)
        self.assertTrue(heating.keep_warm)
        self.assertEqual(heating.target_mode, 12)
        self.assertEqual((cooling.status_code, cooling.status), (3, "cooling"))

    def test_stale_source_does_not_replace_pending_optimistic_values(self) -> None:
        source = MODEL.normalize_data(
            {
                "kettle.status": 0,
                "current_temperature": 45,
                "temperature": 70,
            },
            available=True,
        )
        pending = {"status_code": 1, "status": "heating", "target_mode": 1}

        self.assertEqual(MODEL.reconcile_optimistic(pending, source), pending)

        heating = MODEL.optimistic_start(source, target_mode=1)
        self.assertEqual(MODEL.reconcile_optimistic(pending, heating), {})

    def test_ready_does_not_prematurely_confirm_optimistic_stop(self) -> None:
        ready = MODEL.normalize_data(
            {"kettle.status": 0, "current_temperature": 80}, available=True
        )
        pending = {"status_code": 3, "status": "cooling"}

        self.assertEqual(MODEL.reconcile_optimistic(pending, ready), pending)

    def test_preset_icons_have_human_friendly_defaults(self) -> None:
        self.assertEqual(MODEL.preset_icon("Warm water", 45), "mdi:cup-water")
        self.assertEqual(MODEL.preset_icon("Wolfberries", 70), "mdi:fruit-cherries")
        self.assertEqual(MODEL.preset_icon("Scented tea", 80), "mdi:flower-tulip")


if __name__ == "__main__":
    unittest.main()
