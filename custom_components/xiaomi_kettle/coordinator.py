"""State coordinator for Xiaomi Kettle proxy entities."""

from __future__ import annotations

import logging
from collections.abc import Awaitable, Callable
from dataclasses import dataclass, fields, replace
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import Event, HomeAssistant, callback
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.event import (
    async_call_later,
    async_track_state_change_event,
)
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

from .const import (
    CONF_NOTIFY_EVENTS,
    CONF_PRESET_ICONS,
    CONF_SOURCE_DEVICE_ID,
    CONF_SOURCE_ENTITY,
    DEFAULT_NOTIFY_EVENTS,
    DOMAIN,
    ENTITY_SUFFIXES,
    OPTIMISTIC_TIMEOUT,
)
from .miot import async_start_boil, async_start_manual, async_start_preset
from .model import (
    KettleData,
    KettlePreset,
    normalize_data,
    optimistic_start,
    optimistic_stop,
    reconcile_optimistic,
    transition_events,
)

_LOGGER = logging.getLogger(__name__)


@dataclass(frozen=True, slots=True)
class SourceEntities:
    """Xiaomi Miot entities backing one kettle."""

    main: str
    device_id: str
    lifted: str | None = None
    stop: str | None = None
    keep_warm: str | None = None
    keep_temperature: str | None = None
    keep_duration: str | None = None
    warming_time: str | None = None
    boiling_reminder: str | None = None
    keep_warm_reminder: str | None = None
    lift_memory: str | None = None
    custom_knob: str | None = None
    no_disturb: str | None = None

    @property
    def all(self) -> list[str]:
        """Return all available source entity IDs."""
        return list(
            dict.fromkeys(
                value
                for value in (
                    self.main,
                    self.lifted,
                    self.stop,
                    self.keep_warm,
                    self.keep_temperature,
                    self.keep_duration,
                    self.warming_time,
                    self.boiling_reminder,
                    self.keep_warm_reminder,
                    self.lift_memory,
                    self.custom_knob,
                    self.no_disturb,
                )
                if value is not None
            )
        )


def resolve_source_entities(
    hass: HomeAssistant, entry: ConfigEntry
) -> SourceEntities:
    """Resolve related Xiaomi Miot entities from the selected source device."""
    main = entry.data[CONF_SOURCE_ENTITY]
    device_id = entry.data[CONF_SOURCE_DEVICE_ID]
    registry = er.async_get(hass)
    entries = er.async_entries_for_device(registry, device_id)

    def find(domain: str, suffix: str) -> str | None:
        return next(
            (
                item.entity_id
                for item in entries
                if item.domain == domain
                and not item.disabled
                and item.entity_id.endswith(f"_{suffix}")
            ),
            None,
        )

    return SourceEntities(
        main=main,
        device_id=device_id,
        lifted=find("binary_sensor", ENTITY_SUFFIXES["lifted"]),
        stop=find("button", ENTITY_SUFFIXES["stop"]),
        keep_warm=find("switch", ENTITY_SUFFIXES["keep_warm"]),
        keep_temperature=find("number", ENTITY_SUFFIXES["keep_temperature"]),
        keep_duration=find("number", ENTITY_SUFFIXES["keep_duration"]),
        warming_time=find("sensor", ENTITY_SUFFIXES["warming_time"]),
        boiling_reminder=find("switch", ENTITY_SUFFIXES["boiling_reminder"]),
        keep_warm_reminder=find("switch", ENTITY_SUFFIXES["keep_warm_reminder"]),
        lift_memory=find("switch", ENTITY_SUFFIXES["lift_memory"]),
        custom_knob=find("switch", ENTITY_SUFFIXES["custom_knob"]),
        no_disturb=find("switch", ENTITY_SUFFIXES["no_disturb"]),
    )


