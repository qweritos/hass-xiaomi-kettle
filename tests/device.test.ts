import { describe, expect, it } from 'vitest';
import { isSupportedKettleEntity, resolveKettleEntities } from '../src/device';
import type { KettleHass } from '../src/types';

const hass = {
  entities: {
    'water_heater.kitchen_kettle': {
      entity_id: 'water_heater.kitchen_kettle',
      device_id: 'kettle-device',
    },
    'switch.kitchen_kettle_auto_keep_warm': {
      entity_id: 'switch.kitchen_kettle_auto_keep_warm',
      device_id: 'kettle-device',
    },
    'number.kitchen_kettle_keep_warm_temperature': {
      entity_id: 'number.kitchen_kettle_keep_warm_temperature',
      device_id: 'kettle-device',
    },
    'button.kitchen_kettle_stop_work': {
      entity_id: 'button.kitchen_kettle_stop_work',
      device_id: 'kettle-device',
    },
  },
  devices: {
    'kettle-device': {
      id: 'kettle-device',
      model: 'yunmi.kettle.v19',
    },
  },
  states: {},
} as unknown as KettleHass;

describe('device discovery', () => {
  it('recognizes every entity attached to the supported model', () => {
    expect(isSupportedKettleEntity(hass, 'switch.kitchen_kettle_auto_keep_warm')).toBe(true);
  });

  it('finds the water heater and optional controls without a fixed entity prefix', () => {
    expect(resolveKettleEntities(hass, 'switch.kitchen_kettle_auto_keep_warm')).toMatchObject({
      deviceId: 'kettle-device',
      main: 'water_heater.kitchen_kettle',
      sourceMain: 'water_heater.kitchen_kettle',
      keepWarm: 'switch.kitchen_kettle_auto_keep_warm',
      keepTemp: 'number.kitchen_kettle_keep_warm_temperature',
      stop: 'button.kitchen_kettle_stop_work',
    });
  });

  it('resolves a friendly integration proxy back to its Xiaomi Miot source', () => {
    const proxyHass = {
      ...hass,
      entities: {
        ...hass.entities,
        'water_heater.kitchen_kettle_proxy': {
          entity_id: 'water_heater.kitchen_kettle_proxy',
          device_id: 'proxy-device',
        },
        'button.kitchen_kettle_start': {
          entity_id: 'button.kitchen_kettle_start',
          device_id: 'proxy-device',
        },
        'button.kitchen_kettle_boil': {
          entity_id: 'button.kitchen_kettle_boil',
          device_id: 'proxy-device',
        },
      },
      states: {
        'water_heater.kitchen_kettle_proxy': {
          state: 'ready',
          attributes: {
            'xiaomi_kettle.source_entity_id': 'water_heater.kitchen_kettle',
          },
        },
        'water_heater.kitchen_kettle': { state: 'ready', attributes: {} },
        'button.kitchen_kettle_start': {
          state: 'unknown',
          attributes: {
            'xiaomi_kettle.source_entity_id': 'water_heater.kitchen_kettle',
          },
        },
        'button.kitchen_kettle_boil': {
          state: 'unknown',
          attributes: {
            'xiaomi_kettle.source_entity_id': 'water_heater.kitchen_kettle',
          },
        },
      },
    } as unknown as KettleHass;

    expect(isSupportedKettleEntity(proxyHass, 'water_heater.kitchen_kettle_proxy')).toBe(true);
    expect(resolveKettleEntities(proxyHass, 'water_heater.kitchen_kettle_proxy')).toMatchObject({
      deviceId: 'proxy-device',
      main: 'water_heater.kitchen_kettle_proxy',
      sourceMain: 'water_heater.kitchen_kettle',
      start: 'button.kitchen_kettle_start',
      boil: 'button.kitchen_kettle_boil',
    });
  });
});
