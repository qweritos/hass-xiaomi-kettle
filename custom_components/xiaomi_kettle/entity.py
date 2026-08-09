"""Base entity for the Xiaomi Kettle integration."""

from __future__ import annotations

from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import ATTR_SOURCE_ENTITY_ID, DOMAIN
from .coordinator import KettleCoordinator


class XiaomiKettleEntity(CoordinatorEntity[KettleCoordinator]):
    """Base class for friendly kettle entities."""

    _attr_has_entity_name = True

    def __init__(
        self, coordinator: KettleCoordinator, key: str, translation_key: str
    ) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"{coordinator.entry.unique_id}_{key}"
        self._attr_translation_key = translation_key
        device_info = DeviceInfo(
            identifiers={(DOMAIN, coordinator.entry.entry_id)},
            name=coordinator.device_name,
            manufacturer=coordinator.manufacturer,
            model=coordinator.model,
            sw_version=coordinator.sw_version,
            configuration_url=coordinator.configuration_url,
            suggested_area=coordinator.area_name,
        )
        supported_keys = DeviceInfo.__annotations__
        if coordinator.model_id and "model_id" in supported_keys:
            device_info["model_id"] = coordinator.model_id
        if "via_device_id" in supported_keys:
            device_info["via_device_id"] = coordinator.sources.device_id
        elif coordinator.source_device and coordinator.source_device.identifiers:
            device_info["via_device"] = sorted(
                coordinator.source_device.identifiers
            )[0]
        self._attr_device_info = device_info

    @property
    def available(self) -> bool:
        return self.coordinator.data.available

    @property
    def extra_state_attributes(self) -> dict[str, str]:
        return {ATTR_SOURCE_ENTITY_ID: self.coordinator.sources.main}
