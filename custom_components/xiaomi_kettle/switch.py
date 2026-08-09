"""Friendly kettle switches."""

from dataclasses import dataclass

from homeassistant.components.switch import SwitchEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import EntityCategory
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .entity import XiaomiKettleEntity


@dataclass(frozen=True, slots=True)
class SwitchDefinition:
    key: str
    source_key: str
    value_path: str
    icon: str
    category: EntityCategory | None = EntityCategory.CONFIG


SWITCHES = [
    SwitchDefinition("keep_warm", "keep_warm", "keep_warm", "mdi:heat-wave", None),
    SwitchDefinition(
        "boiling_reminder",
        "boiling_reminder",
        "settings.boiling_reminder",
        "mdi:bell-boil",
    ),
    SwitchDefinition(
        "keep_warm_reminder",
        "keep_warm_reminder",
        "settings.keep_warm_reminder",
        "mdi:bell-ring-outline",
    ),
    SwitchDefinition(
        "lift_memory", "lift_memory", "settings.lift_memory", "mdi:memory"
    ),
    SwitchDefinition(
        "custom_knob", "custom_knob", "settings.custom_knob", "mdi:knob"
    ),
    SwitchDefinition(
        "no_disturb", "no_disturb", "settings.no_disturb", "mdi:moon-waning-crescent"
    ),
]


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    coordinator = entry.runtime_data.coordinator
    async_add_entities(
        KettleSwitch(coordinator, definition)
        for definition in SWITCHES
        if getattr(coordinator.sources, definition.source_key)
    )


class KettleSwitch(XiaomiKettleEntity, SwitchEntity):
    def __init__(self, coordinator, definition: SwitchDefinition) -> None:
        super().__init__(coordinator, definition.key, definition.key)
        self.definition = definition
        self._attr_icon = definition.icon
        self._attr_entity_category = definition.category

    @property
    def is_on(self) -> bool:
        value = self.coordinator.data
        for part in self.definition.value_path.split("."):
            value = getattr(value, part)
        return bool(value)

    async def async_turn_on(self, **kwargs) -> None:
        await self.coordinator.async_set_switch(
            getattr(self.coordinator.sources, self.definition.source_key), True
        )

    async def async_turn_off(self, **kwargs) -> None:
        await self.coordinator.async_set_switch(
            getattr(self.coordinator.sources, self.definition.source_key), False
        )
