"""Pure kettle state and preset models."""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass, field, replace
from typing import Any

STATUS_BY_CODE = {
    0: "ready",
    1: "heating",
    2: "boiling",
    3: "cooling",
    4: "keeping_warm",
}

STATUS_OPTIONS = [
    "ready",
    "heating",
    "boiling",
    "cooling",
    "keeping_warm",
    "lifted",
    "fault",
    "unavailable",
]


def _as_float(value: Any, fallback: float | None = None) -> float | None:
    try:
        return float(value)
    except (TypeError, ValueError):
        return fallback


def _as_int(value: Any, fallback: int = 0) -> int:
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return fallback


def _as_bool(value: Any, fallback: bool = False) -> bool:
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.lower() in {"1", "true", "on", "yes"}
    if value is None:
        return fallback
    return bool(value)


@dataclass(frozen=True, slots=True)
class KettlePreset:
    """A Xiaomi Home kettle preset."""

    name: str
    target: float
    keep_warm: bool
    keep_temperature: float
    duration: int
    mode: int


@dataclass(frozen=True, slots=True)
class KettleSettings:
    """Human-friendly kettle settings."""

    boiling_reminder: bool = False
    keep_warm_reminder: bool = False
    lift_memory: bool = False
    custom_knob: bool = False
    no_disturb: bool = False


@dataclass(frozen=True, slots=True)
class KettleData:
    """Normalized kettle state."""

    available: bool
    status_code: int
    status: str
    current_temperature: float | None
    target_temperature: float | None
    keep_warm: bool
    keep_temperature: float
    keep_duration: int
    warming_time: int
    lifted: bool
    fault: int
    target_mode: int
    presets: tuple[KettlePreset, ...] = field(default_factory=tuple)
    settings: KettleSettings = field(default_factory=KettleSettings)


def optimistic_start(
    data: KettleData,
    *,
    target_temperature: float | None = None,
    keep_warm: bool | None = None,
    keep_temperature: float | None = None,
    keep_duration: int | None = None,
    target_mode: int | None = None,
) -> KettleData:
    """Return the expected helper state immediately after starting work."""
    return replace(
        data,
        status_code=1,
        status="heating",
        target_temperature=(
            data.target_temperature
            if target_temperature is None
            else target_temperature
        ),
        keep_warm=data.keep_warm if keep_warm is None else keep_warm,
        keep_temperature=(
            data.keep_temperature
            if keep_temperature is None
            else keep_temperature
        ),
        keep_duration=data.keep_duration if keep_duration is None else keep_duration,
        target_mode=data.target_mode if target_mode is None else target_mode,
    )


def optimistic_stop(data: KettleData) -> KettleData:
    """Return the expected helper state immediately after stopping work."""
    return replace(data, status_code=3, status="cooling")


def reconcile_optimistic(
    changes: Mapping[str, Any], source: KettleData
) -> dict[str, Any]:
    """Keep stale source values overlaid and remove confirmed optimistic fields."""
    pending = dict(changes)
    pending_status = pending.get("status")
    status_confirmed = (
        pending_status == "heating" and source.status in {"heating", "boiling"}
    ) or (pending_status == "cooling" and source.status == "cooling")
    if status_confirmed:
        pending.pop("status", None)
        pending.pop("status_code", None)

    for key, expected in tuple(pending.items()):
        if getattr(source, key) == expected:
            pending.pop(key, None)
    return pending


def preset_icon(name: str, target: float) -> str:
    """Return the automatic icon used for a discovered Xiaomi preset."""
    normalized = name.casefold()
    if any(word in normalized for word in ("wolf", "goji", "berr")):
        return "mdi:fruit-cherries"
    if any(word in normalized for word in ("flower", "scent")):
        return "mdi:flower-tulip"
    if "tea" in normalized:
        return "mdi:tea"
    if target <= 50 or "water" in normalized:
        return "mdi:cup-water"
    return "mdi:cup"


