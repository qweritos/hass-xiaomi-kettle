import type { HomeAssistant, LovelaceCardConfig } from 'custom-card-helpers';

export type HassEntity = HomeAssistant['states'][string];

export interface KettleCardConfig extends LovelaceCardConfig {
  entity: string;
  name?: string;
  icon?: string;
  show_controls?: boolean;
  show_presets?: boolean;
  preset_icons?: Record<string, string>;
}

export interface EntityRegistryEntry {
  entity_id: string;
  device_id: string | null;
  disabled_by?: string | null;
}

export interface DeviceRegistryEntry {
  id: string;
  area_id?: string | null;
  manufacturer?: string | null;
  model?: string | null;
  name?: string | null;
  name_by_user?: string | null;
}

export interface AreaRegistryEntry {
  area_id: string;
  name: string;
}

export interface KettleHass extends HomeAssistant {
  entities: Record<string, EntityRegistryEntry>;
  devices: Record<string, DeviceRegistryEntry>;
  areas: Record<string, AreaRegistryEntry>;
}

export interface ResolvedKettleEntities {
  deviceId: string;
  main: string;
  sourceMain: string;
  start?: string;
  boil?: string;
  program?: string;
  lifted?: string;
  stop?: string;
  keepWarm?: string;
  keepTemp?: string;
  keepTime?: string;
  warmingTime?: string;
  boilReminder?: string;
  warmReminder?: string;
  liftMemory?: string;
  customKnob?: string;
  noDisturb?: string;
}

export interface KettlePreset {
  key: string;
  name: string;
  target: number;
  keep: boolean;
  keepTemperature: number;
  duration: number;
  mode: number;
  icon: string;
}

export type StatusTone = 'idle' | 'hot' | 'cool' | 'warm' | 'fault' | 'lifted';

export interface KettleStatus {
  code: number;
  label: string;
  tone: StatusTone;
  lifted: boolean;
  fault: number;
}
