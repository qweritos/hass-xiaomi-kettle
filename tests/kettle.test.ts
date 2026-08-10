import { describe, expect, it } from 'vitest';
import { ARM_TIMEOUT } from '../src/constants';
import {
  formatDuration,
  getStatus,
  parsePresets,
  programNameForMode,
  remainingKeepWarmMinutes,
} from '../src/kettle';

describe('confirmation timing', () => {
  it('reverts every armed action after one second', () => {
    expect(ARM_TIMEOUT).toBe(1_000);
  });
});

describe('parsePresets', () => {
  it('parses Xiaomi extended modes and preserves their target-mode order', () => {
    const presets = parsePresets(
      'Warm water,45,1,45,1440_Wolfberries,70,1,70,1440_Scented tea,80,1,80,1440_Tea 2,80,1,80,60',
    );

    expect(presets).toHaveLength(4);
    expect(presets.map(({ name, mode }) => [name, mode])).toEqual([
      ['Warm water', 10],
      ['Wolfberries', 11],
      ['Scented tea', 12],
      ['Tea 2', 13],
    ]);
    expect(presets[3]).toMatchObject({
      target: 80,
      keep: true,
      keepTemperature: 80,
      duration: 60,
    });
  });

  it('applies icons by exact preset name and keeps automatic fallbacks', () => {
    const presets = parsePresets('Warm water,45,1,45,1440_Wolfberries,70,1,70,1440', {
      'Warm water': 'mdi:water-boiler',
    });

    expect(presets[0]?.icon).toBe('mdi:water-boiler');
    expect(presets[1]?.icon).toBe('mdi:fruit-cherries');
  });

  it('ignores malformed records', () => {
    expect(parsePresets('Broken_Ok,70,0,45,60')).toHaveLength(1);
    expect(parsePresets(undefined)).toEqual([]);
  });
});

describe('formatDuration', () => {
  it('formats full and partial hours', () => {
    expect(formatDuration(60)).toBe('1 h');
    expect(formatDuration(90)).toBe('1 h 30 min');
    expect(formatDuration(1440)).toBe('24 h');
  });

  it('formats Russian duration units', () => {
    expect(formatDuration(90, 'ru')).toBe('1 ч 30 мин');
  });
});

describe('active program and keep-warm time', () => {
  const presets = parsePresets(
    'Warm water,45,1,45,1440_Scented tea,80,1,80,1440_Da Hong Pao,90,1,80,60',
  );

  it('maps built-in and Xiaomi preset target modes to display names', () => {
    expect(programNameForMode(0, presets)).toBe('Manual');
    expect(programNameForMode(1, presets)).toBe('Boil');
    expect(programNameForMode(11, presets)).toBe('Scented tea');
    expect(programNameForMode(15, presets)).toBeUndefined();
  });

  it('localizes built-in target modes', () => {
    expect(programNameForMode(0, presets, 'ru')).toBe('Вручную');
    expect(programNameForMode(1, presets, 'ru')).toBe('Вскипятить');
  });

  it('subtracts elapsed keep-warm time without returning a negative value', () => {
    expect(remainingKeepWarmMinutes(1_440, 49)).toBe(1_391);
    expect(remainingKeepWarmMinutes(60, 75)).toBe(0);
  });
});

describe('getStatus', () => {
  it('prioritizes faults and lifting over the work state', () => {
    const entity = {
      entity_id: 'water_heater.kettle',
      state: 'on',
      attributes: { 'kettle.status': 1, 'kettle.fault': 0 },
      last_changed: '',
      last_updated: '',
      context: { id: '', parent_id: null, user_id: null },
    };

    expect(getStatus(entity, false)).toMatchObject({ label: 'Heating', tone: 'hot' });
    expect(getStatus(entity, true)).toMatchObject({ label: 'Lifted from base', tone: 'lifted' });
    expect(getStatus(entity, false, 'ru')).toMatchObject({ label: 'Нагрев', tone: 'hot' });
  });
});