class KettleCoordinator(DataUpdateCoordinator[KettleData]):
    """Mirror Xiaomi Miot state and emit kettle-cycle transitions."""

    def __init__(
        self, hass: HomeAssistant, entry: ConfigEntry, sources: SourceEntities
    ) -> None:
        super().__init__(hass, _LOGGER, name=entry.title, update_interval=None)
        self.entry = entry
        self.sources = sources
        self._transition_listeners: list[Callable[[str, KettleData], None]] = []
        self._authoritative_data: KettleData | None = None
        self._optimistic_changes: dict[str, Any] = {}
        self._cancel_optimistic_timeout: Callable[[], None] | None = None

        device = dr.async_get(hass).async_get(sources.device_id)
        self.source_device = device
        self.device_name = entry.title
        self.manufacturer = "Xiaomi"
        self.model = "Smart Kettle 2 Pro"
        self.model_id = device.model if device else None
        self.sw_version = device.sw_version if device else None
        self.configuration_url = device.configuration_url if device else None
        self.area_id = device.area_id if device else None
        area = ar.async_get(hass).async_get_area(self.area_id) if self.area_id else None
        self.area_name = area.name if area else None

    @property
    def preset_icons(self) -> dict[str, str]:
        """Return configured icons keyed by exact Xiaomi preset name."""
        configured = self.entry.options.get(CONF_PRESET_ICONS, {})
        if not isinstance(configured, dict):
            return {}
        return {
            str(name): str(icon)
            for name, icon in configured.items()
            if str(name).strip() and str(icon).strip()
        }

    async def _async_update_data(self) -> KettleData:
        data = self._read_data()
        self._authoritative_data = data
        return data

    def _state_value(self, entity_id: str | None) -> Any:
        state = self.hass.states.get(entity_id) if entity_id else None
        return state.state if state else None

    def _read_data(self) -> KettleData:
        main = self.hass.states.get(self.sources.main)
        attributes = main.attributes if main else {}
        return normalize_data(
            attributes,
            available=main is not None and main.state != "unavailable",
            overrides={
                "lifted": self._state_value(self.sources.lifted),
                "keep_warm": self._state_value(self.sources.keep_warm),
                "keep_temperature": self._state_value(self.sources.keep_temperature),
                "keep_duration": self._state_value(self.sources.keep_duration),
                "warming_time": self._state_value(self.sources.warming_time),
                "boiling_reminder": self._state_value(self.sources.boiling_reminder),
                "keep_warm_reminder": self._state_value(self.sources.keep_warm_reminder),
                "lift_memory": self._state_value(self.sources.lift_memory),
                "custom_knob": self._state_value(self.sources.custom_knob),
                "no_disturb": self._state_value(self.sources.no_disturb),
            },
        )

    async def async_start(self) -> None:
        """Subscribe to source-state changes."""
        self.entry.async_on_unload(
            async_track_state_change_event(
                self.hass, self.sources.all, self._async_handle_source_change
            )
        )

    @callback
    def _async_handle_source_change(self, event: Event) -> None:
        old = self._authoritative_data
        new = self._read_data()
        self._authoritative_data = new
        self._reconcile_optimistic(new)
        self.async_set_updated_data(replace(new, **self._optimistic_changes))
        for event_type in transition_events(old, new):
            for listener in tuple(self._transition_listeners):
                listener(event_type, new)
            self.hass.async_create_task(
                self._async_send_notification(event_type, new),
                f"Notify for {self.entry.title}: {event_type}",
            )

    def _reconcile_optimistic(self, source: KettleData) -> None:
        """Remove optimistic fields that Xiaomi Miot has confirmed."""
        self._optimistic_changes = reconcile_optimistic(
            self._optimistic_changes, source
        )

        if not self._optimistic_changes and self._cancel_optimistic_timeout:
            self._cancel_optimistic_timeout()
            self._cancel_optimistic_timeout = None

    @callback
    def _async_clear_optimistic(self, now: Any = None) -> None:
        """Restore the latest source state after the reconciliation window."""
        self._optimistic_changes.clear()
        self._cancel_optimistic_timeout = None
        if self._authoritative_data:
            self.async_set_updated_data(self._authoritative_data)

    async def _async_run_optimistic(
        self,
        expected: KettleData,
        action: Callable[[], Awaitable[Any]],
    ) -> None:
        """Publish expected state before awaiting Xiaomi Miot."""
        changes = {
            field.name: getattr(expected, field.name)
            for field in fields(KettleData)
            if getattr(expected, field.name) != getattr(self.data, field.name)
        }
        if self._cancel_optimistic_timeout:
            self._cancel_optimistic_timeout()
            self._cancel_optimistic_timeout = None
        self._optimistic_changes.update(changes)
        self.async_set_updated_data(expected)
        try:
            await action()
        except Exception:
            self._async_clear_optimistic()
            raise
        else:
            if self._optimistic_changes:
                self._cancel_optimistic_timeout = async_call_later(
                    self.hass,
                    OPTIMISTIC_TIMEOUT,
                    self._async_clear_optimistic,
                )

    @callback
    def async_add_transition_listener(
        self, listener: Callable[[str, KettleData], None]
    ) -> Callable[[], None]:
        self._transition_listeners.append(listener)

        @callback
        def remove_listener() -> None:
            if listener in self._transition_listeners:
                self._transition_listeners.remove(listener)

        return remove_listener

    async def _async_send_notification(
        self, event_type: str, data: KettleData
    ) -> None:
        selected_events = self.entry.options.get(
            CONF_NOTIFY_EVENTS, DEFAULT_NOTIFY_EVENTS
        )
        if event_type not in selected_events:
            return

        temperature = (
            f" at {data.current_temperature:g} °C"
            if data.current_temperature is not None
            else ""
        )
        messages = {
            "heating_started": f"{self.device_name} started heating{temperature}.",
            "boiling": f"{self.device_name} is boiling{temperature}.",
            "finished": f"{self.device_name} finished boiling{temperature}.",
            "lifted": f"{self.device_name} was lifted from its base.",
            "fault": f"{self.device_name} reported fault code {data.fault}.",
        }
        try:
            await self.hass.services.async_call(
                "persistent_notification",
                "create",
                {
                    "message": messages[event_type],
                    "title": self.device_name,
                    "notification_id": f"{DOMAIN}_{self.entry.entry_id}",
                },
            )
        except Exception:
            _LOGGER.exception("Unable to send %s notification", event_type)

    async def async_set_target_temperature(self, value: float) -> None:
        await self._async_run_optimistic(
            replace(self.data, target_temperature=value),
            lambda: self.hass.services.async_call(
                "water_heater",
                "set_temperature",
                {"entity_id": self.sources.main, "temperature": value},
                blocking=True,
            ),
        )

    async def async_set_switch(self, entity_id: str, value: bool) -> None:
        changes: dict[str, Any] = {}
        if entity_id == self.sources.keep_warm:
            changes["keep_warm"] = value
        else:
            setting_keys = {
                self.sources.boiling_reminder: "boiling_reminder",
                self.sources.keep_warm_reminder: "keep_warm_reminder",
                self.sources.lift_memory: "lift_memory",
                self.sources.custom_knob: "custom_knob",
                self.sources.no_disturb: "no_disturb",
            }
            if setting_key := setting_keys.get(entity_id):
                changes["settings"] = replace(
                    self.data.settings, **{setting_key: value}
                )
        await self._async_run_optimistic(
            replace(self.data, **changes),
            lambda: self.hass.services.async_call(
                "switch",
                "turn_on" if value else "turn_off",
                {"entity_id": entity_id},
                blocking=True,
            ),
        )

    async def async_set_number(self, entity_id: str, value: float) -> None:
        changes: dict[str, Any] = {}
        if entity_id == self.sources.keep_temperature:
            changes["keep_temperature"] = value
        elif entity_id == self.sources.keep_duration:
            changes["keep_duration"] = int(value)
        await self._async_run_optimistic(
            replace(self.data, **changes),
            lambda: self.hass.services.async_call(
                "number",
                "set_value",
                {"entity_id": entity_id, "value": value},
                blocking=True,
            ),
        )

    async def async_stop(self) -> None:
        if not self.sources.stop:
            return
        await self._async_run_optimistic(
            optimistic_stop(self.data),
            lambda: self.hass.services.async_call(
                "button",
                "press",
                {"entity_id": self.sources.stop},
                blocking=True,
            ),
        )

    async def async_start_manual(self) -> None:
        data = self.data
        await self._async_run_optimistic(
            optimistic_start(self.data, target_mode=0),
            lambda: async_start_manual(
                self.hass,
                self.sources.main,
                target=data.target_temperature or 70,
                keep_warm=data.keep_warm,
                keep_temperature=data.keep_temperature,
                duration=data.keep_duration,
            ),
        )

    async def async_boil(self) -> None:
        data = self.data
        await self._async_run_optimistic(
            optimistic_start(self.data, target_temperature=99, target_mode=1),
            lambda: async_start_boil(
                self.hass,
                self.sources.main,
                keep_warm=data.keep_warm,
                keep_temperature=data.keep_temperature,
                duration=data.keep_duration,
            ),
        )

    async def async_start_preset(self, preset: KettlePreset) -> None:
        await self._async_run_optimistic(
            optimistic_start(
                self.data,
                target_temperature=preset.target,
                keep_warm=preset.keep_warm,
                keep_temperature=preset.keep_temperature,
                keep_duration=preset.duration,
                target_mode=preset.mode,
            ),
            lambda: async_start_preset(self.hass, self.sources.main, preset),
        )
