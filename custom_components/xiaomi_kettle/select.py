"""Xiaomi Home kettle programs."""

from homeassistant.components.select import SelectEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .entity import XiaomiKettleEntity


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    async_add_entities([KettleProgramSelect(entry.runtime_data.coordinator)])


class KettleProgramSelect(XiaomiKettleEntity, SelectEntity):
    _attr_icon = "mdi:lightning-bolt"

    def __init__(self, coordinator) -> None:
        super().__init__(coordinator, "program", "program")

    @property
    def options(self) -> list[str]:
        return [preset.name for preset in self.coordinator.data.presets]

    @property
    def current_option(self) -> str | None:
        mode = self.coordinator.data.target_mode
        return next(
            (preset.name for preset in self.coordinator.data.presets if preset.mode == mode),
            None,
        )

    @property
    def available(self) -> bool:
        return super().available and bool(self.coordinator.data.presets)

    async def async_select_option(self, option: str) -> None:
        preset = next(
            preset for preset in self.coordinator.data.presets if preset.name == option
        )
        await self.coordinator.async_start_preset(preset)
