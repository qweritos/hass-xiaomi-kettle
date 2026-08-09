"""Xiaomi Miot commands used by friendly kettle entities."""

from __future__ import annotations

import logging
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError

_LOGGER = logging.getLogger(__name__)


def _property(did: str, siid: int, piid: int, value: Any) -> dict[str, Any]:
    return {"did": did, "siid": siid, "piid": piid, "value": value}


async def async_send_properties(
    hass: HomeAssistant, source_entity_id: str, properties: list[dict[str, Any]]
) -> None:
    """Write raw properties through the existing Xiaomi Miot entity."""
    response = await hass.services.async_call(
        "xiaomi_miot",
        "send_command",
        {
            "entity_id": source_entity_id,
            "method": "set_properties",
            "params": properties,
        },
        blocking=True,
        return_response=True,
    )
    result: list[dict[str, Any]] = []
    if isinstance(response, dict):
        for candidate in (
            response.get("result"),
            response.get("response"),
            response.get("service_response"),
        ):
            if isinstance(candidate, dict):
                candidate = candidate.get("result")
            if isinstance(candidate, list):
                result = candidate
                break
    failures = [item for item in result if int(item.get("code", -1)) != 0]
    if result and len(failures) == len(result):
        raise HomeAssistantError(
            translation_domain="xiaomi_kettle",
            translation_key="command_rejected",
            translation_placeholders={"count": str(len(failures))},
        )
    if failures:
        _LOGGER.debug(
            "Xiaomi accepted the kettle command with %d of %d properties rejected",
            len(failures),
            len(result),
        )


async def async_start_boil(
    hass: HomeAssistant,
    source_entity_id: str,
    *,
    keep_warm: bool,
    keep_temperature: float,
    duration: int,
) -> None:
    """Start the kettle's native boil program."""
    await async_send_properties(
        hass,
        source_entity_id,
        [
            _property("set-2-4", 2, 4, 99),
            _property("set-2-5", 2, 5, keep_warm),
            _property("set-2-6", 2, 6, keep_temperature),
            _property("set-3-1", 3, 1, duration),
            _property("set-3-11", 3, 11, 1),
            _property(
                "set-3-13",
                3,
                13,
                f"99,{1 if keep_warm else 0},{keep_temperature:g},{duration}",
            ),
        ],
    )


async def async_start_manual(
    hass: HomeAssistant,
    source_entity_id: str,
    *,
    target: float,
    keep_warm: bool,
    keep_temperature: float,
    duration: int,
) -> None:
    """Start heating with the current manual settings."""
    await async_send_properties(
        hass,
        source_entity_id,
        [
            _property("set-2-4", 2, 4, target),
            _property("set-2-5", 2, 5, keep_warm),
            _property("set-2-6", 2, 6, keep_temperature),
            _property("set-3-1", 3, 1, duration),
            _property("set-3-11", 3, 11, 0),
            _property(
                "set-3-12",
                3,
                12,
                f"{target:g},{1 if keep_warm else 0},{keep_temperature:g},{duration}",
            ),
        ],
    )


async def async_start_preset(
    hass: HomeAssistant, source_entity_id: str, preset: Any
) -> None:
    """Start a Xiaomi Home preset."""
    await async_send_properties(
        hass,
        source_entity_id,
        [
            _property("set-2-4", 2, 4, preset.target),
            _property("set-2-5", 2, 5, preset.keep_warm),
            _property("set-2-6", 2, 6, preset.keep_temperature),
            _property("set-3-1", 3, 1, preset.duration),
            _property("set-3-11", 3, 11, preset.mode),
        ],
    )
