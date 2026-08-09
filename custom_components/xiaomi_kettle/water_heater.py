"""Friendly kettle water-heater entity."""

from typing import ClassVar

from homeassistant.components.water_heater import WaterHeaterEntity, WaterHeaterEntityFeature
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import ATTR_TEMPERATURE, UnitOfTemperature
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .entity import XiaomiKettleEntity


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    async_add_entities([KettleWaterHeater(entry.runtime_data.coordinator)])


class KettleWaterHeater(XiaomiKettleEntity, WaterHeaterEntity):
    _attr_icon = "mdi:kettle-steam"
    _attr_supported_features = WaterHeaterEntityFeature.TARGET_TEMPERATURE
    _attr_temperature_unit = UnitOfTemperature.CELSIUS
    _attr_min_temp = 40
    _attr_max_temp = 99
    _attr_target_temperature_step = 1
    _attr_operation_list: ClassVar[list[str]] = [
        "ready",
        "heating",
        "boiling",
        "cooling",
        "keeping_warm",
        "lifted",
        "fault",
    ]

    def __init__(self, coordinator) -> None:
        super().__init__(coordinator, "kettle", "kettle")

    @property
    def current_temperature(self) -> float | None:
        return self.coordinator.data.current_temperature

    @property
    def target_temperature(self) -> float | None:
        return self.coordinator.data.target_temperature

    @property
    def current_operation(self) -> str:
        return self.coordinator.data.status

    async def async_set_temperature(self, **kwargs) -> None:
        if (temperature := kwargs.get(ATTR_TEMPERATURE)) is not None:
            await self.coordinator.async_set_target_temperature(float(temperature))

    @property
    def extra_state_attributes(self) -> dict:
        data = self.coordinator.data
        return {
            **super().extra_state_attributes,
            "kettle.status": data.status_code,
            "kettle.fault": data.fault,
            "kettle.temperature": data.current_temperature,
            "kettle.target_temperature": data.target_temperature,
            "kettle.auto_keep_warm": data.keep_warm,
            "kettle.keep_warm_temperature": data.keep_temperature,
            "function.keep_warm_time": data.keep_duration,
            "function.warming_time": data.warming_time,
            "function.kettle_lifting": data.lifted,
            "function.target_mode": data.target_mode,
            "function.extended_mode": "_".join(
                ",".join(
                    (
                        preset.name,
                        f"{preset.target:g}",
                        "1" if preset.keep_warm else "0",
                        f"{preset.keep_temperature:g}",
                        str(preset.duration),
                    )
                )
                for preset in data.presets
            ),
            "xiaomi_kettle.preset_icons": self.coordinator.preset_icons,
        }
