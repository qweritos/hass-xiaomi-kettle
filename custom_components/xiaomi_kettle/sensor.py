"""Friendly kettle status sensor."""

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .entity import XiaomiKettleEntity
from .model import STATUS_OPTIONS


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    async_add_entities([KettleStatusSensor(entry.runtime_data.coordinator)])


class KettleStatusSensor(XiaomiKettleEntity, SensorEntity):
    _attr_device_class = SensorDeviceClass.ENUM
    _attr_options = STATUS_OPTIONS
    _attr_icon = "mdi:kettle"

    def __init__(self, coordinator) -> None:
        super().__init__(coordinator, "status", "status")

    @property
    def native_value(self) -> str:
        return self.coordinator.data.status

    @property
    def extra_state_attributes(self) -> dict:
        data = self.coordinator.data
        return {
            **super().extra_state_attributes,
            "status_code": data.status_code,
            "fault_code": data.fault,
            "lifted": data.lifted,
        }
