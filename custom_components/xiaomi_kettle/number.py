"""Friendly keep-warm number entities."""

from homeassistant.components.number import NumberEntity, NumberMode
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import UnitOfTemperature, UnitOfTime
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import EntityCategory
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .entity import XiaomiKettleEntity


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    coordinator = entry.runtime_data.coordinator
    entities = []
    if coordinator.sources.keep_temperature:
        entities.append(KettleKeepTemperature(coordinator))
    if coordinator.sources.keep_duration:
        entities.append(KettleKeepDuration(coordinator))
    async_add_entities(entities)


class KettleKeepTemperature(XiaomiKettleEntity, NumberEntity):
    _attr_entity_category = EntityCategory.CONFIG
    _attr_icon = "mdi:thermometer-water"
    _attr_mode = NumberMode.SLIDER
    _attr_native_min_value = 0
    _attr_native_max_value = 100
    _attr_native_step = 1
    _attr_native_unit_of_measurement = UnitOfTemperature.CELSIUS

    def __init__(self, coordinator) -> None:
        super().__init__(coordinator, "keep_temperature", "keep_temperature")

    @property
    def native_value(self) -> float:
        return self.coordinator.data.keep_temperature

    async def async_set_native_value(self, value: float) -> None:
        await self.coordinator.async_set_number(
            self.coordinator.sources.keep_temperature, value
        )


class KettleKeepDuration(XiaomiKettleEntity, NumberEntity):
    _attr_entity_category = EntityCategory.CONFIG
    _attr_icon = "mdi:timer-outline"
    _attr_mode = NumberMode.SLIDER
    _attr_native_min_value = 60
    _attr_native_max_value = 1440
    _attr_native_step = 30
    _attr_native_unit_of_measurement = UnitOfTime.MINUTES

    def __init__(self, coordinator) -> None:
        super().__init__(coordinator, "keep_duration", "keep_duration")

    @property
    def native_value(self) -> int:
        return self.coordinator.data.keep_duration

    async def async_set_native_value(self, value: float) -> None:
        await self.coordinator.async_set_number(
            self.coordinator.sources.keep_duration, value
        )
