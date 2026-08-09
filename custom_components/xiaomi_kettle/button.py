"""Kettle action buttons."""

from homeassistant.components.button import ButtonEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .entity import XiaomiKettleEntity


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    coordinator = entry.runtime_data.coordinator
    entities = [KettleStartButton(coordinator), KettleBoilButton(coordinator)]
    if coordinator.sources.stop:
        entities.append(KettleStopButton(coordinator))
    async_add_entities(entities)


class KettleStartButton(XiaomiKettleEntity, ButtonEntity):
    _attr_icon = "mdi:fire"

    def __init__(self, coordinator) -> None:
        super().__init__(coordinator, "start", "start")

    async def async_press(self) -> None:
        await self.coordinator.async_start_manual()


class KettleBoilButton(XiaomiKettleEntity, ButtonEntity):
    _attr_icon = "mdi:kettle-steam"

    def __init__(self, coordinator) -> None:
        super().__init__(coordinator, "boil", "boil")

    async def async_press(self) -> None:
        await self.coordinator.async_boil()


class KettleStopButton(XiaomiKettleEntity, ButtonEntity):
    _attr_icon = "mdi:stop-circle-outline"

    def __init__(self, coordinator) -> None:
        super().__init__(coordinator, "stop", "stop")

    async def async_press(self) -> None:
        await self.coordinator.async_stop()
