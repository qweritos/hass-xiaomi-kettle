"""Config and options flows for Xiaomi Kettle."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import section
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.selector import (
    IconSelector,
    SelectOptionDict,
    SelectSelector,
    SelectSelectorConfig,
    SelectSelectorMode,
)

from .const import (
    CONF_NOTIFY_EVENTS,
    CONF_PRESET_ICONS,
    CONF_SOURCE_DEVICE_ID,
    CONF_SOURCE_ENTITY,
    DEFAULT_NOTIFY_EVENTS,
    DOMAIN,
    NOTIFICATION_EVENTS,
    SUPPORTED_MODELS,
)
from .model import KettlePreset, parse_presets, preset_icon


@dataclass(frozen=True, slots=True)
class KettleCandidate:
    entity_id: str
    device_id: str
    name: str
    label: str


def _candidates(hass: HomeAssistant) -> list[KettleCandidate]:
    entity_registry = er.async_get(hass)
    device_registry = dr.async_get(hass)
    area_registry = ar.async_get(hass)
    candidates: list[KettleCandidate] = []

    for state in hass.states.async_all("water_heater"):
        entity = entity_registry.async_get(state.entity_id)
        if not entity or entity.platform != "xiaomi_miot" or not entity.device_id:
            continue
        device = device_registry.async_get(entity.device_id)
        if not device or (device.model or "").lower() not in SUPPORTED_MODELS:
            continue
        area = area_registry.async_get_area(device.area_id) if device.area_id else None
        source_name = device.name_by_user or device.name or state.name
        friendly_name = f"{area.name} Kettle" if area else "Kettle"
        label = f"{area.name} · {source_name}" if area else source_name
        candidates.append(
            KettleCandidate(state.entity_id, device.id, friendly_name, label)
        )
    return sorted(candidates, key=lambda item: item.label.casefold())


def _presets(hass: HomeAssistant, entity_id: str) -> tuple[KettlePreset, ...]:
    """Return presets currently exposed by the selected Xiaomi Miot kettle."""
    state = hass.states.get(entity_id)
    attributes = state.attributes if state else {}
    return parse_presets(
        attributes.get("function.extended_mode")
        or attributes.get("function.extended-mode")
    )


def _notification_schema(
    defaults: dict[str, Any], presets: tuple[KettlePreset, ...]
) -> vol.Schema:
    options = [
        SelectOptionDict(value=event, label=event.replace("_", " ").title())
        for event in NOTIFICATION_EVENTS
    ]
    schema: dict[Any, Any] = {
        vol.Optional(
            CONF_NOTIFY_EVENTS,
            default=defaults.get(CONF_NOTIFY_EVENTS, DEFAULT_NOTIFY_EVENTS),
        ): SelectSelector(
            SelectSelectorConfig(
                options=options,
                multiple=True,
                mode=SelectSelectorMode.LIST,
            )
        )
    }
    configured = defaults.get(CONF_PRESET_ICONS, {})
    if not isinstance(configured, dict):
        configured = {}
    preset_defaults = {
        preset.name: str(configured.get(preset.name) or preset_icon(preset.name, preset.target))
        for preset in presets
    }
    if preset_defaults:
        schema[vol.Optional(CONF_PRESET_ICONS, default=preset_defaults)] = section(
            vol.Schema(
                {
                    vol.Optional(name, default=icon): IconSelector()
                    for name, icon in preset_defaults.items()
                }
            ),
            {"collapsed": False},
        )
    return vol.Schema(schema)


class XiaomiKettleConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Select an existing Xiaomi Miot kettle."""

    VERSION = 1
    _candidate: KettleCandidate | None = None

    async def async_step_user(self, user_input: dict[str, Any] | None = None):
        candidates = _candidates(self.hass)
        if not candidates:
            return self.async_abort(reason="no_devices")

        errors: dict[str, str] = {}
        if user_input is not None:
            self._candidate = next(
                (
                    candidate
                    for candidate in candidates
                    if candidate.entity_id == user_input[CONF_SOURCE_ENTITY]
                ),
                None,
            )
            if self._candidate is None:
                errors["base"] = "device_unavailable"
            else:
                await self.async_set_unique_id(self._candidate.device_id)
                self._abort_if_unique_id_configured()
                return await self.async_step_notifications()

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_SOURCE_ENTITY): SelectSelector(
                        SelectSelectorConfig(
                            options=[
                                SelectOptionDict(
                                    value=candidate.entity_id, label=candidate.label
                                )
                                for candidate in candidates
                            ],
                            mode=SelectSelectorMode.DROPDOWN,
                        )
                    )
                }
            ),
            errors=errors,
        )

    async def async_step_notifications(
        self, user_input: dict[str, Any] | None = None
    ):
        if self._candidate is None:
            return await self.async_step_user()
        if user_input is not None:
            return self.async_create_entry(
                title=self._candidate.name,
                data={
                    CONF_SOURCE_ENTITY: self._candidate.entity_id,
                    CONF_SOURCE_DEVICE_ID: self._candidate.device_id,
                },
                options=user_input,
            )
        return self.async_show_form(
            step_id="notifications",
            data_schema=_notification_schema(
                {}, _presets(self.hass, self._candidate.entity_id)
            ),
            last_step=True,
        )

    @staticmethod
    def async_get_options_flow(config_entry: ConfigEntry):
        return XiaomiKettleOptionsFlow()


class XiaomiKettleOptionsFlow(config_entries.OptionsFlow):
    """Edit notification and refresh behavior."""

    async def async_step_init(self, user_input: dict[str, Any] | None = None):
        if user_input is not None:
            return self.async_create_entry(data=user_input)
        presets = _presets(
            self.hass, self.config_entry.data[CONF_SOURCE_ENTITY]
        )
        return self.async_show_form(
            step_id="init",
            data_schema=_notification_schema(
                dict(self.config_entry.options), presets
            ),
        )
