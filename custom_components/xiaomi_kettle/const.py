"""Constants for the Xiaomi Kettle integration."""

from homeassistant.const import Platform

DOMAIN = "xiaomi_kettle"
VERSION = "0.1.0"

PLATFORMS = [
    Platform.BUTTON,
    Platform.EVENT,
    Platform.NUMBER,
    Platform.SELECT,
    Platform.SENSOR,
    Platform.SWITCH,
    Platform.WATER_HEATER,
]

SUPPORTED_MODELS = {"yunmi.kettle.v19"}

CONF_SOURCE_ENTITY = "source_entity"
CONF_SOURCE_DEVICE_ID = "source_device_id"
CONF_NOTIFY_EVENTS = "notify_events"
CONF_PRESET_ICONS = "preset_icons"

DEFAULT_NOTIFY_EVENTS = ["finished"]
POLL_INTERVAL = 1
OPTIMISTIC_TIMEOUT = 10
NOTIFICATION_EVENTS = ["heating_started", "boiling", "finished", "lifted", "fault"]

ATTR_SOURCE_ENTITY_ID = f"{DOMAIN}.source_entity_id"
FRONTEND_PATH = "/xiaomi-kettle"
FRONTEND_URL = f"{FRONTEND_PATH}/xiaomi-kettle-card.js"
FRONTEND_RESOURCE_URL = "/local/xiaomi-kettle/xiaomi-kettle-card.js"

ENTITY_SUFFIXES = {
    "lifted": "kettle_lifting",
    "stop": "stop_work",
    "keep_warm": "auto_keep_warm",
    "keep_temperature": "keep_warm_temperature",
    "keep_duration": "keep_warm_time",
    "warming_time": "warming_time",
    "boiling_reminder": "boiling_reminder",
    "keep_warm_reminder": "keep_warm_reminder",
    "lift_memory": "lift_remember_temp",
    "custom_knob": "custom_knob_temp",
    "no_disturb": "no_disturb",
}
