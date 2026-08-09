"""Kettle-cycle event entity."""

from homeassistant.components.event import EventEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import NOTIFICATION_EVENTS
from .entity import XiaomiKettleEntity
from .model import KettleData


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    async_add_entities([KettleCycleEvent(entry.runtime_data.coordinator)])


class KettleCycleEvent(XiaomiKettleEntity, EventEntity):
    _attr_event_types = NOTIFICATION_EVENTS
    _attr_icon = "mdi:kettle-alert-outline"

    def __init__(self, coordinator) -> None:
        super().__init__(coordinator, "cycle", "cycle")

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        self.async_on_remove(
            self.coordinator.async_add_transition_listener(self._handle_transition)
        )

    @callback
    def _handle_transition(self, event_type: str, data: KettleData) -> None:
        self._trigger_event(
            event_type,
            {
                "temperature": data.current_temperature,
                "target_temperature": data.target_temperature,
                "status_code": data.status_code,
                "fault_code": data.fault,
            },
        )
        self.async_write_ha_state()
