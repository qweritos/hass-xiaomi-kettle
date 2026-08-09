import { ENTITY_SUFFIXES, SUPPORTED_MODELS } from './constants';
import type { EntityRegistryEntry, KettleHass, ResolvedKettleEntities } from './types';

function domain(entityId: string): string {
  return entityId.split('.', 1)[0] ?? '';
}

function deviceIdForEntity(hass: KettleHass, entityId: string): string | undefined {
  return hass.entities?.[entityId]?.device_id ?? undefined;
}

function sourceEntity(hass: KettleHass, entityId: string): string {
  const configured = hass.states?.[entityId]?.attributes?.['xiaomi_kettle.source_entity_id'];
  return typeof configured === 'string' && hass.states[configured] ? configured : entityId;
}

function helperDeviceId(hass: KettleHass, sourceEntityId: string): string | undefined {
  return (
    Object.values(hass.entities ?? {}).find((entry) => {
      const state = hass.states?.[entry.entity_id];
      return state?.attributes?.['xiaomi_kettle.source_entity_id'] === sourceEntityId;
    })?.device_id ?? undefined
  );
}

export function isSupportedKettleEntity(hass: KettleHass | undefined, entityId: string): boolean {
  if (!hass || !entityId) return false;
  const sourceEntityId = sourceEntity(hass, entityId);
  if (sourceEntityId !== entityId) return true;
  const deviceId = deviceIdForEntity(hass, sourceEntityId);
  const model = deviceId ? hass.devices?.[deviceId]?.model?.toLowerCase() : undefined;
  const stateModel = String(hass.states?.[entityId]?.attributes?.model ?? '').toLowerCase();
  return Boolean((model && SUPPORTED_MODELS.has(model)) || SUPPORTED_MODELS.has(stateModel));
}

export function resolveKettleEntities(
  hass: KettleHass,
  sourceEntityId: string,
): ResolvedKettleEntities | undefined {
  const controlEntityId = sourceEntity(hass, sourceEntityId);
  const sourceDeviceId = deviceIdForEntity(hass, controlEntityId);
  if (!sourceDeviceId) return undefined;

  const entriesFor = (wantedDeviceId: string): EntityRegistryEntry[] =>
    Object.values(hass.entities ?? {}).filter(
      (entry) => entry.device_id === wantedDeviceId && !entry.disabled_by,
    );
  const findIn = (
    entries: EntityRegistryEntry[],
    wantedDomain: string,
    suffixes: string[] = [],
  ): string | undefined =>
    entries.find(
      (entry) =>
        domain(entry.entity_id) === wantedDomain &&
        (!suffixes.length || suffixes.some((suffix) => entry.entity_id.endsWith(`_${suffix}`))),
    )?.entity_id;

  const sourceEntries = entriesFor(sourceDeviceId);
  const sourceMain =
    findIn(sourceEntries, 'water_heater') ??
    (domain(controlEntityId) === 'water_heater' ? controlEntityId : undefined);
  if (!sourceMain) return undefined;

  const helperId = helperDeviceId(hass, sourceMain);
  const deviceId = helperId ?? sourceDeviceId;
  const preferredEntries = helperId ? entriesFor(helperId) : sourceEntries;
  const find = (wantedDomain: string, ...suffixes: string[]): string | undefined =>
    findIn(preferredEntries, wantedDomain, suffixes) ??
    findIn(sourceEntries, wantedDomain, suffixes);

  const main = findIn(preferredEntries, 'water_heater') ?? sourceMain;
  if (!main) return undefined;

  return {
    deviceId,
    main,
    sourceMain,
    start: find('button', 'start'),
    boil: find('button', 'boil'),
    program: find('select', 'program'),
    lifted: find('binary_sensor', ENTITY_SUFFIXES.lifted, 'lifted'),
    stop: find('button', 'stop', ENTITY_SUFFIXES.stop),
    keepWarm: find('switch', 'keep_warm', ENTITY_SUFFIXES.keepWarm),
    keepTemp: find('number', 'keep_temperature', ENTITY_SUFFIXES.keepTemp),
    keepTime: find('number', 'keep_duration', ENTITY_SUFFIXES.keepTime),
    warmingTime: find('sensor', ENTITY_SUFFIXES.warmingTime),
    boilReminder: find('switch', 'boiling_reminder', ENTITY_SUFFIXES.boilReminder),
    warmReminder: find('switch', 'keep_warm_reminder', ENTITY_SUFFIXES.warmReminder),
    liftMemory: find('switch', 'lift_memory', ENTITY_SUFFIXES.liftMemory),
    customKnob: find('switch', 'custom_knob', ENTITY_SUFFIXES.customKnob),
    noDisturb: find('switch', 'no_disturb', ENTITY_SUFFIXES.noDisturb),
  };
}