def parse_presets(source: Any) -> tuple[KettlePreset, ...]:
    """Parse Xiaomi's function.extended_mode string."""
    if not isinstance(source, str) or not source.strip():
        return ()

    presets: list[KettlePreset] = []
    for index, record in enumerate(source.strip().split("_")):
        fields = record.split(",")
        if len(fields) < 5:
            continue
        name = fields[0].strip()
        target = _as_float(fields[1])
        keep_temperature = _as_float(fields[3])
        duration = _as_int(fields[4], -1)
        if not name or target is None or keep_temperature is None or duration < 0:
            continue
        presets.append(
            KettlePreset(
                name=name,
                target=target,
                keep_warm=_as_bool(fields[2]),
                keep_temperature=keep_temperature,
                duration=duration,
                mode=10 + index,
            )
        )
    return tuple(presets[:6])


def normalize_data(
    attributes: Mapping[str, Any],
    *,
    available: bool,
    overrides: Mapping[str, Any] | None = None,
) -> KettleData:
    """Normalize Xiaomi Miot attributes and related entity states."""
    override = overrides or {}
    status_code = _as_int(attributes.get("kettle.status"), 0)
    fault = _as_int(attributes.get("kettle.fault"), 0)
    lifted = _as_bool(
        override.get("lifted"), _as_bool(attributes.get("function.kettle_lifting"))
    )
    if not available:
        status = "unavailable"
    elif fault:
        status = "fault"
    elif lifted:
        status = "lifted"
    else:
        status = STATUS_BY_CODE.get(status_code, "unavailable")

    settings = KettleSettings(
        boiling_reminder=_as_bool(
            override.get("boiling_reminder"),
            _as_bool(attributes.get("function.boiling_reminder")),
        ),
        keep_warm_reminder=_as_bool(
            override.get("keep_warm_reminder"),
            _as_bool(attributes.get("function.keep_warm_reminder")),
        ),
        lift_memory=_as_bool(
            override.get("lift_memory"),
            _as_bool(attributes.get("function.lift_remember_temp")),
        ),
        custom_knob=_as_bool(
            override.get("custom_knob"),
            _as_bool(attributes.get("function.custom_knob_temp")),
        ),
        no_disturb=_as_bool(
            override.get("no_disturb"), _as_bool(attributes.get("no_disturb"))
        ),
    )

    return KettleData(
        available=available,
        status_code=status_code,
        status=status,
        current_temperature=_as_float(
            attributes.get("current_temperature", attributes.get("kettle.temperature"))
        ),
        target_temperature=_as_float(
            attributes.get("temperature", attributes.get("kettle.target_temperature"))
        ),
        keep_warm=_as_bool(
            override.get("keep_warm"),
            _as_bool(attributes.get("kettle.auto_keep_warm")),
        ),
        keep_temperature=_as_float(
            override.get("keep_temperature"),
            _as_float(attributes.get("kettle.keep_warm_temperature"), 40),
        )
        or 0,
        keep_duration=_as_int(
            override.get("keep_duration"),
            _as_int(attributes.get("function.keep_warm_time"), 1440),
        ),
        warming_time=_as_int(
            override.get("warming_time"),
            _as_int(attributes.get("function.warming_time"), 0),
        ),
        lifted=lifted,
        fault=fault,
        target_mode=_as_int(attributes.get("function.target_mode"), 0),
        presets=parse_presets(attributes.get("function.extended_mode")),
        settings=settings,
    )


def transition_events(old: KettleData | None, new: KettleData) -> tuple[str, ...]:
    """Return meaningful events emitted by a state transition."""
    if old is None:
        return ()

    events: list[str] = []
    if not old.fault and new.fault:
        events.append("fault")
    if not old.lifted and new.lifted:
        events.append("lifted")
    if old.status_code != new.status_code:
        if new.status_code == 1:
            events.append("heating_started")
        elif new.status_code == 2:
            events.append("boiling")
        if old.status_code in {1, 2} and new.status_code in {0, 3, 4}:
            events.append("finished")
    return tuple(dict.fromkeys(events))
