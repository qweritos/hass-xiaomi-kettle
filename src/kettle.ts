import type { HassEntity, KettlePreset, KettleStatus } from './types';

export function formatDuration(minutes: number): string {
  if (minutes >= 60 && minutes % 60 === 0) return `${minutes / 60} h`;
  if (minutes > 60) return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
  return `${minutes} min`;
}

export function remainingKeepWarmMinutes(duration: number, elapsed: number): number {
  return Math.max(0, duration - elapsed);
}

function presetIcon(name: string, target: number): string {
  const normalized = name.toLowerCase();
  if (/wolf|goji|berr/.test(normalized)) return 'mdi:fruit-cherries';
  if (/flower|scent/.test(normalized)) return 'mdi:flower-tulip';
  if (normalized.includes('tea')) return 'mdi:tea';
  if (target <= 50 || normalized.includes('water')) return 'mdi:cup-water';
  return 'mdi:cup';
}

export function parsePresets(
  source: unknown,
  configuredIcons: Record<string, string> = {},
): KettlePreset[] {
  if (typeof source !== 'string' || !source.trim()) return [];

  return source
    .trim()
    .split('_')
    .map((record, index): KettlePreset | undefined => {
      const [rawName, rawTarget, rawKeep, rawKeepTemperature, rawDuration] = record.split(',');
      const name = rawName?.trim();
      const target = Number(rawTarget);
      const keepTemperature = Number(rawKeepTemperature);
      const duration = Number(rawDuration);

      if (
        !name ||
        !Number.isFinite(target) ||
        !Number.isFinite(keepTemperature) ||
        !Number.isFinite(duration)
      ) {
        return undefined;
      }

      return {
        key: `preset-${index}`,
        name,
        target,
        keep: rawKeep?.trim() === '1',
        keepTemperature,
        duration,
        mode: 10 + index,
        icon: configuredIcons[name] || presetIcon(name, target),
      };
    })
    .filter((preset): preset is KettlePreset => preset !== undefined)
    .slice(0, 6);
}

export function programNameForMode(mode: number, presets: KettlePreset[]): string | undefined {
  if (mode === 0) return 'Manual';
  if (mode === 1) return 'Boil';
  return presets.find((preset) => preset.mode === mode)?.name;
}

export function getStatus(entity: HassEntity | undefined, lifted: boolean): KettleStatus {
  const attributes = entity?.attributes ?? {};
  const code = Number(attributes['kettle.status']);
  const fault = Number(attributes['kettle.fault']) || 0;

  if (fault) return { code, fault, lifted, label: `Fault · code ${fault}`, tone: 'fault' };
  if (lifted) return { code, fault, lifted, label: 'Lifted from base', tone: 'lifted' };

  const statuses: Record<number, [string, KettleStatus['tone']]> = {
    0: ['Ready', 'idle'],
    1: ['Heating', 'hot'],
    2: ['Boiling', 'hot'],
    3: ['Cooling', 'cool'],
    4: ['Keeping warm', 'warm'],
  };
  const [label, tone] = statuses[code] ?? ['Unavailable', 'idle'];
  return { code, fault, lifted, label, tone };
}
