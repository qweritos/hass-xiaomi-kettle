"""Xiaomi Kettle custom integration."""

from __future__ import annotations

import os
import shutil
import time
from dataclasses import dataclass
from pathlib import Path

from homeassistant.components.frontend import add_extra_js_url, remove_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.components.lovelace.const import LOVELACE_DATA, MODE_STORAGE
from homeassistant.components.lovelace.resources import ResourceStorageCollection
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_ID, CONF_TYPE, CONF_URL, EVENT_HOMEASSISTANT_STARTED
from homeassistant.core import Event, HomeAssistant, callback

from .const import (
    DOMAIN,
    FRONTEND_PATH,
    FRONTEND_RESOURCE_URL,
    FRONTEND_URL,
    PLATFORMS,
    VERSION,
)
from .coordinator import KettleCoordinator, resolve_source_entities


@dataclass(slots=True)
class RuntimeData:
    """Runtime data for one configured kettle."""

    coordinator: KettleCoordinator


type XiaomiKettleConfigEntry = ConfigEntry[RuntimeData]


def _copy_frontend_bundle(source: Path, target: Path) -> None:
    """Atomically maintain the early-loading dashboard bundle under /local."""
    target.parent.mkdir(parents=True, exist_ok=True)
    if target.exists() and target.read_bytes() == source.read_bytes():
        return
    temporary = target.with_suffix(".tmp")
    shutil.copyfile(source, temporary)
    os.replace(temporary, target)


async def _async_register_lovelace_resource(
    hass: HomeAssistant, resource_url: str
) -> None:
    """Keep one storage-mode dashboard resource current across HA startup."""
    lovelace = hass.data[LOVELACE_DATA]
    resources = lovelace.resources
    if lovelace.resource_mode != MODE_STORAGE or not isinstance(
        resources, ResourceStorageCollection
    ):
        return

    await resources.async_get_info()
    managed_paths = {FRONTEND_URL, FRONTEND_RESOURCE_URL}
    existing = next(
        (
            item
            for item in resources.async_items()
            if str(item.get(CONF_URL, "")).split("?", 1)[0] in managed_paths
        ),
        None,
    )
    if existing is None:
        await resources.async_create_item(
            {"res_type": "module", CONF_URL: resource_url}
        )
    elif existing.get(CONF_URL) != resource_url or existing.get(CONF_TYPE) != "module":
        await resources.async_update_item(
            existing[CONF_ID],
            {"res_type": "module", CONF_URL: resource_url},
        )


async def _async_register_frontend(hass: HomeAssistant) -> None:
    """Register and load the bundled frontend once."""
    data = hass.data.setdefault(DOMAIN, {})
    frontend_dir = Path(__file__).parent / "frontend"
    frontend_file = frontend_dir / "xiaomi-kettle-card.js"
    local_file = Path(hass.config.path("www", "xiaomi-kettle", frontend_file.name))
    if not data.get("frontend_copied"):
        await hass.async_add_executor_job(
            _copy_frontend_bundle, frontend_file, local_file
        )
        data["frontend_copied"] = True
    boot_token = data.setdefault("frontend_boot_token", time.time_ns())
    version = f"{VERSION}-{frontend_file.stat().st_mtime_ns}-{boot_token}"
    frontend_url = f"{FRONTEND_URL}?v={version}"
    resource_url = f"{FRONTEND_RESOURCE_URL}?v={version}"
    if not data.get("frontend_registered"):
        await hass.http.async_register_static_paths(
            [StaticPathConfig(FRONTEND_PATH, str(frontend_dir), True)]
        )
        data["frontend_registered"] = True
    if (previous_url := data.get("frontend_url")) and previous_url != frontend_url:
        remove_extra_js_url(hass, previous_url)
    data["frontend_url"] = frontend_url
    # Register this after frontend setup as well as during domain setup. This is
    # idempotent and avoids losing the URL if frontend initializes concurrently.
    add_extra_js_url(hass, frontend_url)
    await _async_register_lovelace_resource(hass, resource_url)
    if not hass.is_running and not data.get("frontend_start_listener"):
        data["frontend_start_listener"] = True

        @callback
        def register_after_start(_event: Event) -> None:
            add_extra_js_url(hass, frontend_url)

        hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STARTED, register_after_start)


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Register the bundled frontend."""
    await _async_register_frontend(hass)
    return True


async def async_setup_entry(
    hass: HomeAssistant, entry: XiaomiKettleConfigEntry
) -> bool:
    """Set up one friendly kettle proxy."""
    await _async_register_frontend(hass)
    legacy_options = {"notify_entities", "poll_interval"}
    if legacy_options.intersection(entry.options):
        hass.config_entries.async_update_entry(
            entry,
            options={
                key: value
                for key, value in entry.options.items()
                if key not in legacy_options
            },
        )
    sources = resolve_source_entities(hass, entry)
    coordinator = KettleCoordinator(hass, entry, sources)
    await coordinator.async_config_entry_first_refresh()
    await coordinator.async_start()
    entry.runtime_data = RuntimeData(coordinator)
    entry.async_on_unload(entry.add_update_listener(async_reload_entry))
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_unload_entry(
    hass: HomeAssistant, entry: XiaomiKettleConfigEntry
) -> bool:
    """Unload one kettle proxy."""
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)


async def async_reload_entry(
    hass: HomeAssistant, entry: XiaomiKettleConfigEntry
) -> None:
    """Reload after notification or refresh options change."""
    await hass.config_entries.async_reload(entry.entry_id)
